import { MapboxDesign } from '@mapconductor/react-for-mapbox';
import type { MapDesignOption } from './types';

export const MAPBOX_DESIGNS: MapDesignOption[] = [
  { label: 'Streets', design: MapboxDesign.Streets },
  { label: 'Outdoors', design: MapboxDesign.Outdoors },
  { label: 'Light', design: MapboxDesign.Light },
  { label: 'Dark', design: MapboxDesign.Dark },
  { label: 'Satellite Streets', design: MapboxDesign.SatelliteStreets },
  { label: 'OsmBright', design: MapboxDesign.OsmBright },
  { label: 'OsmBrightJa', design: MapboxDesign.OsmBrightJa },
  { label: 'OpenMapTiles', design: MapboxDesign.OpenMapTiles },
];
