export type Sender = 'user' | 'serenity';

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: Date | string;
}

export interface SendMessagePayload {
  text: string;
}

