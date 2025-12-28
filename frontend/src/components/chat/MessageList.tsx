import type { Message } from '@/types/chat';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { useEffect, useRef, useState } from 'react';

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
  error?: string | null;
}

export default function MessageList({ messages, isTyping, error }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  const prevMessagesLengthRef = useRef(0);
  const shouldShowIndicatorRef = useRef(false);

  // Show "Scroll to new message" button when new message arrives but user is scrolled up
  const [showNewMessageIndicator, setShowNewMessageIndicator] = useState(false);

  // Function to scroll smoothly to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    shouldShowIndicatorRef.current = false;
    isAtBottomRef.current = true;
  };

  // Check if user is near the bottom (within 100px tolerance)
  const checkIfAtBottom = () => {
    const container = scrollContainerRef.current;
    if (!container) return false;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    const atBottom = distanceFromBottom < 100; // 100px tolerance
    isAtBottomRef.current = atBottom;
    return atBottom;
  };

  // Track when we need to update indicator state (avoids setState in effect)
  const pendingIndicatorUpdateRef = useRef<boolean | null>(null);

  // When new messages or typing state changes
  useEffect(() => {
    const hasNewMessages = messages.length > prevMessagesLengthRef.current;
    prevMessagesLengthRef.current = messages.length;

    // Use ref to check current scroll position (avoids stale closure)
    if (isAtBottomRef.current) {
      // Scroll immediately
      scrollToBottom();
      shouldShowIndicatorRef.current = false;
      pendingIndicatorUpdateRef.current = false;
    } else if (hasNewMessages) {
      // Only show indicator if there are actually new messages
      shouldShowIndicatorRef.current = true;
      pendingIndicatorUpdateRef.current = true;
    }
  }, [messages.length, isTyping]);

  // Separate effect to handle state updates (satisfies linter)
  useEffect(() => {
    if (pendingIndicatorUpdateRef.current !== null) {
      setShowNewMessageIndicator(pendingIndicatorUpdateRef.current);
      pendingIndicatorUpdateRef.current = null;
    }
  }, [messages.length]); // Update when messages change

  // Listen to manual scrolling to update isAtBottom state
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const atBottom = checkIfAtBottom();
      // Hide indicator if user scrolls down manually to bottom
      if (shouldShowIndicatorRef.current && atBottom) {
        shouldShowIndicatorRef.current = false;
        setShowNewMessageIndicator(false);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [showNewMessageIndicator]);

  // Initial check on mount and scroll to bottom
  useEffect(() => {
    checkIfAtBottom();
    // Scroll to bottom on initial mount
    setTimeout(() => {
      scrollToBottom();
    }, 0);
  }, []);

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto px-4 py-6 bg-gray-50 relative"
      role="log"
      aria-live="polite"
      aria-label="Chat messages"
    >
      {/* Error message */}
      {error && (
        <div
          className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm"
          role="alert"
          aria-live="assertive"
        >
          <p className="font-medium">Unable to send message</p>
          <p>{error}</p>
        </div>
      )}

      {/* All messages */}
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {/* Typing indicator */}
      {isTyping && <TypingIndicator />}

      {/* Hidden anchor for scrolling */}
      <div ref={messagesEndRef} aria-hidden="true" />

      {/* Floating "New message" button */}
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