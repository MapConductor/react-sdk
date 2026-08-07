import { useMemo, useState } from 'react';
import { RasterLayerSource, createRasterLayerState } from '@mapconductor/js-sdk-core';
import { RasterLayer } from '@mapconductor/js-sdk-react';
import { ControlPanel, SliderControl } from '../../components/ControlPanel';
import {
  GSI_RELIEF_ATTRIBUTION_RULES,
  GSI_STANDARD_ATTRIBUTION_RULES,
} from '../../gsiAttributions';
import { MapViewContainer } from '../../MapViewContainer';
import { useSampleI18n } from '../../samples/i18n';

const INIT_CAMERA = { lat: 35.6812, lng: 139.7671, zoom: 7 };
const TILE_SIZE = 256;

type GsiLayer = 'relief' | 'standard';

/**
 * ヘッダ計測モード（`?probeHeaders=1`）で使うタイルの宛先と指定値。
 *
 * **同一オリジンの相対パス**にしてあるのが重要。`extraHeaders` を付けた fetch を
 * 別オリジンへ飛ばすと CORS のプリフライトが挟まり、計測したいのはヘッダなのに
 * プリフライトの成否を測ることになる。テスト側（raster-headers.spec.ts）は
 * このパスを横取りしてヘッダを記録する。
 *
 * 値は android-sdk / ios-sdk の計測ページと同じものを使う。
 */
const PROBE_TEMPLATE = '/__mc-header-probe/{z}/{x}/{y}.png';
const PROBE_USER_AGENT = 'MapConductorRasterHeaderProbe/1.0';
const PROBE_HEADER_NAME = 'X-MapConductor-Test';
const PROBE_HEADER_VALUE = 'mapconductor-probe';

function useHeaderProbeState() {
  return useMemo(() => {
    const enabled =
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('probeHeaders') === '1';
    if (!enabled) return null;
    return createRasterLayerState({
      id: 'mc-header-probe',
      source: RasterLayerSource.UrlTemplate({ template: PROBE_TEMPLATE, tileSize: TILE_SIZE }),
      opacity: 1,
      userAgent: PROBE_USER_AGENT,
      extraHeaders: { [PROBE_HEADER_NAME]: PROBE_HEADER_VALUE },
    });
  }, []);
}

export function RasterLayerPage() {
  const { t } = useSampleI18n();
  const [selectedLayer, setSelectedLayer] = useState<GsiLayer>('relief');
  const [opacity, setOpacity] = useState(0.75);
  const probeState = useHeaderProbeState();
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

  // 計測モードでは GSI のタイルを出さない。実在のサーバへの要求が混ざると、
  // 記録したヘッダがどのレイヤのものか区別できなくなる。
  if (probeState) {
    return (
      <MapViewContainer initialCamera={INIT_CAMERA}>
        <RasterLayer state={probeState} />
      </MapViewContainer>
    );
  }

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
