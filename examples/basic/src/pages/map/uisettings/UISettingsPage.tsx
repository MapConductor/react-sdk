import { useState } from 'react';
import {
  type MapDesignTypeInterface,
  MapUISettings,
  type MapViewStateInterface,
} from '@mapconductor/js-sdk-core';
import { ControlPanel } from '../../../components/ControlPanel';
import { MapViewContainer } from '../../../MapViewContainer';
import { useSampleI18n } from '../../../samples/i18n';

const INIT_CAMERA = { lat: 35.681236, lng: 139.767125, zoom: 14 };

type GestureKey = keyof MapUISettings;

const GESTURES: { key: GestureKey; label: string; labelJa: string }[] = [
  { key: 'scrollGesture', label: 'Pan', labelJa: 'スクロール' },
  { key: 'zoomGesture', label: 'Zoom', labelJa: 'ズーム' },
  { key: 'rotateGesture', label: 'Rotate', labelJa: '回転' },
  { key: 'tiltGesture', label: 'Tilt', labelJa: '傾き' },
];

function UISettingsContent({
  mapViewState,
}: {
  mapViewState: MapViewStateInterface<MapDesignTypeInterface<unknown>>;
}) {
  const { t } = useSampleI18n();
  const [settings, setSettings] = useState<MapUISettings>({ ...MapUISettings.Default });

  // Assigning to `uiSettings` pushes the flags straight to the map — the view
  // subscribes to the state rather than re-rendering on them.
  const update = (key: GestureKey, enabled: boolean) => {
    const next = { ...settings, [key]: enabled };
    setSettings(next);
    mapViewState.uiSettings = next;
  };

  return (
    <ControlPanel title={t('Gestures', 'ジェスチャ')}>
      {GESTURES.map(({ key, label, labelJa }) => (
        <label key={key} className="checkbox-control">
          <input
            type="checkbox"
            checked={settings[key]}
            onChange={event => update(key, event.target.checked)}
          />
          <span>{t(label, labelJa)}</span>
        </label>
      ))}
      <p className="control-panel-note">
        {t(
          'A provider that cannot honour a flag logs a one-time warning to the console.',
          'フラグを反映できないプロバイダは、コンソールに一度だけ警告を出します。',
        )}
      </p>
    </ControlPanel>
  );
}

export function UISettingsPage() {
  const [mapViewState, setMapViewState] = useState<MapViewStateInterface<
    MapDesignTypeInterface<unknown>
  > | null>(null);
  const [camera, setCamera] = useState('');

  // Published so a browser test can tell whether a gesture actually moved the
  // map — the same trick the Android and iOS sample pages use.
  return (
    <MapViewContainer
      initialCamera={INIT_CAMERA}
      onStateReady={setMapViewState}
      onCameraMove={next => setCamera(
        [next.position.latitude, next.position.longitude, next.zoom, next.bearing, next.tilt]
          .map(value => value.toFixed(4)).join(','),
      )}
    >
      {mapViewState && <UISettingsContent mapViewState={mapViewState} />}
      <div data-testid="camera-readout" style={{ display: 'none' }}>{camera}</div>
    </MapViewContainer>
  );
}
