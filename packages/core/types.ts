/**
 * OAuth Kit - Core Types
 * Universal type definitions for OAuth provider interface
 */

/**
 * OAuth Provider Interface
 * All providers must implement this interface
 */
export interface OAuthProvider {
  /**
   * Generate OAuth authorization URL
   * 
   * @param provider Provider name (e.g., 'google', 'apple', 'demo')
   * @param redirectUri Final client-side redirect URI where the OAuth flow should end.
   *                    This is the URI where your client app will receive the callback.
   *                    Standardized paths: `/auth/callback` (web) or `/native-callback` (native).
   *                    
   *                    **Important**: This represents the FINAL client-side destination.
   *                    Providers can use server-side callbacks (like Supabase) that:
   *                    - Receive OAuth response at a server callback URL
   *                    - Process the OAuth response server-side
   *                    - Redirect to this `redirectUri` with the final result
   *                    
   *                    Example flows:
   *                    - Direct: OAuth Provider → `redirectUri` (client app)
   *                    - Server-side: OAuth Provider → Server Callback → Process → `redirectUri` (client app)
   *                    
   * @param state State parameter for CSRF protection
   * @returns OAuth authorization URL (can be sync or async)
   * 
   * @example Direct callback pattern:
   * ```typescript
   * // OAuth provider redirects directly to client app
   * return `https://provider.com/oauth/authorize?redirect_uri=${redirectUri}&...`;
   * ```
   * 
   * @example Server-side callback pattern (Supabase-style):
   * ```typescript
   * // OAuth provider redirects to server, server redirects to redirectUri
   * const serverCallback = 'https://your-server.com/oauth/callback';
   * // Configure server to redirect to redirectUri after processing
   * return `https://provider.com/oauth/authorize?redirect_uri=${serverCallback}&...`;
   * ```
   */
  getOAuthUrl(provider: string, redirectUri: string, state: string): string | Promise<string>;

  /**
   * Handle OAuth callback
   * 
   * Called when your client app receives the callback at the redirectUri.
   * For server-side callback flows, this receives the final result after the server
   * has processed and redirected to your client app.
   * 
   * @param params Parameters from callback URL (code, access_token, state, etc.)
   *               The exact parameters depend on your provider implementation:
   *               - Direct callback: Receives tokens/code directly from OAuth provider
   *               - Server-side callback: Receives final result after server processing
   * @returns Authentication result with tokens and user info
   */
  handleCallback(params: Record<string, string>): Promise<AuthResult>;

  /**
   * Set authentication session
   * @param tokens Token set from OAuth flow
   */
  setSession(tokens: TokenSet): Promise<void>;

  /**
   * Get current session
   * @returns Current session or null if not authenticated
   */
  getSession(): Promise<Session | null>;

  /**
   * Sign out
   */
  signOut(): Promise<void>;
}

/**
 * OAuth Kit Configuration
 */
export interface OAuthKitConfig {
  /** Your app's base URL (e.g., 'https://myapp.com' or 'http://localhost:5173') */
  appUrl: string;
  
  /** Despia deeplink scheme (e.g., 'myapp') */
  deeplinkScheme: string;
  
  /** OAuth provider implementation */
  provider: OAuthProvider;
}

/**
 * Token set for session management
 */
export interface TokenSet {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}

/**
 * Authentication result from callback
 */
export interface AuthResult {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  user?: User;
  [key: string]: any;
}

/**
 * User session
 */
export interface Session {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  user: User;
}

/**
 * User information
 */
export interface User {
  id: string;
  email?: string;
  name?: string;
  avatar_url?: string;
  [key: string]: any;
}
