import * as Sentry from '@sentry/react';

/**
 * Manual Sentry Test Function
 * 
 * This function directly sends an error to Sentry without triggering the ErrorBoundary.
 * Useful for testing Sentry integration without breaking the UI.
 * 
 * Usage:
 * import { testSentryCapture } from '../utils/sentryTest';
 * testSentryCapture();
 */
export function testSentryCapture() {
  if (!import.meta.env.DEV) {
    console.warn('Sentry test functions should only be called in development');
    return;
  }

  // Add timestamp to make each error unique (prevents Sentry deduplication)
  const timestamp = new Date().toISOString();
  const testError = new Error(`🧪 Test Error: Direct Sentry capture test at ${timestamp}`);
  
  if (import.meta.env.VITE_SENTRY_DSN) {
    console.log('📤 Sending test error to Sentry...');
    const eventId = Sentry.captureException(testError, {
      tags: {
        test: true,
        source: 'manual-test',
      },
      extra: {
        timestamp: new Date().toISOString(),
        message: 'This is a manual test of Sentry error capture',
      },
    });
    console.log('✅ Test error sent to Sentry with event ID:', eventId);
    console.log('💡 Check your Sentry dashboard in a few seconds');
  } else {
    console.warn('⚠️ Sentry DSN not configured. Error not sent.');
    console.warn('💡 Make sure VITE_SENTRY_DSN is set in your .env file');
  }
}
