import * as Sentry from '@sentry/react';
import { useState } from 'react';

/**
 * Sentry Diagnostics Component
 * 
 * Use this to verify Sentry is working correctly.
 * Shows initialization status and allows testing.
 */
export function SentryDiagnostics() {
  const [status, setStatus] = useState<string>('Checking...');
  const [lastEventId, setLastEventId] = useState<string | null>(null);

  const checkSentry = () => {
    const dsn = import.meta.env.VITE_SENTRY_DSN;
    
    if (!dsn || dsn.trim() === '') {
      setStatus('❌ DSN not configured');
      return;
    }

    // Check if Sentry is initialized
    const client = Sentry.getClient();
    if (!client) {
      setStatus('❌ Sentry client not initialized');
      return;
    }

    setStatus('✅ Sentry is initialized');
    
    // Test capture
    console.log('🧪 Testing Sentry capture...');
    const eventId = Sentry.captureMessage('Test message from diagnostics', 'info');
    setLastEventId(eventId || 'No event ID returned');
    console.log('📤 Event ID:', eventId);
  };

  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <div
      className="fixed bottom-36 right-4 z-50 p-4 rounded-lg text-xs"
      style={{
        background: "linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%)",
        border: "1px solid rgba(34, 197, 94, 0.3)",
        color: "rgb(187, 247, 208)",
        boxShadow: "0 2px 8px rgba(34, 197, 94, 0.2)",
        maxWidth: "300px",
      }}
    >
      <div className="font-medium mb-2">🔍 Sentry Diagnostics</div>
      <div className="mb-2">{status}</div>
      {lastEventId && (
        <div className="mb-2 text-xs opacity-75">
          Last Event ID: {lastEventId}
        </div>
      )}
      <button
        onClick={checkSentry}
        className="px-3 py-1 rounded bg-green-500/20 hover:bg-green-500/30 transition-colors text-xs"
      >
        Test Sentry
      </button>
      <div className="mt-2 text-xs opacity-60">
        DSN: {import.meta.env.VITE_SENTRY_DSN ? '✅ Set' : '❌ Missing'}
      </div>
    </div>
  );
}
