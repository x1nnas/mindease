# Environment Variables Setup

## Required Variables

### `VITE_API_URL`
- **Description**: Backend API URL
- **Default**: `http://localhost:5050`
- **Example**: `VITE_API_URL=http://localhost:5050`

## Optional Variables

### `VITE_SENTRY_DSN`
- **Description**: Sentry DSN for error tracking (optional)
- **Default**: Empty (error tracking disabled)
- **How to get**: 
  1. Go to https://sentry.io
  2. Create a project or select existing one
  3. Go to Settings → Client Keys (DSN)
  4. Copy the DSN
- **Example**: `VITE_SENTRY_DSN=https://your-dsn-here@o....ingest.sentry.io/...`

### `VITE_APP_VERSION`
- **Description**: App version for release tracking (optional)
- **Default**: Empty
- **Use case**: Set via CI/CD or build process
- **Example**: `VITE_APP_VERSION=1.0.0`

## Setup Instructions

1. Copy `.env.example` to `.env` (or create `.env` file)
2. Fill in your values
3. Restart the dev server

## Example `.env` file

```env
# API Configuration
VITE_API_URL=http://localhost:5050

# Sentry Error Tracking (Optional)
VITE_SENTRY_DSN=https://your-dsn-here@o....ingest.sentry.io/...

# App Version (Optional)
VITE_APP_VERSION=1.0.0
```

## Security Notes

- `.env` files are gitignored by default
- Never commit `.env` files with real credentials
- Use `.env.example` as a template (without real values)
- In production, set environment variables via your hosting platform
