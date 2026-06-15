'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ACCESS_TOKEN_KEY,
  clearTokens,
  getAccessToken,
  login as apiLogin,
  type LoginPayload,
} from '@/lib/api';

export interface UseAuthResult {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
}

/**
 * Client-side auth hook backed by localStorage tokens.
 */
export function useAuth(): UseAuthResult {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsAuthenticated(Boolean(getAccessToken()));
    setIsLoading(false);

    const onStorage = (event: StorageEvent) => {
      if (event.key === ACCESS_TOKEN_KEY) {
        setIsAuthenticated(Boolean(getAccessToken()));
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    await apiLogin(payload);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setIsAuthenticated(false);
  }, []);

  return { isAuthenticated, isLoading, login, logout };
}
