import type { SupportedLanguage } from '../sampleRegistry';
import {
  PROVIDER_IMPORTS,
  initialCameraCode,
  providerCode,
  type ProviderCode,
} from '../sampleDocumentationProviders';
import type { SamplePageDoc } from './types';

import helloMap from './pages/hello-map';
import map from './pages/map';
import mapDesign from './pages/map-design';
import flyTo from './pages/fly-to';
import tilt from './pages/tilt';
import visibleRegion from './pages/visible-region';
import cameraSync from './pages/camera-sync';
import marker from './pages/marker';
import markerAnimation from './pages/marker-animation';
import postOffice from './pages/post-office';
import postOfficeCluster from './pages/post-office-cluster';
import circle from './pages/circle';
import polyline from './pages/polyline';
import polylineClick from './pages/polyline-click';
import polygon from './pages/polygon';
import polygonClick from './pages/polygon-click';
import polygonGeodesic from './pages/polygon-geodesic';
import polygonHole from './pages/polygon-hole';
import groundImage from './pages/ground-image';
import rasterLayer from './pages/raster-layer';
import infoBubbleSimple from './pages/info-bubble-simple';
import infoBubbleStyled from './pages/info-bubble-styled';
import infoBubbleMultiple from './pages/info-bubble-multiple';
import infoBubbleRich from './pages/info-bubble-rich';
import geojsonBasic from './pages/geojson-basic';
import geojsonLayer from './pages/geojson-layer';
import heatmapLayer from './pages/heatmap-layer';
import threejsObject from './pages/threejs-object';

export type { SamplePageDoc } from './types';

/** Every sample page's documentation, keyed by its route id. */
const DOCUMENTATION: Record<string, SamplePageDoc> = {
  'hello-map': helloMap,
  map,
  'map-design': mapDesign,
  'fly-to': flyTo,
  tilt,
  'visible-region': visibleRegion,
  'camera-sync': cameraSync,
  marker,
  'marker-animation': markerAnimation,
  'post-office': postOffice,
  'post-office-cluster': postOfficeCluster,
  circle,
  polyline,
  'polyline-click': polylineClick,
  polygon,
  'polygon-click': polygonClick,
  'polygon-geodesic': polygonGeodesic,
  'polygon-hole': polygonHole,
  'ground-image': groundImage,
  'raster-layer': rasterLayer,
  'info-bubble-simple': infoBubbleSimple,
  'info-bubble-styled': infoBubbleStyled,
  'info-bubble-multiple': infoBubbleMultiple,
  'info-bubble-rich': infoBubbleRich,
  'geojson-basic': geojsonBasic,
  'geojson-layer': geojsonLayer,
  'heatmap-layer': heatmapLayer,
  'threejs-object': threejsObject,
};

const FALLBACK: SamplePageDoc = {
  code: `<MapViewContainer state={mapViewState}>
  {/* MapConductor overlays */}
</MapViewContainer>`,
  explanation: {
    en: ['Render provider-independent overlays inside the shared MapConductor map view.'],
    ja: ['MapConductorの共通地図ビュー内へ、プロバイダー非依存のオーバーレイを描画します。'],
    'es-419': ['Renderiza capas independientes del proveedor dentro de la vista de mapa compartida de MapConductor.'],
  },
};

const SECTION_COMMENTS: Record<SupportedLanguage, {
  map: string;
  state: string;
  render: string;
}> = {
  en: {
    map: 'Create the map',
    state: 'Prepare the data and interaction state',
    render: 'Render the map and its overlays',
  },
  ja: {
    map: '地図の作成',
    state: 'データと操作用Stateの準備',
    render: '地図とオーバーレイの描画',
  },
  'es-419': {
    map: 'Crear el mapa',
    state: 'Preparar los datos y el estado de interacción',
    render: 'Renderizar el mapa y sus capas',
  },
};

function adaptProviderView(code: string, provider: ProviderCode): string {
  return code
    .split('<MapViewContainer').join(`<${provider.component}${provider.openingProps}`)
    .split('</MapViewContainer>').join(`</${provider.component}>`);
}

interface ImportDefinition {
  source: string;
  values: readonly string[];
  types?: readonly string[];
}

const IMPORT_DEFINITIONS: readonly ImportDefinition[] = [
  {
    source: 'react',
    values: ['useEffect', 'useMemo', 'useRef', 'useState'],
  },
  {
    source: '@mapconductor/js-sdk-core',
    values: [
      'ColorDefaultIcon',
      'MarkerAnimation',
      'MarkerTilingOptions',
      'PolygonManager',
      'RasterLayerSource',
      'calculatePositionAtDistance',
      'computeDistanceBetween',
      'createCircleState',
      'createGeoPoint',
      'createGeoRectBounds',
      'createGroundImageState',
      'createMapCameraPosition',
      'createMarkerState',
      'createPolygonState',
      'createPolygonEntity',
      'createPolylineState',
      'createRasterLayerState',
    ],
    types: [
      'GeoPoint',
      'MapCameraPosition',
      'MapDesignTypeInterface',
      'MapViewStateInterface',
      'MarkerState',
      'VisibleRegion',
    ],
  },
  {
    source: '@mapconductor/js-sdk-react',
    values: [
      'Circle',
      'GroundImage',
      'InfoBubble',
      'InfoBubbleAtPosition',
      'InfoBubbleCustom',
      'Marker',
      'Markers',
      'Polygon',
      'Polyline',
      'RasterLayer',
      'useMapReady',
    ],
  },
  // One import per provider package, generated from the provider registry so
  // adding a provider needs no change here.
  ...PROVIDER_IMPORTS,
  {
    source: '@mapconductor/react-geojson-layer',
    values: ['GeoJSONLayer', 'GeoJSONLayerState'],
    types: ['GeoJSONFeatureData'],
  },
  {
    source: '@mapconductor/react-heatmap',
    values: ['HeatmapOverlay', 'HeatmapPointState', 'HeatmapPoints'],
  },
  {
    source: '@mapconductor/react-marker-clustering',
    values: ['MarkerClusterGroup'],
  },
];

function usesIdentifier(code: string, identifier: string): boolean {
  return new RegExp(`\\b${identifier}\\b`).test(code);
}

function formatImport(definition: ImportDefinition, code: string): string | null {
  const names = [
    ...definition.values.filter(name => usesIdentifier(code, name)),
    ...(definition.types ?? [])
      .filter(name => usesIdentifier(code, name))
      .map(name => `type ${name}`),
  ];
  if (names.length === 0) return null;
  if (names.length <= 3) {
    return `import { ${names.join(', ')} } from '${definition.source}';`;
  }
  return `import {\n${names.map(name => `  ${name},`).join('\n')}\n} from '${definition.source}';`;
}

function importCode(code: string): string {
  const imports = IMPORT_DEFINITIONS
    .map(definition => formatImport(definition, code))
    .filter((value): value is string => value !== null);
  if (usesIdentifier(code, 'THREE')) {
    imports.splice(1, 0, "import * as THREE from 'three';");
  }
  return imports.join('\n');
}

export function getSampleDocumentation(
  page: string | undefined,
  providerName?: string,
  language: SupportedLanguage = 'en',
): SamplePageDoc {
  const documentation = DOCUMENTATION[page ?? ''] ?? FALLBACK;
  const provider = providerCode(providerName);
  const providerSetup = page === 'camera-sync'
    ? initialCameraCode()
    : provider.stateSetup;
  const comments = SECTION_COMMENTS[language];
  const stateSection = documentation.state
    ? [`// (2) ${comments.state}`, documentation.state].join('\n')
    : '';
  const mainCode = [
    `// (1) ${comments.map}`,
    providerSetup,
    stateSection,
    `// (${documentation.state ? 3 : 2}) ${comments.render}`,
    adaptProviderView(documentation.code, provider),
  ].filter(Boolean).join('\n\n');
  return {
    ...documentation,
    code: [importCode(mainCode), mainCode]
      .filter(Boolean)
      .join('\n\n'),
  };
}
