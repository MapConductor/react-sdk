import { useEffect, useMemo, useState } from 'react';
import {
  ImageIcon,
  createGeoPoint,
  createMapCameraPosition,
  createMarkerState,
  createPolylineState,
  type MapDesignTypeInterface,
  type MapViewStateInterface,
} from '@mapconductor/js-sdk-core';
import { Markers, Polyline } from '@mapconductor/js-sdk-react';
import { ControlPanel } from '../../../components/ControlPanel';
import { MapViewContainer } from '../../../MapViewContainer';
import { useSampleI18n } from '../../../i18n';

const INIT_CAMERA = { lat: 35.0, lng: 0.0, zoom: 3 };

const CITIES = [
  { id: 'tokyo', label: 'Tokyo', latitude: 35.6762, longitude: 139.6503, icon: 'tokyo.png' },
  { id: 'honolulu', label: 'Honolulu', latitude: 21.3099, longitude: -157.8581, icon: 'honolulu.png' },
  { id: 'new-york', label: 'New York', latitude: 40.7128, longitude: -74.006, icon: 'newyork.png' },
  { id: 'london', label: 'London', latitude: 51.5074, longitude: -0.1278, icon: 'london.png' },
  { id: 'sydney', label: 'Sydney', latitude: -33.9506, longitude: 151.1815, icon: 'sydney.png' },
] as const;

const CONNECTIONS = [
  { id: 'honolulu-to-new-york', from: 'honolulu', to: 'new-york', color: 'rgba(0, 255, 0, 0.7)' },
  { id: 'honolulu-to-sydney', from: 'honolulu', to: 'sydney', color: 'rgba(179, 0, 0, 0.7)' },
  { id: 'tokyo-to-london', from: 'tokyo', to: 'london', color: 'rgba(255, 0, 255, 0.7)' },
  { id: 'tokyo-to-new-york', from: 'tokyo', to: 'new-york', color: 'rgba(0, 0, 255, 0.7)' },
  { id: 'tokyo-to-honolulu', from: 'tokyo', to: 'honolulu', color: 'rgba(255, 89, 31, 0.7)' },
  { id: 'london-to-new-york', from: 'london', to: 'new-york', color: 'rgba(191, 0, 0, 0.7)' },
  { id: 'london-to-sydney', from: 'london', to: 'sydney', color: 'rgba(255, 0, 255, 0.7)' },
] as const;

function FlyToContent({ mapViewState }: { mapViewState: MapViewStateInterface<MapDesignTypeInterface<unknown>> }) {
  const { t } = useSampleI18n();
  const [icons, setIcons] = useState<Map<string, ImageIcon> | null>(null);
  const [geodesic, setGeodesic] = useState(false);

  useEffect(() => {
    let active = true;

    Promise.all(CITIES.map(async city => {
      const image = await loadImage(`${import.meta.env.BASE_URL}city-icons/${city.icon}`);
      return [city.id, new ImageIcon(image)] as const;
    }))
      .then(entries => {
        if (active) setIcons(new Map(entries));
      })
      .catch(() => {
        if (active) setIcons(new Map());
      });

    return () => {
      active = false;
    };
  }, []);

  const markers = useMemo(
    () => CITIES.map(city => createMarkerState({
      id: city.id,
      position: createGeoPoint({ latitude: city.latitude, longitude: city.longitude }),
      extra: city.label,
      icon: icons?.get(city.id),
    })),
    [icons],
  );

  const polylines = useMemo(() => {
    const positions = new Map(markers.map(marker => [marker.id, marker.position]));

    return CONNECTIONS.map(connection => createPolylineState({
      id: connection.id,
      points: [positions.get(connection.from)!, positions.get(connection.to)!],
      strokeColor: connection.color,
      strokeWidth: 3,
      geodesic,
    }));
  }, [geodesic, markers]);

  return (
    <>
      {polylines.map(polyline => <Polyline key={polyline.id} state={polyline} />)}
      <Markers states={markers} />
      <ControlPanel title={t('Fly To', 'カメラ移動')}>
        <label className="toggle-control">
          <input
            className="toggle-control-input"
            type="checkbox"
            role="switch"
            checked={geodesic}
            onChange={event => setGeodesic(event.target.checked)}
          />
          <span className="toggle-control-track" aria-hidden="true">
            <span className="toggle-control-thumb" />
          </span>
          <span>geodesic</span>
        </label>
        <div className="button-grid">
          {markers.map(marker => (
            <button
              key={marker.id}
              onClick={() => mapViewState.moveCameraTo(
                createMapCameraPosition({ position: marker.position, zoom: 13 }),
                1600,
              )}
            >
              {marker.extra as string}
            </button>
          ))}
        </div>
      </ControlPanel>
    </>
  );
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load icon: ${url}`));
    image.src = url;
  });
}

export function FlyToPage() {
  const [mapViewState, setMapViewState] = useState<MapViewStateInterface<MapDesignTypeInterface<unknown>> | null>(null);
  return (
    <MapViewContainer initialCamera={INIT_CAMERA} onStateReady={setMapViewState}>
      {mapViewState && <FlyToContent mapViewState={mapViewState} />}
    </MapViewContainer>
  );
}
