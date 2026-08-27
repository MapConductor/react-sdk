import { useState } from 'react';
import type { GeoPoint, MapCameraPosition } from '@mapconductor/js-sdk-core';
import { ControlPanel } from '../../../components/ControlPanel';
import { MapViewContainer } from '../../../MapViewContainer';
import { useSampleI18n } from '../../../samples/i18n';

const INIT_CAMERA = { lat: 21.3069, lng: -157.8583, zoom: 10 };

function formatPoint(point: GeoPoint | null, unavailable: string): string {
  return point?.toUrlValue(5) ?? unavailable;
}

function VisibleRegionContent({ cameraPosition }: { cameraPosition: MapCameraPosition | null }) {
  const { t } = useSampleI18n();
  const visibleRegion = cameraPosition?.visibleRegion ?? null;
  const bounds = visibleRegion?.bounds ?? null;
  const unavailable = t(
    {
      en: 'Unavailable',
      ja: '取得できません',
      'es-419': 'No disponible',
      de: 'Nicht verfügbar',
      th: 'ไม่มีข้อมูล',
      hi: 'उपलब्ध नहीं',
    },
  );

  return (
    <ControlPanel title={t(
      {
        en: 'Visible Region',
        ja: '表示領域',
        'es-419': 'Región visible',
        de: 'Sichtbarer Bereich',
        th: 'พื้นที่ที่มองเห็น',
        hi: 'दृश्य क्षेत्र',
      },
    )}>
      <p className="control-panel-note">
        {t(
          {
            en: 'Move the map to update the current camera and visible region.',
            ja: '地図を動かすと現在のカメラと表示領域が更新されます。',
            'es-419': 'Mueve el mapa para actualizar la cámara y la región visible actuales.',
            de: 'Bewegen Sie die Karte, um Kamera und sichtbaren Bereich zu aktualisieren.',
            th: 'เลื่อนแผนที่เพื่ออัปเดตกล้องและพื้นที่ที่มองเห็นในขณะนั้น',
            hi: 'मैप हिलाने पर मौजूदा कैमरा और दृश्य क्षेत्र अपडेट होते हैं।',
          },
        )}
      </p>
      <p className="control-panel-note">
        {t({ en: 'Center', ja: '中心', 'es-419': 'Centro', de: 'Mittelpunkt', th: 'จุดกึ่งกลาง', hi: 'केंद्र' })}: {formatPoint(cameraPosition?.position ?? null, unavailable)}
      </p>
      <p className="control-panel-note">
        {t({ en: 'Zoom', ja: 'ズーム', 'es-419': 'Zoom', de: 'Zoom', th: 'ซูม', hi: 'ज़ूम' })}: {cameraPosition?.zoom.toFixed(2) ?? unavailable}
      </p>
      <p className="control-panel-note">
        {t({ en: 'Bearing', ja: '方位', 'es-419': 'Rumbo', de: 'Ausrichtung', th: 'ทิศ', hi: 'दिशा' })}: {cameraPosition?.bearing.toFixed(1) ?? unavailable} {t(
          {
            en: 'deg',
            ja: '度',
            'es-419': 'grados',
            de: 'Grad',
            th: 'องศา',
            hi: 'अंश',
          },
        )}
      </p>
      <p className="control-panel-note">
        {t({ en: 'Tilt', ja: '傾き', 'es-419': 'Inclinación', de: 'Neigung', th: 'การเอียง', hi: 'झुकाव' })}: {cameraPosition?.tilt.toFixed(1) ?? unavailable} {t(
          {
            en: 'deg',
            ja: '度',
            'es-419': 'grados',
            de: 'Grad',
            th: 'องศา',
            hi: 'अंश',
          },
        )}
      </p>
      <p className="control-panel-note">
        {t({ en: 'Bounds', ja: '境界', 'es-419': 'Límites', de: 'Grenzen', th: 'ขอบเขต', hi: 'सीमा' })}: {bounds?.toUrlValue(5) ?? unavailable}
      </p>
      <p className="control-panel-note">
        {t({ en: 'Near Left', ja: '手前左', 'es-419': 'Cerca izquierda', de: 'Nah links', th: 'ใกล้ซ้าย', hi: 'पास बाएँ' })}: {formatPoint(visibleRegion?.nearLeft ?? null, unavailable)}
      </p>
      <p className="control-panel-note">
        {t({ en: 'Near Right', ja: '手前右', 'es-419': 'Cerca derecha', de: 'Nah rechts', th: 'ใกล้ขวา', hi: 'पास दाएँ' })}: {formatPoint(visibleRegion?.nearRight ?? null, unavailable)}
      </p>
      <p className="control-panel-note">
        {t({ en: 'Far Left', ja: '奥左', 'es-419': 'Lejos izquierda', de: 'Fern links', th: 'ไกลซ้าย', hi: 'दूर बाएँ' })}: {formatPoint(visibleRegion?.farLeft ?? null, unavailable)}
      </p>
      <p className="control-panel-note">
        {t({ en: 'Far Right', ja: '奥右', 'es-419': 'Lejos derecha', de: 'Fern rechts', th: 'ไกลขวา', hi: 'दूर दाएँ' })}: {formatPoint(visibleRegion?.farRight ?? null, unavailable)}
      </p>
    </ControlPanel>
  );
}

export function VisibleRegionPage() {
  const [cameraPosition, setCameraPosition] = useState<MapCameraPosition | null>(null);

  return (
    <MapViewContainer initialCamera={INIT_CAMERA} onCameraMove={setCameraPosition}>
      <VisibleRegionContent cameraPosition={cameraPosition} />
    </MapViewContainer>
  );
}
