import { useState } from 'react';
import { createGeoPoint, createPolygonState, type GeoPoint, type PolygonState } from '@mapconductor/js-sdk-core';
import { Polygons } from '@mapconductor/js-sdk-react';
import { ControlPanel } from '../../../components/ControlPanel';
import { MapViewContainer } from '../../../MapViewContainer';
import { useSampleI18n } from '../../../samples/i18n';
import { LoadingOverlay, useLoadingOverlay } from '../../../components/LoadingOverlay';

const COLUMNS = 10;
const SPACING = 0.004;
const ORIGIN = { latitude: 35.6895, longitude: 139.6917 };
const INIT_CAMERA = { lat: ORIGIN.latitude - 0.006, lng: ORIGIN.longitude + 0.018, zoom: 14 };
const PALETTE = ['rgba(66, 133, 244, 0.4)', 'rgba(234, 67, 53, 0.4)', 'rgba(251, 188, 5, 0.4)', 'rgba(52, 168, 83, 0.4)'];
const TAPPED = 'rgba(156, 39, 176, 0.8)';

function hexagon(center: { latitude: number; longitude: number }, radius: number): GeoPoint[] {
  return Array.from({ length: 7 }, (_, i) => {
    const angle = (Math.PI / 3) * i;
    return createGeoPoint({
      latitude: center.latitude + radius * Math.sin(angle),
      longitude: center.longitude + radius * Math.cos(angle),
    });
  });
}

function buildRow(row: number, paletteIndex: number): PolygonState[] {
  return Array.from({ length: COLUMNS }, (_, column) => {
    const center = {
      latitude: ORIGIN.latitude - row * SPACING,
      longitude: ORIGIN.longitude + column * SPACING + (row % 2 === 1 ? SPACING / 2 : 0),
    };
    return createPolygonState({
      id: `hex-${row}-${column}`,
      points: hexagon(center, SPACING * 0.45),
      strokeColor: '#444444',
      strokeWidth: 1,
      fillColor: PALETTE[(paletteIndex + row + column) % PALETTE.length],
      onClick: event => {
        event.state.fillColor = TAPPED;
      },
    });
  });
}

function buildStates(rows: number, paletteIndex: number): PolygonState[] {
  return Array.from({ length: rows }, (_, row) => buildRow(row, paletteIndex)).flat();
}

export function PolygonsPage() {
  const loading = useLoadingOverlay();
  const { t } = useSampleI18n();
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [states, setStates] = useState(() => buildStates(3, 0));
  const rows = states.length / COLUMNS;

  const addRow = () => setStates(prev => [...prev, ...buildRow(rows, paletteIndex)]);
  const removeRow = () => setStates(prev => prev.slice(0, Math.max(0, prev.length - COLUMNS)));
  // New state objects with the same ids: <Polygons> must update them in place, not add.
  const recolor = () => {
    const next = (paletteIndex + 1) % PALETTE.length;
    setPaletteIndex(next);
    setStates(buildStates(rows, next));
  };

  return (
    <MapViewContainer initialCamera={INIT_CAMERA}>
      <Polygons states={states} {...loading.bind('polygons')} />
      <LoadingOverlay visible={loading.active} />
      <ControlPanel
        title={t({
          en: `Polygons (${states.length})`,
          ja: `複数のポリゴン（${states.length}）`,
          'es-419': `Polígonos (${states.length})`,
          de: `Polygone (${states.length})`,
          th: `โพลีกอนหลายรูป (${states.length})`,
          hi: `कई पॉलीगॉन (${states.length})`,
        })}
      >
        <div className="button-grid" style={{ marginBottom: 8 }}>
          <button type="button" data-testid="removeRow" onClick={removeRow}>−</button>
          <button type="button" data-testid="addRow" onClick={addRow}>+</button>
          <button type="button" data-testid="recolor" onClick={recolor}>
            {t({ en: 'Recolor', ja: '色を変える', 'es-419': 'Cambiar color', de: 'Umfärben', th: 'เปลี่ยนสี', hi: 'रंग बदलें' })}
          </button>
        </div>
        <p className="control-panel-note">
          {t({
            en: 'A grid of hexagons registered with one <Polygons states>. Tap a hexagon to change its fill in place.',
            ja: '六角形の格子を 1 つの <Polygons states> で登録しています。六角形をタップすると、その塗りだけがその場で変わります。',
            'es-419': 'Una cuadrícula de hexágonos registrada con un solo <Polygons states>. Toca un hexágono para cambiar su relleno.',
            de: 'Ein Sechseckraster, registriert mit einem einzigen <Polygons states>. Tippen Sie auf ein Sechseck, um seine Füllung zu ändern.',
            th: 'ตารางหกเหลี่ยมที่ลงทะเบียนด้วย <Polygons states> ตัวเดียว แตะหกเหลี่ยมเพื่อเปลี่ยนสีพื้น',
            hi: 'षट्भुजों का ग्रिड एक ही <Polygons states> से दर्ज है। किसी षट्भुज पर टैप करके उसका रंग बदलें।',
          })}
        </p>
      </ControlPanel>
    </MapViewContainer>
  );
}
