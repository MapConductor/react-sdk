import { defineConfig, type Plugin, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import mkcert from 'vite-plugin-mkcert';
import { cpSync, existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const cesiumSource = resolve(__dirname, '../../node_modules/cesium/Build/Cesium');
const basePath = process.env.VITE_BASE_PATH ?? '/';
const cesiumStaticPath = `${basePath.endsWith('/') ? basePath : `${basePath}/`}cesiumStatic/`;

function cesiumStaticAssets(): Plugin {
  return {
    name: 'cesium-static-assets',
    configureServer(server) {
      server.middlewares.use(cesiumStaticPath, (req, res, next) => {
        const relativePath = decodeURIComponent((req.url ?? '/').split('?')[0]).replace(/^\/+/, '');
        const filePath = resolve(cesiumSource, relativePath);
        if (!filePath.startsWith(`${cesiumSource}/`) || !existsSync(filePath) || !statSync(filePath).isFile()) {
          next();
          return;
        }
        const contentTypes: Record<string, string> = {
          '.css': 'text/css',
          '.gif': 'image/gif',
          '.jpg': 'image/jpeg',
          '.js': 'text/javascript',
          '.json': 'application/json',
          '.png': 'image/png',
          '.svg': 'image/svg+xml',
          '.wasm': 'application/wasm',
          '.webp': 'image/webp',
        };
        res.setHeader('Content-Type', contentTypes[extname(filePath)] ?? 'application/octet-stream');
        res.end(readFileSync(filePath));
      });
    },
    writeBundle(options) {
      if (!options.dir) return;
      for (const directory of ['Assets', 'ThirdParty', 'Workers', 'Widgets']) {
        cpSync(join(cesiumSource, directory), join(options.dir, 'cesiumStatic', directory), { recursive: true });
      }
    },
  };
}

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
  base: basePath,
  // mkcert() enables server.https itself (with a locally-trusted cert) when present;
  // no separate server.https config is needed.
  define: {
    CESIUM_BASE_URL: JSON.stringify(cesiumStaticPath),
  },
  plugins: [react(), cesiumStaticAssets(), mapconductorTileServiceWorker(), ...(useHttps ? [mkcert()] : [])],
  resolve: {
    dedupe: ['react', 'react-dom', '@mapconductor/js-sdk-core'],
  },
  ssr: {
    noExternal: ['prism-react-renderer'],
  },
  server: {
    host: '0.0.0.0',
    port: 4000,
  },
  build: {
    sourcemap: true,
  },
});
