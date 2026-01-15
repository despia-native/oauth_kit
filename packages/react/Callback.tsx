/**
 * OAuth Kit - Callback Component
 * Universal component for web OAuth callback
 */

import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import type { OAuthProvider, AuthResult } from '../core/types';

export interface CallbackProps {
  /** OAuth provider instance */
  provider: OAuthProvider;
  
  /** Path to redirect to after successful callback */
  redirectTo?: string;
  
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
 * Callback Component
 * Universal web callback component
 */
export function Callback({
  provider,
  redirectTo = '/',
  onError,
  onSuccess,
  loadingComponent,
  errorComponent,
}: CallbackProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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

        // Hash params (some providers use hash)
        if (typeof window !== 'undefined' && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          hashParams.forEach((value, key) => {
            params[key] = value;
          });
        }

        // Check for error in params
        if (params.error) {
          throw new Error(params.error_description || params.error);
        }

        // Handle callback with provider
        const result = await provider.handleCallback(params);

        // Validate result has required fields
        if (!result || !result.access_token) {
          throw new Error('Invalid OAuth response: missing access_token');
        }

        // Set session
        await provider.setSession({
          access_token: result.access_token,
          refresh_token: result.refresh_token,
          expires_in: result.expires_in,
        });

        // Call success handler
        onSuccess?.(result);

        // Redirect to destination
        navigate(redirectTo, { replace: true });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
        setError(errorMessage);
        setIsProcessing(false);
        
        // Call error handler
        onError?.(err instanceof Error ? err : new Error(errorMessage));
      }
    };

    handleCallback();
  }, [searchParams, provider, redirectTo, navigate, onError, onSuccess]);

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
          <button onClick={() => navigate('/')}>Go to home</button>
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
