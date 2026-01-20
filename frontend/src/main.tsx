import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import * as Sentry from '@sentry/react'
import { ErrorFallback } from './components/ErrorFallback'
import { initSentry } from './config/sentry'
import { logErrorLocally } from './utils/errorLogger'
import './index.css'
import App from './App.tsx'

// Initialize Sentry before rendering app
// This must happen before any other code runs
initSentry();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => {
        console.error('Global error caught by ErrorBoundary:', error);
        
        // Capture error in Sentry if DSN is configured
        if (import.meta.env.VITE_SENTRY_DSN) {
          try {
            console.log('📤 Sending error to Sentry...');
            const eventId = Sentry.captureException(error, {
              extra: {
                componentStack: info.componentStack,
              },
              tags: {
                errorBoundary: true,
              },
            });
            
            if (eventId) {
              console.log('✅ Error sent to Sentry with event ID:', eventId);
            } else {
              console.warn('⚠️ Sentry may be blocked (ad blocker?) - error not sent');
              // Fallback: Log error locally
              logErrorLocally(error, { componentStack: info.componentStack });
            }
          } catch (sentryError) {
            console.error('❌ Failed to send error to Sentry:', sentryError);
            // Fallback: Log error locally
            logErrorLocally(error, { componentStack: info.componentStack });
          }
        } else {
          console.warn('⚠️ Sentry DSN not configured. Error not sent.');
        }
      }}
      onReset={() => {
        // Clear any error state when resetting
        console.log('Error boundary reset');
      }}
    >
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
