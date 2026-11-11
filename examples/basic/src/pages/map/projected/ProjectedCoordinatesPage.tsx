import { useEffect, useState } from 'react';
import {
  ColorDefaultIcon,
  MarkerAnimation,
  Spherical,
  createMarkerState,
  type GeoPoint,
  type MapCameraPosition,
  type MapCoordinateSystem,
  type MapDesignTypeInterface,
  type MapViewHolder,
  type MapViewStateInterface,
  type MarkerState,
} from '@mapconductor/js-sdk-core';
import { Marker } from '@mapconductor/js-sdk-react';
import { ControlPanel } from '../../../components/ControlPanel';
import { MapViewContainer } from '../../../MapViewContainer';
import { useSampleI18n } from '../../../samples/i18n';

// android / ios の同ページと同じカメラ。並べて数値を突き合わせるため揃えてある。
const INIT_CAMERA = { lat: 35.681236, lng: 139.767125, zoom: 12 };

type Holder = MapViewHolder<unknown, unknown>;

let dropCount = 0;

/**
 * タップした地点（赤）と、その投影座標を緯度経度へ戻した地点（青・小）に落とすマーカー。
 *
 * 投影と逆投影が合っていれば、青は赤のピン先に重なる。タップのたびに新しい id に
 * するので、Drop がそのつど再生される。同じ地点なら後から足した青が手前に描かれる。
 * 青を小さくするのは `scale` ではなく `iconSize` で行う（android / ios の同ページと同じ）。
 */
function dropMarkers(tapped: GeoPoint, holder: Holder | null): MarkerState[] {
  dropCount += 1;
  const markers = [
    createMarkerState({
      id: `projected-tapped-${dropCount}`,
      position: tapped,
      icon: new ColorDefaultIcon({ fillColor: '#e53935', label: 'T' }),
      animation: MarkerAnimation.Drop,
    }),
  ];
  const projected = holder?.toProjectedPoint(tapped) ?? null;
  const back = projected && holder ? holder.fromProjectedPoint(projected) : null;
  if (back) {
    markers.push(createMarkerState({
      id: `projected-back-${dropCount}`,
      position: back,
      icon: new ColorDefaultIcon({ fillColor: '#1e88e5', label: 'P', iconSize: 28 }),
      animation: MarkerAnimation.Drop,
    }));
  }
  return markers;
}

function formatSystem(system: MapCoordinateSystem): string {
  return `${system.code ?? '(engine-defined)'} (${system.unit})`;
}

/**
 * 1 地点ぶん: 緯度経度、投影座標（地図エンジンの座標系での x / y。画面座標ではない）、
 * その x / y を緯度経度へ戻した値と元の地点とのずれ。ずれが 0 に近ければ往復できている。
 */
function ProjectionLines({ label, point, holder, unavailable }: {
  label: string;
  point: GeoPoint | null;
  holder: Holder | null;
  unavailable: string;
}) {
  const projected = point && holder ? holder.toProjectedPoint(point) : null;
  const back = projected && holder ? holder.fromProjectedPoint(projected) : null;
  const error = point && back ? Spherical.computeDistanceBetween(point, back) : null;
  return (
    <>
      <p className="control-panel-note">{label}: {point?.toUrlValue(6) ?? unavailable}</p>
      <p className="control-panel-note">
        &nbsp;&nbsp;Projected: {projected ? `x=${projected.x.toFixed(2)}, y=${projected.y.toFixed(2)}` : unavailable}
      </p>
      <p className="control-panel-note">
        &nbsp;&nbsp;Back: {back?.toUrlValue(6) ?? unavailable}{error !== null ? ` (error ${error.toFixed(3)} m)` : ''}
      </p>
    </>
  );
}

function ProjectedCoordinatesContent({ holder, center, tapped }: {
  holder: Holder | null;
  center: GeoPoint | null;
  tapped: GeoPoint | null;
}) {
  const { t } = useSampleI18n();
  const unavailable = t({
    en: 'Unavailable',
    ja: '取得できません',
    'es-419': 'No disponible',
    de: 'Nicht verfügbar',
    th: 'ไม่มีข้อมูล',
    hi: 'उपलब्ध नहीं',
  });

  return (
    <ControlPanel title={t({
      en: 'Projected Coordinates',
      ja: '投影座標',
      'es-419': 'Coordenadas proyectadas',
      de: 'Projizierte Koordinaten',
      th: 'พิกัดที่ฉายแล้ว',
      hi: 'प्रक्षेपित निर्देशांक',
    })}>
      <p className="control-panel-note">
        {t({
          en: 'Tap the map to project the tapped point.',
          ja: '地図をタップすると、その地点の投影座標を表示します。',
          'es-419': 'Toca el mapa para proyectar el punto tocado.',
          de: 'Tippen Sie auf die Karte, um den angetippten Punkt zu projizieren.',
          th: 'แตะแผนที่เพื่อฉายพิกัดของจุดที่แตะ',
          hi: 'टैप किए गए बिंदु को प्रक्षेपित करने के लिए मैप पर टैप करें।',
        })}
      </p>
      <p className="control-panel-note">
        {t({
          en: 'Markers: red T = tapped, blue P = back from the projected point.',
          ja: 'マーカー: 赤の T がタップ地点、青の P が投影座標から戻した地点。',
          'es-419': 'Marcadores: T rojo = punto tocado, P azul = de vuelta desde el punto proyectado.',
          de: 'Marker: rotes T = angetippt, blaues P = aus dem projizierten Punkt zurückgerechnet.',
          th: 'หมุด: T สีแดง = จุดที่แตะ, P สีน้ำเงิน = แปลงกลับจากพิกัดที่ฉาย',
          hi: 'मार्कर: लाल T = टैप किया गया बिंदु, नीला P = प्रक्षेपित बिंदु से वापस बदला गया।',
        })}
      </p>
      <p className="control-panel-note">
        {t({ en: 'Coordinate system', ja: '座標系', 'es-419': 'Sistema de coordenadas', de: 'Koordinatensystem', th: 'ระบบพิกัด', hi: 'निर्देशांक प्रणाली' })}: {holder ? formatSystem(holder.coordinateSystem) : unavailable}
      </p>
      <ProjectionLines label={t({ en: 'Center', ja: '中心', 'es-419': 'Centro', de: 'Mittelpunkt', th: 'จุดกึ่งกลาง', hi: 'केंद्र' })} point={center} holder={holder} unavailable={unavailable} />
      <ProjectionLines label={t({ en: 'Tapped', ja: 'タップ地点', 'es-419': 'Punto tocado', de: 'Angetippt', th: 'จุดที่แตะ', hi: 'टैप किया गया बिंदु' })} point={tapped} holder={holder} unavailable={unavailable} />
    </ControlPanel>
  );
}

export function ProjectedCoordinatesPage() {
  const [state, setState] = useState<MapViewStateInterface<MapDesignTypeInterface<unknown>> | null>(null);
  const [center, setCenter] = useState<GeoPoint | null>(null);
  const [tapped, setTapped] = useState<GeoPoint | null>(null);
  // ホルダは地図が出来てから付く。描画のたびに読むと、付いた後に描き直しが
  // 起きず取り残されるので、地図の通知で取り直して state に持つ。
  const [holder, setHolder] = useState<Holder | null>(null);
  const [markers, setMarkers] = useState<MarkerState[]>([]);
  // Some engines send no camera event when the map comes up: take the initial
  // values from the state, retrying until the holder is attached.
  useEffect(() => {
    if (!state || holder) return;
    const timer = window.setInterval(() => {
      const attached = state.getMapViewHolder();
      if (!attached) return;
      setHolder(attached);
      setCenter(current => current ?? state.cameraPosition.position);
    }, 300);
    return () => window.clearInterval(timer);
  }, [state, holder]);
  const refresh = (camera: MapCameraPosition) => {
    setHolder(state?.getMapViewHolder() ?? null);
    setCenter(camera.position);
  };

  return (
    <MapViewContainer
      initialCamera={INIT_CAMERA}
      onStateReady={setState}
      onCameraMove={refresh}
      onCameraMoveEnd={refresh}
      onMapClick={point => {
        const current = state?.getMapViewHolder() ?? null;
        setHolder(current);
        setTapped(point);
        setMarkers(dropMarkers(point, current));
      }}
    >
      {markers.map(marker => <Marker key={marker.id} state={marker} />)}
      <ProjectedCoordinatesContent holder={holder} center={center} tapped={tapped} />
    </MapViewContainer>
  );
}
