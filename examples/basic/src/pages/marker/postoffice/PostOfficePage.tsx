import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ImageIcon,
  MarkerTilingOptions,
  createGeoPoint,
  createMapCameraPosition,
  createMarkerState,
  type MapDesignTypeInterface,
  type MapViewStateInterface,
  type MarkerState,
} from '@mapconductor/js-sdk-core';
import { InfoBubble, Markers } from '@mapconductor/js-sdk-react';
import { MapLibreDesign, useMapLibreViewState } from '@mapconductor/react-for-maplibre';
import { MapboxDesign, useMapboxViewState } from '@mapconductor/react-for-mapbox';
import { LeafletDesign, useLeafletMapViewState } from '@mapconductor/react-for-leaflet';
import { OpenLayersDesign, useOpenLayersMapViewState } from '@mapconductor/react-for-openlayers';
import { ArcGISDesign, useArcGISViewState } from '@mapconductor/react-for-arcgis';
import { ControlPanel } from '../../../components/ControlPanel';
import { MapViewContainer } from '../../../MapViewContainer';
import { useSingletonGoogleMapViewState } from '../../../SingletonGoogleMaps';
import { useSampleI18n } from '../../../i18n';

// ─── Data types ────────────────────────────────────────────────────────────────
interface PostOfficeExtra {
  name: string;
  address: string;
}

// ─── InfoBubble with zoom-in on click ──────────────────────────────────────────
function PostOfficeInfoBubble({
  extra,
  marker,
  mapViewState,
}: {
  extra: PostOfficeExtra;
  marker: MarkerState;
  mapViewState: MapViewStateInterface<MapDesignTypeInterface<unknown>> | null;
}) {
  const handleClick = () => {
    mapViewState?.moveCameraTo(
      createMapCameraPosition({
        position: marker.position,
        zoom: 18,
        tilt: 30,
      }),
      2000,
    );
  };

  return (
    <InfoBubble marker={marker} bubbleColor="#ffffff" borderColor="#ef4444">
      <div className="bubble-content" onClick={handleClick} style={{ cursor: 'pointer' }}>
        <strong>{extra.name}</strong>
        <span>{extra.address}</span>
      </div>
    </InfoBubble>
  );
}

// ─── Constants ─────────────────────────────────────────────────────────────────
const INIT_CAMERA = { lat: 35.68049, lng: 139.76669, zoom: 10 };
const INIT_CAMERA_POSITION = createMapCameraPosition({
  position: createGeoPoint({ latitude: INIT_CAMERA.lat, longitude: INIT_CAMERA.lng }),
  zoom: INIT_CAMERA.zoom,
});

const MARKER_TILING_OPTIONS: MarkerTilingOptions = {
  ...MarkerTilingOptions.Default,
  iconScaleCallback: (_state, zoom) => {
    if (zoom > 10)  return 0.8;
    if (zoom > 5)  return 0.5;
    return 0.2;
  },
};

function PostOfficePageContent({
  mapViewState,
}: {
  mapViewState: MapViewStateInterface<MapDesignTypeInterface<unknown>>;
}) {
  const { t } = useSampleI18n();
  const [raw, setRaw] = useState<[number, number, string, string][] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<MarkerState | null>(null);
  const [icon, setIcon] = useState<ImageIcon | null>(null);

  // Load post office data
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}postoffice/postoffices.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<[number, number, string, string][]>;
      })
      .then(setRaw)
      .then(() => new Promise<HTMLImageElement>((resolve, reject) => {
        const url = `${import.meta.env.BASE_URL}postoffice/postoffice.webp`;
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load icon: ${url}`));
        img.src = url;
      }))
      .then((img) => setIcon(new ImageIcon(img)))
      .catch((err) => setError(String(err)));
  }, []);

  // Build MarkerState array — tile rendering kicks in automatically at 2000+ markers
  const markerStates = useMemo(
    () =>
      (raw ?? []).map(([lat, lng, name, address], i) =>
        createMarkerState({
          id: `po-${i}`,
          position: createGeoPoint({ latitude: lat, longitude: lng }),
          extra: { name, address } satisfies PostOfficeExtra,
          icon,
          onClick: (state) => setSelected(state),
        }),
      ),
    [icon, raw],
  );

  const clearSelect = useCallback(() => setSelected(null), [])

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>データの読み込みに失敗しました: {error}</p>
      </div>
    );
  }

  return (
    <MapViewContainer
      state={mapViewState}
      markerTilingOptions={MARKER_TILING_OPTIONS}
      onMapClick={clearSelect}
    >
      <Markers states={markerStates} />

      {selected && (
        <PostOfficeInfoBubble
          extra={selected.extra as unknown as PostOfficeExtra}
          marker={selected}
          mapViewState={mapViewState}
        />
      )}

      <ControlPanel title={t('Post Offices (24,526 markers)', '郵便局（24,526件）')}>
        {!raw ? (
          <p className="control-panel-note">{t('Loading data…', 'データを読み込んでいます…')}</p>
        ) : (
          <p className="control-panel-note">
            {t(
              'Click a marker to display postal-office information.',
              'マーカーをクリックすると郵便局情報が表示されます。',
            )}
          </p>
        )}
      </ControlPanel>
    </MapViewContainer>
  );
}

function GooglePostOfficePage() {
  const mapViewState = useSingletonGoogleMapViewState(INIT_CAMERA_POSITION);

  return <PostOfficePageContent mapViewState={mapViewState} />;
}

function MapLibrePostOfficePage() {
  const mapViewState = useMapLibreViewState({
    mapDesignType: MapLibreDesign.OsmBrightJa,
    cameraPosition: INIT_CAMERA_POSITION,
  });

  return <PostOfficePageContent mapViewState={mapViewState} />;
}

function MapboxPostOfficePage() {
  const mapViewState = useMapboxViewState({
    mapDesignType: MapboxDesign.Streets,
    cameraPosition: INIT_CAMERA_POSITION,
  });

  return <PostOfficePageContent mapViewState={mapViewState} />;
}

function LeafletPostOfficePage() {
  const mapViewState = useLeafletMapViewState({
    mapDesignType: LeafletDesign.OpenStreetMap,
    cameraPosition: INIT_CAMERA_POSITION,
  });
  return <PostOfficePageContent mapViewState={mapViewState} />;
}

function OpenLayersPostOfficePage() {
  const mapViewState = useOpenLayersMapViewState({
    mapDesignType: OpenLayersDesign.OpenStreetMap,
    cameraPosition: INIT_CAMERA_POSITION,
  });
  return <PostOfficePageContent mapViewState={mapViewState} />;
}

function ArcGISPostOfficePage() {
  const mapViewState = useArcGISViewState({
    apiKey: import.meta.env.VITE_ARCGIS_API_KEY ?? '',
    mapDesignType: ArcGISDesign.Streets,
    cameraPosition: INIT_CAMERA_POSITION,
  });
  return <PostOfficePageContent mapViewState={mapViewState} />;
}

// ─── Page component ─────────────────────────────────────────────────────────────
export function PostOfficePage() {
  const location = useLocation();
  if (location.pathname.startsWith('/google-maps')) return <GooglePostOfficePage />;
  if (location.pathname.startsWith('/mapbox')) return <MapboxPostOfficePage />;
  if (location.pathname.startsWith('/leaflet')) return <LeafletPostOfficePage />;
  if (location.pathname.startsWith('/openlayers')) return <OpenLayersPostOfficePage />;
  if (location.pathname.startsWith('/arcgis')) return <ArcGISPostOfficePage />;
  return <MapLibrePostOfficePage />;
}
