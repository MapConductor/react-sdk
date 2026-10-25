import { DeckGLDesign } from '@mapconductor/react-for-deckgl';
import { GSI_STANDARD_ATTRIBUTION_RULES } from '../../gsiAttributions';
import type { MapDesignOption } from './types';

const GSI_STANDARD_DESIGN = new DeckGLDesign({
  id: 'gsi-standard',
  tileUrl: 'https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',
  tileSize: 256,
  minZoom: 5,
  maxZoom: 18,
  backgroundColor: '#f2efe9',
  attributionRules: GSI_STANDARD_ATTRIBUTION_RULES,
});

export const DECKGL_DESIGNS: MapDesignOption[] = [
  { label: 'Standard', design: DeckGLDesign.Standard },
  { label: 'Light', design: DeckGLDesign.Light },
  { label: 'Dark', design: DeckGLDesign.Dark },
  { label: 'Satellite', design: DeckGLDesign.Satellite },
  { label: 'GSI Standard', design: GSI_STANDARD_DESIGN },
  { label: 'None', design: DeckGLDesign.None },
];
