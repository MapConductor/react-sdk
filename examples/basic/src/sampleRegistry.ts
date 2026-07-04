export type SampleStatus = 'ready' | 'unsupported';

export interface SamplePageDefinition {
  id: string;
  label: string;
  group: string;
  status?: SampleStatus;
  showProviderSelector?: boolean;
}

export const SAMPLE_PAGES: SamplePageDefinition[] = [
  { id: 'map', label: 'Store Map', group: 'Map' },
  { id: 'map-design', label: 'Map Design', group: 'Map' },
  { id: 'fly-to', label: 'Fly To', group: 'Map' },
  { id: 'tilt', label: 'Tilt', group: 'Map' },
  { id: 'visible-region', label: 'Visible Region', group: 'Map' },
  { id: 'camera-sync', label: 'Camera Sync', group: 'Map', showProviderSelector: false },
  { id: 'marker', label: 'Marker Icons', group: 'Marker' },
  { id: 'marker-animation', label: 'Marker Animation', group: 'Marker' },
  { id: 'post-office', label: 'Post Office', group: 'Marker' },
  { id: 'post-office-cluster', label: 'Post Office Cluster', group: 'Marker', status: 'unsupported' },
  { id: 'circle', label: 'Circle', group: 'Shape' },
  { id: 'polyline', label: 'Polyline', group: 'Shape' },
  { id: 'polyline-click', label: 'Polyline Click', group: 'Shape' },
  { id: 'polygon', label: 'Polygon', group: 'Shape' },
  { id: 'polygon-click', label: 'Polygon Click', group: 'Shape' },
  { id: 'polygon-geodesic', label: 'Polygon Geodesic', group: 'Shape' },
  { id: 'polygon-hole', label: 'Polygon Hole', group: 'Shape' },
  { id: 'ground-image', label: 'Ground Image', group: 'Overlay' },
  { id: 'raster-layer', label: 'Raster Layer', group: 'Overlay' },
  { id: 'info-bubble-simple', label: 'Simple Bubble', group: 'Info Bubble' },
  { id: 'info-bubble-styled', label: 'Styled Bubble', group: 'Info Bubble' },
  { id: 'info-bubble-multiple', label: 'Multiple Bubbles', group: 'Info Bubble' },
  { id: 'info-bubble-rich', label: 'Rich Bubble', group: 'Info Bubble' },
  { id: 'geojson-basic', label: 'GeoJSON Basic', group: 'Extensions', status: 'unsupported' },
  { id: 'geojson-layer', label: 'GeoJSON Layer', group: 'Extensions', status: 'unsupported' },
  { id: 'heatmap-layer', label: 'Heatmap Layer', group: 'Extensions', status: 'unsupported' },
];

export const DEFAULT_SAMPLE_PAGE = 'map';

export function isKnownSamplePage(page: string | undefined): boolean {
  return SAMPLE_PAGES.some((item) => item.id === page);
}

export function getSamplePageDefinition(page: string | undefined): SamplePageDefinition | undefined {
  return SAMPLE_PAGES.find((item) => item.id === page);
}
