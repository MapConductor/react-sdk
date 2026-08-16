import React from 'react';
import type { ProviderDesignOverrides, ProviderViewProps, MapProvider } from '../providers/types';
import { MapLibreProviderView } from '../providers/MapLibreProviderView';
import { LongdoProviderView } from '../providers/LongdoProviderView';
import { MapTilerProviderView } from '../providers/MapTilerProviderView';
import { MapboxProviderView } from '../providers/MapboxProviderView';
import { GoogleMapsProviderView } from '../providers/GoogleMapsProviderView';
import { HereProviderView } from '../providers/HereProviderView';
import { ArcGISProviderView } from '../providers/ArcGISProviderView';

export type { MapProvider, ProviderDesignOverrides };

interface MapViewContainerProps extends ProviderViewProps {
  provider: MapProvider;
  designTypes?: ProviderDesignOverrides;
}

export function MapViewContainer({ provider, designTypes, ...rest }: MapViewContainerProps) {
  switch (provider) {
    case 'longdo':
      return <LongdoProviderView mapDesignType={designTypes?.longdo} {...rest} />;
    case 'maptiler':
      return <MapTilerProviderView mapDesignType={designTypes?.maptiler} {...rest} />;
    case 'mapbox':
      return <MapboxProviderView mapDesignType={designTypes?.mapbox} {...rest} />;
    case 'maplibre':
      return <MapLibreProviderView mapDesignType={designTypes?.maplibre} {...rest} />;
    case 'google-maps':
      return <GoogleMapsProviderView mapDesignType={designTypes?.['google-maps']} {...rest} />;
    case 'here':
      return <HereProviderView mapDesignType={designTypes?.here} {...rest} />;
    case 'arcgis':
      return <ArcGISProviderView mapDesignType={designTypes?.arcgis} {...rest} />;
    default:
      return null;
  }
}
