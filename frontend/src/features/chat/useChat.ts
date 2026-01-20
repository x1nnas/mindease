import { useState, useEffect, useRef } from 'react';
import type { Message, Sender } from './types';
import { sendMessage } from '../../services/api';
import { getLatestMoodCheckIn, formatMoodContext } from '../../utils/moodUtils';

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesRef = useRef<Message[]>([]);

  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome-1',
      text: "Hi there. I'm Serenity — I'm here whenever you need a moment of calm or just someone to talk to. There's no pressure here. What's on your mind?",
      sender: 'serenity' as Sender,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
    messagesRef.current = [welcomeMessage];
  }, []);

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
      // Limit to last 10 messages to prevent token overflow and control costs
      // Backend will also enforce this, but doing it here reduces payload size
      const MAX_HISTORY_MESSAGES = 10;
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

      // STEP 4: Send message with both conversation history and mood context
      // The API will include this context when talking to the AI
      const response = await sendMessage(text.trim(), conversationHistory, moodContext);

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

