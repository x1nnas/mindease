import ChatWindow from '../features/chat/ChatWindow';
import ChatInput from '../features/chat/ChatInput';
import { useChat } from '../features/chat/useChat';

function ChatHeader() {
  return (
    <header className="bg-white/70 backdrop-blur-md border-b border-purple-100/30 px-4 py-4 shadow-sm">
      <div className="flex items-center gap-3 max-w-4xl mx-auto">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center shadow-md">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full"></div>
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-gray-800">Serenity</h1>
          <p className="text-sm text-emerald-600 font-medium flex items-center gap-1">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            Online
          </p>
        </div>
      </div>
    </header>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 py-16 bg-gray-50">
      <div className="w-32 h-32 mb-8 bg-gradient-to-br from-blue-400 via-blue-500 to-purple-600 rounded-full shadow-lg" />

      <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4">
        Welcome to Serenity
      </h2>

      <p className="text-lg text-gray-600 text-center max-w-md leading-relaxed">
        I'm here to listen and support you — anytime, without judgment.
        <br />
        <span className="text-base text-gray-500 mt-4 block">
          Take a deep breath and share what's on your mind when you're ready.
        </span>
      </p>

      <div className="mt-12 text-gray-300">
        <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={0.5}
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
          />
        </svg>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { messages, isTyping, isLoading, error, sendMessage } = useChat();

  const hasMessages = messages.length > 0;
  const isDisabled = isTyping || isLoading;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <ChatHeader />

      <main className="flex-1 flex flex-col overflow-hidden">
        {!hasMessages ? (
          <EmptyState />
        ) : (
          <ChatWindow
            messages={messages}
            isTyping={isTyping}
            error={error}
          />
        )}
      </main>

      <ChatInput onSend={sendMessage} disabled={isDisabled} />
    </div>
  );
}

