import antennaHorizons from './pages/antenna-horizons';
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
import projectedCoordinates from './pages/projected-coordinates';
import cameraSync from './pages/camera-sync';
import marker from './pages/marker';
import markerLabelPosition from './pages/marker-label-position';
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
import vectorTile from './pages/vector-tile';
import infoBubbleSimple from './pages/info-bubble-simple';
import infoBubbleStyled from './pages/info-bubble-styled';
import infoBubbleMultiple from './pages/info-bubble-multiple';
import infoBubbleRich from './pages/info-bubble-rich';
import geojsonBasic from './pages/geojson-basic';
import geojsonLayer from './pages/geojson-layer';
import kmlLayer from './pages/kml-layer';
import heatmapLayer from './pages/heatmap-layer';
import threejsObject from './pages/threejs-object';
import fitBounds from './pages/fit-bounds';
import cameraRestriction from './pages/camera-restriction';
import uiSettings from './pages/ui-settings';
import streetTree from './pages/street-tree';
import styleAdjustments from './pages/style-adjustments';

export type { SamplePageDoc } from './types';

/** Every sample page's documentation, keyed by its route id. */
const DOCUMENTATION: Record<string, SamplePageDoc> = {
  'antenna-horizons': antennaHorizons,
  'hello-map': helloMap,
  map,
  'map-design': mapDesign,
  'fly-to': flyTo,
  tilt,
  'visible-region': visibleRegion,
  'projected-coordinates': projectedCoordinates,
  'camera-sync': cameraSync,
  marker,
  'marker-label-position': markerLabelPosition,
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
  'vector-tile': vectorTile,
  'info-bubble-simple': infoBubbleSimple,
  'info-bubble-styled': infoBubbleStyled,
  'info-bubble-multiple': infoBubbleMultiple,
  'info-bubble-rich': infoBubbleRich,
  'geojson-basic': geojsonBasic,
  'geojson-layer': geojsonLayer,
  'kml-layer': kmlLayer,
  'heatmap-layer': heatmapLayer,
  'threejs-object': threejsObject,
  'fit-bounds': fitBounds,
  'camera-restriction': cameraRestriction,
  'ui-settings': uiSettings,
  'street-tree': streetTree,
  'style-adjustments': styleAdjustments,
};

const FALLBACK: SamplePageDoc = {
  code: `<MapViewContainer state={mapViewState}>
  {/* MapConductor overlays */}
</MapViewContainer>`,
  explanation: {
    en: ['Render provider-independent overlays inside the shared MapConductor map view.'],
    ja: ['MapConductorの共通地図ビュー内へ、プロバイダー非依存のオーバーレイを描画します。'],
    'es-419': ['Renderiza capas independientes del proveedor dentro de la vista de mapa compartida de MapConductor.'],
    de: ['Zeichnen Sie anbieterunabhängige Overlays in die gemeinsame Kartenansicht von MapConductor.'],
    th: ['วาดโอเวอร์เลย์ที่ไม่ผูกกับผู้ให้บริการไว้ภายในมุมมองแผนที่ร่วมของ MapConductor'],
    hi: ['प्रोवाइडर से स्वतंत्र ओवरले MapConductor के साझा मैप व्यू के भीतर रेंडर करें।'],
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
  de: {
    map: 'Die Karte erzeugen',
    state: 'Daten und Interaktionszustand vorbereiten',
    render: 'Die Karte und ihre Overlays rendern',
  },
  th: {
    map: 'สร้างแผนที่',
    state: 'เตรียมข้อมูลและสถานะการโต้ตอบ',
    render: 'เรนเดอร์แผนที่และโอเวอร์เลย์',
  },
  hi: {
    map: 'मैप बनाएँ',
    state: 'डेटा और इंटरैक्शन स्टेट तैयार करें',
    render: 'मैप और उसके ओवरले रेंडर करें',
  },
};

function adaptProviderView(code: string, provider: ProviderCode): string {
  return code
    .split('ProviderDesign').join(provider.designClass)
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
      'DefaultMarkerIcon',
      'ImageIcon',
      'MapUISettings',
      'MarkerAnimation',
      'CircleTilingOptions',
      'MarkerTilingOptions',
      'PolygonManager',
      'RasterLayerSource',
      'Spherical',
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
      'MarkerLabelPosition',
      'MarkerState',
      'VisibleRegion',
    ],
  },
  {
    source: '@mapconductor/js-sdk-react',
    values: [
      'Circles',
      'Circle',
      'GroundImage',
      'InfoBubble',
      'InfoBubbleCustom',
      'Marker',
      'Markers',
      'Polygon',
      'Polyline',
      'RasterLayer',
      'useMapLoaded',
    ],
  },
  // One import per provider package, generated from the provider registry so
  // adding a provider needs no change here.
  ...PROVIDER_IMPORTS,
  {
    source: '@mapconductor/react-geojson',
    values: ['GeoJSONLayer', 'GeoJSONLayerState', 'GeoJSONParser', 'colorArgb'],
    types: ['GeoJSONFeatureData'],
  },
  {
    source: '@mapconductor/react-vectortile',
    values: ['VectorTileLayer'],
  },
  {
    source: '@mapconductor/js-vectorstyle',
    values: ['buildStyleRules', 'LayerRole'],
  },
  {
    source: '@mapconductor/react-kml',
    values: ['KMLLayer', 'KMLLayerState', 'KMLParser', 'KMLLoader'],
    types: ['KMLFeatureData'],
  },
  {
    source: '@mapconductor/react-heatmap',
    values: ['HeatmapOverlay', 'HeatmapPointState', 'HeatmapPoints'],
  },
  {
    source: '@mapconductor/react-marker-clustering',
    values: ['MarkerClusterGroup'],
    types: ['MarkerCluster'],
  },
];

function usesIdentifier(code: string, identifier: string): boolean {
  // Names in comments and data (e.g. GeoJSON's type: 'Polygon') are not imports.
  const source = code.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`/g, '');
  return new RegExp(`\\b${identifier}\\b`).test(source);
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
  for (const definition of PROVIDER_IMPORTS) {
    if (['maplibre', 'mapbox', 'leaflet', 'openlayers', 'maptiler', 'azuremaps', 'cesium']
      .some(name => definition.source === `@mapconductor/react-for-${name}`)
      && definition.values.some(name => usesIdentifier(code, name))) {
      imports.push(`import '${definition.source}/style.css';`);
    }
  }
  return imports.join('\n');
}

export function getSampleDocumentation(
  page: string | undefined,
  providerName?: string,
  language: SupportedLanguage = 'en',
): SamplePageDoc {
  const documentation = DOCUMENTATION[page ?? ''] ?? FALLBACK;
  const provider = providerCode(providerName, documentation.camera);
  const providerSetup = page === 'camera-sync'
    ? initialCameraCode(documentation.camera)
    : provider.stateSetup;
  const comments = SECTION_COMMENTS[language];
  const stateSection = documentation.state
    ? [`// (2) ${comments.state}`, adaptProviderView(documentation.state, provider)].join('\n')
    : '';
  const body = [
    `// (1) ${comments.map}`,
    providerSetup,
    stateSection,
    `// (${documentation.state ? 3 : 2}) ${comments.render}`,
    `return (\n  <div style={{ height: 500, position: 'relative', display: 'flex', flexDirection: 'column' }}>\n${adaptProviderView(documentation.code, provider).split('\n').map(line => `    ${line}`).join('\n')}\n  </div>\n);`,
  ].filter(Boolean).join('\n\n');
  const mainCode = [
    page === 'camera-sync' ? undefined : provider.prerequisites,
    documentation.helpers,
    `export default function App() {\n${body.split('\n').map(line => line ? `  ${line}` : '').join('\n')}\n}`,
  ].filter(Boolean).join('\n\n');
  return {
    ...documentation,
    code: [importCode(mainCode), mainCode]
      .filter(Boolean)
      .join('\n\n'),
  };
}
