/**
 * OAuth Kit - Despia Native Handler
 * Handles native OAuth flow using Despia Native SDK
 */

/**
 * Detect if running in Despia native app
 */
export function isDespiaNative(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }
  return navigator.userAgent.toLowerCase().includes('despia');
}

/**
 * Open OAuth URL in Despia's secure browser session
 * - Web: Regular window.location redirect
 * - Native: Uses oauth:// protocol to open ASWebAuthenticationSession/Chrome Custom Tab
 */
export async function openDespiaOAuth(url: string): Promise<void> {
  if (!isDespiaNative()) {
    // Web: Regular redirect
    if (typeof window !== 'undefined') {
      window.location.href = url;
    }
    return;
  }

  // Native: Use oauth:// protocol handler
  // The oauth:// prefix tells Despia to open in ASWebAuthenticationSession/Chrome Custom Tab
  if (typeof window !== 'undefined') {
    window.location.href = `oauth://?url=${encodeURIComponent(url)}`;
  }
}

/**
 * Create deeplink to close native browser session
 * Format: {scheme}://oauth/{path}?params
 * The oauth/ prefix tells Despia to close the browser session
 */
export function createDespiaDeeplink(
  path: string,
  params: Record<string, string>,
  scheme: string
): string {
  const query = new URLSearchParams(params).toString();
  // Remove leading slash from path if present
  const cleanPath = path.replace(/^\//, '');
  return `${scheme}://oauth/${cleanPath}?${query}`;
}
