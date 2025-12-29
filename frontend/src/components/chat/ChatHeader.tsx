export default function ChatHeader() {
    return (
      <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          {/* Serenity's Avatar */}
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 via-blue-500 to-purple-600 rounded-full shadow-md" />
            {/* Online indicator */}
            <span
              className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"
              aria-label="Online"
            />
          </div>
  
          {/* Name and status */}
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900">Serenity</h1>
            <p className="text-sm text-green-600 font-medium">Online</p>
          </div>
  
          {/* Optional: Future actions (e.g., info button, settings) */}
          {/* <button aria-label="Chat info">
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button> */}
        </div>
      </header>
    );
  }