import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import EmptyState from './EmptyState';
import { useSerenityChat } from '@/hooks/useSerenityChat';

export default function ChatPage() {
  const { messages, isTyping, isLoading, error, sendMessage } = useSerenityChat();

  const hasMessages = messages.length > 0;
  const isDisabled = isTyping || isLoading;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Centered container with max-width for better UX */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full bg-white/95 backdrop-blur-sm shadow-2xl rounded-t-3xl overflow-hidden">
        {/* Fixed header */}
        <ChatHeader />

        {/* Main content area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {!hasMessages ? (
            <EmptyState />
          ) : (
            <MessageList
              messages={messages}
              isTyping={isTyping}
              error={error}
            />
          )}
        </main>

        {/* Input bar at bottom */}
        <ChatInput onSend={sendMessage} disabled={isDisabled} />
      </div>
    </div>
  );
}