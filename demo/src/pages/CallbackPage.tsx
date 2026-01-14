/**
 * Callback Page
 * Web OAuth callback handler
 */

import { Callback } from '../../../packages/react/Callback';
import { mockProvider } from '../providers/mock-provider';

export function CallbackPage() {
  return (
    <Callback
      provider={mockProvider}
      redirectTo="/"
    />
  );
}
