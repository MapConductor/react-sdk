import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { MapDesignTypeInterface } from '@mapconductor/js-sdk-core';
import { GoogleMapDesign, GoogleMapDesignType } from '@mapconductor/react-for-googlemaps';
import { MapLibreDesign, MapLibreMapDesignType } from '@mapconductor/react-for-maplibre';
import { LeafletDesign, LeafletMapDesignType } from '@mapconductor/react-for-leaflet';
import { GSI_STANDARD_ATTRIBUTION_RULES } from '../../../gsiAttributions';
import { MapViewContainer, useSampleMapViewState } from '../../../MapViewContainer';

const INIT_CAMERA = { lat: 21.382314, lng: -157.933097, zoom: 12 };

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

interface MapDesignOption {
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
const GOOGLE_MAP_DESIGNS: MapDesignOption[] = [
  { label: 'Normal', design: GoogleMapDesign.Normal },
  { label: 'Satellite', design: GoogleMapDesign.Satellite },
  { label: 'Hybrid', design: GoogleMapDesign.Hybrid },
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

const LEAFLET_DESIGNS: MapDesignOption[] = [
  { label: 'OpenStreetMap', design: LeafletDesign.OpenStreetMap },
  { label: 'GSI Standard', design: GSI_STANDARD_DESIGN },
  { label: 'None', design: LeafletDesign.None },
];

export function MapDesignPage() {
  const location = useLocation();
  const mapViewState = useSampleMapViewState(INIT_CAMERA);
  const mapProviderName = (() => {
    const paths = location.pathname.split('/');
    if (!Array.isArray(paths) || paths.length < 2) return null;
    return paths[1];
  })();
  const mapDesignOptions = useMemo(() => {
    switch(mapProviderName) {
      case 'google-maps':
        return GOOGLE_MAP_2D_DESIGNS;
      case 'google-maps-3d':
        return GOOGLE_MAP_DESIGNS;
      case 'maplibre':
      case 'maplibre-3d':
        return MAPLIBRE_DESIGNS;
      case 'leaflet':
        return LEAFLET_DESIGNS;
      default:
        throw new Error(`[debug] Not defined MapTypeDesign for ${mapProviderName}`);
    }
  }, [mapProviderName]);
  const [selectedDesignId, setSelectedDesignId] = useState(mapViewState.mapDesignType.id);

  useEffect(() => {
    setSelectedDesignId(mapViewState.mapDesignType.id);
  }, [mapViewState.id, mapViewState.mapDesignType.id]);

  const handleDesignChange = (designId: string) => {
    const option = mapDesignOptions.find(item => item.design.id === designId);
    if (!option) return;

    mapViewState.mapDesignType = option.design as GoogleMapDesignType | MapLibreMapDesignType | LeafletMapDesignType;
    setSelectedDesignId(mapViewState.mapDesignType.id);
  };

  return (
    <MapViewContainer state={mapViewState}>
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
    </MapViewContainer>
  );
}
