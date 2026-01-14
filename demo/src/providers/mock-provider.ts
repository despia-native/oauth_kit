/**
 * Demo Mock Provider Setup
 */

import { MockProvider } from '../../../packages/providers/mock';

// Create mock provider instance
export const mockProvider = new MockProvider({
  baseUrl: 'http://localhost:3001/demo/provider',
  clientId: 'demo-client-id',
});
