/**
 * Utility functions for managing journal entries
 * 
 * This file handles reading and writing journal entries to localStorage.
 * In the future, this could be replaced with API calls to fetch from a database.
 */

export interface JournalEntry {
  id: string;              // Unique identifier
  content: string;         // Journal entry text
  timestamp: string;       // ISO timestamp when the entry was created
  dateKey: string;        // Normalized date key (YYYY-MM-DD) for date-based lookups
  allowSerenityAccess?: boolean;  // Future: User consent for Serenity to access this entry
}

/**
 * Normalizes a date to midnight in the user's local timezone
 * This creates a consistent date key for "same day" comparisons
 * 
 * @param date - The date to normalize (defaults to now)
 * @returns A date string in YYYY-MM-DD format
 */
export function normalizeDateToMidnight(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Saves a new journal entry
 * 
 * @param content - The journal entry text
 * @param allowSerenityAccess - Optional flag for future Serenity integration (defaults to false)
 * @returns The saved journal entry
 * 
 * HOW IT WORKS:
 * 1. Creates a unique ID for the entry
 * 2. Normalizes today's date to create a dateKey
 * 3. Saves to localStorage with timestamp
 * 4. Returns the saved entry
 * 
 * FUTURE SERENITY INTEGRATION:
 * - allowSerenityAccess flag is stored but not used yet
 * - When user explicitly shares journal with Serenity, this will be set to true
 * - Serenity will only access entries where allowSerenityAccess === true
 */
export function saveJournalEntry(
  content: string,
  allowSerenityAccess: boolean = false
): JournalEntry {
  const id = `journal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = new Date().toISOString();
  const dateKey = normalizeDateToMidnight();

  const entry: JournalEntry = {
    id,
    content: content.trim(),
    timestamp,
    dateKey,
    allowSerenityAccess, // Store for future use
  };

  try {
    // Get all existing journal entries
    const stored = localStorage.getItem('journalEntries');
    let entries: JournalEntry[] = [];
    
    if (stored) {
      try {
        entries = JSON.parse(stored);
        if (!Array.isArray(entries)) {
          entries = [];
        }
      } catch {
        entries = [];
      }
    }

    // Add new entry
    entries.push(entry);

    // Save back to localStorage
    localStorage.setItem('journalEntries', JSON.stringify(entries));
    
    return entry;
  } catch (error) {
    console.error('Error saving journal entry:', error);
    throw error;
  }
}

/**
 * Gets all journal entries, sorted by date (newest first)
 * 
 * @returns Array of all journal entries
 * 
 * USE CASES:
 * - Show journal history
 * - Generate reports
 * - Display entries in a list
 */
export function getAllJournalEntries(): JournalEntry[] {
  try {
    const stored = localStorage.getItem('journalEntries');
    
    if (!stored) {
      return [];
    }

    const entries: JournalEntry[] = JSON.parse(stored);
    
    if (!Array.isArray(entries)) {
      return [];
    }

    // Ensure all entries have dateKey (backward compatibility)
    const normalizedEntries = entries.map(entry => {
      if (!entry.dateKey) {
        entry.dateKey = normalizeDateToMidnight(new Date(entry.timestamp));
      }
      return entry;
    });

    // Sort by timestamp (newest first)
    return normalizedEntries.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (error) {
    console.error('Error reading journal entries:', error);
    return [];
  }
}

/**
 * Gets journal entries for a specific date
 * 
 * @param dateKey - The normalized date key (YYYY-MM-DD), defaults to today
 * @returns Array of journal entries for that date
 * 
 * NOTE: Users can write multiple entries per day
 */
export function getJournalEntriesForDate(dateKey?: string): JournalEntry[] {
  try {
    const targetDate = dateKey || normalizeDateToMidnight();
    const allEntries = getAllJournalEntries();
    
    return allEntries.filter(entry => {
      const entryDate = entry.dateKey || normalizeDateToMidnight(new Date(entry.timestamp));
      return entryDate === targetDate;
    });
  } catch (error) {
    console.error('Error reading journal entries for date:', error);
    return [];
  }
}

/**
 * Gets the most recent journal entry
 * 
 * @returns The latest journal entry, or null if none exists
 */
export function getLatestJournalEntry(): JournalEntry | null {
  const entries = getAllJournalEntries();
  return entries.length > 0 ? entries[0] : null;
}

/**
 * Gets journal entries that are allowed for Serenity access
 * 
 * @returns Array of journal entries where allowSerenityAccess === true
 * 
 * FUTURE USE:
 * - When user explicitly shares journal with Serenity
 * - Only these entries will be included in Serenity's context
 * - User must explicitly opt-in for each entry
 */
export function getSerenityAccessibleEntries(): JournalEntry[] {
  const allEntries = getAllJournalEntries();
  return allEntries.filter(entry => entry.allowSerenityAccess === true);
}

/**
 * Updates the allowSerenityAccess flag for a journal entry
 * 
 * @param entryId - The ID of the journal entry to update
 * @param allowAccess - Whether to allow Serenity access
 * 
 * FUTURE USE:
 * - Called when user explicitly shares/unshares a journal entry with Serenity
 * - Updates the flag in localStorage
 */
export function updateSerenityAccess(
  entryId: string,
  allowAccess: boolean
): void {
  try {
    const entries = getAllJournalEntries();
    const index = entries.findIndex(entry => entry.id === entryId);
    
    if (index !== -1) {
      entries[index].allowSerenityAccess = allowAccess;
      localStorage.setItem('journalEntries', JSON.stringify(entries));
    }
  } catch (error) {
    console.error('Error updating Serenity access:', error);
    throw error;
  }
}

/**
 * Formats journal entry data into a context string for the AI
 * 
 * @param entry - The journal entry
 * @returns A formatted string describing the journal entry
 * 
 * FUTURE USE:
 * - When user explicitly shares journal with Serenity
 * - This formats the entry for inclusion in AI context
 * - Only entries with allowSerenityAccess === true will be formatted
 */
export function formatJournalContext(entry: JournalEntry): string {
  const date = new Date(entry.timestamp);
  const formattedDate = date.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

  return `Journal entry from ${formattedDate}: "${entry.content.substring(0, 500)}${entry.content.length > 500 ? '...' : ''}"`;
}
