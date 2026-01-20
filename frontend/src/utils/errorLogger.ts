/**
 * Error Logger Utility
 * 
 * Provides fallback error logging when Sentry is unavailable
 * (e.g., blocked by ad blockers, network issues, etc.)
 */

interface ErrorLog {
  message: string;
  stack?: string;
  timestamp: string;
  url: string;
  userAgent: string;
  componentStack?: string;
}

/**
 * Log error locally as fallback when Sentry fails
 * This ensures errors are still captured even if Sentry is blocked
 */
export function logErrorLocally(error: Error, context?: { componentStack?: string }) {
  const errorLog: ErrorLog = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    componentStack: context?.componentStack,
  };

  // Store in localStorage (limited to last 10 errors to prevent storage bloat)
  try {
    const existingLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]') as ErrorLog[];
    const updatedLogs = [errorLog, ...existingLogs].slice(0, 10); // Keep only last 10
    localStorage.setItem('errorLogs', JSON.stringify(updatedLogs));
    
    console.log('📝 Error logged locally (Sentry unavailable):', errorLog);
  } catch (storageError) {
    // If localStorage is full or unavailable, just log to console
    console.error('Failed to store error log:', storageError);
    console.error('Error details:', errorLog);
  }
}

/**
 * Get locally stored error logs
 * Useful for debugging when Sentry is blocked
 */
export function getLocalErrorLogs(): ErrorLog[] {
  try {
    return JSON.parse(localStorage.getItem('errorLogs') || '[]') as ErrorLog[];
  } catch {
    return [];
  }
}

/**
 * Clear locally stored error logs
 */
export function clearLocalErrorLogs() {
  try {
    localStorage.removeItem('errorLogs');
  } catch {
    // Ignore errors
  }
}
