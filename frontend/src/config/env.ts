const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Sentry DSN (optional - app works without it)
export const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN || '';

function validateEnv(): void {
  const url = import.meta.env.VITE_API_URL;
  const isProduction = import.meta.env.PROD;
  
  // Only warn in production - development default is fine
  if (!url && isProduction) {
    console.warn(
      '⚠️  WARNING: VITE_API_URL not set in .env file.\n' +
      '   Using default: http://localhost:5000\n' +
      '   For production, set VITE_API_URL in frontend/.env'
    );
    return;
  }
  
  // In development, silently use default
  if (!url) {
    return;
  }

  if (url.trim() === '') {
    console.error('❌ ERROR: VITE_API_URL is empty');
    console.error('💡 Please set a valid URL in frontend/.env: VITE_API_URL=http://localhost:5000');
    throw new Error('VITE_API_URL environment variable is empty');
  }

  try {
    new URL(url);
  } catch {
    console.error(`❌ ERROR: Invalid VITE_API_URL format: ${url}`);
    console.error('💡 VITE_API_URL must be a valid URL (e.g., http://localhost:5000)');
    throw new Error('Invalid VITE_API_URL format');
  }
}

validateEnv();

export { API_BASE_URL };
