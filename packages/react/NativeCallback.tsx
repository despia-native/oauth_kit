/**
 * OAuth Kit - NativeCallback Component
 * Universal component for native OAuth callback (drop on page with props)
 */

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { OAuthProvider, AuthResult } from '../core/types';
import { createDespiaDeeplink } from '../core/despia-handler';

export interface NativeCallbackProps {
  /** Despia deeplink scheme (e.g., 'myapp') */
  deeplinkScheme: string;
  
  /** Path to redirect to after callback (in WebView, not browser) */
  exitPath?: string;
  
  /** OAuth provider instance */
  provider: OAuthProvider;
  
  /** Optional: Custom error handler */
  onError?: (error: Error) => void;
  
  /** Optional: Custom success handler */
  onSuccess?: (result: AuthResult) => void;
  
  /** Optional: Loading component */
  loadingComponent?: React.ReactNode;
  
  /** Optional: Error component */
  errorComponent?: (error: string) => React.ReactNode;
}

/**
 * NativeCallback Component
 * Universal boilerplate - drop on page with props, handles everything
 */
export function NativeCallback({
  deeplinkScheme,
  exitPath = '/auth/callback',
  provider,
  onError,
  onSuccess,
  loadingComponent,
  errorComponent,
}: NativeCallbackProps) {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setIsProcessing(true);

        // Extract all params from URL (query + hash)
        const params: Record<string, string> = {};
        
        // Query params
        searchParams.forEach((value, key) => {
          params[key] = value;
        });

        // Hash params (many OAuth providers use hash for implicit flow)
        // Extract access_token, token_type, expires_in, etc. from hash
        if (typeof window !== 'undefined' && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          hashParams.forEach((value, key) => {
            params[key] = value;
          });
        }

        // Handle callback with provider
        const result = await provider.handleCallback(params);

        // Set session
        await provider.setSession({
          access_token: result.access_token,
          refresh_token: result.refresh_token,
          expires_in: result.expires_in,
        });

        // Call success handler
        onSuccess?.(result);

        // Build deeplink to close browser session
        // Format: myapp://oauth/{exitPath}?tokens
        const deeplinkParams: Record<string, string> = {
          access_token: result.access_token,
        };

        if (result.refresh_token) {
          deeplinkParams.refresh_token = result.refresh_token;
        }

        // Remove leading slash from exitPath if present
        const path = exitPath.replace(/^\//, '');
        
        const deeplink = createDespiaDeeplink(path, deeplinkParams, deeplinkScheme);

        // Redirect to deeplink - this CLOSES the browser session
        if (typeof window !== 'undefined') {
          window.location.href = deeplink;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
        setError(errorMessage);
        setIsProcessing(false);
        
        // Call error handler
        onError?.(err instanceof Error ? err : new Error(errorMessage));

        // Redirect with error
        const path = exitPath.replace(/^\//, '');
        const errorDeeplink = createDespiaDeeplink(
          path,
          { error: errorMessage },
          deeplinkScheme
        );
        
        if (typeof window !== 'undefined') {
          window.location.href = errorDeeplink;
        }
      }
    };

    handleCallback();
  }, [searchParams, provider, deeplinkScheme, exitPath, onError, onSuccess]);

  // Show error if present
  if (error) {
    if (errorComponent) {
      return <>{errorComponent(error)}</>;
    }
    
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        padding: '1rem',
        textAlign: 'center'
      }}>
        <div>
          <h2>Sign in failed</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Show loading
  if (loadingComponent) {
    return <>{loadingComponent}</>;
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      <div>Completing sign in...</div>
    </div>
  );
}
