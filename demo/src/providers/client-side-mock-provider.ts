/**
 * Client-Side Mock Provider
 * Simulates OAuth flow entirely in the browser for demo purposes
 * No server required - works on Netlify, Vercel, or any static hosting
 */

import type { OAuthProvider, AuthResult, TokenSet, Session, User } from '../../../packages/core/types';

export class ClientSideMockProvider implements OAuthProvider {
  private clientId: string;

  constructor(config: { clientId?: string } = {}) {
    this.clientId = config.clientId || 'demo-client-id';
  }

  async getOAuthUrl(provider: string, redirectUri: string, state: string): Promise<string> {
    // For client-side demo, simulate OAuth by directly returning the callback URL
    // with the authorization code already embedded
    // This simulates the provider redirecting back after approval
    
    // Generate a mock authorization code
    const mockCode = this.generateMockCode();
    
    // Store state for verification (optional, but good practice)
    if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(`oauth_state_${state}`, JSON.stringify({
        state,
        timestamp: Date.now(),
      }));
    }

    // Return the redirect URI with code and state - this simulates the OAuth provider
    // redirecting back after the user approves the authorization
    const callbackUrl = new URL(redirectUri);
    callbackUrl.searchParams.set('code', mockCode);
    callbackUrl.searchParams.set('state', state);
    
    return callbackUrl.toString();
  }

  async handleCallback(params: Record<string, string>): Promise<AuthResult> {
    // Check for error
    if (params.error) {
      throw new Error(params.error_description || params.error);
    }

    // Get authorization code
    const code = params.code;
    if (!code) {
      // Debug: log available params
      console.error('No authorization code in callback. Available params:', Object.keys(params));
      throw new Error(`No authorization code in callback. Received params: ${JSON.stringify(params)}`);
    }

    // Simulate token exchange (no actual server call needed)
    // In a real flow, this would call the provider's token endpoint
    const mockTokens = this.generateMockTokens();
    const mockUser = this.generateMockUser();

    const result: AuthResult = {
      access_token: mockTokens.access_token,
      refresh_token: mockTokens.refresh_token,
      expires_in: mockTokens.expires_in,
      user: mockUser,
    };

    // Ensure all required fields are present
    if (!result.access_token) {
      throw new Error('Failed to generate access token');
    }

    return result;
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

    // Check if token expired
    const expiresAt = localStorage.getItem('oauth_expires_at');
    if (expiresAt && parseInt(expiresAt, 10) < Date.now()) {
      this.signOut();
      return null;
    }

    // Return mock user data
    const mockUser = this.generateMockUser();

    return {
      access_token: accessToken,
      refresh_token: localStorage.getItem('oauth_refresh_token') || undefined,
      expires_at: expiresAt ? parseInt(expiresAt, 10) : undefined,
      user: mockUser,
    };
  }

  async signOut(): Promise<void> {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('oauth_access_token');
      localStorage.removeItem('oauth_refresh_token');
      localStorage.removeItem('oauth_expires_at');
    }
  }

  // Helper methods for generating mock data

  private generateMockCode(): string {
    return `demo_code_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private generateMockTokens(): { access_token: string; refresh_token: string; expires_in: number } {
    return {
      access_token: `demo_access_token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
      refresh_token: `demo_refresh_token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
      expires_in: 3600, // 1 hour
    };
  }

  private generateMockUser(): User {
    return {
      id: 'demo-user-123',
      email: 'demo@example.com',
      name: 'Demo User',
      picture: 'https://ui-avatars.com/api/?name=Demo+User&background=random',
    };
  }
}
