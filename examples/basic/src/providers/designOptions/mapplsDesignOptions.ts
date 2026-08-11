import { MapplsDesign } from '@mapconductor/react-for-mappls';
import type { MapDesignOption } from './types';

export const MAPPLS_DESIGNS: MapDesignOption[] = [
  { label: 'Default', design: MapplsDesign.Default },
  { label: 'StandardDay', design: MapplsDesign.StandardDay },
  { label: 'StandardNight', design: MapplsDesign.StandardNight },
  { label: 'GreyDay', design: MapplsDesign.GreyDay },
];
