import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

export default defineConfig(({ mode }) => ({
  server: {
    host: '::',
    port: 8080,
    proxy: {
      '/api': {
        target: 'https://og-backend-mwwi.onrender.com/api',
        changeOrigin: true,
        secure: false,
        ws: false,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log(`[Vite Proxy] Forwarding ${req.method} ${req.url} to ${proxyReq.getHeader('host')}${proxyReq.path}`);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log(`[Vite Proxy] Received response for ${req.method} ${req.url}: ${proxyRes.statusCode}`);
            console.log(`[Vite Proxy] Response headers: ${JSON.stringify(proxyRes.headers)}`);
          });
          proxy.on('error', (err, req, res) => {
            console.log(`[Vite Proxy] Error for ${req.method} ${req.url}: ${err.message}`);
          });
        },
      },
    },
  },
  plugins: [react(), mode === 'development' && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    minify: 'esbuild',
    sourcemap: true,
    rollupOptions: {
      external: [], // Ensure @react-oauth/google is bundled
    },
  },
})); 