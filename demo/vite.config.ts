import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Ensure Vite resolves dependencies from demo's node_modules
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
      'react-router-dom': path.resolve(__dirname, './node_modules/react-router-dom'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/demo/provider': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
