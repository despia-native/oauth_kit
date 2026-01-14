/**
 * OAuth 2.0 UserInfo Endpoint (OpenID Connect style)
 * GET /demo/provider/userinfo
 */

import type { Request, Response } from 'express';
import { verifyToken } from './token.js';

// Fake user data
const FAKE_USER = {
  id: 'demo_user_123',
  email: 'demo@example.com',
  name: 'Demo User',
  avatar_url: 'https://ui-avatars.com/api/?name=Demo+User&background=007AFF&color=fff',
};

export function userinfoHandler(req: Request, res: Response) {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'invalid_token', error_description: 'Missing or invalid Authorization header' });
  }

  const accessToken = authHeader.substring(7); // Remove 'Bearer ' prefix

  // Verify token
  if (!verifyToken(accessToken)) {
    return res.status(401).json({ error: 'invalid_token', error_description: 'Token expired or invalid' });
  }

  // Return user info
  res.json(FAKE_USER);
}
