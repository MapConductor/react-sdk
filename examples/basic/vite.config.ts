import { defineConfig, type Plugin, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import mkcert from 'vite-plugin-mkcert';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function mapconductorTileServiceWorker(): Plugin {
  const tileServiceWorkerPath = resolve(__dirname, '../../js-sdk-core/src/tileserver/tile-sw.js');

  return {
    name: 'mapconductor-tile-service-worker',
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/tile-sw.js', (req, res, next) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          next();
          return;
        }
        res.setHeader('Content-Type', 'application/javascript');
        res.end(readFileSync(tileServiceWorkerPath, 'utf-8'));
      });
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'tile-sw.js',
        source: readFileSync(tileServiceWorkerPath, 'utf-8'),
      });
    },
  };
}

// The tile Service Worker requires a "secure context": HTTPS, or plain HTTP
// on localhost/127.0.0.1. Accessing the dev server via a LAN IP (e.g. to test
// on a phone) or any non-localhost host therefore needs HTTPS — opt in with
// `HTTPS=true npm run dev` (or the `dev:https` script).
//
// Uses vite-plugin-mkcert (not @vitejs/plugin-basic-ssl): Chrome/Firefox
// refuse to register a Service Worker whose script was fetched over a
// connection with an untrusted certificate, even after you've clicked
// through the page-load warning for a plain self-signed cert — mkcert
// installs a locally-trusted CA instead, which SW registration accepts.
// First run prompts once for your OS keychain password to install that CA.
const useHttps = process.env.HTTPS === 'true';

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? '/',
  // mkcert() enables server.https itself (with a locally-trusted cert) when present;
  // no separate server.https config is needed.
  plugins: [react(), mapconductorTileServiceWorker(), ...(useHttps ? [mkcert()] : [])],
  resolve: {
    dedupe: ['react', 'react-dom', '@mapconductor/js-sdk-core'],
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  build: {
    sourcemap: true,
  },
});
