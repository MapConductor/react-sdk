import { LongdoDesign } from '@mapconductor/react-for-longdo';
import type { MapDesignOption } from './types';

export const LONGDO_DESIGNS: MapDesignOption[] = [
  { label: 'Normal', design: LongdoDesign.Normal },
  { label: 'Easy', design: LongdoDesign.Easy },
  { label: 'Pastel', design: LongdoDesign.Pastel },
  { label: 'PastelGray', design: LongdoDesign.PastelGray },
  { label: 'Hard', design: LongdoDesign.Hard },
  { label: 'Gray', design: LongdoDesign.Gray },
  { label: 'Light', design: LongdoDesign.Light },
  { label: 'Night', design: LongdoDesign.Night },
  { label: 'Dark', design: LongdoDesign.Dark },
  { label: 'Political', design: LongdoDesign.Political },
  { label: 'Osm', design: LongdoDesign.Osm },
  { label: 'Satellite', design: LongdoDesign.Satellite },
  { label: 'Hybrid', design: LongdoDesign.Hybrid },
];
