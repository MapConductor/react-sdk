import { useMemo, useState } from 'react';
import { RasterLayerSource, createRasterLayerState } from '@mapconductor/js-sdk-core';
import { RasterLayer } from '@mapconductor/js-sdk-react';
import { ControlPanel, SliderControl } from '../../components/ControlPanel';
import {
  GSI_RELIEF_ATTRIBUTION_RULES,
  GSI_STANDARD_ATTRIBUTION_RULES,
} from '../../gsiAttributions';
import { MapViewContainer } from '../../MapViewContainer';
import { useSampleI18n } from '../../i18n';

const INIT_CAMERA = { lat: 35.6812, lng: 139.7671, zoom: 5 };
const TILE_SIZE = 256;

type GsiLayer = 'relief' | 'standard';

export function RasterLayerPage() {
  const { t } = useSampleI18n();
  const [selectedLayer, setSelectedLayer] = useState<GsiLayer>('relief');
  const [opacity, setOpacity] = useState(0.75);
  const state = useMemo(() => createRasterLayerState({
    id: 'gsi-raster',
    source: selectedLayer === 'relief'
      ? RasterLayerSource.UrlTemplate({
          template: 'https://cyberjapandata.gsi.go.jp/xyz/relief/{z}/{x}/{y}.png',
          tileSize: TILE_SIZE,
          minZoom: 5,
          maxZoom: 15,
          attributionRules: [...GSI_RELIEF_ATTRIBUTION_RULES],
        })
      : RasterLayerSource.UrlTemplate({
          template: 'https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',
          tileSize: TILE_SIZE,
          minZoom: 5,
          maxZoom: 18,
          attributionRules: [...GSI_STANDARD_ATTRIBUTION_RULES],
        }),
    opacity,
  }), [opacity, selectedLayer]);

  return (
    <MapViewContainer initialCamera={INIT_CAMERA}>
      <RasterLayer state={state} />
      <ControlPanel title={t('Raster Layer', 'ラスターレイヤー')}>
        <label className="slider-control">
          <span className="slider-label">{t('GSI layer', '国土地理院レイヤー')}</span>
          <select
            value={selectedLayer}
            onChange={event => setSelectedLayer(event.target.value as GsiLayer)}
          >
            <option value="relief">{t('Relief map', '色別標高図')}</option>
            <option value="standard">{t('Standard map', '標準地図（電子国土基本図）')}</option>
          </select>
        </label>
        <SliderControl label={t('Opacity', '透明度')} value={opacity} min={0} max={1} onChange={setOpacity} />
      </ControlPanel>
    </MapViewContainer>
  );
}
