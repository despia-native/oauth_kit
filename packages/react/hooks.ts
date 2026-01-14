/**
 * OAuth Kit - React Hooks
 */

import { useState, useEffect, useCallback } from 'react';
import type { Session } from '../core/types';
import { useOAuthContext } from './context';

/**
 * Hook to get OAuth manager from context
 */
export function useOAuthManager() {
  const { manager } = useOAuthContext();
  return manager;
}

/**
 * Hook to get OAuth session state and methods
 */
export function useOAuth() {
  const { manager } = useOAuthContext();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load initial session
  useEffect(() => {
    manager.getSession().then((sess) => {
      setSession(sess);
      setIsLoading(false);
    }).catch((err) => {
      setError(err instanceof Error ? err : new Error('Failed to load session'));
      setIsLoading(false);
    });
  }, [manager]);

  const signIn = useCallback(async (providerName: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await manager.signIn(providerName);
      // Loading persists until callback completes
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Sign in failed'));
      setIsLoading(false);
    }
  }, [manager]);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await manager.signOut();
      setSession(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Sign out failed'));
    } finally {
      setIsLoading(false);
    }
  }, [manager]);

  // Poll for session changes (simple approach - providers can implement onAuthStateChange)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const sess = await manager.getSession();
        setSession(sess);
      } catch {
        // Ignore errors
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [manager]);

  return {
    session,
    isLoading,
    error,
    signIn,
    signOut,
    isAuthenticated: !!session,
  };
}

/**
 * Hook to get only session state
 */
export function useOAuthSession() {
  const { session } = useOAuth();
  return session;
}
