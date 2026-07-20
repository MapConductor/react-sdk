import { OpenLayersDesign } from '@mapconductor/react-for-openlayers';
import type { MapDesignOption } from './types';

export const OPENLAYERS_DESIGNS: MapDesignOption[] = [
  { label: 'OpenStreetMap', design: OpenLayersDesign.OpenStreetMap },
  { label: 'None', design: OpenLayersDesign.None },
];
