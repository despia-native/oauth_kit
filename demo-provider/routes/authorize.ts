/**
 * OAuth 2.0 Authorization Endpoint
 * GET /demo/provider/authorize
 */

import type { Request, Response } from 'express';

// In-memory storage for authorization codes (in production, use Redis/DB)
const authCodes = new Map<string, { code: string; redirectUri: string; expiresAt: number }>();

export function authorizeHandler(req: Request, res: Response) {
  const { client_id, redirect_uri, response_type, state, scope } = req.query;

  // Validate parameters
  if (!client_id || !redirect_uri || !response_type) {
    return res.status(400).send('Missing required parameters');
  }

  if (response_type !== 'code') {
    return res.status(400).send('Only authorization code flow is supported');
  }

  // Generate authorization code
  const code = `demo_code_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  // Store code
  authCodes.set(code, {
    code,
    redirectUri: redirect_uri as string,
    expiresAt,
  });

  // Render simple login form
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Demo OAuth Login</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          background: #f5f5f5;
        }
        .container {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          max-width: 400px;
          width: 100%;
        }
        h1 {
          margin-top: 0;
        }
        button {
          width: 100%;
          padding: 12px;
          background: #007AFF;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
          margin-top: 1rem;
        }
        button:hover {
          background: #0056CC;
        }
        .info {
          font-size: 14px;
          color: #666;
          margin-top: 1rem;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Demo OAuth Provider</h1>
        <p>This is a mock OAuth provider for testing.</p>
        <form method="POST" action="/demo/provider/authorize">
          <input type="hidden" name="code" value="${code}" />
          <input type="hidden" name="state" value="${state || ''}" />
          <input type="hidden" name="redirect_uri" value="${redirect_uri}" />
          <button type="submit">Sign In with Demo Provider</button>
        </form>
        <div class="info">
          Client ID: ${client_id}<br>
          Scope: ${scope || 'openid email profile'}
        </div>
      </div>
    </body>
    </html>
  `);
}

// Handle form submission
export function authorizePostHandler(req: Request, res: Response) {
  const { code, state, redirect_uri } = req.body;

  if (!code || !redirect_uri) {
    return res.status(400).send('Missing required parameters');
  }

  // Verify code exists and hasn't expired
  const storedCode = authCodes.get(code);
  if (!storedCode) {
    return res.status(400).send('Invalid authorization code');
  }

  if (Date.now() > storedCode.expiresAt) {
    authCodes.delete(code);
    return res.status(400).send('Authorization code expired');
  }

  // Remove code (one-time use)
  authCodes.delete(code);

  // Redirect to callback with code
  const params = new URLSearchParams({
    code: code,
    state: state || '',
  });

  res.redirect(`${redirect_uri}?${params.toString()}`);
}

// Clean up expired codes periodically
setInterval(() => {
  const now = Date.now();
  for (const [code, data] of authCodes.entries()) {
    if (now > data.expiresAt) {
      authCodes.delete(code);
    }
  }
}, 60 * 1000); // Run every minute
