export default function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 py-16 bg-gray-50">
      {/* Large, soothing avatar */}
      <div className="w-32 h-32 mb-8 bg-gradient-to-br from-blue-400 via-blue-500 to-purple-600 rounded-full shadow-lg" />

      {/* Welcoming headline */}
      <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4">
        Welcome to Serenity
      </h2>

      {/* Supportive subtext */}
      <p className="text-lg text-gray-600 text-center max-w-md leading-relaxed">
        I'm here to listen and support you — anytime, without judgment.
        <br />
        <span className="text-base text-gray-500 mt-4 block">
          Take a deep breath and share what's on your mind when you're ready.
        </span>
      </p>

      {/* Optional subtle decorative element */}
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
