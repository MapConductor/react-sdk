import { GoogleMapDesign, type GoogleMapDesignType } from '@mapconductor/reactnative-for-googlemaps';
import {
  MapLibreDesign,
  type MapLibreMapDesignType,
} from '@mapconductor/reactnative-for-maplibre';
import { HereMapDesign, type HereMapDesignType } from '@mapconductor/reactnative-for-here';
import { ArcGISDesign, type ArcGISDesignType } from '@mapconductor/reactnative-for-arcgis';
import type { MapDesignTypeInterface } from '@mapconductor/js-sdk-core';
import type { MapProvider } from './types';

export interface MapDesignOption {
  label: string;
  design: MapDesignTypeInterface<unknown>;
}

const GOOGLE_MAP_2D_DESIGNS: MapDesignOption[] = [
  { label: 'Normal', design: GoogleMapDesign.Normal },
  { label: 'Satellite', design: GoogleMapDesign.Satellite },
  { label: 'Hybrid', design: GoogleMapDesign.Hybrid },
  { label: 'Terrain', design: GoogleMapDesign.Terrain },
  { label: 'None', design: GoogleMapDesign.None },
];

const MAPLIBRE_DESIGNS: MapDesignOption[] = [
  { label: 'DemoTiles', design: MapLibreDesign.DemoTiles },
  { label: 'MapTilerBasicEn', design: MapLibreDesign.MapTilerBasicEn },
  { label: 'MapTilerBasicJa', design: MapLibreDesign.MapTilerBasicJa },
  { label: 'MapTilerTonerEn', design: MapLibreDesign.MapTilerTonerEn },
  { label: 'MapTilerTonerJa', design: MapLibreDesign.MapTilerTonerJa },
  { label: 'OsmBright', design: MapLibreDesign.OsmBright },
  { label: 'OsmBrightEn', design: MapLibreDesign.OsmBrightEn },
  { label: 'OsmBrightJa', design: MapLibreDesign.OsmBrightJa },
  { label: 'OpenMapTiles', design: MapLibreDesign.OpenMapTiles },
];

// First entry must match HereProviderView's default (NormalDay) so the picker's
// initial value aligns with the design the map actually mounts with.
const HERE_DESIGNS: MapDesignOption[] = [
  { label: 'Normal Day', design: HereMapDesign.NormalDay },
  { label: 'Normal Night', design: HereMapDesign.NormalNight },
  { label: 'Satellite', design: HereMapDesign.Satellite },
  { label: 'Hybrid Day', design: HereMapDesign.HybridDay },
  { label: 'Hybrid Night', design: HereMapDesign.HybridNight },
  { label: 'Lite Day', design: HereMapDesign.LiteDay },
  { label: 'Lite Night', design: HereMapDesign.LiteNight },
  { label: 'Lite Hybrid Day', design: HereMapDesign.LiteHybridDay },
  { label: 'Lite Hybrid Night', design: HereMapDesign.LiteHybridNight },
  { label: 'Logistics Day', design: HereMapDesign.LogisticsDay },
  { label: 'Logistics Night', design: HereMapDesign.LogisticsNight },
  { label: 'Logistics Hybrid Day', design: HereMapDesign.LogisticsHybridDay },
  { label: 'Road Network Day', design: HereMapDesign.RoadNetworkDay },
  { label: 'Road Network Night', design: HereMapDesign.RoadNetworkNight },
];

// First entry must match ArcGISProviderView's default (Streets). Only complete,
// standalone basemaps are listed; ArcGIS *Base/*Labels/*Detail reference layers
// are meant to be composited and render incompletely on their own.
const ARCGIS_DESIGNS: MapDesignOption[] = [
  { label: 'Streets', design: ArcGISDesign.Streets },
  { label: 'Streets Night', design: ArcGISDesign.StreetsNight },
  { label: 'Streets Relief', design: ArcGISDesign.StreetsRelief },
  { label: 'Navigation', design: ArcGISDesign.Navigation },
  { label: 'Navigation Night', design: ArcGISDesign.NavigationNight },
  { label: 'Imagery', design: ArcGISDesign.Imagery },
  { label: 'Imagery Standard', design: ArcGISDesign.ImageryStandard },
  { label: 'Topographic', design: ArcGISDesign.Topographic },
  { label: 'Terrain', design: ArcGISDesign.Terrain },
  { label: 'Oceans', design: ArcGISDesign.Oceans },
  { label: 'Light Gray', design: ArcGISDesign.LightGray },
  { label: 'Dark Gray', design: ArcGISDesign.DarkGray },
  { label: 'Outdoor', design: ArcGISDesign.Outdoor },
  { label: 'Community', design: ArcGISDesign.Community },
  { label: 'Charted Territory', design: ArcGISDesign.ChartedTerritory },
  { label: 'Colored Pencil', design: ArcGISDesign.ColoredPencil },
  { label: 'Nova', design: ArcGISDesign.Nova },
  { label: 'Modern Antique', design: ArcGISDesign.ModernAntique },
  { label: 'Midcentury', design: ArcGISDesign.Midcentury },
  { label: 'Newspaper', design: ArcGISDesign.Newspaper },
  { label: 'Human Geography', design: ArcGISDesign.HumanGeography },
  { label: 'Human Geography Dark', design: ArcGISDesign.HumanGeographyDark },
  { label: 'OSM Standard', design: ArcGISDesign.OsmStandard },
  { label: 'OSM Standard Relief', design: ArcGISDesign.OsmStandardRelief },
  { label: 'OSM Streets', design: ArcGISDesign.OsmStreets },
  { label: 'OSM Streets Relief', design: ArcGISDesign.OsmStreetsRelief },
  { label: 'OSM Light Gray', design: ArcGISDesign.OsmLightGray },
  { label: 'OSM Dark Gray', design: ArcGISDesign.OsmDarkGray },
  { label: 'OSM Blueprint', design: ArcGISDesign.OsmBlueprint },
  { label: 'OSM Hybrid', design: ArcGISDesign.OsmHybrid },
  { label: 'OSM Navigation', design: ArcGISDesign.OsmNavigation },
  { label: 'OSM Navigation Dark', design: ArcGISDesign.OsmNavigationDark },
];

export const DESIGN_OPTIONS: Partial<Record<MapProvider, MapDesignOption[]>> = {
  maplibre: MAPLIBRE_DESIGNS,
  'google-maps': GOOGLE_MAP_2D_DESIGNS,
  here: HERE_DESIGNS,
  arcgis: ARCGIS_DESIGNS,
};

export function providerLabel(provider: MapProvider): string {
  switch (provider) {
    case 'google-maps':
      return 'Google Maps';
    case 'here':
      return 'HERE';
    case 'arcgis':
      return 'ArcGIS';
    default:
      return 'MapLibre';
  }
}

export type {
  GoogleMapDesignType,
  MapLibreMapDesignType,
  HereMapDesignType,
  ArcGISDesignType,
};
