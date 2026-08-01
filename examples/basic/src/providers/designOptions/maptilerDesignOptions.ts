import { MapTilerDesign } from '@mapconductor/react-for-maptiler';
import type { MapDesignOption } from './types';

export const MAPTILER_DESIGNS: MapDesignOption[] = [
  { label: 'Streets', design: MapTilerDesign.Streets },
  { label: 'StreetsDark', design: MapTilerDesign.StreetsDark },
  { label: 'StreetsLight', design: MapTilerDesign.StreetsLight },
  { label: 'Basic', design: MapTilerDesign.Basic },
  { label: 'Bright', design: MapTilerDesign.Bright },
  { label: 'Satellite', design: MapTilerDesign.Satellite },
  { label: 'Outdoor', design: MapTilerDesign.Outdoor },
  { label: 'Winter', design: MapTilerDesign.Winter },
  { label: 'Topo', design: MapTilerDesign.Topo },
  { label: 'Toner', design: MapTilerDesign.Toner },
  { label: 'Dataviz', design: MapTilerDesign.Dataviz },
  { label: 'Backdrop', design: MapTilerDesign.Backdrop },
  { label: 'Ocean', design: MapTilerDesign.Ocean },
  { label: 'Landscape', design: MapTilerDesign.Landscape },
  { label: 'Aquarelle', design: MapTilerDesign.Aquarelle },
  { label: 'OpenStreetMap', design: MapTilerDesign.OpenStreetMap },
];
