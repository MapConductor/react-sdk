import { useMemo, useState } from 'react';
import {
  ColorDefaultIcon,
  createGeoPoint,
  createGeoRectBounds,
  createMarkerState,
  type GeoRectBounds,
  type MapDesignTypeInterface,
  type MapViewStateInterface,
} from '@mapconductor/js-sdk-core';
import { Markers, Polyline } from '@mapconductor/js-sdk-react';
import { ControlPanel } from '../../../components/ControlPanel';
import { MapViewContainer } from '../../../MapViewContainer';
import { useSampleI18n } from '../../../samples/i18n';

const INIT_CAMERA = { lat: 20, lng: 60, zoom: 2 };

const CITIES = [
  { id: 'tokyo', label: 'Tokyo', short: 'T', latitude: 35.6762, longitude: 139.6503, color: '#e6194B' },
  { id: 'osaka', label: 'Osaka', short: 'O', latitude: 34.6937, longitude: 135.5023, color: '#f58231' },
  { id: 'honolulu', label: 'Honolulu', short: 'H', latitude: 21.3099, longitude: -157.8581, color: '#3cb44b' },
  { id: 'new-york', label: 'New York', short: 'N', latitude: 40.7128, longitude: -74.006, color: '#4363d8' },
  { id: 'london', label: 'London', short: 'L', latitude: 51.5074, longitude: -0.1278, color: '#911eb4' },
  { id: 'sydney', label: 'Sydney', short: 'S', latitude: -33.8688, longitude: 151.2093, color: '#f032e6' },
] as const;

type CityId = (typeof CITIES)[number]['id'];

const PRESETS: { id: string; label: string; labelJa: string; cities: CityId[] }[] = [
  { id: 'world', label: 'World (all)', labelJa: '世界（全都市）', cities: ['tokyo', 'osaka', 'honolulu', 'new-york', 'london', 'sydney'] },
  { id: 'pacific', label: 'Pacific', labelJa: '太平洋', cities: ['tokyo', 'honolulu', 'sydney'] },
  { id: 'atlantic', label: 'Atlantic', labelJa: '大西洋', cities: ['new-york', 'london'] },
  { id: 'japan', label: 'Japan', labelJa: '日本', cities: ['tokyo', 'osaka'] },
];

const PADDINGS = [0, 40, 80, 160];

function boundsForPreset(cityIds: CityId[]): GeoRectBounds {
  const bounds = createGeoRectBounds({});
  for (const id of cityIds) {
    const city = CITIES.find(c => c.id === id)!;
    bounds.extend(createGeoPoint({ latitude: city.latitude, longitude: city.longitude }));
  }
  return bounds;
}

function FitBoundsContent({ mapViewState }: { mapViewState: MapViewStateInterface<MapDesignTypeInterface<unknown>> }) {
  const { t } = useSampleI18n();
  const [padding, setPadding] = useState<number>(80);
  const [presetId, setPresetId] = useState<string>('world');

  const markers = useMemo(
    () => CITIES.map(city => createMarkerState({
      id: city.id,
      position: createGeoPoint({ latitude: city.latitude, longitude: city.longitude }),
      extra: city.label,
      icon: new ColorDefaultIcon({ fillColor: city.color, label: city.short }),
    })),
    [],
  );

  // Visualize the target bounds as an unfilled rectangle outline.
  const targetBounds = useMemo<GeoRectBounds | null>(() => {
    const preset = PRESETS.find(p => p.id === presetId);
    return preset ? boundsForPreset(preset.cities) : null;
  }, [presetId]);

  const fit = (id: string, pad: number): void => {
    const preset = PRESETS.find(p => p.id === id);
    if (!preset) return;
    mapViewState.fitBounds(boundsForPreset(preset.cities), pad);
  };

  return (
    <>
      <Markers states={markers} />
      {targetBounds && (
        <Polyline bounds={targetBounds} strokeColor="#1d4ed8" strokeWidth={2} geodesic={false} />
      )}
      <ControlPanel title={t('Fit Bounds', '範囲にフィット')}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>{t('Bounds', '範囲')}</div>
          <div className="button-grid">
            {PRESETS.map(preset => (
              <button
                key={preset.id}
                aria-pressed={presetId === preset.id}
                style={presetId === preset.id ? { fontWeight: 700 } : undefined}
                onClick={() => { setPresetId(preset.id); fit(preset.id, padding); }}
              >
                {t(preset.label, preset.labelJa)}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>{t('Padding (px)', 'パディング (px)')}</div>
          <div className="button-grid">
            {PADDINGS.map(pad => (
              <button
                key={pad}
                aria-pressed={padding === pad}
                style={padding === pad ? { fontWeight: 700 } : undefined}
                onClick={() => { setPadding(pad); fit(presetId, pad); }}
              >
                {pad}
              </button>
            ))}
          </div>
        </div>

        <button onClick={() => fit(presetId, padding)}>
          {t('Fit Bounds', '範囲にフィット')}
        </button>

        <p style={{ fontSize: 12, opacity: 0.75, margin: '8px 0 0', lineHeight: 1.5 }}>
          {t(
            'Tip: rotate or tilt the map first, then Fit — the current bearing/pitch is preserved.',
            'ヒント: 先に地図を回転・傾けてから「範囲にフィット」を押すと、現在の bearing/pitch を保ったままフィットします。',
          )}
        </p>
      </ControlPanel>
    </>
  );
}

export function FitBoundsPage() {
  const [mapViewState, setMapViewState] = useState<MapViewStateInterface<MapDesignTypeInterface<unknown>> | null>(null);
  return (
    <MapViewContainer initialCamera={INIT_CAMERA} onStateReady={setMapViewState}>
      {mapViewState && <FitBoundsContent mapViewState={mapViewState} />}
    </MapViewContainer>
  );
}
