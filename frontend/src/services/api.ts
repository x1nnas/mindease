import { API_BASE_URL } from '../config/env';
import { isTokenExpired } from '../utils/tokenUtils';

/**
 * Handles 401/403 responses by clearing auth and redirecting to login
 * This is called when API requests fail due to expired/invalid tokens
 * 
 * Why window.location.href instead of navigate?
 * - Forces full page reload, clearing all React state
 * - Ensures auth state is completely reset
 * - Prevents any stale state from persisting
 */
const handleAuthError = () => {
  // Clear auth state
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('userFirstName');
  
  // Only redirect if we're not already on auth page
  if (window.location.pathname !== '/auth' && window.location.pathname !== '/') {
    // Redirect to login page
    // Use window.location to force full page reload and clear React state
    window.location.href = '/auth';
  }
};

const getHeaders = () => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  const token = localStorage.getItem('token');
  
  // Check if token is expired before sending request
  if (token) {
    if (isTokenExpired(token)) {
      // Token expired - handle auth error
      handleAuthError();
      throw new Error('Session expired. Please log in again.');
    }
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

export interface SerenityResponse {
  message: string;
  reply: string;
  meta: {
    isGuest: boolean;
    userId: string | null;
  };
}

export interface AuthResponse {
  message: string;
  token: string;
  user: {
    email: string;
    id: string;
  };
}

export const register = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Registration failed' }));
    throw new Error(errorData.message || 'Registration failed. Please try again.');
  }

  return response.json();
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
    throw new Error(errorData.message || 'Invalid email or password.');
  }

  return response.json();
};

/**
 * Sends a message to Serenity (the AI chatbot)
 * 
 * @param message - The user's message text
 * @param history - Previous conversation messages for context
 * @param moodContext - Optional mood check-in data to provide context about user's emotional state
 * 
 * HOW IT WORKS:
 * 1. Makes a POST request to the backend /api/serenity/chat endpoint
 * 2. Sends the message, conversation history, and mood context in the request body
 * 3. The backend uses this data to generate a personalized AI response
 * 4. Returns the AI's reply
 * 
 * WHY MOOD CONTEXT?
 * - Helps Serenity understand the user's current emotional state
 * - Allows for more empathetic and relevant responses
 * - Example: If user reported feeling sad, Serenity can acknowledge that
 */
export const sendMessage = async (
  message: string,
  history?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  moodContext?: string | null
): Promise<SerenityResponse> => {
  // Build the request body with message, history, and optional mood context
  const requestBody: {
    message: string;
    history?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
    moodContext?: string;
  } = {
    message,
  };

  // Only include history if it exists (not empty)
  if (history && history.length > 0) {
    requestBody.history = history;
  }

  // Only include mood context if it exists
  // This prevents sending null/undefined values
  if (moodContext) {
    requestBody.moodContext = moodContext;
  }

  const response = await fetch(`${API_BASE_URL}/api/serenity/chat`, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify(requestBody),
  });

  // Handle auth errors (401 Unauthorized, 403 Forbidden)
  if (response.status === 401 || response.status === 403) {
    handleAuthError();
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to reach Serenity' }));
    throw new Error(errorData.message || 'Failed to reach Serenity. Please try again.');
  }

  return response.json();
};

/**
 * Mood Check-In API Functions
 */

export interface MoodCheckInResponse {
  id: string;
  userId: string;
  date: string; // ISO date string (normalized to start-of-day UTC)
  value: number; // 0-100
  label: string;
  createdAt: string; // ISO timestamp
}

export interface MoodCheckInRequest {
  value: number;
  label: string;
}

/**
 * Saves or updates a mood check-in for today
 * Backend enforces one mood per user per day via compound unique index
 */
export const saveOrUpdateMoodCheckIn = async (
  moodData: MoodCheckInRequest
): Promise<MoodCheckInResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/mood`, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify(moodData),
  });

  // Handle auth errors
  if (response.status === 401 || response.status === 403) {
    handleAuthError();
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to save mood check-in' }));
    throw new Error(errorData.message || 'Failed to save mood check-in. Please try again.');
  }

  const data = await response.json();
  return data.moodCheckIn;
};

/**
 * Gets the mood check-in for today
 */
export const getTodayMoodCheckIn = async (): Promise<MoodCheckInResponse | null> => {
  const response = await fetch(`${API_BASE_URL}/api/mood/today`, {
    method: 'GET',
    headers: getHeaders(),
    credentials: 'include',
  });

  // Handle auth errors
  if (response.status === 401 || response.status === 403) {
    handleAuthError();
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to get mood check-in' }));
    throw new Error(errorData.message || 'Failed to get mood check-in.');
  }

  const data = await response.json();
  return data.moodCheckIn || null;
};

/**
 * Gets the latest mood check-in
 */
export const getLatestMoodCheckIn = async (): Promise<MoodCheckInResponse | null> => {
  const response = await fetch(`${API_BASE_URL}/api/mood/latest`, {
    method: 'GET',
    headers: getHeaders(),
    credentials: 'include',
  });

  // Handle auth errors
  if (response.status === 401 || response.status === 403) {
    handleAuthError();
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to get mood check-in' }));
    throw new Error(errorData.message || 'Failed to get mood check-in.');
  }

  const data = await response.json();
  return data.moodCheckIn || null;
};

/**
 * Gets all mood check-ins for the user
 */
export const getAllMoodCheckIns = async (): Promise<MoodCheckInResponse[]> => {
  const response = await fetch(`${API_BASE_URL}/api/mood`, {
    method: 'GET',
    headers: getHeaders(),
    credentials: 'include',
  });

  // Handle auth errors
  if (response.status === 401 || response.status === 403) {
    handleAuthError();
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to get mood check-ins' }));
    throw new Error(errorData.message || 'Failed to get mood check-ins.');
  }

  const data = await response.json();
  return data.moodCheckIns || [];
};

/**
 * Journal Entry API Functions
 */

export interface JournalEntryResponse {
  id: string;
  userId: string;
  content: string;
  allowSerenityAccess: boolean;
  createdAt: string; // ISO timestamp
}

export interface JournalEntryRequest {
  content: string;
  allowSerenityAccess?: boolean;
}

/**
 * Creates a new journal entry
 */
export const createJournalEntry = async (
  entryData: JournalEntryRequest
): Promise<JournalEntryResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/journal`, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify(entryData),
  });

  // Handle auth errors
  if (response.status === 401 || response.status === 403) {
    handleAuthError();
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to create journal entry' }));
    throw new Error(errorData.message || 'Failed to create journal entry. Please try again.');
  }

  const data = await response.json();
  return data.journalEntry;
};

/**
 * Gets all journal entries for the user
 */
export const getAllJournalEntries = async (): Promise<JournalEntryResponse[]> => {
  const response = await fetch(`${API_BASE_URL}/api/journal`, {
    method: 'GET',
    headers: getHeaders(),
    credentials: 'include',
  });

  // Handle auth errors
  if (response.status === 401 || response.status === 403) {
    handleAuthError();
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to get journal entries' }));
    throw new Error(errorData.message || 'Failed to get journal entries.');
  }

  const data = await response.json();
  return data.journalEntries || [];
};

/**
 * Gets a single journal entry by ID
 */
export const getJournalEntryById = async (id: string): Promise<JournalEntryResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/journal/${id}`, {
    method: 'GET',
    headers: getHeaders(),
    credentials: 'include',
  });

  // Handle auth errors
  if (response.status === 401 || response.status === 403) {
    handleAuthError();
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Journal entry not found' }));
    throw new Error(errorData.message || 'Journal entry not found.');
  }

  const data = await response.json();
  return data.journalEntry;
};

/**
 * Updates a journal entry
 */
export const updateJournalEntry = async (
  id: string,
  entryData: Partial<JournalEntryRequest>
): Promise<JournalEntryResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/journal/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify(entryData),
  });

  // Handle auth errors
  if (response.status === 401 || response.status === 403) {
    handleAuthError();
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to update journal entry' }));
    throw new Error(errorData.message || 'Failed to update journal entry. Please try again.');
  }

  const data = await response.json();
  return data.journalEntry;
};

/**
 * Deletes a journal entry
 */
export const deleteJournalEntry = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/journal/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
    credentials: 'include',
  });

  // Handle auth errors
  if (response.status === 401 || response.status === 403) {
    handleAuthError();
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to delete journal entry' }));
    throw new Error(errorData.message || 'Failed to delete journal entry. Please try again.');
  }
};
