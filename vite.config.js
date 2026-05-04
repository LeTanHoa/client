import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    outDir: "dist"
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://spotify-server-orpin.vercel.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});