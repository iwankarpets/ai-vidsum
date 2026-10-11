'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { type User } from '../api/types';
import { refreshSession, setAccessToken, setSessionExpiredHandler } from '../api/client';
import { authApi } from '../api/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const queryClient = useQueryClient();

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setToken(null);
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

 
  useEffect(() => {
    setSessionExpiredHandler(() => {
      clearSession();
      router.push('/auth/login');
    });
    return () => setSessionExpiredHandler(null);
  }, [clearSession, router]);

  // При загрузке страницы пробуем восстановить сессию по refresh-cookie
  useEffect(() => {
    refreshSession()
      .then(({ user: currentUser, token: freshToken }) => {
        setToken(freshToken);
        setUser(currentUser);
      })
      .catch(() => {
        clearSession();
      })
      .finally(() => {
        setLoading(false);
      });
  }, [clearSession]);

  const login = (newToken: string, newUser: User) => {
    setAccessToken(newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    void authApi.logout().catch(() => undefined);
    clearSession();
    router.push('/auth/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useRequireAuth() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [loading, user, router]);

  return { user, loading };
}