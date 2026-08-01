/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY: string;
  readonly VITE_ARCGIS_API_KEY: string;
  readonly VITE_MAPBOX_ACCESS_TOKEN: string;
  readonly VITE_HERE_API_KEY: string;
  readonly VITE_MAPKIT_TOKEN: string;
  readonly VITE_AZURE_MAPS_SUBSCRIOTION_KEY: string;
  readonly VITE_TOMTOM_API_KEY: string;
  readonly VITE_MAPTILER: string;
  // Add more environment variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
