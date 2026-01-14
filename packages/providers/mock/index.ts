/**
 * OAuth Kit - Mock Provider
 * Implements OAuthProvider interface for demo/testing
 * Uses /demo/provider endpoints
 */

import type { OAuthProvider, AuthResult, TokenSet, Session, User } from '../../core/types';

export interface MockProviderConfig {
  /** Base URL of the demo provider server (e.g., 'http://localhost:3001/demo/provider') */
  baseUrl: string;
  
  /** Client ID for the mock provider */
  clientId?: string;
}

/**
 * Mock OAuth Provider
 * Implements OAuthProvider interface for demo
 */
export class MockProvider implements OAuthProvider {
  private baseUrl: string;
  private clientId: string;

  constructor(config: MockProviderConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.clientId = config.clientId || 'demo-client-id';
  }

  async getOAuthUrl(provider: string, redirectUri: string, state: string): Promise<string> {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state: state,
    });

    return `${this.baseUrl}/authorize?${params.toString()}`;
  }

  async handleCallback(params: Record<string, string>): Promise<AuthResult> {
    // Check for error
    if (params.error) {
      throw new Error(params.error_description || params.error);
    }

    // Get authorization code
    const code = params.code;
    if (!code) {
      throw new Error('No authorization code in callback');
    }

    // Exchange code for tokens
    const tokenResponse = await fetch(`${this.baseUrl}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: params.redirect_uri || '',
        client_id: this.clientId,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Token exchange failed: ${errorText}`);
    }

    const tokenData = await tokenResponse.json();

    return {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
    };
  }

  async setSession(tokens: TokenSet): Promise<void> {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }

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
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return null;
    }

    const accessToken = localStorage.getItem('oauth_access_token');
    if (!accessToken) {
      return null;
    }

    // Fetch user info
    try {
      const userResponse = await fetch(`${this.baseUrl}/userinfo`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!userResponse.ok) {
        // Token might be invalid
        this.signOut();
        return null;
      }

      const user: User = await userResponse.json();

      const expiresAt = localStorage.getItem('oauth_expires_at');
      
      return {
        access_token: accessToken,
        refresh_token: localStorage.getItem('oauth_refresh_token') || undefined,
        expires_at: expiresAt ? parseInt(expiresAt, 10) : undefined,
        user,
      };
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      return null;
    }
  }

  async signOut(): Promise<void> {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('oauth_access_token');
      localStorage.removeItem('oauth_refresh_token');
      localStorage.removeItem('oauth_expires_at');
    }
  }
}
