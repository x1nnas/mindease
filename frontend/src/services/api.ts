import { API_BASE_URL } from '../config/env';

const getHeaders = () => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  const token = localStorage.getItem('token');
  if (token) {
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

export const sendMessage = async (
  message: string,
  history?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
): Promise<SerenityResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/serenity/chat`, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify({ message, history }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to reach Serenity' }));
    throw new Error(errorData.message || 'Failed to reach Serenity. Please try again.');
  }

  return response.json();
};
