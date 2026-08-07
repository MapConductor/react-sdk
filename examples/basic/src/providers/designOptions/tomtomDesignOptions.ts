import { TomTomDesign } from '@mapconductor/react-for-tomtom';
import type { MapDesignOption } from './types';

export const TOMTOM_DESIGNS: MapDesignOption[] = [
  { label: 'Standard', design: TomTomDesign.Standard },
  { label: 'StandardLight', design: TomTomDesign.StandardLight },
  { label: 'StandardDark', design: TomTomDesign.StandardDark },
  { label: 'Driving', design: TomTomDesign.Driving },
  { label: 'DrivingLight', design: TomTomDesign.DrivingLight },
  { label: 'DrivingDark', design: TomTomDesign.DrivingDark },
  { label: 'MonoLight', design: TomTomDesign.MonoLight },
  { label: 'MonoDark', design: TomTomDesign.MonoDark },
  { label: 'Satellite', design: TomTomDesign.Satellite },
];
