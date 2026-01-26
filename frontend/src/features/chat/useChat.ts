import { useState, useEffect, useRef } from 'react';
import type { Message, Sender } from './types';
import { sendMessage } from '../../services/api';
import { getLatestMoodCheckIn, formatMoodContext } from '../../utils/moodUtils';
import { useLanguage } from '../../i18n/useLanguage';

const CHAT_STORAGE_KEY = 'mindease_chat_messages';
const MAX_HISTORY_MESSAGES = 50; // Increased from 10 to allow longer conversations

// Load messages from localStorage
const loadMessagesFromStorage = (): Message[] => {
  try {
    const stored = localStorage.getItem(CHAT_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert timestamp strings back to Date objects
      return parsed.map((msg: Message) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
    }
  } catch (error) {
    console.error('Error loading chat from storage:', error);
  }
  return [];
};

// Save messages to localStorage
const saveMessagesToStorage = (messages: Message[]) => {
  try {
    // Only save if there are messages beyond the welcome message
    const messagesToSave = messages.filter(msg => msg.id !== 'welcome-1');
    if (messagesToSave.length > 0) {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } else {
      // Clear storage if only welcome message exists
      localStorage.removeItem(CHAT_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Error saving chat to storage:', error);
  }
};

export function useChat() {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>(() => {
    // Try to load saved messages first
    const savedMessages = loadMessagesFromStorage();
    if (savedMessages.length > 0) {
      return savedMessages;
    }
    // Otherwise, return empty array (welcome message will be added in useEffect)
    return [];
  });
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesRef = useRef<Message[]>(messages);

  // Update messagesRef when messages change
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    // Get welcome message based on language
    const welcomeText = language === 'pt'
      ? "Olá. Sou a Serenity — estou aqui sempre que precisares de um momento de calma ou apenas de alguém com quem conversar. Não há pressão aqui. O que tens em mente?"
      : "Hi there. I'm Serenity — I'm here whenever you need a moment of calm or just someone to talk to. There's no pressure here. What's on your mind?";
    
    const welcomeMessage: Message = {
      id: 'welcome-1',
      text: welcomeText,
      sender: 'serenity' as Sender,
      timestamp: new Date(),
    };

    setMessages((prev) => {
      // If we have saved messages, update welcome message if it exists
      const hasWelcome = prev.some(msg => msg.id === 'welcome-1');
      if (hasWelcome) {
        // Update welcome message text if language changed
        return prev.map(msg => 
          msg.id === 'welcome-1' ? welcomeMessage : msg
        );
      } else {
        // If no saved messages, start with welcome message
        if (prev.length === 0) {
          return [welcomeMessage];
        } else {
          // Prepend welcome to existing saved messages
          return [welcomeMessage, ...prev];
        }
      }
    });
  }, [language]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      saveMessagesToStorage(messages);
    }
  }, [messages]);

  const handleSend = async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => {
      const updated = [...prev, userMessage];
      messagesRef.current = updated;
      return updated;
    });
    
    setIsTyping(true);
    setError(null);

    // Record start time for minimum delay calculation
    const startTime = Date.now();
    const minDelay = 1500; // Minimum 1.5 seconds to show "thinking"
    const maxDelay = 3000; // Maximum 3 seconds for longer responses

    try {
      setIsLoading(true);

      // STEP 1: Build conversation history from previous messages
      // Increased limit to 50 messages to allow longer conversations within a session
      // Backend will also enforce its own limit, but we send more for better context
      const conversationHistory = messagesRef.current
        .filter((msg) => msg.id !== 'welcome-1')
        .slice(-MAX_HISTORY_MESSAGES) // Keep only last N messages
        .map((msg) => ({
          role: (msg.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
          content: msg.text,
        }));

      // STEP 2: Get the latest mood check-in data
      // This reads from MongoDB via API
      const latestMood = await getLatestMoodCheckIn();
      
      // STEP 3: Format mood data as context string
      // This converts the mood data into a description the AI can understand
      const moodContext = latestMood ? formatMoodContext(latestMood) : null;

      // STEP 4: Send message with conversation history, mood context, and language preference
      // The API will include this context when talking to the AI
      const response = await sendMessage(text.trim(), conversationHistory, moodContext, language);

      // Calculate how long the API call took
      const apiCallTime = Date.now() - startTime;
      
      // Calculate delay based on response length (longer responses = more thinking time)
      const responseLength = response.reply?.length || 0;
      const lengthBasedDelay = Math.min(responseLength * 20, maxDelay - minDelay); // 20ms per character, capped
      const targetDelay = minDelay + lengthBasedDelay;
      
      // If API responded too quickly, add delay to make it feel natural
      const remainingDelay = Math.max(0, targetDelay - apiCallTime);

      // Wait for remaining delay to ensure minimum "thinking" time
      if (remainingDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingDelay));
      }

      const serenityMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.reply || "I'm here with you.",
        sender: 'serenity',
        timestamp: new Date(),
      };

      setMessages((prev) => {
        const updated = [...prev, serenityMessage];
        messagesRef.current = updated;
        // Save to localStorage (handled by useEffect, but ensure it's saved)
        saveMessagesToStorage(updated);
        return updated;
      });
    } catch (err) {
      // Handle network errors or unexpected failures
      // If backend returns error, show it; otherwise show calm fallback
      let errorMessage = 'I\'m having trouble responding right now. Let\'s try again in a moment.';
      
      if (err instanceof Error) {
        // Check if it's a rate limit or daily limit error (these have specific messages)
        if (err.message.includes('limit') || err.message.includes('429')) {
          errorMessage = err.message;
        } else if (err.message.includes('network') || err.message.includes('fetch')) {
          errorMessage = 'Connection issue. Please check your internet and try again.';
        } else {
          // For other errors, use the error message if available, otherwise fallback
          errorMessage = err.message || errorMessage;
        }
      }
      
      // Show error but don't break the conversation flow
      // User can still see their message and try again
      setError(errorMessage);
      console.error('Chat error:', err);
    } finally {
      setIsTyping(false);
      setIsLoading(false);
    }
  };

  return {
    messages,
    isTyping,
    isLoading,
    error,
    sendMessage: handleSend,
    clearError: () => setError(null),
  };
}

