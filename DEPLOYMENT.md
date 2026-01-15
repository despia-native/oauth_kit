# Deployment Guide

## Demo App Deployment (Netlify)

The demo app can be deployed to Netlify. However, the demo OAuth provider server must be deployed separately.

### Step 1: Deploy Demo Provider Server

The `demo-provider` directory contains an Express server that must be deployed separately.

**Options:**
- **Render**: https://render.com
- **Railway**: https://railway.app
- **Fly.io**: https://fly.io
- **Any Node.js hosting service**

**Deploy the provider:**
```bash
cd demo-provider
# Follow your hosting service's instructions
# Make sure it's accessible via HTTPS
```

**Note the deployed URL**, e.g., `https://oauth-demo-provider.onrender.com`

### Step 2: Deploy Demo App to Netlify

1. **Connect your GitHub repository to Netlify**
   - Go to https://app.netlify.com
   - Add new site from Git
   - Select your repository

2. **Configure build settings:**
   - Base directory: `demo`
   - Build command: `npm install && npm run build`
   - Publish directory: `dist`

3. **Set environment variable:**
   - Go to Site settings → Environment variables
   - Add variable:
     - **Key**: `VITE_PROVIDER_URL`
     - **Value**: `https://your-deployed-provider.com/demo/provider`
     - Replace with your actual deployed provider URL

4. **Deploy**
   - Netlify will automatically deploy on every push
   - Or trigger a manual deploy

### Step 3: Verify

After deployment:
- The demo app should be accessible at your Netlify URL
- Click "Sign In" and it should connect to your deployed provider
- The OAuth flow should work end-to-end

## Local Development

For local development, the demo provider runs on `http://localhost:3001`:

```bash
# Terminal 1: Start demo provider
npm run demo:provider

# Terminal 2: Start demo app
npm run demo:dev
```

The app will automatically use `http://localhost:3001/demo/provider` when running locally.
