import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { setMapLibreWorkerUrl } from '@mapconductor/react-for-maplibre';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import App from './App';
import './index.css';

// MapLibre GL JS v6 is ESM-only and loads its worker from a URL. Vite resolves
// that worker file via `?worker&url`; register it once before any map is created.
setMapLibreWorkerUrl(maplibreWorkerUrl);

const container = document.getElementById('root')!;
const app = (
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

if (container.hasChildNodes()) {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}
