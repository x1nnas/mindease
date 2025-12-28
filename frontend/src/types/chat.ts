export type Sender = 'user' | 'serenity';

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: Date | string; // Allow string for API responses, convert to Date when needed
}

export interface SendMessagePayload {
  text: string;
  // Add userId, sessionId, etc. later if needed
}