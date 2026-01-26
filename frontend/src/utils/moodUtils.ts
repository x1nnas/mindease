/**
 * Utility functions for managing mood check-in data
 * 
 * This file now uses API calls to fetch from MongoDB.
 * Backend stores data with userId, normalized date (UTC), value, label, createdAt.
 */

import {
  saveOrUpdateMoodCheckIn as apiSaveOrUpdateMoodCheckIn,
  getTodayMoodCheckIn as apiGetTodayMoodCheckIn,
  getLatestMoodCheckIn as apiGetLatestMoodCheckIn,
  getAllMoodCheckIns as apiGetAllMoodCheckIns,
  type MoodCheckInResponse,
} from '../services/api';

/**
 * Frontend-compatible interface (maps from API response)
 * Maintains backward compatibility with existing code
 */
export interface MoodCheckIn {
  value: number;        // 0-100 mood value
  label: string;        // Human-readable label (e.g., "Feeling Amazing! ✨")
  timestamp: string;   // ISO timestamp (from createdAt)
  dateKey: string;     // Normalized date key (YYYY-MM-DD) derived from date
}

/**
 * Gets the most recent mood check-in from API
 * 
 * @returns The latest mood check-in, or null if none exists
 */
export async function getLatestMoodCheckIn(): Promise<MoodCheckIn | null> {
  try {
    const apiResponse = await apiGetLatestMoodCheckIn();
    return mapApiResponseToMoodCheckIn(apiResponse);
  } catch (error) {
    console.error('Error reading mood check-in:', error);
    return null;
  }
}

/**
 * Gets all mood check-ins from API, sorted by date (newest first)
 * 
 * @returns Array of all mood check-ins
 * 
 * USE CASES:
 * - Generate mood reports/charts
 * - Show mood history
 * - Analyze mood trends over time
 * 
 * NOTE: Backend enforces one mood per user per day via compound unique index
 */
export async function getAllMoodCheckIns(): Promise<MoodCheckIn[]> {
  try {
    const apiResponses = await apiGetAllMoodCheckIns();
    return apiResponses
      .map(mapApiResponseToMoodCheckIn)
      .filter((m: MoodCheckIn | null): m is MoodCheckIn => m !== null);
  } catch (error) {
    console.error('Error reading all mood check-ins:', error);
    return [];
  }
}

/**
 * Checks if a mood check-in was created "today" based on user's local timezone
 * 
 * @param moodTimestamp - ISO timestamp string from the mood check-in
 * @returns true if the mood was created today in user's local timezone
 */
function isMoodFromToday(moodTimestamp: string): boolean {
  const moodDate = new Date(moodTimestamp);
  const now = new Date();
  
  // Get local date components for both dates
  const moodLocalDate = new Date(moodDate.getFullYear(), moodDate.getMonth(), moodDate.getDate());
  const todayLocalDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Compare dates (ignoring time)
  return moodLocalDate.getTime() === todayLocalDate.getTime();
}

/**
 * Normalizes a date to YYYY-MM-DD format
 * Backend stores dates normalized to start-of-day UTC
 * This function converts API date strings to the format used by frontend
 * 
 * @param date - The date to normalize (Date object or ISO string)
 * @returns A date string in YYYY-MM-DD format
 */
export function normalizeDateToMidnight(date: Date | string = new Date()): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const year = dateObj.getUTCFullYear();
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Converts API response to frontend-compatible format
 */
function mapApiResponseToMoodCheckIn(apiResponse: MoodCheckInResponse | null): MoodCheckIn | null {
  if (!apiResponse) return null;
  
  // Validate required fields to prevent crashes from malformed API responses
  if (!apiResponse.date || !apiResponse.createdAt || apiResponse.value === undefined || !apiResponse.label) {
    console.error('Invalid mood check-in response:', apiResponse);
    return null;
  }
  
  return {
    value: apiResponse.value,
    label: apiResponse.label,
    timestamp: apiResponse.createdAt,
    dateKey: normalizeDateToMidnight(apiResponse.date),
  };
}

/**
 * Gets the mood check-in for a specific date (or today)
 * 
 * @param dateKey - The normalized date key (YYYY-MM-DD), defaults to today
 * @returns The mood check-in for that date, or null if none exists
 * 
 * USE CASES:
 * - Check if user already checked in today
 * - Get mood for a specific date for reports
 */
export async function getMoodCheckInForDate(dateKey?: string): Promise<MoodCheckIn | null> {
  try {
    // If specific date requested, get all and filter
    // Otherwise, use today endpoint
    if (dateKey && dateKey !== normalizeDateToMidnight()) {
      const allMoods = await getAllMoodCheckIns();
      return allMoods.find(m => m.dateKey === dateKey) || null;
    }
    
    // Use today endpoint for current date
    const apiResponse = await apiGetTodayMoodCheckIn();
    return mapApiResponseToMoodCheckIn(apiResponse);
  } catch (error) {
    console.error('Error reading mood check-in for date:', error);
    return null;
  }
}

/**
 * Checks if user has already checked in today (based on user's local timezone)
 * 
 * @returns Promise that resolves to true if a mood check-in exists for today, false otherwise
 * 
 * USE CASE:
 * - Show "You already checked in today" message
 * - Disable check-in button if already done
 * - Show different UI based on check-in status
 * 
 * NOTE: Uses local timezone to determine "today", so midnight in user's timezone
 * resets the check-in requirement, not UTC midnight.
 */
export async function hasCheckedInToday(): Promise<boolean> {
  try {
    // Get all moods and check if any were created "today" in local timezone
    const allMoods = await getAllMoodCheckIns();
    
    // Check if any mood was created today (based on local timezone)
    return allMoods.some(m => isMoodFromToday(m.timestamp));
  } catch (error) {
    console.error('Error checking if checked in today:', error);
    // Fallback: try the API's "today" endpoint (uses UTC, but better than nothing)
    try {
      const mood = await getMoodCheckInForDate();
      if (mood && mood.timestamp) {
        return isMoodFromToday(mood.timestamp);
      }
      return false;
    } catch (fallbackError) {
      console.error('Fallback check also failed:', fallbackError);
      return false;
    }
  }
}

/**
 * Saves or updates a mood check-in for today
 * Backend enforces one mood per user per day via compound unique index
 * 
 * @param moodData - The mood data to save (value, label)
 * @returns The saved mood check-in object
 * 
 * HOW IT WORKS:
 * 1. Calls API to save/update mood check-in
 * 2. Backend normalizes date to start-of-day UTC
 * 3. Backend uses upsert to create or update
 * 4. Returns the saved mood check-in
 */
export async function saveOrUpdateMoodCheckIn(moodData: {
  value: number;
  label: string;
}): Promise<MoodCheckIn> {
  try {
    const apiResponse = await apiSaveOrUpdateMoodCheckIn(moodData);
    return mapApiResponseToMoodCheckIn(apiResponse)!;
  } catch (error) {
    console.error('Error saving mood check-in:', error);
    throw error;
  }
}

/**
 * Formats mood data into a context string for the AI
 * 
 * @param mood - The mood check-in data
 * @returns A formatted string describing the user's mood
 * 
 * HOW IT WORKS:
 * This function converts the mood data into a natural language description
 * that the AI can understand and use in its responses.
 * 
 * EXAMPLE OUTPUT:
 * "The user recently reported feeling 'Feeling Amazing! ✨' (mood value: 100) on [timestamp]"
 */
export function formatMoodContext(mood: MoodCheckIn): string {
  const date = new Date(mood.timestamp);
  const formattedDate = date.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

  return `The user recently reported feeling '${mood.label}' (mood value: ${mood.value}/100) on ${formattedDate}.`;
}
