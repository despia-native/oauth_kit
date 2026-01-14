/**
 * Native Callback Page
 * Native OAuth callback handler (runs in ASWebAuthenticationSession/Chrome Custom Tab)
 */

import { NativeCallback } from '../../../packages/react/NativeCallback';
import { mockProvider } from '../providers/mock-provider';

export function NativeCallbackPage() {
  return (
    <NativeCallback
      deeplinkScheme="myapp"
      exitPath="/auth/callback"
      provider={mockProvider}
    />
  );
}
