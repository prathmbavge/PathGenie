import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));


export default defineConfig(({ mode }) => {
  // Load environment variables from .env file in the client directory
  // Set the third parameter to '' to load all variables, including those without VITE_ prefix
  const env = loadEnv(mode, path.resolve(__dirname), '');

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_SERVER_URL, // Use loaded environment variable
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api'), // Preserve /api prefix
        },
      },
    },
  };
});