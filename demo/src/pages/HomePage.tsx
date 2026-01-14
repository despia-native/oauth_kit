/**
 * Home Page
 * Shows login button if not authenticated, user info if authenticated
 */

import { useOAuth } from '../../../packages/react/hooks';
import { useNavigate } from 'react-router-dom';

export function HomePage() {
  const { session, isLoading, signOut, isAuthenticated } = useOAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !session) {
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
        <h1>OAuth Kit Demo</h1>
        <p>Please sign in to continue</p>
        <button 
          onClick={() => navigate('/auth')}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#007AFF',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Sign In
        </button>
      </div>
    );
  }

  // User is authenticated
  const { user } = session;

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      padding: '2rem',
      gap: '1rem',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <h1>Welcome!</h1>
      
      {user.avatar_url && (
        <img 
          src={user.avatar_url} 
          alt={user.name || 'User'} 
          style={{ width: '80px', height: '80px', borderRadius: '50%' }}
        />
      )}
      
      <div style={{ textAlign: 'center' }}>
        <h2>{user.name || 'User'}</h2>
        {user.email && <p>{user.email}</p>}
        {user.id && <p style={{ fontSize: '14px', color: '#666' }}>ID: {user.id}</p>}
      </div>

      <button 
        onClick={async () => {
          await signOut();
          navigate('/');
        }}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          backgroundColor: '#FF3B30',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          marginTop: '1rem'
        }}
      >
        Sign Out
      </button>
    </div>
  );
}
