import { useCallback, useEffect, useMemo, useState } from 'react';
import { createGeoPoint, type GeoPoint, type MapDesignTypeInterface, type MapViewStateInterface } from '@mapconductor/js-sdk-core';
import { InfoBubble } from '@mapconductor/js-sdk-react';
import { GeoJSONLayer, GeoJSONLayerState, colorArgb, type GeoJSONFeatureData } from '@mapconductor/react-geojson';
import { ControlPanel } from '../../../components/ControlPanel';
import { MapViewContainer } from '../../../MapViewContainer';
import { useSampleI18n } from '../../../samples/i18n';
import { PropertyTable } from './PropertyTable';
import { railroadGeoJSONSource, type RailroadGeoJSONSource } from './railroadGeoJSON';

interface SelectedFeature { position: GeoPoint; properties: Record<string, unknown> }

export function GeoJSONLayerPage({ source = railroadGeoJSONSource }: { source?: RailroadGeoJSONSource }) {
  const { t } = useSampleI18n();
  const [mapState, setMapState] = useState<MapViewStateInterface<MapDesignTypeInterface<unknown>> | null>(null);
  const [features, setFeatures] = useState<GeoJSONFeatureData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<SelectedFeature | null>(null);
  const layerState = useMemo(() => new GeoJSONLayerState({
    strokeColor: colorArgb(200, 250, 36, 29),
    strokeWidth: 6,
    onClick: (feature, position) => setSelected({
      position: createGeoPoint({ latitude: position.latitude, longitude: position.longitude }),
      properties: feature.properties ?? {},
    }),
  }), []);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    source.load(controller.signal)
      .then(setFeatures)
      .catch(reason => { if (!controller.signal.aborted) setError(String(reason)); })
      .finally(() => { if (!controller.signal.aborted) setIsLoading(false); });
    return () => controller.abort();
  }, [source]);

  const handleMapClick = useCallback((point: GeoPoint) => {
    if (mapState && !layerState.processClick(point, 10, mapState.cameraPosition.zoom)) setSelected(null);
  }, [layerState, mapState]);

  if (error) return <div style={{ padding: '2rem', textAlign: 'center' }}><p>データの読み込みに失敗しました: {error}</p></div>;
  return (
    <MapViewContainer initialCamera={{ lat: 35.68, lng: 139.77, zoom: 13 }} onStateReady={setMapState} onMapClick={handleMapClick}>
      <GeoJSONLayer state={layerState} features={features} />
      {selected && <InfoBubble position={selected.position}><PropertyTable properties={selected.properties} /></InfoBubble>}
      <ControlPanel title={t(
        {
          en: 'GeoJSON Layer',
          ja: 'GeoJSON レイヤー',
          'es-419': 'Capa GeoJSON',
          de: 'GeoJSON-Ebene',
          th: 'เลเยอร์ GeoJSON',
          hi: 'GeoJSON लेयर',
        },
      )}>
        <p className="control-panel-note">{isLoading
          ? t(
            {
              en: 'Loading GeoJSON…',
              ja: 'GeoJSONを読み込んでいます…',
              'es-419': 'Cargando GeoJSON…',
              de: 'GeoJSON wird geladen…',
              th: 'กำลังโหลด GeoJSON…',
              hi: 'GeoJSON लोड हो रहा है…',
            },
          )
          : t(
            {
              en: 'Tap a railway line to display its properties.',
              ja: '路線をタップするとプロパティが表示されます。',
              'es-419': 'Toca una línea de ferrocarril para ver sus propiedades.',
              de: 'Tippen Sie auf eine Bahnlinie, um ihre Eigenschaften anzuzeigen.',
              th: 'แตะเส้นทางรถไฟเพื่อดูคุณสมบัติของเส้นนั้น',
              hi: 'किसी रेल लाइन पर टैप करने से उसकी प्रॉपर्टी दिखती हैं।',
            },
          )}
        </p>
      </ControlPanel>
    </MapViewContainer>
  );
}
