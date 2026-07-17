import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ImageIcon,
  createGeoPoint,
  createMapCameraPosition,
  createMarkerState,
  type MapDesignTypeInterface,
  type MapViewStateInterface,
  type MarkerState,
} from '@mapconductor/js-sdk-core';
import { InfoBubble } from '@mapconductor/js-sdk-react';
import { MapLibreDesign, useMapLibreViewState } from '@mapconductor/react-for-maplibre';
import { LeafletDesign, useLeafletMapViewState } from '@mapconductor/react-for-leaflet';
import {
  MarkerClusterGroup,
  type ClusterIconProvider,
  type MarkerCluster,
} from '@mapconductor/react-marker-clustering';
import { ControlPanel } from '../../../components/ControlPanel';
import { MapViewContainer } from '../../../MapViewContainer';
import { useSingletonGoogleMapViewState } from '../../../SingletonGoogleMaps';
import { useSampleI18n } from '../../../i18n';

// ─── Data types ────────────────────────────────────────────────────────────────
interface PostOfficeExtra {
  name: string;
  address: string;
}

// ─── Cluster icon helpers ──────────────────────────────────────────────────────
function clusterCountLabel(count: number): string {
  if (count > 1_000) return '1k+';
  if (count > 200) return '200+';
  if (count > 100) return '100+';
  return String(count);
}

function drawClusterCanvas(background: HTMLImageElement, label: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = background.naturalWidth;
  canvas.height = background.naturalHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(background, 0, 0);
  // The bubble occupies roughly the top 38% of the image; its center is at ~20%.
  const bubbleCenterY = Math.floor(background.naturalHeight * 0.22);
  const fontSize = Math.floor(background.naturalHeight * 0.35);
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, background.naturalWidth / 2, bubbleCenterY);
  return canvas;
}

function buildClusterIconProvider(background: HTMLImageElement): ClusterIconProvider {
  const cache = new Map<string, ImageIcon>();
  return (count: number) => {
    const label = clusterCountLabel(count);
    const hit = cache.get(label);
    if (hit) return hit;
    const canvas = drawClusterCanvas(background, label);
    const icon = new ImageIcon(canvas, { anchor: { x: 0.5, y: 0.5 } });
    cache.set(label, icon);
    return icon;
  };
}

// ─── InfoBubble ────────────────────────────────────────────────────────────────
function PostOfficeInfoBubble({
  extra,
  marker,
  mapViewState,
}: {
  extra: PostOfficeExtra;
  marker: MarkerState;
  mapViewState: MapViewStateInterface<MapDesignTypeInterface<unknown>>;
}) {
  const handleClick = () => {
    mapViewState.moveCameraTo(
      createMapCameraPosition({ position: marker.position, zoom: 18, tilt: 30 }),
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
const INIT_CAMERA_POSITION = createMapCameraPosition({
  position: createGeoPoint({ latitude: 35.68049, longitude: 139.76669 }),
  zoom: 10,
});

// ─── Page content ──────────────────────────────────────────────────────────────
function PostOfficeClusterPageContent({
  mapViewState,
}: {
  mapViewState: MapViewStateInterface<MapDesignTypeInterface<unknown>>;
}) {
  const { t } = useSampleI18n();
  const [raw, setRaw] = useState<[number, number, string, string][] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<MarkerState | null>(null);
  const [markerIcon, setMarkerIcon] = useState<ImageIcon | null>(null);
  const [clusterIconProvider, setClusterIconProvider] = useState<ClusterIconProvider | null>(null);
  const [debugHullPolygons, setDebugHullPolygons] = useState(false);

  // Load post office data and icons in parallel.
  useEffect(() => {
    Promise.all([
      fetch(`${import.meta.env.BASE_URL}postoffice/postoffices.json`)
        .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() as Promise<[number, number, string, string][]>; }),
      loadImage(`${import.meta.env.BASE_URL}postoffice/postoffice.webp`),
      loadImage(`${import.meta.env.BASE_URL}postoffice/cluster_red.png`),
    ])
      .then(([data, markerImg, clusterImg]) => {
        setRaw(data);
        // scale 0.5 matches the Android example (24dp on screen).
        setMarkerIcon(new ImageIcon(markerImg, { scale: 0.5 }));
        setClusterIconProvider(() => buildClusterIconProvider(clusterImg));
      })
      .catch(err => setError(String(err)));
  }, []);

  const markerStates = useMemo(
    () =>
      (raw ?? []).map(([lat, lng, name, address], i) =>
        createMarkerState({
          id: `po-${i}`,
          position: createGeoPoint({ latitude: lat, longitude: lng }),
          extra: { name, address } satisfies PostOfficeExtra,
          icon: markerIcon,
          onClick: (state) => setSelected(state),
        }),
      ),
    [markerIcon, raw],
  );

  // Fast O(1) lookup for cluster-click zoom.
  const markerMapRef = useRef<Map<string, MarkerState>>(new Map());
  useEffect(() => {
    markerMapRef.current = new Map(markerStates.map(s => [s.id, s]));
  }, [markerStates]);

  const handleClusterClick = useCallback((cluster: MarkerCluster) => {
    const map = markerMapRef.current;
    let lat = 0, lon = 0, count = 0;
    for (const id of cluster.markerIds) {
      const s = map.get(id);
      if (!s) continue;
      lat += s.position.latitude;
      lon += s.position.longitude;
      count++;
    }
    if (count === 0) return;
    const camera = mapViewState.cameraPosition;
    mapViewState.moveCameraTo(
      createMapCameraPosition({
        position: createGeoPoint({ latitude: lat / count, longitude: lon / count }),
        zoom: Math.min((camera?.zoom ?? 10) + 2, 18),
      }),
      600,
    );
  }, [mapViewState]);

  const clearSelect = useCallback(() => setSelected(null), []);

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>データの読み込みに失敗しました: {error}</p>
      </div>
    );
  }

  return (
    <MapViewContainer state={mapViewState} onMapClick={clearSelect}>
      <MarkerClusterGroup
        markers={markerStates}
        clusterIconProvider={clusterIconProvider ?? undefined}
        onClusterClick={handleClusterClick}
        minClusterSize={3}
        clusterRadiusPx={80}
        enableZoomAnimation
        enablePanAnimation
        debugHullPolygons={debugHullPolygons}
      />

      {selected && !(selected.extra as unknown as MarkerCluster)?.markerIds && (
        <PostOfficeInfoBubble
          extra={selected.extra as unknown as PostOfficeExtra}
          marker={selected}
          mapViewState={mapViewState}
        />
      )}

      <ControlPanel title={t('Post Office Clusters (24,526 markers)', '郵便局クラスタリング（24,526件）')}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
          <input
            type="checkbox"
            checked={debugHullPolygons}
            onChange={e => setDebugHullPolygons(e.target.checked)}
          />
          {t('Show debug hull polygons', 'デバッグ用の外周ポリゴンを表示')}
        </label>
        {!raw ? (
          <p className="control-panel-note">{t('Loading data…', 'データを読み込んでいます…')}</p>
        ) : (
          <p className="control-panel-note">
            {t('Click a cluster to zoom in.', 'クラスターをクリックするとズームインします。')}<br />
            {t(
              'Click an individual marker to display postal-office information.',
              '個別マーカーをクリックすると郵便局情報が表示されます。',
            )}
          </p>
        )}
      </ControlPanel>
    </MapViewContainer>
  );
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

// ─── Provider-specific wrappers ────────────────────────────────────────────────
function GooglePostOfficeClusterPage() {
  const mapViewState = useSingletonGoogleMapViewState(INIT_CAMERA_POSITION);
  return <PostOfficeClusterPageContent mapViewState={mapViewState} />;
}

function MapLibrePostOfficeClusterPage() {
  const mapViewState = useMapLibreViewState({
    mapDesignType: MapLibreDesign.OsmBrightJa,
    cameraPosition: INIT_CAMERA_POSITION,
  });
  return <PostOfficeClusterPageContent mapViewState={mapViewState} />;
}

function LeafletPostOfficeClusterPage() {
  const mapViewState = useLeafletMapViewState({
    mapDesignType: LeafletDesign.OpenStreetMap,
    cameraPosition: INIT_CAMERA_POSITION,
  });
  return <PostOfficeClusterPageContent mapViewState={mapViewState} />;
}

// ─── Page export ───────────────────────────────────────────────────────────────
export function PostOfficeClusterPage() {
  const location = useLocation();
  if (location.pathname.startsWith('/google-maps')) return <GooglePostOfficeClusterPage />;
  if (location.pathname.startsWith('/leaflet')) return <LeafletPostOfficeClusterPage />;
  return <MapLibrePostOfficeClusterPage />;
}
