/**
 * Token utility functions for JWT handling
 * Handles token validation, expiration checks, and decoding
 */

interface DecodedToken {
  id: string;
  exp: number;
  iat?: number;
}

/**
 * Decodes a JWT token without verification
 * Returns null if token is invalid or malformed
 */
export function decodeToken(token: string): DecodedToken | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded as DecodedToken;
  } catch {
    return null;
  }
}

/**
 * Checks if a JWT token is expired
 * Returns true if token is expired or invalid
 */
export function isTokenExpired(token: string | null): boolean {
  if (!token) {
    return true;
  }

  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  // Check if token is expired (with 5 second buffer for clock skew)
  const expirationTime = decoded.exp * 1000; // Convert to milliseconds
  const currentTime = Date.now();
  const buffer = 5000; // 5 seconds buffer

  return currentTime >= (expirationTime - buffer);
}

/**
 * Checks if a JWT token is valid (not expired and properly formatted)
 */
export function isTokenValid(token: string | null): boolean {
  if (!token) {
    return false;
  }

  return !isTokenExpired(token);
}

/**
 * Gets the expiration time of a token in milliseconds
 * Returns null if token is invalid
 */
export function getTokenExpiration(token: string | null): number | null {
  if (!token) {
    return null;
  }

  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return null;
  }

  return decoded.exp * 1000; // Convert to milliseconds
}
