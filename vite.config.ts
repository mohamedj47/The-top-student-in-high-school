
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Helper to safely get env var from either process.env (Vercel) or .env file (Local)
  const getEnv = (key: string) => {
    return process.env[key] || env[key] || '';
  };

  return {
    // Base path is crucial for relative asset loading
    base: './',
    plugins: [react()],
    define: {
      // Vital: Polyfill process.env for the browser
      'process.env.API_KEY': JSON.stringify(getEnv('API_KEY')),
      'process.env.API_KEY_2': JSON.stringify(getEnv('API_KEY_2')),
      'process.env.API_KEY_3': JSON.stringify(getEnv('API_KEY_3')),
      'process.env.API_KEY_4': JSON.stringify(getEnv('API_KEY_4')),
      'process.env.API_KEY_5': JSON.stringify(getEnv('API_KEY_5')),
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    }
  };
});

