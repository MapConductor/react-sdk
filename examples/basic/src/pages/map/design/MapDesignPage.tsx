import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { MapDesignTypeInterface, MapViewStateInterface } from '@mapconductor/js-sdk-core';
import { MapViewContainer } from '../../../MapViewContainer';
import type { MapDesignOption } from '../../../providers/designOptions/types';

const INIT_CAMERA = { lat: 21.382314, lng: -157.933097, zoom: 12 };

// Each loader dynamically imports only the design-option metadata for one
// provider. Design metadata (tile URLs, style ids, etc.) lives in the same
// bundled package as that provider's heavy runtime SDK, and these packages
// aren't marked "sideEffects": false, so importing anything from e.g.
// @mapconductor/react-for-maplibre at module scope would pull maplibre-gl
// itself into whatever chunk this page ends up in. Loading them on demand
// keeps each provider's SDK isolated in its own chunk (see MapViewContainer.tsx).
const DESIGN_OPTIONS_LOADERS: Record<string, () => Promise<MapDesignOption[]>> = {
  'google-maps': () => import('../../../providers/designOptions/googleDesignOptions').then(m => m.GOOGLE_MAP_2D_DESIGNS),
  'google-maps-3d': () => import('../../../providers/designOptions/googleDesignOptions').then(m => m.GOOGLE_MAP_DESIGNS),
  maplibre: () => import('../../../providers/designOptions/maplibreDesignOptions').then(m => m.MAPLIBRE_DESIGNS),
  'maplibre-3d': () => import('../../../providers/designOptions/maplibreDesignOptions').then(m => m.MAPLIBRE_DESIGNS),
  mapbox: () => import('../../../providers/designOptions/mapboxDesignOptions').then(m => m.MAPBOX_DESIGNS),
  leaflet: () => import('../../../providers/designOptions/leafletDesignOptions').then(m => m.LEAFLET_DESIGNS),
  openlayers: () => import('../../../providers/designOptions/openLayersDesignOptions').then(m => m.OPENLAYERS_DESIGNS),
  arcgis: () => import('../../../providers/designOptions/arcgisDesignOptions').then(m => m.ARCGIS_DESIGNS),
  'arcgis-3d': () => import('../../../providers/designOptions/arcgisDesignOptions').then(m => m.ARCGIS_DESIGNS),
  cesium: () => import('../../../providers/designOptions/cesiumDesignOptions').then(m => m.CESIUM_DESIGNS),
};

export function MapDesignPage() {
  const location = useLocation();
  const [mapViewState, setMapViewState] = useState<MapViewStateInterface<MapDesignTypeInterface<unknown>> | null>(null);
  const mapProviderName = (() => {
    const paths = location.pathname.split('/');
    if (!Array.isArray(paths) || paths.length < 2) return null;
    return paths[1];
  })();
  const [mapDesignOptions, setMapDesignOptions] = useState<MapDesignOption[]>([]);
  const [selectedDesignId, setSelectedDesignId] = useState('');

  useEffect(() => {
    const loader = mapProviderName ? DESIGN_OPTIONS_LOADERS[mapProviderName] : undefined;
    if (!loader) {
      throw new Error(`[debug] Not defined MapTypeDesign for ${mapProviderName}`);
    }
    let active = true;
    setMapDesignOptions([]);
    loader().then(options => {
      if (active) setMapDesignOptions(options);
    });
    return () => {
      active = false;
    };
  }, [mapProviderName]);

  useEffect(() => {
    if (mapViewState && mapDesignOptions.length > 0) {
      setSelectedDesignId(String(mapViewState.mapDesignType.id));
    }
  }, [mapViewState, mapViewState?.id, mapViewState?.mapDesignType.id, mapDesignOptions]);

  const handleDesignChange = (designId: string) => {
    if (!mapViewState) return;
    const option = mapDesignOptions.find(item => item.design.id === designId);
    if (!option) return;

    mapViewState.mapDesignType = option.design;
    setSelectedDesignId(String(mapViewState.mapDesignType.id));
  };

  return (
    <MapViewContainer initialCamera={INIT_CAMERA} onStateReady={setMapViewState}>
      {mapViewState && mapDesignOptions.length > 0 && (
        <div className="map-design-selector">
          <label>
            <span>Map design</span>
            <select
              value={selectedDesignId}
              onChange={event => handleDesignChange(event.target.value)}
            >
              {mapDesignOptions.map(option => (
                <option key={String(option.design.id)} value={String(option.design.id)}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
    </MapViewContainer>
  );
}
