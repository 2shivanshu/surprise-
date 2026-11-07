import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Project site: https://2shivanshu.github.io/surprise-/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/surprise-/' : '/',
  plugins: [
    react(),
    {
      name: 'dev-rewrite-surprise-base',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url && req.url.startsWith('/surprise-')) {
            req.url = req.url.replace(/^\/surprise-/, '') || '/';
          }
          next();
        });
      },
    },
  ],
  build: {
    target: 'es2020',
    sourcemap: false,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          three: ['three'],
        },
      },
    },
  },
}));
