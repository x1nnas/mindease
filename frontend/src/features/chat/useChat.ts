import { useState, useEffect, useRef } from 'react';
import type { Message, Sender } from './types';
import { sendMessage } from '../../services/api';

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesRef = useRef<Message[]>([]);

  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome-1',
      text: "Hi, I'm Serenity. I'm here to listen and support you without judgment. How are you feeling today?",
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

    try {
      setIsLoading(true);

      const conversationHistory = messagesRef.current
        .filter((msg) => msg.id !== 'welcome-1')
        .map((msg) => ({
          role: (msg.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
          content: msg.text,
        }));

      const response = await sendMessage(text.trim(), conversationHistory);

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
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong. Please try again later.';
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

