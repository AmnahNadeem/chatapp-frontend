import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  define: {
    'process.env': {
      REACT_APP_BACKEND_URL:'https://chatapp-nybh.onrender.com/api', // ✅ Replace with your actual backend URL
      REACT_APP_WEBSOCKET_URL:'wss://chatapp-nybh.onrender.com', // ✅ Replace with your actual WebSocket URL
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
