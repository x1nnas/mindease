import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { AuthContext, type User } from '../contexts/authContext';
import { isTokenValid, isTokenExpired } from '../utils/tokenUtils';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Clean up invalid/expired tokens and user data
  const clearAuth = () => {
    // Get user ID before clearing user data (for chat cleanup)
    const currentUser = user;
    const userId = currentUser?.id || null;
    
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userFirstName');
    
    // Clear chat history for this user
    if (userId) {
      // Import and call clearChatHistory
      import('../features/chat/useChat').then(({ clearChatHistory }) => {
        clearChatHistory(userId);
      });
    }
    // Also clear any guest chat history
    localStorage.removeItem('mindease_chat_messages_guest');
  };

  // Initial auth check on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    // Check if token exists and is valid
    if (storedToken && storedUser) {
      // Validate token expiration
      if (isTokenExpired(storedToken)) {
        // Token is expired - clear auth state
        console.log('Token expired, clearing auth state');
        clearAuth();
        setIsLoading(false);
        return;
      }

      // Token is valid - set auth state
      if (isTokenValid(storedToken)) {
      setToken(storedToken);
      try {
        const parsedUser = JSON.parse(storedUser);
        // If firstName is stored separately, merge it
        const firstName = localStorage.getItem('userFirstName');
        if (firstName && !parsedUser.firstName) {
          parsedUser.firstName = firstName;
        }
        setUser(parsedUser);
      } catch {
          // Invalid user data - clear everything
          clearAuth();
        }
      } else {
        // Token is invalid - clear auth state
        clearAuth();
      }
    } else {
      // No token or user data - ensure clean state
      clearAuth();
      }
    
    setIsLoading(false);
  }, []);

  // Periodic token validation (check every 5 minutes)
  useEffect(() => {
    if (!token) return;

    const validateInterval = setInterval(() => {
      const currentToken = localStorage.getItem('token');
      if (currentToken && isTokenExpired(currentToken)) {
        console.log('Token expired during session, clearing auth state');
        clearAuth();
        // Redirect to login
        window.location.href = '/auth';
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(validateInterval);
  }, [token]);

  const login = async (email: string, password: string) => {
    const { login: loginApi } = await import('../services/api');
    const response = await loginApi(email, password);
    
    setToken(response.token);
    setUser(response.user);
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
  };

  const register = async (email: string, password: string) => {
    const { register: registerApi } = await import('../services/api');
    const response = await registerApi(email, password);
    
    setToken(response.token);
    setUser(response.user);
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
  };

  const logout = () => {
    clearAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

