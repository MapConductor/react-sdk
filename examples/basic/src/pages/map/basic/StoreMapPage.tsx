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
import { StoreInfoView } from './StoreInfoView';

const INIT_CAMERA = { lat: 21.382314, lng: -157.933097, zoom: 10 };

const STORE_ICON_URLS: Record<string, string> = {
  coffee_bean: `${import.meta.env.BASE_URL}store-icons/coffee_bean.webp`,
  honolulu_coffee: `${import.meta.env.BASE_URL}store-icons/honolulu_coffee.webp`,
  coffee_extra: `${import.meta.env.BASE_URL}store-icons/coffee_extra.webp`,
  starbucks: `${import.meta.env.BASE_URL}store-icons/starbucks.webp`,
};

export function MapPage() {
  // Gets the mapViewState for controll map view.
  const mapViewState = useSampleMapViewState(INIT_CAMERA);
  // Holds the selected marker state.
  const [selectedMarker, setSelectedMarker] = useState<MarkerState | null>(null);
  // Holds icon images.
  const [storeImages, setStoreImages] = useState<Record<string, HTMLImageElement>>({});

  useEffect(() => {
    setSelectedMarker(null);
  }, [mapViewState])
  
  // (1) Loads icon image files
  useEffect(() => {
    setSelectedMarker(null);
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

  // (2) Creates marker states for POIs (coffee stores).
  const markers = useMemo(
    () =>
      STORES.map(({ lat, lng, ...info }) => {
        const img = storeImages[info.store] ?? storeImages['starbucks'];
        return createMarkerState({
          position: createGeoPoint({ latitude: lat, longitude: lng }),
          extra: info,
          icon: img ? new ImageDefaultIcon(img) : null,
          clickable: true,
          draggable: true,
          onClick: (state: MarkerState) => {
            console.log('clicked', state);
            setSelectedMarker(state)
          },
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
