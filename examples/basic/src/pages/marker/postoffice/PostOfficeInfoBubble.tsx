import { createMapCameraPosition, type MarkerState } from '@mapconductor/js-sdk-core';
import { InfoBubble } from '@mapconductor/js-sdk-react';
import type { PostOfficeMapState } from './PostOfficeMapProvider';
import type { PostOfficeExtra } from './usePostOfficeMarkers';

export function PostOfficeInfoBubble({
  marker,
  mapViewState,
}: {
  marker: MarkerState;
  mapViewState: PostOfficeMapState;
}) {
  const extra = marker.extra as unknown as PostOfficeExtra;
  const zoomIn = () => mapViewState.moveCameraTo(
    createMapCameraPosition({ position: marker.position, zoom: 18, tilt: 30 }),
    2000,
  );
  return (
    <InfoBubble marker={marker} bubbleColor="#ffffff" borderColor="#ef4444">
      <div className="bubble-content" onClick={zoomIn} style={{ cursor: 'pointer' }}>
        <strong>{extra.name}</strong>
        <span>{extra.address}</span>
      </div>
    </InfoBubble>
  );
}
