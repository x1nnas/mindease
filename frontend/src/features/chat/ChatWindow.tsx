import { useEffect, useRef, useState } from 'react';
import type { Message } from './types';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';

interface ChatWindowProps {
  messages: Message[];
  isTyping: boolean;
  error?: string | null;
}

export default function ChatWindow({ messages, isTyping, error }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  const prevMessagesLengthRef = useRef(0);
  const shouldShowIndicatorRef = useRef(false);
  const [showNewMessageIndicator, setShowNewMessageIndicator] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    shouldShowIndicatorRef.current = false;
    isAtBottomRef.current = true;
  };

  const checkIfAtBottom = () => {
    const container = scrollContainerRef.current;
    if (!container) return false;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    const atBottom = distanceFromBottom < 100;
    isAtBottomRef.current = atBottom;
    return atBottom;
  };

  const pendingIndicatorUpdateRef = useRef<boolean | null>(null);

  useEffect(() => {
    const hasNewMessages = messages.length > prevMessagesLengthRef.current;
    prevMessagesLengthRef.current = messages.length;

    if (isAtBottomRef.current) {
      scrollToBottom();
      shouldShowIndicatorRef.current = false;
      pendingIndicatorUpdateRef.current = false;
    } else if (hasNewMessages) {
      shouldShowIndicatorRef.current = true;
      pendingIndicatorUpdateRef.current = true;
    }
  }, [messages.length, isTyping]);

  useEffect(() => {
    if (pendingIndicatorUpdateRef.current !== null) {
      setShowNewMessageIndicator(pendingIndicatorUpdateRef.current);
      pendingIndicatorUpdateRef.current = null;
    }
  }, [messages.length]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const atBottom = checkIfAtBottom();
      if (shouldShowIndicatorRef.current && atBottom) {
        shouldShowIndicatorRef.current = false;
        setShowNewMessageIndicator(false);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [showNewMessageIndicator]);

  useEffect(() => {
    checkIfAtBottom();
    setTimeout(() => {
      scrollToBottom();
    }, 0);
  }, []);

  return (
    <div 
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto py-6"
      role="log"
      aria-live="polite"
      aria-label="Chat messages"
    >
      <div className="max-w-4xl mx-auto">
        {error && (
          <div
            className="mb-4 mx-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm"
            role="alert"
            aria-live="assertive"
          >
            <p className="font-medium">Unable to send message</p>
            <p>{error}</p>
          </div>
        )}

        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {isTyping && <TypingIndicator />}
        
        <div ref={messagesEndRef} />
      </div>

      {showNewMessageIndicator && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-24 left-1/2 transform -translate-x-1/2 
                     bg-blue-600 text-white px-4 py-2 rounded-full 
                     shadow-lg text-sm font-medium
                     hover:bg-blue-700 active:scale-95
                     transition-all z-10"
          aria-label="Scroll to new message from Serenity"
        >
          New message from Serenity ↓
        </button>
      )}
    </div>
  );
}

