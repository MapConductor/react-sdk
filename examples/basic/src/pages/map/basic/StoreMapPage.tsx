import { useEffect, useMemo, useState } from 'react';
import {
  ImageDefaultIcon,
  createGeoPoint,
  createMarkerState,
  type MarkerState,
} from '@mapconductor/js-sdk-core';
import { InfoBubble, Markers } from '@mapconductor/js-sdk-react';
import { STORES, type StoreInfo } from '../../../data/storeData';
import { MapViewContainer, useSampleMapViewState } from '../../../MapViewContainer';

const INIT_CAMERA = { lat: 21.382314, lng: -157.933097, zoom: 10 };

const STORE_ICON_URLS: Record<string, string> = {
  coffee_bean: '/store-icons/coffee_bean.webp',
  honolulu_coffee: '/store-icons/honolulu_coffee.webp',
  coffee_extra: '/store-icons/coffee_extra.webp',
  starbucks: '/store-icons/starbucks.webp',
};

function StoreInfoView({ info }: { info: StoreInfo }) {
  const openDirections = () => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(info.address)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div style={{ minWidth: 220, maxWidth: 280, color: '#111827' }}>
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{info.name}</div>
      <div style={{ fontSize: 13, lineHeight: 1.35, marginBottom: 8 }}>{info.address}</div>
      {(info.instore || info.driveThrough) && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 12, marginBottom: 8 }}>
          {info.instore && <span>● In store eating</span>}
          {info.driveThrough && <span>● Drive Through</span>}
        </div>
      )}
      <button
        type="button"
        onClick={openDirections}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          border: 0,
          borderRadius: 16,
          padding: '8px 12px',
          background: '#f5f5f5',
          color: '#111827',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#111827', display: 'inline-block' }} />
        Get Directions
      </button>
    </div>
  );
}

export function MapPage() {
  const mapViewState = useSampleMapViewState(INIT_CAMERA);
  const [selectedMarker, setSelectedMarker] = useState<MarkerState | null>(null);
  const [storeImages, setStoreImages] = useState<Record<string, HTMLImageElement>>({});

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      Object.entries(STORE_ICON_URLS).map(([key, url]) =>
        new Promise<[string, HTMLImageElement]>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve([key, img]);
          img.onerror = () => reject(new Error(`Failed to load icon: ${url}`));
          img.src = url;
        })
      )
    )
      .then(results => {
        if (!cancelled) setStoreImages(Object.fromEntries(results));
      })
      .catch(err => console.error('Failed to preload store icons', err));
    return () => { cancelled = true; };
  }, []);

  const markers = useMemo(
    () =>
      STORES.map(({ lat, lng, ...info }) => {
        const img = storeImages[info.store] ?? storeImages['starbucks'];
        return createMarkerState({
          position: createGeoPoint({ latitude: lat, longitude: lng }),
          extra: info,
          icon: img ? new ImageDefaultIcon(img) : null,
          clickable: true,
          onClick: (state: MarkerState) => setSelectedMarker(state),
        });
      }),
    [storeImages]
  );

  return (
    <MapViewContainer state={mapViewState} onMapClick={() => setSelectedMarker(null)}>
      <Markers states={markers} />
      {selectedMarker && (
        <InfoBubble marker={selectedMarker} bubbleColor="#ffffff">
          <StoreInfoView info={selectedMarker.extra as StoreInfo} />
        </InfoBubble>
      )}
    </MapViewContainer>
  );
}
