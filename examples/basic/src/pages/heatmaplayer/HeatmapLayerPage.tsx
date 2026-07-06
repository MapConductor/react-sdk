import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { createGeoPoint, createMapCameraPosition } from '@mapconductor/js-sdk-core';
import { GoogleMapDesign, useGoogleMapViewState } from '@mapconductor/react-for-googlemaps';
import { MapLibreDesign, useMapLibreViewState } from '@mapconductor/react-for-maplibre';
import { HeatmapOverlay, HeatmapPoints, HeatmapPointState } from '@mapconductor/react-heatmap';
import { ControlPanel } from '../../components/ControlPanel';
import { MapViewContainer } from '../../MapViewContainer';
import type { MapDesignTypeInterface, MapViewStateInterface } from '@mapconductor/js-sdk-core';

const INIT_CAMERA_POSITION = createMapCameraPosition({
  position: createGeoPoint({ latitude: 35.68049, longitude: 139.76669 }),
  zoom: 10,
});

function HeatmapLayerPageContent({
  mapViewState,
}: {
  mapViewState: MapViewStateInterface<MapDesignTypeInterface<unknown>>;
}) {
  const [heatmapPoints, setHeatmapPoints] = useState<HeatmapPointState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/postoffice/postoffices.json')
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

      <ControlPanel title="Heatmap Layer (24,526件)">
        {isLoading ? (
          <p className="control-panel-note">データ読み込み中...</p>
        ) : (
          <p className="control-panel-note">
            郵便局データをヒートマップで表示しています。
          </p>
        )}
      </ControlPanel>
    </MapViewContainer>
  );
}

function GoogleHeatmapLayerPage() {
  const mapViewState = useGoogleMapViewState({
    mapDesignType: GoogleMapDesign.Normal,
    cameraPosition: INIT_CAMERA_POSITION,
  });
  return <HeatmapLayerPageContent mapViewState={mapViewState} />;
}

function MapLibreHeatmapLayerPage() {
  const mapViewState = useMapLibreViewState({
    mapDesignType: MapLibreDesign.MapTilerTonerEn,
    cameraPosition: INIT_CAMERA_POSITION,
  });
  return <HeatmapLayerPageContent mapViewState={mapViewState} />;
}

export function HeatmapLayerPage() {
  const location = useLocation();
  return location.pathname.startsWith('/google-maps')
    ? <GoogleHeatmapLayerPage />
    : <MapLibreHeatmapLayerPage />;
}
