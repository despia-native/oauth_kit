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
  
  // For production, require the environment variable
  if (import.meta.env.MODE === 'production') {
    // If VITE_PROVIDER_URL is not set in production, throw an error
    console.error('VITE_PROVIDER_URL environment variable is not set. Please set it in Netlify dashboard.');
    // Return empty string to fail fast and show the error
    throw new Error('VITE_PROVIDER_URL environment variable must be set in production. Please configure it in Netlify dashboard: Site settings → Environment variables → Add VITE_PROVIDER_URL');
  }
  
  // Development - use localhost
  return 'http://localhost:3001/demo/provider';
};

// Create mock provider instance
export const mockProvider = new MockProvider({
  baseUrl: getProviderBaseUrl(),
  clientId: 'demo-client-id',
});
