import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3030',
      '/.conversations': 'http://localhost:3030',
      '/audio': 'http://localhost:3030',
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
