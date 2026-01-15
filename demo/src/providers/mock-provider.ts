/**
 * Demo Mock Provider Setup
 * 
 * Uses Client-Side Mock Provider for demo purposes (works without backend server)
 * To use server-based provider, import from '../../../packages/providers/mock' instead
 */

import { ClientSideMockProvider } from './client-side-mock-provider';

// Create client-side mock provider instance
// This works entirely in the browser - no server needed!
// Perfect for demos on Netlify, Vercel, or any static hosting
export const mockProvider = new ClientSideMockProvider({
  clientId: 'demo-client-id',
});

// Alternative: Server-based provider (requires separate server deployment)
// Uncomment to use the server-based mock provider instead:
/*
import { MockProvider } from '../../../packages/providers/mock';

const getProviderBaseUrl = (): string => {
  if (import.meta.env.VITE_PROVIDER_URL) {
    return import.meta.env.VITE_PROVIDER_URL;
  }
  
  if (import.meta.env.MODE === 'production') {
    throw new Error('VITE_PROVIDER_URL environment variable must be set in production.');
  }
  
  return 'http://localhost:3001/demo/provider';
};

export const mockProvider = new MockProvider({
  baseUrl: getProviderBaseUrl(),
  clientId: 'demo-client-id',
});
*/
