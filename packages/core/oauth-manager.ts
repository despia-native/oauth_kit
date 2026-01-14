/**
 * OAuth Kit - OAuth Manager
 * Universal OAuth flow orchestration (same structure for all providers)
 */

import type { OAuthProvider, OAuthKitConfig, Session, TokenSet, AuthResult } from './types';
import { isDespiaNative, openDespiaOAuth, createDespiaDeeplink } from './despia-handler';

/**
 * Universal OAuth Manager
 * Standardized flow - same structure for ALL providers
 */
export class OAuthManager {
  private provider: OAuthProvider;
  private appUrl: string;
  private deeplinkScheme: string;

  // Standard redirect URIs (same for ALL providers)
  private readonly WEB_CALLBACK_PATH = '/auth/callback';
  private readonly NATIVE_CALLBACK_PATH = '/native-callback';

  constructor(config: OAuthKitConfig) {
    this.provider = config.provider;
    this.appUrl = config.appUrl.replace(/\/$/, ''); // Remove trailing slash
    this.deeplinkScheme = config.deeplinkScheme;
  }

  /**
   * Sign in with OAuth provider
   * Standardized flow - same for ALL providers
   */
  async signIn(providerName: string): Promise<void> {
    const isNative = isDespiaNative();
    const redirectUri = isNative 
      ? `${this.appUrl}${this.NATIVE_CALLBACK_PATH}`
      : `${this.appUrl}${this.WEB_CALLBACK_PATH}`;

    const state = this.generateState();
    this.storeState(state);

    // Provider generates URL (their implementation, our structure)
    const oauthUrl = await this.provider.getOAuthUrl(providerName, redirectUri, state);

    // Open using Despia (same for all providers)
    await openDespiaOAuth(oauthUrl);
  }

  /**
   * Handle OAuth callback
   * Standardized flow - same for ALL providers
   */
  async handleCallback(
    params: Record<string, string>,
    isNative: boolean = false
  ): Promise<{ redirectUrl: string }> {
    try {
      // Provider handles callback (their implementation, our structure)
      const result = await this.provider.handleCallback(params);

      // Set session (same for all providers)
      await this.provider.setSession({
        access_token: result.access_token,
        refresh_token: result.refresh_token,
        expires_in: result.expires_in,
      });

      if (isNative) {
        // Native: redirect to deeplink (standardized format)
        const deeplinkParams: Record<string, string> = {
          access_token: result.access_token,
        };

        if (result.refresh_token) {
          deeplinkParams.refresh_token = result.refresh_token;
        }

        const deeplink = createDespiaDeeplink(
          'callback', // Will navigate to /auth/callback in WebView
          deeplinkParams,
          this.deeplinkScheme
        );
        return { redirectUrl: deeplink };
      } else {
        // Web: redirect to callback page (standardized)
        return { redirectUrl: `${this.appUrl}${this.WEB_CALLBACK_PATH}` };
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Authentication failed';
      
      if (isNative) {
        const deeplink = createDespiaDeeplink(
          'callback',
          { error: errorMsg },
          this.deeplinkScheme
        );
        return { redirectUrl: deeplink };
      } else {
        return { redirectUrl: `${this.appUrl}${this.WEB_CALLBACK_PATH}?error=${encodeURIComponent(errorMsg)}` };
      }
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    await this.provider.signOut();
  }

  /**
   * Get current session
   */
  async getSession(): Promise<Session | null> {
    return this.provider.getSession();
  }

  /**
   * Create deeplink URL (helper for error cases)
   */
  createDeeplink(path: string, params: Record<string, string>): string {
    return createDespiaDeeplink(path, params, this.deeplinkScheme);
  }

  /**
   * Generate random state for CSRF protection
   */
  private generateState(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Store OAuth state (for verification on callback)
   */
  private storeState(state: string): void {
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(`oauth_state_${state}`, JSON.stringify({
          state,
          timestamp: Date.now(),
        }));
      }
    } catch {
      // sessionStorage unavailable (private browsing, etc.)
    }
  }
}
