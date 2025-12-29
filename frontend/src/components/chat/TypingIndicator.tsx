export default function TypingIndicator() {
    return (
      <div className="flex justify-start w-full">
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 px-5 py-3.5 rounded-2xl rounded-bl-none shadow-sm max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
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