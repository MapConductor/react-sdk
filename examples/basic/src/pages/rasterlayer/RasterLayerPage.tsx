import { useMemo, useState } from 'react';
import { RasterLayerSource, createRasterLayerState } from '@mapconductor/js-sdk-core';
import { RasterLayer } from '@mapconductor/js-sdk-react';
import { ControlPanel, SliderControl } from '../../components/ControlPanel';
import { MapViewContainer, useSampleMapViewState } from '../../MapViewContainer';

const INIT_CAMERA = { lat: 35.6812, lng: 139.7671, zoom: 5 };

export function RasterLayerPage() {
  const mapViewState = useSampleMapViewState(INIT_CAMERA);
  const [opacity, setOpacity] = useState(0.75);
  const state = useMemo(() => createRasterLayerState({
    id: 'osm-raster',
    source: RasterLayerSource.UrlTemplate({
      template: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      tileSize: RasterLayerSource.DEFAULT_TILE_SIZE,
      attribution: '© OpenStreetMap contributors',
    }),
    opacity,
  }), [opacity]);

  return (
    <MapViewContainer state={mapViewState}>
      <RasterLayer state={state} />
      <ControlPanel title="Raster Layer">
        <SliderControl label="Opacity" value={opacity} min={0} max={1} onChange={setOpacity} />
      </ControlPanel>
    </MapViewContainer>
  );
}
