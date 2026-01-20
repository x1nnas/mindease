/**
 * Error Testing Component
 * 
 * This component is for testing Sentry error tracking and the ErrorBoundary.
 * It should only be used in development mode.
 * 
 * To use it:
 * 1. Import it in any page: import { ErrorTestingButton } from '../components/ErrorTesting';
 * 2. Add it to your JSX: {import.meta.env.DEV && <ErrorTestingButton />}
 * 3. Click the button to trigger an error
 * 
 * The error will be:
 * - Caught by the ErrorBoundary (shows ErrorFallback UI)
 * - Sent to Sentry (if DSN is configured)
 */

export function ErrorTestingButton() {
  const handleError = () => {
    // This error will be caught by the ErrorBoundary in main.tsx
    // and automatically sent to Sentry
    // Add timestamp to make each error unique (prevents Sentry deduplication)
    const timestamp = new Date().toISOString();
    throw new Error(`🧪 Test Error: Sentry tracking test at ${timestamp}`);
  };

  // Only show in development
  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <button
      onClick={handleError}
      className="fixed top-4 right-4 z-50 px-4 py-2 text-xs font-medium rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
      style={{
        background: "linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%)",
        border: "1px solid rgba(239, 68, 68, 0.3)",
        color: "rgb(254, 202, 202)",
        boxShadow: "0 2px 8px rgba(239, 68, 68, 0.2)",
      }}
      title="Test Sentry Error Tracking (Dev Only)"
    >
      🧪 Test Error
    </button>
  );
}