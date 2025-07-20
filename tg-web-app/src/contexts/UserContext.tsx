import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTelegram } from './TelegramContext';

interface User {
  _id: string;
  telegramId: number;
  firstName: string;
  lastName?: string;
  username?: string;
  age: number;
  bio?: string;
  photos: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
  preferences: {
    minAge: number;
    maxAge: number;
    maxDistance: number;
  };
  isActive: boolean;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  updateUser: (userData: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  error: null,
  updateUser: async () => {},
  refreshUser: async () => {}
});

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: React.ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: telegramUser, isReady } = useTelegram();

  const fetchUser = async () => {
    if (!telegramUser?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/users/profile/${telegramUser.id}`);
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else if (response.status === 404) {
        // Пользователь не найден - это нормально для новых пользователей
        setUser(null);
      } else {
        throw new Error('Ошибка загрузки профиля');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!telegramUser?.id) return;
    
    try {
      setError(null);
      
      const response = await fetch('/api/users/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Telegram-Init-Data': window.Telegram?.WebApp?.initData || ''
        },
        body: JSON.stringify({
          telegramId: telegramUser.id,
          firstName: telegramUser.first_name,
          lastName: telegramUser.last_name,
          username: telegramUser.username,
          ...userData
        })
      });
      
      if (!response.ok) {
        throw new Error('Ошибка обновления профиля');
      }
      
      const updatedUser = await response.json();
      setUser(updatedUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      throw err;
    }
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  useEffect(() => {
    if (isReady && telegramUser) {
      fetchUser();
    }
  }, [isReady, telegramUser]);

  return (
    <UserContext.Provider value={{ user, loading, error, updateUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};