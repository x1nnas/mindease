export default function TypingIndicator() {
    return (
      <div className="flex justify-start mb-4">
        <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150" />
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-300" />
            </div>
            <p className="text-sm text-gray-600">Serenity is typing...</p>
          </div>
        </div>
      </div>
    );
  }