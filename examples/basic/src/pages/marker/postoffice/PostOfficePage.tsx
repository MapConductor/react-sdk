import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  MarkerTilingOptions,
  createGeoPoint,
  createMapCameraPosition,
  createMarkerState,
  type MapDesignTypeInterface,
  type MapViewStateInterface,
  type MarkerState,
} from '@mapconductor/js-sdk-core';
import { InfoBubble, Markers } from '@mapconductor/js-sdk-react';
import { GoogleMapDesign, useGoogleMapViewState } from '@mapconductor/react-for-googlemaps';
import { MapLibreDesign, useMapLibreViewState } from '@mapconductor/react-for-maplibre';
import { ControlPanel } from '../../../components/ControlPanel';
import { MapViewContainer } from '../../../MapViewContainer';

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
    if (zoom > 12) return 2.0;
    if (zoom > 10) return 1.0;
    if (zoom > 8)  return 0.8;
    if (zoom > 5)  return 0.5;
    return 0.2;
  },
};

function PostOfficePageContent({
  mapViewState,
}: {
  mapViewState: MapViewStateInterface<MapDesignTypeInterface<unknown>>;
}) {
  const [raw, setRaw] = useState<[number, number, string, string][] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<MarkerState | null>(null);

  // Load post office data
  useEffect(() => {
    fetch('/postoffice/postoffices.json')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<[number, number, string, string][]>;
      })
      .then(setRaw)
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
          onClick: (state) => setSelected(state),
        }),
      ),
    [raw],
  );

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
    >
      <Markers states={markerStates} />

      {selected && (
        <PostOfficeInfoBubble
          extra={selected.extra as unknown as PostOfficeExtra}
          marker={selected}
          mapViewState={mapViewState}
        />
      )}

      <ControlPanel title="Post Office (24,526件)">
        {!raw ? (
          <p className="control-panel-note">データ読み込み中...</p>
        ) : (
          <p className="control-panel-note">
            マーカーをクリックすると郵便局情報が表示されます。
          </p>
        )}
      </ControlPanel>
    </MapViewContainer>
  );
}

function GooglePostOfficePage() {
  const mapViewState = useGoogleMapViewState({
    mapDesignType: GoogleMapDesign.Normal,
    cameraPosition: INIT_CAMERA_POSITION,
  });

  return <PostOfficePageContent mapViewState={mapViewState} />;
}

function MapLibrePostOfficePage() {
  const mapViewState = useMapLibreViewState({
    mapDesignType: MapLibreDesign.OsmBrightJa,
    cameraPosition: INIT_CAMERA_POSITION,
  });

  return <PostOfficePageContent mapViewState={mapViewState} />;
}

// ─── Page component ─────────────────────────────────────────────────────────────
export function PostOfficePage() {
  const location = useLocation();
  return location.pathname.startsWith('/google-maps')
    ? <GooglePostOfficePage />
    : <MapLibrePostOfficePage />;
}
