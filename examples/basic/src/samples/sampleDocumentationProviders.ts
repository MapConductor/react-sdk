/**
 * Provider registry for the sample documentation snippets.
 *
 * Each map provider is described once, as data, so the code generator (see
 * sampleDocumentation.ts) and the docs component (SampleDocumentation.tsx) can
 * resolve a provider's component, hook, design and imports by lookup instead of
 * a growing switch/ternary chain. Adding a provider is a single entry here.
 */

export interface ProviderCode {
  component: string;
  openingProps: string;
  stateSetup: string;
  designClass: string;
  prerequisites?: string;
}

export interface ProviderImport {
  source: string;
  values: readonly string[];
}

interface ProviderDefinition {
  /** React component that renders the map (e.g. `MapLibreMapView2D`). */
  component: string;
  /** Extra JSX props on the opening tag (e.g. ` mapId="DEMO_MAP_ID"`). */
  openingProps?: string;
  /** View-state hook (e.g. `useMapLibreViewState`). */
  hook: string;
  /** Default design expression (e.g. `MapLibreDesign.OsmBrightJa`). */
  design: string;
  /** Auth/config option lines placed before `mapDesignType` in the hook call. */
  hookOptions?: readonly string[];
  /** Extra setup appended after the hook call (e.g. the HERE `platform`). */
  extraSetup?: string;
  /** Host-page setup that cannot be expressed as a React prop. */
  prerequisites?: string;
  /** The provider package import used by the snippet. */
  import: ProviderImport;
}

const CAMERA_CODE = `const initialCamera = createMapCameraPosition({
  position: createGeoPoint({ latitude: 35.6812, longitude: 139.7671 }),
  zoom: 12,
});`;

const HERE_PLATFORM_SETUP = `const platform = useMemo(
  () => new H.service.Platform({ apikey: 'YOUR_HERE_API_KEY' }),
  [],
);`;

const DEFAULT_PROVIDER = 'maplibre';

/** Registry of every provider the docs can render. Keyed by route provider id. */
const PROVIDER_DEFINITIONS: Record<string, ProviderDefinition> = {
  maplibre: {
    component: 'MapLibreMapView2D',
    hook: 'useMapLibreViewState',
    design: 'MapLibreDesign.OsmBrightJa',
    import: { source: '@mapconductor/react-for-maplibre', values: ['MapLibreDesign', 'MapLibreMapView2D', 'useMapLibreViewState'] },
  },
  'maplibre-3d': {
    component: 'MapLibreMapView',
    hook: 'useMapLibreViewState',
    design: 'MapLibreDesign.OsmBrightJa',
    import: { source: '@mapconductor/react-for-maplibre', values: ['MapLibreDesign', 'MapLibreMapView', 'useMapLibreViewState'] },
  },
  mapbox: {
    component: 'MapBoxMapView2D',
    hook: 'useMapboxViewState',
    design: 'MapboxDesign.Streets',
    hookOptions: ["accessToken: 'YOUR_MAPBOX_ACCESS_TOKEN'"],
    import: { source: '@mapconductor/react-for-mapbox', values: ['MapboxDesign', 'MapBoxMapView2D', 'useMapboxViewState'] },
  },
  'mapbox-3d': {
    component: 'MapBoxMapView',
    hook: 'useMapboxViewState',
    design: 'MapboxDesign.Streets',
    hookOptions: ["accessToken: 'YOUR_MAPBOX_ACCESS_TOKEN'"],
    import: { source: '@mapconductor/react-for-mapbox', values: ['MapboxDesign', 'MapBoxMapView', 'useMapboxViewState'] },
  },
  leaflet: {
    component: 'LeafletMapView',
    hook: 'useLeafletMapViewState',
    design: 'LeafletDesign.OpenStreetMap',
    import: { source: '@mapconductor/react-for-leaflet', values: ['LeafletDesign', 'LeafletMapView', 'useLeafletMapViewState'] },
  },
  openlayers: {
    component: 'OpenLayersMapView',
    hook: 'useOpenLayersMapViewState',
    design: 'OpenLayersDesign.OpenStreetMap',
    import: { source: '@mapconductor/react-for-openlayers', values: ['OpenLayersDesign', 'OpenLayersMapView', 'useOpenLayersMapViewState'] },
  },
  'google-maps': {
    component: 'GoogleMapView2D',
    openingProps: ' mapId="DEMO_MAP_ID"',
    hook: 'useGoogleMapViewState',
    design: 'GoogleMapDesign.Normal',
    hookOptions: ["apiKey: 'YOUR_GOOGLE_MAPS_API_KEY'"],
    import: { source: '@mapconductor/react-for-googlemaps', values: ['GoogleMapDesign', 'GoogleMapView2D', 'useGoogleMapViewState'] },
  },
  'google-maps-3d': {
    component: 'GoogleMapView',
    openingProps: ' mapId="DEMO_MAP_ID"',
    hook: 'useGoogleMapViewState',
    design: 'GoogleMapDesign.Normal',
    hookOptions: ["apiKey: 'YOUR_GOOGLE_MAPS_API_KEY'"],
    import: { source: '@mapconductor/react-for-googlemaps', values: ['GoogleMapDesign', 'GoogleMapView', 'useGoogleMapViewState'] },
  },
  arcgis: {
    component: 'ArcGISMapView2D',
    hook: 'useArcGISViewState',
    design: 'ArcGISDesign.Streets',
    hookOptions: ["apiKey: 'YOUR_ARCGIS_API_KEY'"],
    import: { source: '@mapconductor/react-for-arcgis', values: ['ArcGISDesign', 'ArcGISMapView2D', 'useArcGISViewState'] },
  },
  'arcgis-3d': {
    component: 'ArcGISMapView',
    hook: 'useArcGISViewState',
    design: 'ArcGISDesign.Streets',
    hookOptions: ["apiKey: 'YOUR_ARCGIS_API_KEY'"],
    import: { source: '@mapconductor/react-for-arcgis', values: ['ArcGISDesign', 'ArcGISMapView', 'useArcGISViewState'] },
  },
  cesium: {
    component: 'CesiumMapView',
    hook: 'useCesiumMapViewState',
    design: 'CesiumDesign.Default',
    import: { source: '@mapconductor/react-for-cesium', values: ['CesiumDesign', 'CesiumMapView', 'useCesiumMapViewState'] },
  },
  here: {
    component: 'HereMapView2D',
    openingProps: ' platform={platform}',
    hook: 'useHereViewState',
    design: 'HereMapDesign.NormalDay',
    extraSetup: HERE_PLATFORM_SETUP,
    prerequisites: `// Before mounting App, add these tags to index.html:
// <script src="https://js.api.here.com/v3/3.2/mapsjs-core.js"></script>
// <script src="https://js.api.here.com/v3/3.2/mapsjs-service.js"></script>
// <script src="https://js.api.here.com/v3/3.2/mapsjs-ui.js"></script>
// <script src="https://js.api.here.com/v3/3.2/mapsjs-mapevents.js"></script>
// <link rel="stylesheet" href="https://js.api.here.com/v3/3.2/mapsjs-ui.css" />`,
    import: { source: '@mapconductor/react-for-here', values: ['HereMapDesign', 'HereMapView2D', 'useHereViewState'] },
  },
  mapkit: {
    component: 'MapKitMapView',
    hook: 'useMapKitViewState',
    design: 'MapKitMapDesign.Standard',
    hookOptions: ["token: 'YOUR_MAPKIT_TOKEN'"],
    import: { source: '@mapconductor/react-for-mapkit', values: ['MapKitMapDesign', 'MapKitMapView', 'useMapKitViewState'] },
  },
  azuremaps: {
    component: 'AzureMapsMapView',
    hook: 'useAzureMapsViewState',
    design: 'AzureMapsDesign.Road',
    hookOptions: ["subscriptionKey: 'YOUR_AZURE_MAPS_SUBSCRIPTION_KEY'"],
    import: { source: '@mapconductor/react-for-azuremaps', values: ['AzureMapsDesign', 'AzureMapsMapView', 'useAzureMapsViewState'] },
  },
  tomtom: {
    component: 'TomTomMapView2D', hook: 'useTomTomViewState', design: 'TomTomDesign.Standard',
    hookOptions: ["apiKey: 'YOUR_TOMTOM_API_KEY'"],
    import: { source: '@mapconductor/react-for-tomtom', values: ['TomTomDesign', 'TomTomMapView2D', 'useTomTomViewState'] },
  },
  maptiler: {
    component: 'MapTilerMapView2D', hook: 'useMapTilerViewState', design: 'MapTilerDesign.Streets',
    hookOptions: ["apiKey: 'YOUR_MAPTILER_API_KEY'"],
    import: { source: '@mapconductor/react-for-maptiler', values: ['MapTilerDesign', 'MapTilerMapView2D', 'useMapTilerViewState'] },
  },
  longdo: {
    component: 'LongdoMapView2D', hook: 'useLongdoViewState', design: 'LongdoDesign.Normal',
    hookOptions: ["apiKey: 'YOUR_LONGDO_API_KEY'"],
    import: { source: '@mapconductor/react-for-longdo', values: ['LongdoDesign', 'LongdoMapView2D', 'useLongdoViewState'] },
  },
  mappls: {
    component: 'MapplsMapView2D', hook: 'useMapplsViewState', design: 'MapplsDesign.Default',
    hookOptions: ["apiKey: 'YOUR_MAPPLS_API_KEY'"],
    import: { source: '@mapconductor/react-for-mappls', values: ['MapplsDesign', 'MapplsMapView2D', 'useMapplsViewState'] },
  },
  deckgl: {
    component: 'DeckGLMapView', hook: 'useDeckGLMapViewState', design: 'DeckGLDesign.Standard',
    import: { source: '@mapconductor/react-for-deckgl', values: ['DeckGLDesign', 'DeckGLMapView', 'useDeckGLMapViewState'] },
  },
};

export const DOCUMENTATION_PROVIDERS = Object.keys(PROVIDER_DEFINITIONS);

function definitionFor(provider: string | undefined): ProviderDefinition {
  if (provider === 'google') provider = 'google-maps';
  if (provider === 'google-3d') provider = 'google-maps-3d';
  return (provider && PROVIDER_DEFINITIONS[provider]) || PROVIDER_DEFINITIONS[DEFAULT_PROVIDER];
}

/** The `initialCamera` snippet, shared by every provider and by camera-sync. */
export function initialCameraCode(camera?: { latitude: number; longitude: number; zoom: number }): string {
  if (!camera) return CAMERA_CODE;
  return `const initialCamera = createMapCameraPosition({\n  position: createGeoPoint({ latitude: ${camera.latitude}, longitude: ${camera.longitude} }),\n  zoom: ${camera.zoom},\n});`;
}

/** Resolve a provider id to its snippet component, opening props and state setup. */
export function providerCode(provider: string | undefined, camera?: { latitude: number; longitude: number; zoom: number }): ProviderCode {
  const definition = definitionFor(provider);
  const options = [
    ...(definition.hookOptions ?? []),
    `mapDesignType: ${definition.design}`,
    'cameraPosition: initialCamera',
  ]
    .map(line => `  ${line},`)
    .join('\n');
  const hookCall = `const mapViewState = ${definition.hook}({\n${options}\n});`;
  const stateSetup = [
    initialCameraCode(camera),
    definition.extraSetup ? `${hookCall}\n${definition.extraSetup}` : hookCall,
  ].join('\n\n');
  return {
    component: definition.component,
    openingProps: definition.openingProps ?? '',
    stateSetup,
    designClass: definition.design.split('.')[0],
    prerequisites: definition.prerequisites,
  };
}

/** The map component name for a provider (used by the docs prose). */
export function providerComponent(provider: string | undefined): string {
  return definitionFor(provider).component;
}

/** The view-state hook name for a provider (used by the docs prose). */
export function providerHook(provider: string | undefined): string {
  return definitionFor(provider).hook;
}

/** One import per provider package, unioning the names used across its variants. */
export const PROVIDER_IMPORTS: readonly ProviderImport[] = (() => {
  const bySource = new Map<string, Set<string>>();
  for (const definition of Object.values(PROVIDER_DEFINITIONS)) {
    const values = bySource.get(definition.import.source) ?? new Set<string>();
    definition.import.values.forEach(value => values.add(value));
    bySource.set(definition.import.source, values);
  }
  return [...bySource.entries()].map(([source, values]) => ({
    source,
    values: [...values].sort(),
  }));
})();
