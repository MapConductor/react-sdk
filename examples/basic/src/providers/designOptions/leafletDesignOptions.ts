import { LeafletDesign } from '@mapconductor/react-for-leaflet';
import { GSI_STANDARD_ATTRIBUTION_RULES } from '../../gsiAttributions';
import type { MapDesignOption } from './types';

const GSI_STANDARD_DESIGN = new LeafletDesign({
  id: 'gsi-standard',
  tileUrl: 'https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',
  tileOptions: {
    minZoom: 5,
    maxZoom: 18,
    tileSize: 256,
  },
  attributionRules: GSI_STANDARD_ATTRIBUTION_RULES,
});

export const LEAFLET_DESIGNS: MapDesignOption[] = [
  { label: 'OpenStreetMap', design: LeafletDesign.OpenStreetMap },
  { label: 'GSI Standard', design: GSI_STANDARD_DESIGN },
  { label: 'None', design: LeafletDesign.None },
];
