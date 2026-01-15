/**
 * Demo Mock Provider Setup
 */

import { MockProvider } from '../../../packages/providers/mock';

// Get provider URL from environment or use localhost for development
const getProviderBaseUrl = (): string => {
  // Check for environment variable (set in Netlify)
  if (import.meta.env.VITE_PROVIDER_URL) {
    return import.meta.env.VITE_PROVIDER_URL;
  }
  
  // For production, use the deployed provider URL from environment variable
  if (import.meta.env.MODE === 'production') {
    // If VITE_PROVIDER_URL is not set, show a helpful error
    const host = typeof window !== 'undefined' ? window.location.host : '';
    console.warn('VITE_PROVIDER_URL not set. The demo provider server must be deployed separately.');
    // Return a placeholder that will fail gracefully
    // In production, VITE_PROVIDER_URL should be set in Netlify environment variables
    return `https://your-provider-service.com/demo/provider`; // Update via VITE_PROVIDER_URL env var
  }
  
  // Development - use localhost
  return 'http://localhost:3001/demo/provider';
};

// Create mock provider instance
export const mockProvider = new MockProvider({
  baseUrl: getProviderBaseUrl(),
  clientId: 'demo-client-id',
});
