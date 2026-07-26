import { AzureMapsDesign } from '@mapconductor/react-for-azuremaps';
import type { MapDesignOption } from './types';

export const AZUREMAPS_DESIGNS: MapDesignOption[] = [
  { label: 'Road', design: AzureMapsDesign.Road },
  { label: 'Road Shaded Relief', design: AzureMapsDesign.RoadShadedRelief },
  { label: 'Grayscale Light', design: AzureMapsDesign.GrayscaleLight },
  { label: 'Grayscale Dark', design: AzureMapsDesign.GrayscaleDark },
  { label: 'Night', design: AzureMapsDesign.Night },
  { label: 'Satellite', design: AzureMapsDesign.Satellite },
  { label: 'Satellite Road Labels', design: AzureMapsDesign.SatelliteRoadLabels },
];
