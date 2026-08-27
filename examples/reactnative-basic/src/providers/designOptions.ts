import { GoogleMapDesign, type GoogleMapDesignType } from '@mapconductor/reactnative-for-googlemaps';
import {
  MapLibreDesign,
  type MapLibreMapDesignType,
} from '@mapconductor/reactnative-for-maplibre';
import { ArcGISDesign, type ArcGISDesignType } from '@mapconductor/reactnative-for-arcgis';
import { LongdoDesign, type LongdoMapDesignType } from '@mapconductor/reactnative-for-longdo';
import { MapTilerDesign, type MapTilerMapDesignType } from '@mapconductor/reactnative-for-maptiler';
import { MapboxDesign, type MapboxMapDesignType } from '@mapconductor/reactnative-for-mapbox';
import { TomTomDesign, type TomTomMapDesignType } from '@mapconductor/reactnative-for-tomtom';
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

// First entry must match LongdoProviderView's default (Normal).
const LONGDO_DESIGNS: MapDesignOption[] = [
  { label: 'Normal', design: LongdoDesign.Normal },
  { label: 'Easy', design: LongdoDesign.Easy },
  { label: 'Pastel', design: LongdoDesign.Pastel },
  { label: 'Pastel Gray', design: LongdoDesign.PastelGray },
  { label: 'Hard', design: LongdoDesign.Hard },
  { label: 'Gray', design: LongdoDesign.Gray },
  { label: 'Light', design: LongdoDesign.Light },
  { label: 'Night', design: LongdoDesign.Night },
  { label: 'Dark', design: LongdoDesign.Dark },
  { label: 'Political', design: LongdoDesign.Political },
  { label: 'OpenStreetMap', design: LongdoDesign.Osm },
  { label: 'Satellite', design: LongdoDesign.Satellite },
  { label: 'Hybrid', design: LongdoDesign.Hybrid },
];

// First entry must match MapTilerProviderView's default (Streets).
// android は MTMapReferenceStyle、iOS は MapTiler Cloud のスタイル id と、
// 同じ名前で別の実体に解決される。**id の綴りが両者の唯一の接点**なので変えないこと。
const MAPTILER_DESIGNS: MapDesignOption[] = [
  { label: 'Streets', design: MapTilerDesign.Streets },
  { label: 'Streets Dark', design: MapTilerDesign.StreetsDark },
  { label: 'Streets Light', design: MapTilerDesign.StreetsLight },
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

// First entry must match MapboxProviderView's default (Streets).
// **id は 3 プラットフォームで揃っていない**（web は "streets"、android/iOS は
// "streets-v12"）。RN が渡すのは `styleJsonURL`（スタイル URI）なので、
// ここで id を合わせにいく必要はない。
const MAPBOX_DESIGNS: MapDesignOption[] = [
  { label: 'Streets', design: MapboxDesign.Streets },
  { label: 'Outdoors', design: MapboxDesign.Outdoors },
  { label: 'Light', design: MapboxDesign.Light },
  { label: 'Dark', design: MapboxDesign.Dark },
  { label: 'Satellite Streets', design: MapboxDesign.SatelliteStreets },
  { label: 'OSM Bright', design: MapboxDesign.OsmBright },
  { label: 'OSM Bright EN', design: MapboxDesign.OsmBrightEn },
  { label: 'OSM Bright JA', design: MapboxDesign.OsmBrightJa },
  { label: 'MapTiler Toner JA', design: MapboxDesign.MapTilerTonerJa },
  { label: 'MapTiler Basic JA', design: MapboxDesign.MapTilerBasicJa },
  { label: 'OpenMapTiles', design: MapboxDesign.OpenMapTiles },
];

// First entry must match TomTomProviderView's default (Standard).
// **ネイティブのカタログは 3 つだけ。** web の TomTomDesign は standard-light /
// mono-dark 等の派生も持つが、android / iOS は standard / driving / satellite しか
// 引けず、それ以外の id は Standard に丸められる。ここに派生を並べると
// 「選べるのに何も変わらない」選択肢になるので載せない。
const TOMTOM_DESIGNS: MapDesignOption[] = [
  { label: 'Standard', design: TomTomDesign.Standard },
  { label: 'Driving', design: TomTomDesign.Driving },
  { label: 'Satellite', design: TomTomDesign.Satellite },
];

export const DESIGN_OPTIONS: Partial<Record<MapProvider, MapDesignOption[]>> = {
  maplibre: MAPLIBRE_DESIGNS,
  'google-maps': GOOGLE_MAP_2D_DESIGNS,
  arcgis: ARCGIS_DESIGNS,
  'arcgis-3d': ARCGIS_DESIGNS,
  longdo: LONGDO_DESIGNS,
  maptiler: MAPTILER_DESIGNS,
  mapbox: MAPBOX_DESIGNS,
  tomtom: TOMTOM_DESIGNS,
};

export function providerLabel(provider: MapProvider): string {
  switch (provider) {
    case 'google-maps':
      return 'Google Maps';
    case 'arcgis':
      return 'ArcGIS';
    case 'arcgis-3d':
      return 'ArcGIS 3D';
    case 'longdo':
      return 'Longdo';
    case 'maptiler':
      return 'MapTiler';
    case 'mapbox':
      return 'Mapbox';
    case 'tomtom':
      return 'TomTom';
    default:
      return 'MapLibre';
  }
}

export type {
  GoogleMapDesignType,
  MapLibreMapDesignType,
  ArcGISDesignType,
  LongdoMapDesignType,
  MapTilerMapDesignType,
  MapboxMapDesignType,
  TomTomMapDesignType,
};
