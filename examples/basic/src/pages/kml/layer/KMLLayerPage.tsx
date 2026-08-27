import { useCallback, useEffect, useMemo, useState } from 'react';
import { createGeoPoint, type GeoPoint, type MapDesignTypeInterface, type MapViewStateInterface } from '@mapconductor/js-sdk-core';
import { InfoBubble } from '@mapconductor/js-sdk-react';
import { KMLLayer, KMLLayerState, KMLParser, colorArgb, type KMLFeatureData } from '@mapconductor/react-kml';
import { ControlPanel } from '../../../components/ControlPanel';
import { MapViewContainer } from '../../../MapViewContainer';
import { useSampleI18n } from '../../../samples/i18n';
import { PropertyTable } from './PropertyTable';

const KML_ASSET = 'sample.kml';

interface SelectedFeature { position: GeoPoint; properties: Record<string, unknown> }

export function KMLLayerPage() {
  const { t } = useSampleI18n();
  const [mapState, setMapState] = useState<MapViewStateInterface<MapDesignTypeInterface<unknown>> | null>(null);
  const [features, setFeatures] = useState<KMLFeatureData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<SelectedFeature | null>(null);
  const layerState = useMemo(() => new KMLLayerState({
    // Fallback style used when a placemark carries no KML <Style>.
    strokeColor: colorArgb(255, 250, 36, 29),
    fillColor: colorArgb(96, 250, 36, 29),
    strokeWidth: 3,
    pointRadius: 8,
    onClick: (feature, position) => setSelected({
      position: createGeoPoint({ latitude: position.latitude, longitude: position.longitude }),
      properties: feature.properties ?? {},
    }),
  }), []);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    fetch(`/${KML_ASSET}`, { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.text();
      })
      .then(text => setFeatures(KMLParser.parse(text)))
      .catch(reason => { if (!controller.signal.aborted) setError(String(reason)); })
      .finally(() => { if (!controller.signal.aborted) setIsLoading(false); });
    return () => controller.abort();
  }, []);

  const handleMapClick = useCallback((point: GeoPoint) => {
    if (mapState && !layerState.processClick(point, 12, mapState.cameraPosition.zoom)) setSelected(null);
  }, [layerState, mapState]);

  if (error) return <div style={{ padding: '2rem', textAlign: 'center' }}><p>{t(
    {
      en: 'Failed to load data:',
      ja: 'データの読み込みに失敗しました:',
      'es-419': 'No se pudieron cargar los datos:',
      de: 'Daten konnten nicht geladen werden:',
      th: 'โหลดข้อมูลไม่สำเร็จ:',
      hi: 'डेटा लोड नहीं हो सका:',
    },
  )} {error}</p></div>;
  return (
    <MapViewContainer initialCamera={{ lat: 35.685, lng: 139.76, zoom: 13 }} onStateReady={setMapState} onMapClick={handleMapClick}>
      <KMLLayer state={layerState} features={features} />
      {selected && <InfoBubble position={selected.position}><PropertyTable properties={selected.properties} /></InfoBubble>}
      <ControlPanel title={t(
        {
          en: 'KML Layer',
          ja: 'KML レイヤー',
          'es-419': 'Capa KML',
          de: 'KML-Ebene',
          th: 'เลเยอร์ KML',
          hi: 'KML लेयर',
        },
      )}>
        <p className="control-panel-note">{isLoading
          ? t(
            {
              en: 'Loading KML…',
              ja: 'KMLを読み込んでいます…',
              'es-419': 'Cargando KML…',
              de: 'KML wird geladen…',
              th: 'กำลังโหลด KML…',
              hi: 'KML लोड हो रहा है…',
            },
          )
          : t(
            {
              en: `Parsed from ${KML_ASSET}. Tap a feature to inspect its properties.`,
              ja: `${KML_ASSET} を解析しました。Feature をタップすると属性が表示されます。`,
              'es-419': `Analizado desde ${KML_ASSET}. Toca un elemento para inspeccionar sus propiedades.`,
              de: `Aus ${KML_ASSET} eingelesen. Tippen Sie ein Feature an, um seine Eigenschaften zu sehen.`,
              th: `อ่านจาก ${KML_ASSET} แล้ว แตะฟีเจอร์เพื่อดูคุณสมบัติ`,
              hi: `${KML_ASSET} से पढ़ा गया। किसी फ़ीचर पर टैप करने से उसकी प्रॉपर्टी दिखती हैं।`,
            },
          )}
        </p>
      </ControlPanel>
    </MapViewContainer>
  );
}
