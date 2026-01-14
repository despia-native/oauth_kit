/**
 * Main App Component
 * Sets up routes and OAuth provider
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { OAuthProvider } from '../../packages/react/context';
import { mockProvider } from './providers/mock-provider';
import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { CallbackPage } from './pages/CallbackPage';
import { NativeCallbackPage } from './pages/NativeCallbackPage';

// Get app URL from current location
const appUrl = typeof window !== 'undefined' 
  ? `${window.location.protocol}//${window.location.host}`
  : 'http://localhost:5173';

function App() {
  return (
    <OAuthProvider
      config={{
        appUrl,
        deeplinkScheme: 'myapp',
        provider: mockProvider,
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/callback" element={<CallbackPage />} />
          <Route path="/native-callback" element={<NativeCallbackPage />} />
        </Routes>
      </BrowserRouter>
    </OAuthProvider>
  );
}

export default App;
