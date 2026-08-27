import { useMemo, useRef, useState } from 'react';
import {
  createMarkerState,
  createPolygonState,
  type GeoPoint,
  type MarkerState,
} from '@mapconductor/js-sdk-core';
import { Markers, Polygon } from '@mapconductor/js-sdk-react';
import { ControlPanel, SliderControl } from '../components/ControlPanel';
import { Toast, useToast } from '../components/Toast';
import { POLYGON_VERTICES } from '../data/storeData';
import { MapViewContainer } from '../MapViewContainer';
import { useSampleI18n } from '../samples/i18n';

const INIT_CAMERA = { lat: 41.7969, lng: 140.7569, zoom: 16 };

export function PolygonPage() {
  const { t } = useSampleI18n();
  const [vertices, setVertices] = useState<GeoPoint[]>(POLYGON_VERTICES);
  const [fillOpacity, setFillOpacity] = useState(0.3);
  const [strokeWidth, setStrokeWidth] = useState(3);
  const { messages, showToast, dismissToast } = useToast();
  const setVerticesRef = useRef(setVertices);
  setVerticesRef.current = setVertices;

  const polygonState = useMemo(
    () =>
      createPolygonState({
        id: 'demo-polygon',
        points: vertices,
        holes: [],
        strokeColor: '#e74c3c',
        strokeWidth,
        fillColor: `rgba(0, 100, 230, ${fillOpacity})`,
        geodesic: false,
        onClick: () => showToast('Polygon clicked'),
      }),
    [vertices, fillOpacity, strokeWidth, showToast]
  );

  const vertexMarkers = useMemo(
    () =>
      vertices.map((point, index) =>
        createMarkerState({
          id: `vertex-${index}`,
          position: point,
          draggable: true,
          clickable: false,
          onDrag: (state: MarkerState) => {
            setVerticesRef.current(prev => {
              const next = [...prev];
              next[index] = state.position;
              return next;
            });
          },
          onDragEnd: (state: MarkerState) => {
            setVerticesRef.current(prev => {
              const next = [...prev];
              next[index] = state.position;
              return next;
            });
          },
        })
      ),
    [vertices]
  );

  return (
    <MapViewContainer initialCamera={INIT_CAMERA}>
      <Polygon state={polygonState} />
      <Markers states={vertexMarkers} />
      <ControlPanel title={t(
        {
          en: 'Polygon Example',
          ja: 'ポリゴンのサンプル',
          'es-419': 'Ejemplo de polígono',
          de: 'Polygon-Beispiel',
          th: 'ตัวอย่างโพลีกอน',
          hi: 'पॉलीगॉन का उदाहरण',
        },
      )}>
        <SliderControl
          label={t(
            {
              en: 'Fill Opacity',
              ja: '塗りの透明度',
              'es-419': 'Opacidad del relleno',
              de: 'Fülldeckkraft',
              th: 'ความทึบของสีเติม',
              hi: 'भराव की अपारदर्शिता',
            },
          )}
          value={fillOpacity}
          min={0}
          max={1}
          debounce={150}
          onChange={setFillOpacity}
        />
        <SliderControl
          label={t(
            {
              en: 'Stroke Width',
              ja: '線の太さ',
              'es-419': 'Grosor del trazo',
              de: 'Linienbreite',
              th: 'ความหนาเส้น',
              hi: 'रेखा की मोटाई',
            },
          )}
          value={strokeWidth}
          min={1}
          max={10}
          step={0.5}
          format={value => `${value.toFixed(1)}px`}
          onChange={setStrokeWidth}
        />
        <p className="control-panel-note">
          {t(
            {
              en: 'Drag vertex markers to reshape the polygon.',
              ja: '頂点マーカーをドラッグしてポリゴンの形を変更できます。',
              'es-419': 'Arrastra los marcadores de vértice para cambiar la forma del polígono.',
              de: 'Ziehen Sie die Eckpunkt-Marker, um das Polygon umzuformen.',
              th: 'ลากมาร์กเกอร์ที่จุดยอดเพื่อเปลี่ยนรูปทรงของโพลีกอน',
              hi: 'शीर्ष के मार्कर खींचकर पॉलीगॉन का आकार बदलें।',
            },
          )}
        </p>
      </ControlPanel>
      <Toast messages={messages} onDismiss={dismissToast} />
    </MapViewContainer>
  );
}
