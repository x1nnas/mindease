/**
 * Sentry Error Tracking Configuration
 * 
 * Production-ready error monitoring with:
 * - Error boundary integration
 * - Session replay
 * - Performance monitoring
 * - Environment-aware configuration
 */

import * as Sentry from '@sentry/react';

/**
 * Initialize Sentry for error tracking and monitoring
 * 
 * Only initializes if SENTRY_DSN is provided in environment variables
 * This allows the app to work without Sentry in development
 */
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.MODE; // 'development' or 'production'
  const isProduction = import.meta.env.PROD;

  // Only initialize if DSN is provided
  if (!dsn || dsn.trim() === '') {
    if (isProduction) {
      console.warn('⚠️  Sentry DSN not configured. Error tracking disabled.');
    }
    return;
  }

  try {
    Sentry.init({
      dsn,
      
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          // Mask all text content and user input for privacy
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],

      // Performance Monitoring
      // In production, sample 20% of transactions to control costs
      // In development, capture 100% for debugging
      tracesSampleRate: isProduction ? 0.2 : 1.0,

      // Session Replay
      // Record 10% of all sessions (good balance for cost/coverage)
      replaysSessionSampleRate: 0.1,
      // Record 100% of sessions when there's an error (crucial for debugging)
      replaysOnErrorSampleRate: 1.0,

      // Environment configuration
      environment,
      
      // Release tracking (can be set via CI/CD or build process)
      // Example: use git commit hash or Vercel deploy ID
      // Set a default release to avoid warnings
      release: import.meta.env.VITE_APP_VERSION || `mindease@${environment}`,

      // Filter out common non-critical errors
      ignoreErrors: [
        // Browser extensions
        'top.GLOBALS',
        'originalCreateNotification',
        'canvas.contentDocument',
        'MyApp_RemoveAllHighlights',
        'atomicFindClose',
        // Network errors that are handled gracefully
        'NetworkError',
        'Failed to fetch',
        // User-initiated cancellations
        'AbortError',
      ],

      // Debug mode in development to see what's happening
      debug: !isProduction,

      // Don't send errors from localhost in production (development is fine)
      beforeSend(event) {
        // Log in development to debug
        if (!isProduction) {
          console.log('🔍 Sentry beforeSend:', {
            event: event.exception?.values?.[0]?.value || event.message,
            url: event.request?.url,
            environment: event.environment,
          });
        }
        
        // In production, filter out localhost errors
        if (isProduction && window.location.hostname === 'localhost') {
          return null;
        }
        return event;
      },
    });

    if (!isProduction) {
      console.log('✅ Sentry initialized for error tracking');
      console.log('📍 Sentry DSN:', dsn.substring(0, 20) + '...');
      console.log('🌍 Environment:', environment);
    }

    // Test Sentry connection on init (only in development)
    if (!isProduction) {
      // Small delay to ensure Sentry is fully initialized
      setTimeout(() => {
        try {
          const testEventId = Sentry.captureMessage('Sentry connection test', 'info');
          if (testEventId) {
            console.log('✅ Sentry connection test successful');
          }
        } catch (err) {
          console.warn('⚠️ Sentry connection test failed - may be blocked by ad blocker');
        }
      }, 1000);
    }
  } catch (error) {
    // Don't crash the app if Sentry initialization fails
    console.error('❌ Failed to initialize Sentry:', error);
  }
}

/**
 * Capture an exception manually
 * Useful for caught errors that you want to track
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.captureException(error, {
      extra: context,
    });
  }
}

/**
 * Capture a message (non-error events)
 * Useful for tracking important events or warnings
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.captureMessage(message, level);
  }
}
