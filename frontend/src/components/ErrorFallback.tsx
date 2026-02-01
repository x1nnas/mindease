import type { FallbackProps } from 'react-error-boundary';

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const handleGoHome = () => {
    resetErrorBoundary();
    // Use window.location since ErrorBoundary is outside Router context
    window.location.href = '/home';
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#1a241f] overflow-hidden px-6">
      {/* Glow background layer - matching app design */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(150 50% 50% / 0.12) 0%, transparent 60%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      {/* Error Content */}
      <div className="relative z-10 max-w-md w-full text-center space-y-6">
        {/* Error Icon */}
        <div className="flex justify-center mb-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, hsl(150 50% 50% / 0.2) 0%, hsl(150 50% 50% / 0.1) 100%)",
            }}
          >
            <svg
              className="w-8 h-8 text-white/60"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-3">
          <h1 className="text-2xl font-light text-white/90 tracking-wide">
            Something went wrong
          </h1>
          <p className="text-white/60 text-sm font-light leading-relaxed">
            We're sorry, but something unexpected happened. Don't worry, we've been notified and are looking into it.
          </p>
        </div>

        {/* Error Details (only in development) */}
        {import.meta.env.DEV && (
          <div
            className="mt-6 p-4 rounded-xl text-left"
            style={{
              background: "linear-gradient(135deg, hsl(150 50% 50% / 0.1) 0%, hsl(150 50% 50% / 0.05) 100%)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <p className="text-xs text-white/40 font-mono mb-2">Error details (dev only):</p>
            <p className="text-xs text-white/60 font-mono break-all">
              {error instanceof Error ? error.message : String(error) || 'Unknown error'}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-4">
          <button
            onClick={handleGoHome}
            className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-medium rounded-xl hover:from-green-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
          >
            Go to Home
          </button>
          
          <button
            onClick={handleReload}
            className="w-full py-3 text-sm text-white/60 hover:text-white/80 transition-colors duration-300 font-light tracking-wide"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
}
