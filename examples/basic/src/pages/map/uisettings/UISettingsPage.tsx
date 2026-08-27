import { useState } from 'react';
import {
  type MapDesignTypeInterface,
  MapUISettings,
  type MapViewStateInterface,
} from '@mapconductor/js-sdk-core';
import { ControlPanel } from '../../../components/ControlPanel';
import { MapViewContainer } from '../../../MapViewContainer';
import { useSampleI18n, type Phrase } from '../../../samples/i18n';

const INIT_CAMERA = { lat: 35.681236, lng: 139.767125, zoom: 14 };

type GestureKey = keyof MapUISettings;

const GESTURES: { key: GestureKey; label: Phrase }[] = [
  { key: 'scrollGesture', label: { en: 'Pan', ja: 'スクロール', 'es-419': 'Desplazar', de: 'Verschieben', th: 'การเลื่อน', hi: 'पैन' } },
  { key: 'zoomGesture', label: { en: 'Zoom', ja: 'ズーム', 'es-419': 'Zoom', de: 'Zoom', th: 'ซูม', hi: 'ज़ूम' } },
  { key: 'rotateGesture', label: { en: 'Rotate', ja: '回転', 'es-419': 'Rotar', de: 'Drehen', th: 'การหมุน', hi: 'घुमाव' } },
  { key: 'tiltGesture', label: { en: 'Tilt', ja: '傾き', 'es-419': 'Inclinación', de: 'Neigung', th: 'การเอียง', hi: 'झुकाव' } },
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
    <ControlPanel title={t({ en: 'Gestures', ja: 'ジェスチャ', 'es-419': 'Gestos', de: 'Gesten', th: 'ท่าทางสัมผัส', hi: 'जेस्चर' })}>
      {GESTURES.map(({ key, label }) => (
        <label key={key} className="checkbox-control">
          <input
            type="checkbox"
            checked={settings[key]}
            onChange={event => update(key, event.target.checked)}
          />
          <span>{t(label)}</span>
        </label>
      ))}
      <p className="control-panel-note">
        {t(
          {
            en: 'A provider that cannot honour a flag logs a one-time warning to the console.',
            ja: 'フラグを反映できないプロバイダは、コンソールに一度だけ警告を出します。',
            'es-419': 'Un proveedor que no puede aplicar una opción escribe una advertencia única en la consola.',
            de: 'Ein Anbieter, der ein Flag nicht umsetzen kann, schreibt einmalig eine Warnung in die Konsole.',
            th: 'ผู้ให้บริการที่ทำตามแฟล็กไม่ได้จะเขียนคำเตือนลงคอนโซลเพียงครั้งเดียว',
            hi: 'जो प्रोवाइडर किसी फ़्लैग को नहीं मान सकता, वह कंसोल में एक बार चेतावनी लिखता है।',
          },
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
