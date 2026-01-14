/**
 * Auth Page
 * Login UI with "Sign in with Demo Provider" button
 */

import { useOAuthManager } from '../../../packages/react/hooks';
import { useState } from 'react';

export function AuthPage() {
  const manager = useOAuthManager();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await manager.signIn('demo');
      // Loading persists until callback completes
    } catch (error) {
      console.error('Sign in error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      padding: '2rem',
      gap: '1rem'
    }}>
      <h1>Sign In</h1>
      <p>Sign in with the demo OAuth provider</p>
      <button 
        onClick={handleSignIn}
        disabled={isLoading}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          backgroundColor: isLoading ? '#999' : '#007AFF',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          minWidth: '200px'
        }}
      >
        {isLoading ? 'Loading...' : 'Sign in with Demo Provider'}
      </button>
    </div>
  );
}
