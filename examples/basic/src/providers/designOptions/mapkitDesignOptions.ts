import { MapKitMapDesign } from '@mapconductor/react-for-mapkit';
import type { MapDesignOption } from './types';

export const MAPKIT_DESIGNS: MapDesignOption[] = [
  { label: 'Standard', design: MapKitMapDesign.Standard },
  { label: 'Muted Standard', design: MapKitMapDesign.MutedStandard },
  { label: 'Satellite', design: MapKitMapDesign.Satellite },
  { label: 'Hybrid', design: MapKitMapDesign.Hybrid },
];
