import { defineConfig } from 'vite';

/** Node o‘rnatilgach: npm install && npm run dev */
export default defineConfig({
  root: '.',
  publicDir: 'public',
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js']
  }
});
