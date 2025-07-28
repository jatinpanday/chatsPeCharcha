import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: 'localhost',
    port: 8080,
    fs: {
      strict: false,
    },
    proxy: {
      '^/api/.*': {
        target: 'http://localhost:3000', // Your backend server
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
