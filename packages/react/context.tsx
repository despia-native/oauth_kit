/**
 * OAuth Kit - React Context
 */

import React, { createContext, useContext, useMemo } from 'react';
import type { OAuthKitConfig } from '../core/types';
import { OAuthManager } from '../core/oauth-manager';

interface OAuthContextValue {
  manager: OAuthManager;
  config: OAuthKitConfig;
}

const OAuthContext = createContext<OAuthContextValue | null>(null);

export interface OAuthProviderProps {
  config: OAuthKitConfig;
  children: React.ReactNode;
}

/**
 * OAuth Provider Component
 * Wraps app and provides OAuth manager to children
 */
export function OAuthProvider({ config, children }: OAuthProviderProps) {
  const manager = useMemo(() => {
    return new OAuthManager(config);
  }, [config.appUrl, config.deeplinkScheme, config.provider]);

  const value = useMemo(() => ({
    manager,
    config,
  }), [manager, config]);

  return (
    <OAuthContext.Provider value={value}>
      {children}
    </OAuthContext.Provider>
  );
}

/**
 * Hook to access OAuth context
 */
export function useOAuthContext(): OAuthContextValue {
  const context = useContext(OAuthContext);
  if (!context) {
    throw new Error('useOAuthContext must be used within OAuthProvider');
  }
  return context;
}
