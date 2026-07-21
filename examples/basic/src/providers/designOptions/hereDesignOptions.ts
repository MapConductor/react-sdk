import { HereMapDesign } from '@mapconductor/react-for-here';
import type { MapDesignOption } from './types';

export const HERE_DESIGNS: MapDesignOption[] = [
  { label: 'NormalDay', design: HereMapDesign.NormalDay },
  { label: 'NormalNight', design: HereMapDesign.NormalNight },
  { label: 'Satellite', design: HereMapDesign.Satellite },
  { label: 'HybridDay', design: HereMapDesign.HybridDay },
  { label: 'HybridNight', design: HereMapDesign.HybridNight },
  { label: 'LiteDay', design: HereMapDesign.LiteDay },
  { label: 'LiteNight', design: HereMapDesign.LiteNight },
  { label: 'LiteHybridDay', design: HereMapDesign.LiteHybridDay },
  { label: 'LiteHybridNight', design: HereMapDesign.LiteHybridNight },
  { label: 'LogisticsDay', design: HereMapDesign.LogisticsDay },
  { label: 'LogisticsNight', design: HereMapDesign.LogisticsNight },
  { label: 'LogisticsHybridDay', design: HereMapDesign.LogisticsHybridDay },
  { label: 'RoadNetworkDay', design: HereMapDesign.RoadNetworkDay },
  { label: 'RoadNetworkNight', design: HereMapDesign.RoadNetworkNight },
];