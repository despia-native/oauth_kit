/**
 * Mock OAuth 2.0 Provider Server
 * Runs at /demo/provider
 */

import express from 'express';
import cors from 'cors';
import { authorizeHandler, authorizePostHandler } from './routes/authorize.js';
import { tokenHandler } from './routes/token.js';
import { userinfoHandler } from './routes/userinfo.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/demo/provider/authorize', authorizeHandler);
app.post('/demo/provider/authorize', authorizePostHandler);
app.post('/demo/provider/token', tokenHandler);
app.get('/demo/provider/userinfo', userinfoHandler);

// Health check
app.get('/demo/provider/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Root endpoint - provide info about available endpoints
app.get('/demo/provider', (req, res) => {
  res.json({
    name: 'Demo OAuth 2.0 Provider',
    endpoints: {
      authorize: 'GET /demo/provider/authorize',
      token: 'POST /demo/provider/token',
      userinfo: 'GET /demo/provider/userinfo',
      health: 'GET /demo/provider/health',
    },
    description: 'Mock OAuth 2.0 provider for testing OAuth Kit',
  });
});

app.listen(PORT, () => {
  console.log(`Demo OAuth Provider server running at http://localhost:${PORT}/demo/provider`);
  console.log(`  - Authorization: GET /demo/provider/authorize`);
  console.log(`  - Token: POST /demo/provider/token`);
  console.log(`  - UserInfo: GET /demo/provider/userinfo`);
});
