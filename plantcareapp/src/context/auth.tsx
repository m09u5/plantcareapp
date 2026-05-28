import React, { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';

import { loginUser, registerUser, type AuthResponse, type AuthUser, type RegisterResponse } from '@/lib/api';

type AuthContextValue = {
  isReady: boolean;
  token: string | null;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<RegisterResponse>;
  logout: () => void;
};

const STORAGE_KEY = 'plantcare.session';
const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredSession() {
  if (Platform.OS !== 'web' || typeof localStorage === 'undefined') {
    return null;
  }

  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as AuthResponse | null;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function storeSession(session: AuthResponse | null) {
  if (Platform.OS !== 'web' || typeof localStorage === 'undefined') {
    return;
  }

  if (session) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const session = readStoredSession();

    if (session?.token && session.user) {
      setToken(session.token);
      setUser(session.user);
    }

    setIsReady(true);
  }, []);

  const saveSession = (session: AuthResponse) => {
    setToken(session.token);
    setUser(session.user);
    storeSession(session);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      isReady,
      token,
      user,
      login: async (email, password) => {
        saveSession(await loginUser(email, password));
      },
      register: async (email, password) => {
        return registerUser(email, password);
      },
      logout: () => {
        setToken(null);
        setUser(null);
        storeSession(null);
      },
    }),
    [isReady, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
