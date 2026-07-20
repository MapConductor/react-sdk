import { CesiumDesign } from '@mapconductor/react-for-cesium';
import type { MapDesignOption } from './types';

export const CESIUM_DESIGNS: MapDesignOption[] = [
  { label: 'OpenStreetMap', design: CesiumDesign.Default },
  { label: 'None', design: CesiumDesign.None },
];
