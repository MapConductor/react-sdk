import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { createGeoPoint, createMapCameraPosition } from '@mapconductor/js-sdk-core';
import { MapLibreDesign, useMapLibreViewState } from '@mapconductor/react-for-maplibre';
import { MapboxDesign, useMapboxViewState } from '@mapconductor/react-for-mapbox';
import { LeafletDesign, useLeafletMapViewState } from '@mapconductor/react-for-leaflet';
import { OpenLayersDesign, useOpenLayersMapViewState } from '@mapconductor/react-for-openlayers';
import { ArcGISDesign, useArcGISViewState } from '@mapconductor/react-for-arcgis';
import { HeatmapOverlay, HeatmapPoints, HeatmapPointState } from '@mapconductor/react-heatmap';
import { ControlPanel } from '../../components/ControlPanel';
import { MapViewContainer } from '../../MapViewContainer';
import type { MapDesignTypeInterface, MapViewStateInterface } from '@mapconductor/js-sdk-core';
import { useSingletonGoogleMapViewState } from '../../SingletonGoogleMaps';
import { useSampleI18n } from '../../i18n';

const INIT_CAMERA_POSITION = createMapCameraPosition({
  position: createGeoPoint({ latitude: 35.68049, longitude: 139.76669 }),
  zoom: 10,
});

function HeatmapLayerPageContent({
  mapViewState,
}: {
  mapViewState: MapViewStateInterface<MapDesignTypeInterface<unknown>>;
}) {
  const { t } = useSampleI18n();
  const [heatmapPoints, setHeatmapPoints] = useState<HeatmapPointState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}postoffice/postoffices.json`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<[number, number, string, string][]>;
      })
      .then(data => {
        const points = data.map(([lat, lng], i) =>
          new HeatmapPointState({
            id: `po-${i}`,
            position: createGeoPoint({ latitude: lat, longitude: lng }),
          }),
        );
        setHeatmapPoints(points);
        setIsLoading(false);
      })
      .catch(err => {
        setError(String(err));
        setIsLoading(false);
      });
  }, []);

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>データの読み込みに失敗しました: {error}</p>
      </div>
    );
  }

  return (
    <MapViewContainer state={mapViewState}>
      <HeatmapOverlay>
        <HeatmapPoints states={heatmapPoints} />
      </HeatmapOverlay>

      <ControlPanel title={t('Heatmap Layer (24,526 points)', 'ヒートマップレイヤー（24,526件）')}>
        {isLoading ? (
          <p className="control-panel-note">{t('Loading data…', 'データを読み込んでいます…')}</p>
        ) : (
          <p className="control-panel-note">
            {t('Postal-office data is displayed as a heatmap.', '郵便局データをヒートマップで表示しています。')}
          </p>
        )}
      </ControlPanel>
    </MapViewContainer>
  );
}

function GoogleHeatmapLayerPage() {
  const mapViewState = useSingletonGoogleMapViewState(INIT_CAMERA_POSITION);
  return <HeatmapLayerPageContent mapViewState={mapViewState} />;
}

function MapLibreHeatmapLayerPage() {
  const mapViewState = useMapLibreViewState({
    mapDesignType: MapLibreDesign.MapTilerTonerEn,
    cameraPosition: INIT_CAMERA_POSITION,
  });
  return <HeatmapLayerPageContent mapViewState={mapViewState} />;
}

function MapboxHeatmapLayerPage() {
  const mapViewState = useMapboxViewState({
    mapDesignType: MapboxDesign.Light,
    cameraPosition: INIT_CAMERA_POSITION,
  });
  return <HeatmapLayerPageContent mapViewState={mapViewState} />;
}

function LeafletHeatmapLayerPage() {
  const mapViewState = useLeafletMapViewState({
    mapDesignType: LeafletDesign.OpenStreetMap,
    cameraPosition: INIT_CAMERA_POSITION,
  });
  return <HeatmapLayerPageContent mapViewState={mapViewState} />;
}

function OpenLayersHeatmapLayerPage() {
  const mapViewState = useOpenLayersMapViewState({
    mapDesignType: OpenLayersDesign.OpenStreetMap,
    cameraPosition: INIT_CAMERA_POSITION,
  });
  return <HeatmapLayerPageContent mapViewState={mapViewState} />;
}

function ArcGISHeatmapLayerPage() {
  const mapViewState = useArcGISViewState({
    apiKey: import.meta.env.VITE_ARCGIS_API_KEY ?? '',
    mapDesignType: ArcGISDesign.Streets,
    cameraPosition: INIT_CAMERA_POSITION,
  });
  return <HeatmapLayerPageContent mapViewState={mapViewState} />;
}

export function HeatmapLayerPage() {
  const location = useLocation();
  if (location.pathname.startsWith('/google-maps')) return <GoogleHeatmapLayerPage />;
  if (location.pathname.startsWith('/mapbox')) return <MapboxHeatmapLayerPage />;
  if (location.pathname.startsWith('/leaflet')) return <LeafletHeatmapLayerPage />;
  if (location.pathname.startsWith('/openlayers')) return <OpenLayersHeatmapLayerPage />;
  if (location.pathname.startsWith('/arcgis')) return <ArcGISHeatmapLayerPage />;
  return <MapLibreHeatmapLayerPage />;
}
