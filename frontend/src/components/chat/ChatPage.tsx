import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import EmptyState from './EmptyState';
import { useSerenityChat } from '@/hooks/useSerenityChat';

export default function ChatPage() {
  const { messages, isTyping, isLoading, error, sendMessage } = useSerenityChat();

  // Show EmptyState only if there are truly no messages (before welcome message loads)
  const hasMessages = messages.length > 0;
  const isDisabled = isTyping || isLoading;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
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
  );
}