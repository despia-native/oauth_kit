/**
 * OAuth 2.0 Token Endpoint
 * POST /demo/provider/token
 */

import type { Request, Response } from 'express';

// In-memory storage for tokens (in production, use Redis/DB)
const tokens = new Map<string, { accessToken: string; refreshToken: string; expiresAt: number }>();

export function tokenHandler(req: Request, res: Response) {
  const { code, grant_type, redirect_uri, client_id } = req.body;

  // Validate parameters
  if (grant_type !== 'authorization_code') {
    return res.status(400).json({ error: 'unsupported_grant_type' });
  }

  if (!code) {
    return res.status(400).json({ error: 'invalid_request', error_description: 'Missing code' });
  }

  // Generate tokens
  const accessToken = `demo_access_token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  const refreshToken = `demo_refresh_token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  const expiresIn = 3600; // 1 hour
  const expiresAt = Date.now() + expiresIn * 1000;

  // Store tokens (keyed by access token)
  tokens.set(accessToken, {
    accessToken,
    refreshToken,
    expiresAt,
  });

  // Return tokens
  res.json({
    access_token: accessToken,
    refresh_token: refreshToken,
    token_type: 'Bearer',
    expires_in: expiresIn,
  });
}

/**
 * Verify access token
 */
export function verifyToken(accessToken: string): boolean {
  const tokenData = tokens.get(accessToken);
  if (!tokenData) {
    return false;
  }

  if (Date.now() > tokenData.expiresAt) {
    tokens.delete(accessToken);
    return false;
  }

  return true;
}

// Clean up expired tokens periodically
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of tokens.entries()) {
    if (now > data.expiresAt) {
      tokens.delete(token);
    }
  }
}, 60 * 1000); // Run every minute
