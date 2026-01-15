# OAuth Kit for Despia Native Apps

Universal OAuth component kit for Despia Native SDK. Handles OAuth authentication flows in native mobile apps wrapped with Despia, automatically managing the complex native browser session handling.

## Why Do I Need This?

**The Problem**: When you wrap your web app as a native iOS/Android app using Despia, OAuth authentication breaks because:

- Your app runs in a **WebView** (embedded browser)
- WebViews **cannot handle OAuth redirects properly**
- OAuth providers redirect back to URLs, but the WebView doesn't know what to do
- Standard web OAuth flows fail silently or get stuck

**The Solution**: This kit automatically:
- Detects when running in a Despia native app
- Opens OAuth in a secure native browser session (ASWebAuthenticationSession on iOS, Chrome Custom Tabs on Android)
- Handles the callback and closes the browser session properly
- Sets the session in your WebView so authentication persists

**When You Need This**: If you're building a web app that will be wrapped as a native app with Despia and you want OAuth login (Google, Apple, GitHub, custom providers, etc.), you need this kit.

### The Flow Without This Kit (Broken)

```
User clicks "Sign in" 
  → OAuth opens in WebView
  → OAuth provider redirects
  → ❌ WebView doesn't handle redirect properly
  → ❌ Authentication fails
```

### The Flow With This Kit (Working)

**Web Browser**:
```
User clicks "Sign in" 
  → Standard OAuth popup/redirect
  → OAuth provider redirects to /auth/callback
  → ✅ Session set, user logged in
```

**Native App (Despia)**:
```
User clicks "Sign in"
  → Kit detects native environment
  → Opens OAuth in ASWebAuthenticationSession/Chrome Custom Tab
  → User authenticates in secure browser session
  → OAuth provider redirects to /native-callback
  → Kit closes browser session via deeplink
  → ✅ Session set in WebView, user logged in
```

## Quick Summary

**What it does**: Provides drop-in React components and a standardized OAuth flow that works in both web browsers and Despia native apps.

**When to use it**: Any OAuth provider in a React app that will be wrapped as a native app with Despia.

**Installation**: 
```bash
npm install @oauth-kit/react @oauth-kit/core
```

## Quick Start

### Minimal Setup (3 Steps)

**Step 1**: Wrap your app with `OAuthProvider`

```tsx
// src/App.tsx
import { OAuthProvider } from '@oauth-kit/react';
import { YourProvider } from './providers/your-provider';

function App() {
  return (
    <OAuthProvider
      config={{
        appUrl: window.location.origin,
        deeplinkScheme: 'myapp', // Your Despia app scheme
        provider: new YourProvider(),
      }}
    >
      {/* Your app routes */}
    </OAuthProvider>
  );
}
```

**Step 2**: Add required routes

```tsx
// src/App.tsx (in your routes)
<Routes>
  <Route path="/auth/callback" element={<CallbackPage />} />
  <Route path="/native-callback" element={<NativeCallbackPage />} />
  {/* Your other routes */}
</Routes>
```

**Step 3**: Create callback pages

```tsx
// src/pages/CallbackPage.tsx
import { Callback } from '@oauth-kit/react';
import { yourProvider } from '../providers/your-provider';

export function CallbackPage() {
  return <Callback provider={yourProvider} redirectTo="/" />;
}

// src/pages/NativeCallbackPage.tsx
import { NativeCallback } from '@oauth-kit/react';
import { yourProvider } from '../providers/your-provider';

export function NativeCallbackPage() {
  return (
    <NativeCallback
      deeplinkScheme="myapp"
      exitPath="/auth/callback"
      provider={yourProvider}
    />
  );
}
```

**That's it!** Now you can use `useOAuth()` hook anywhere in your app.

## Detailed Setup Guide

### Step 1: Install the Package

```bash
npm install @oauth-kit/react @oauth-kit/core
# or
yarn add @oauth-kit/react @oauth-kit/core
```

### Step 2: Choose or Create a Provider

You need an OAuth provider implementation. Options:

- **Use an existing provider**: Check the `packages/providers/` directory
- **Create your own**: See [Creating a Provider](#creating-a-provider) section below
- **Use Supabase/Auth0/etc.**: Implement the `OAuthProvider` interface for your service

### Step 3: Wrap Your App

Wrap your root component with `OAuthProvider`:

```tsx
// src/App.tsx or src/main.tsx
import { OAuthProvider } from '@oauth-kit/react';
import { BrowserRouter } from 'react-router-dom';
import { yourProvider } from './providers/your-provider';

function App() {
  return (
    <OAuthProvider
      config={{
        appUrl: typeof window !== 'undefined' 
          ? window.location.origin 
          : 'http://localhost:5173',
        deeplinkScheme: 'myapp', // Must match your Despia app configuration
        provider: yourProvider,
      }}
    >
      <BrowserRouter>
        {/* Your routes */}
      </BrowserRouter>
    </OAuthProvider>
  );
}
```

**Required Config Values**:
- `appUrl`: Your app's base URL (automatically detected in browser)
- `deeplinkScheme`: Your Despia app's deeplink scheme (e.g., 'myapp')
- `provider`: Your OAuth provider instance

### Step 4: Add Required Routes

You **must** add these two routes for OAuth callbacks:

```tsx
// src/App.tsx or your router file
import { Routes, Route } from 'react-router-dom';
import { CallbackPage } from './pages/CallbackPage';
import { NativeCallbackPage } from './pages/NativeCallbackPage';

<Routes>
  {/* Required OAuth routes */}
  <Route path="/auth/callback" element={<CallbackPage />} />
  <Route path="/native-callback" element={<NativeCallbackPage />} />
  
  {/* Your other routes */}
  <Route path="/" element={<HomePage />} />
  {/* ... */}
</Routes>
```

**Important**: These route paths are standardized and cannot be changed. All providers use the same paths.

### Step 5: Create Callback Pages

**Web Callback Page** (`/auth/callback`):

```tsx
// src/pages/CallbackPage.tsx
import { Callback } from '@oauth-kit/react';
import { yourProvider } from '../providers/your-provider';

export function CallbackPage() {
  return (
    <Callback
      provider={yourProvider}
      redirectTo="/" // Where to redirect after successful login
    />
  );
}
```

**Native Callback Page** (`/native-callback`):

```tsx
// src/pages/NativeCallbackPage.tsx
import { NativeCallback } from '@oauth-kit/react';
import { yourProvider } from '../providers/your-provider';

export function NativeCallbackPage() {
  return (
    <NativeCallback
      deeplinkScheme="myapp" // Must match your Despia app scheme
      exitPath="/auth/callback" // Path to redirect to in WebView after deeplink
      provider={yourProvider}
    />
  );
}
```

### Step 6: Use OAuth in Your App

Use the `useOAuth()` hook anywhere in your app:

```tsx
// src/pages/LoginPage.tsx
import { useOAuth } from '@oauth-kit/react';

export function LoginPage() {
  const { signIn, isLoading, session, signOut, isAuthenticated } = useOAuth();

  if (isAuthenticated) {
    return (
      <div>
        <p>Welcome, {session?.user?.email}!</p>
        <button onClick={signOut}>Sign Out</button>
      </div>
    );
  }

  return (
    <button onClick={() => signIn('google')} disabled={isLoading}>
      {isLoading ? 'Signing in...' : 'Sign in with Google'}
    </button>
  );
}
```

## For AI Coding Agents

When implementing OAuth authentication for a Despia Native app, follow these guidelines:

### Critical Requirements

**Files That MUST Be Created**:

1. **Callback Pages** (Required):
   - `src/pages/CallbackPage.tsx` - Web OAuth callback handler
   - `src/pages/NativeCallbackPage.tsx` - Native OAuth callback handler

2. **Routes** (Required):
   - `/auth/callback` route pointing to `CallbackPage`
   - `/native-callback` route pointing to `NativeCallbackPage`

3. **App Wrapper** (Required):
   - Wrap root component with `<OAuthProvider>` component
   - Provide `appUrl`, `deeplinkScheme`, and `provider` config

### Critical Patterns

1. **Route Paths Are Fixed**: 
   - Web callback: `/auth/callback` (cannot change)
   - Native callback: `/native-callback` (cannot change)

2. **Deeplink Scheme Must Match**:
   - The `deeplinkScheme` in `OAuthProvider` config must match the Despia app configuration
   - The `deeplinkScheme` in `NativeCallback` component must match

3. **Provider Interface**:
   - All providers must implement the `OAuthProvider` interface
   - Provider handles OAuth URL generation and callback processing
   - Kit handles native browser session management automatically

### Common Mistakes to Avoid

❌ **DON'T**: Only implement `/auth/callback` - you MUST also implement `/native-callback`
❌ **DON'T**: Change the callback route paths - they are standardized
❌ **DON'T**: Forget to wrap the app with `OAuthProvider`
❌ **DON'T**: Use different `deeplinkScheme` values in different places
❌ **DON'T**: Try to handle native browser sessions manually - the kit does this
❌ **DON'T**: Redirect native OAuth to `/auth/callback` - must use `/native-callback`

✅ **DO**: Create both callback pages
✅ **DO**: Use the exact route paths specified
✅ **DO**: Wrap app with `OAuthProvider` at the root
✅ **DO**: Keep `deeplinkScheme` consistent everywhere
✅ **DO**: Let the kit handle native browser sessions

### Implementation Checklist

When implementing OAuth for a Despia Native app, verify:

- [ ] `OAuthProvider` wraps the root component
- [ ] `appUrl` is correctly set (or auto-detected)
- [ ] `deeplinkScheme` matches Despia app configuration
- [ ] OAuth provider instance is created and passed to config
- [ ] `/auth/callback` route exists and points to `CallbackPage`
- [ ] `/native-callback` route exists and points to `NativeCallbackPage`
- [ ] `CallbackPage` uses `<Callback>` component with provider
- [ ] `NativeCallbackPage` uses `<NativeCallback>` component with provider
- [ ] `deeplinkScheme` in `NativeCallback` matches config
- [ ] OAuth provider implements `OAuthProvider` interface correctly

### What Gets Created

**File Structure**:
```
src/
├── App.tsx                    # Wrap with OAuthProvider, add routes
├── pages/
│   ├── CallbackPage.tsx       # Web callback handler
│   └── NativeCallbackPage.tsx # Native callback handler
└── providers/
    └── your-provider.ts       # OAuth provider implementation
```

**Dependencies**:
- `CallbackPage` → imports `<Callback>` component, needs provider instance
- `NativeCallbackPage` → imports `<NativeCallback>` component, needs provider instance
- `App.tsx` → imports `<OAuthProvider>`, needs provider instance and config
- All pages using OAuth → import `useOAuth()` hook

## Creating a Provider

If you need to implement a custom OAuth provider, implement the `OAuthProvider` interface:

```typescript
import type { OAuthProvider, AuthResult, TokenSet, Session } from '@oauth-kit/core';

export class MyProvider implements OAuthProvider {
  async getOAuthUrl(provider: string, redirectUri: string, state: string): Promise<string> {
    // Generate OAuth authorization URL
    // redirectUri is the final client-side destination (e.g., https://myapp.com/auth/callback)
    return 'https://provider.com/oauth/authorize?...';
  }

  async handleCallback(params: Record<string, string>): Promise<AuthResult> {
    // Handle OAuth callback
    // Exchange code for tokens, or extract tokens from params
    return {
      access_token: '...',
      refresh_token: '...',
      user: { id: '...', email: '...' },
    };
  }

  async setSession(tokens: TokenSet): Promise<void> {
    // Store tokens (localStorage, backend API, etc.)
  }

  async getSession(): Promise<Session | null> {
    // Retrieve current session
  }

  async signOut(): Promise<void> {
    // Clear session
  }
}
```

See [Provider Implementation Patterns](#provider-implementation-patterns) below for different approaches (direct callback, server-side callback, edge functions).

## Production-Ready Examples

### Example 1: Supabase Authentication (Frontend + Backend)

Complete production example using Supabase for OAuth authentication.

**Frontend Setup:**

```tsx
// src/providers/supabase-provider.ts
import type { OAuthProvider, AuthResult, TokenSet, Session, User } from '@oauth-kit/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export class SupabaseProvider implements OAuthProvider {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseAnonKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  async getOAuthUrl(provider: string, redirectUri: string, state: string): Promise<string> {
    // Supabase handles the OAuth URL generation
    // redirectUri is where Supabase will redirect after authentication
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: provider as any, // 'google', 'github', 'apple', etc.
      options: {
        redirectTo: redirectUri, // Final client-side destination
      },
    });

    if (error) throw error;
    if (!data.url) throw new Error('Failed to get OAuth URL');

    return data.url;
  }

  async handleCallback(params: Record<string, string>): Promise<AuthResult> {
    // Supabase automatically handles the callback
    // Extract code from params
    const code = params.code;
    if (!code) {
      throw new Error('No authorization code in callback');
    }

    // Exchange code for session using Supabase
    const { data, error } = await this.supabase.auth.exchangeCodeForSession(code);

    if (error) throw error;
    if (!data.session) throw new Error('Failed to create session');

    // Get user info
    const user = data.user;

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email,
        picture: user.user_metadata?.avatar_url,
      },
    };
  }

  async setSession(tokens: TokenSet): Promise<void> {
    // Supabase manages session automatically via cookies/localStorage
    // Just refresh the session to ensure it's up to date
    await this.supabase.auth.refreshSession();
  }

  async getSession(): Promise<Session | null> {
    const { data: { session }, error } = await this.supabase.auth.getSession();
    
    if (error || !session) return null;

    return {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at ? session.expires_at * 1000 : undefined,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.user_metadata?.full_name || session.user.email,
        picture: session.user.user_metadata?.avatar_url,
      },
    };
  }

  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
  }
}
```

**Use in your app:**

```tsx
// src/App.tsx
import { OAuthProvider } from '@oauth-kit/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SupabaseProvider } from './providers/supabase-provider';
import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { CallbackPage } from './pages/CallbackPage';
import { NativeCallbackPage } from './pages/NativeCallbackPage';

const supabaseProvider = new SupabaseProvider(
  process.env.REACT_APP_SUPABASE_URL!,
  process.env.REACT_APP_SUPABASE_ANON_KEY!
);

function App() {
  return (
    <OAuthProvider
      config={{
        appUrl: window.location.origin,
        deeplinkScheme: 'myapp',
        provider: supabaseProvider,
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
```

**Backend Configuration (Supabase Dashboard):**

1. Go to Authentication → URL Configuration
2. Add redirect URLs:
   - `https://yourdomain.com/auth/callback` (web)
   - `https://yourdomain.com/native-callback` (native)
   - `myapp://oauth/auth/callback` (native deeplink)

### Example 2: Google OAuth (Direct Frontend)

Production example using Google OAuth directly from the frontend:

```tsx
// src/providers/google-provider.ts
import type { OAuthProvider, AuthResult, TokenSet, Session, User } from '@oauth-kit/core';

export class GoogleProvider implements OAuthProvider {
  private clientId: string;
  private clientSecret?: string; // Optional, only if using backend for token exchange

  constructor(config: { clientId: string; clientSecret?: string }) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
  }

  async getOAuthUrl(provider: string, redirectUri: string, state: string): Promise<string> {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
      state: state,
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async handleCallback(params: Record<string, string>): Promise<AuthResult> {
    if (params.error) {
      throw new Error(params.error_description || params.error);
    }

    const code = params.code;
    if (!code) {
      throw new Error('No authorization code in callback');
    }

    // Exchange code for tokens
    // NOTE: In production, do this on your backend to protect client_secret
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret || '',
        redirect_uri: params.redirect_uri || window.location.origin + '/auth/callback',
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      throw new Error(error.error_description || 'Token exchange failed');
    }

    const tokens = await tokenResponse.json();

    // Fetch user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user info');
    }

    const userData = await userResponse.json();

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
      },
    };
  }

  async setSession(tokens: TokenSet): Promise<void> {
    // Store in localStorage (or send to your backend)
    localStorage.setItem('oauth_access_token', tokens.access_token);
    if (tokens.refresh_token) {
      localStorage.setItem('oauth_refresh_token', tokens.refresh_token);
    }
    if (tokens.expires_in) {
      const expiresAt = Date.now() + tokens.expires_in * 1000;
      localStorage.setItem('oauth_expires_at', expiresAt.toString());
    }
  }

  async getSession(): Promise<Session | null> {
    const accessToken = localStorage.getItem('oauth_access_token');
    if (!accessToken) return null;

    // Optionally refresh token if expired
    const expiresAt = localStorage.getItem('oauth_expires_at');
    if (expiresAt && parseInt(expiresAt, 10) < Date.now()) {
      // Refresh token logic here
      return null;
    }

    // Fetch current user info
    try {
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!userResponse.ok) {
        this.signOut();
        return null;
      }

      const userData = await userResponse.json();

      return {
        access_token: accessToken,
        refresh_token: localStorage.getItem('oauth_refresh_token') || undefined,
        expires_at: expiresAt ? parseInt(expiresAt, 10) : undefined,
        user: {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          picture: userData.picture,
        },
      };
    } catch {
      return null;
    }
  }

  async signOut(): Promise<void> {
    localStorage.removeItem('oauth_access_token');
    localStorage.removeItem('oauth_refresh_token');
    localStorage.removeItem('oauth_expires_at');
  }
}
```

**⚠️ Security Note**: For production, always exchange the code for tokens on your backend to protect your `client_secret`. See Example 3 below.

### Example 3: Backend Token Exchange (Secure Production Pattern)

For production, always exchange authorization codes for tokens on your backend:

```tsx
// src/providers/google-backend-provider.ts
import type { OAuthProvider, AuthResult, TokenSet, Session, User } from '@oauth-kit/core';

export class GoogleBackendProvider implements OAuthProvider {
  private clientId: string;
  private backendUrl: string;

  constructor(config: { clientId: string; backendUrl: string }) {
    this.clientId = config.clientId;
    this.backendUrl = config.backendUrl;
  }

  async getOAuthUrl(provider: string, redirectUri: string, state: string): Promise<string> {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
      state: state,
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async handleCallback(params: Record<string, string>): Promise<AuthResult> {
    if (params.error) {
      throw new Error(params.error_description || params.error);
    }

    const code = params.code;
    if (!code) {
      throw new Error('No authorization code in callback');
    }

    // Exchange code for tokens via YOUR BACKEND
    // Backend securely handles client_secret
    const response = await fetch(`${this.backendUrl}/api/oauth/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        provider: 'google',
        redirect_uri: params.redirect_uri,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Token exchange failed');
    }

    const data = await response.json();

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      user: data.user,
    };
  }

  async setSession(tokens: TokenSet): Promise<void> {
    // Option 1: Store in localStorage (client-side only)
    localStorage.setItem('oauth_access_token', tokens.access_token);
    if (tokens.refresh_token) {
      localStorage.setItem('oauth_refresh_token', tokens.refresh_token);
    }

    // Option 2: Send to backend to store in secure httpOnly cookies
    await fetch(`${this.backendUrl}/api/auth/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(tokens),
    });
  }

  async getSession(): Promise<Session | null> {
    // Option 1: Get from localStorage
    // Option 2: Get from backend (more secure)
    const response = await fetch(`${this.backendUrl}/api/auth/session`, {
      credentials: 'include',
    });

    if (!response.ok) return null;

    const session = await response.json();
    return session;
  }

  async signOut(): Promise<void> {
    localStorage.removeItem('oauth_access_token');
    localStorage.removeItem('oauth_refresh_token');

    // Also sign out on backend
    await fetch(`${this.backendUrl}/api/auth/signout`, {
      method: 'POST',
      credentials: 'include',
    });
  }
}
```

**Backend Example (Node.js/Express):**

```typescript
// backend/routes/auth.ts
import express from 'express';
import { google } from 'googleapis';

const router = express.Router();

// Exchange code for tokens
router.post('/oauth/exchange', async (req, res) => {
  const { code, provider, redirect_uri } = req.body;

  if (provider === 'google') {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET, // Securely stored on backend
      redirect_uri
    );

    try {
      const { tokens } = await oauth2Client.getToken(code);
      
      // Get user info
      oauth2Client.setCredentials(tokens);
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const userInfo = await oauth2.userinfo.get();

      // Store session (in database, Redis, etc.)
      // ...

      res.json({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expiry_date ? Math.floor((tokens.expiry_date - Date.now()) / 1000) : undefined,
        user: {
          id: userInfo.data.id,
          email: userInfo.data.email,
          name: userInfo.data.name,
          picture: userInfo.data.picture,
        },
      });
    } catch (error) {
      res.status(400).json({ message: 'Token exchange failed' });
    }
  }
});

export default router;
```

### Example 4: Auth0 Integration

```tsx
// src/providers/auth0-provider.ts
import type { OAuthProvider, AuthResult, TokenSet, Session, User } from '@oauth-kit/core';
import { Auth0Client } from '@auth0/auth0-spa-js';

export class Auth0Provider implements OAuthProvider {
  private auth0: Auth0Client;

  constructor(domain: string, clientId: string) {
    this.auth0 = new Auth0Client({
      domain,
      clientId,
      authorizationParams: {
        redirect_uri: window.location.origin + '/auth/callback',
      },
    });
  }

  async getOAuthUrl(provider: string, redirectUri: string, state: string): Promise<string> {
    // Auth0 generates the OAuth URL
    const url = await this.auth0.buildAuthorizeUrl({
      redirect_uri: redirectUri,
      state,
    });
    return url;
  }

  async handleCallback(params: Record<string, string>): Promise<AuthResult> {
    // Auth0 handles callback and code exchange
    await this.auth0.handleRedirectCallback();

    const user = await this.auth0.getUser();
    const token = await this.auth0.getTokenSilently();

    if (!user || !token) {
      throw new Error('Authentication failed');
    }

    return {
      access_token: token,
      expires_in: 86400, // 24 hours
      user: {
        id: user.sub,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
    };
  }

  async setSession(tokens: TokenSet): Promise<void> {
    // Auth0 manages session automatically
    // No manual session storage needed
  }

  async getSession(): Promise<Session | null> {
    const isAuthenticated = await this.auth0.isAuthenticated();
    if (!isAuthenticated) return null;

    const user = await this.auth0.getUser();
    const token = await this.auth0.getTokenSilently();

    if (!user || !token) return null;

    return {
      access_token: token,
      user: {
        id: user.sub,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
    };
  }

  async signOut(): Promise<void> {
    await this.auth0.logout();
  }
}
```

## Provider Implementation Patterns

The OAuth kit supports multiple provider implementation patterns. The `redirectUri` parameter always represents the **final client-side destination** where your app will receive the callback.

### Pattern 1: Direct Client-Side Callback

The OAuth provider redirects directly to your client app:

**Flow**: `OAuth Provider → Client App (redirectUri)`

```typescript
export class DirectProvider implements OAuthProvider {
  async getOAuthUrl(provider: string, redirectUri: string, state: string): Promise<string> {
    const params = new URLSearchParams({
      client_id: 'your-client-id',
      redirect_uri: redirectUri,  // Direct redirect to client app
      response_type: 'code',
      state: state,
    });
    return `https://provider.com/oauth/authorize?${params.toString()}`;
  }

  async handleCallback(params: Record<string, string>): Promise<AuthResult> {
    // Receives code/tokens directly from OAuth provider
    const code = params.code;
    // Exchange code for tokens (or use tokens if implicit flow)
    return {
      access_token: '...',
      refresh_token: '...',
      user: { id: '...', email: '...' },
    };
  }

  // ... implement other methods
}
```

### Pattern 2: Server-Side Callback (Supabase-style)

The OAuth provider redirects to your server, which processes and redirects to the client:

**Flow**: `OAuth Provider → Server Callback → Process → Client App (redirectUri)`

This pattern is used by Supabase, Auth0, and similar services:

```typescript
export class ServerCallbackProvider implements OAuthProvider {
  private serverCallbackUrl = 'https://your-server.com/oauth/callback';

  async getOAuthUrl(provider: string, redirectUri: string, state: string): Promise<string> {
    // OAuth provider redirects to YOUR SERVER callback URL
    // Your server must be configured to redirect to redirectUri after processing
    const params = new URLSearchParams({
      client_id: 'your-client-id',
      redirect_uri: this.serverCallbackUrl,  // Server callback URL
      response_type: 'code',
      state: state,
    });
    return `https://provider.com/oauth/authorize?${params.toString()}`;
  }

  async handleCallback(params: Record<string, string>): Promise<AuthResult> {
    // Receives the final result after server processing
    // Server has already exchanged code for tokens and redirected here
    return {
      access_token: params.access_token,
      refresh_token: params.refresh_token,
      user: { id: '...', email: '...' },
    };
  }

  // ... implement other methods
}
```

**Server Configuration**: Your server callback endpoint must:
1. Receive the OAuth response (e.g., `https://your-server.com/oauth/callback?code=xxx`)
2. Exchange the authorization code for tokens
3. Process and store the session
4. Redirect to the client's `redirectUri` with the final result (tokens or session info)

### Pattern 3: Edge Function (TikTok-style)

Use an edge function to generate the OAuth URL and handle the callback:

**Flow**: `OAuth Provider → Edge Function → Client App (redirectUri)`

```typescript
export class EdgeFunctionProvider implements OAuthProvider {
  constructor(private supabase: SupabaseClient) {}

  async getOAuthUrl(provider: string, redirectUri: string, state: string): Promise<string> {
    const { data } = await this.supabase.functions.invoke('auth-start', {
      body: {
        provider,
        redirect_uri: redirectUri,  // Edge function uses this as final destination
        state,
      },
    });
    return data.url;
  }

  async handleCallback(params: Record<string, string>): Promise<AuthResult> {
    const { data } = await this.supabase.functions.invoke('auth-callback', {
      body: {
        code: params.code,
        redirect_uri: params.redirect_uri,
      },
    });
    return data;
  }

  // ... implement other methods
}
```

## Troubleshooting

### OAuth Not Working in Native App

**Symptoms**: Clicking "Sign in" does nothing, or OAuth opens but fails

**Solutions**:
- Verify `OAuthProvider` wraps your root component
- Check that `deeplinkScheme` matches your Despia app configuration
- Ensure both `/auth/callback` and `/native-callback` routes exist
- Check browser console for errors

### Browser Session Doesn't Close (Native)

**Symptoms**: After OAuth, browser session stays open, user stuck in browser

**Solutions**:
- Verify `NativeCallbackPage` uses `<NativeCallback>` component
- Check that `deeplinkScheme` in `NativeCallback` matches your Despia app scheme
- Ensure deeplink format is correct: `{scheme}://oauth/{path}?params`
- Verify Despia app is configured to handle deeplinks

### Routes Not Found (404)

**Symptoms**: Getting 404 errors on `/auth/callback` or `/native-callback`

**Solutions**:
- Verify routes are added to your router
- Check route paths are exactly `/auth/callback` and `/native-callback`
- Ensure your router (e.g., React Router) is properly configured
- Check that callback page components are imported correctly

### Session Not Persisting

**Symptoms**: User logs in but session is lost on page refresh

**Solutions**:
- Verify provider's `setSession()` method stores tokens correctly
- Check provider's `getSession()` method retrieves tokens correctly
- Ensure tokens are stored in a persistent location (localStorage, backend, etc.)
- Verify `handleCallback()` is calling `setSession()` with tokens

### Provider Implementation Errors

**Symptoms**: Errors in provider's `getOAuthUrl()` or `handleCallback()` methods

**Solutions**:
- Verify provider implements all 5 methods of `OAuthProvider` interface
- Check that `redirectUri` is used correctly (final client-side destination)
- Ensure `handleCallback()` returns proper `AuthResult` format
- Verify error handling in provider methods

## Architecture

### Core Library (`packages/core/`)

Framework-agnostic core that provides:

- `OAuthProvider` interface - 5 methods all providers must implement
- `OAuthManager` class - Standardized OAuth flow orchestration
- Despia handler - Native OAuth session management

### React Components (`packages/react/`)

React bindings including:

- `OAuthProvider` - Context provider component
- `useOAuth()` - Hook for authentication state
- `NativeCallback` - Component for native callback page
- `Callback` - Component for web callback page

## Standardized Routes

All providers use the same route structure:

- `/auth/callback` - Web OAuth callback (required)
- `/native-callback` - Native OAuth callback (required)

**These paths are fixed and cannot be changed.**

## Standardized Redirect URIs

The manager automatically generates redirect URIs:

- Web: `{appUrl}/auth/callback`
- Native: `{appUrl}/native-callback`

The `redirectUri` passed to your provider's `getOAuthUrl()` method will be one of these standardized URIs.

## License

MIT
