import { useMemo, useState } from 'react';
import {
  ColorDefaultIcon,
  createGeoPoint,
  createMarkerState,
  type MarkerLabelPosition,
} from '@mapconductor/js-sdk-core';
import { InfoBubble, Markers } from '@mapconductor/js-sdk-react';
import { MapViewContainer } from '../../../MapViewContainer';

// 信州大学（松本キャンパス）周辺に 3 × 3 で並べ、それぞれ違う labelPosition を付ける。
const CENTER = { latitude: 36.2526, longitude: 137.9828 };
const INIT_CAMERA = { lat: CENTER.latitude, lng: CENTER.longitude, zoom: 15 };
const STEP = { latitude: 0.004, longitude: 0.007 };

const POSITIONS: MarkerLabelPosition[][] = [
  ['left top', 'center top', 'right top'],
  ['left center', 'center center', 'right center'],
  ['left bottom', 'center bottom', 'right bottom'],
];

export function MarkerLabelPositionPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const markers = useMemo(
    () =>
      POSITIONS.flatMap((row, rowIndex) =>
        row.map((labelPosition, columnIndex) =>
          createMarkerState({
            id: labelPosition,
            position: createGeoPoint({
              latitude: CENTER.latitude + (1 - rowIndex) * STEP.latitude,
              longitude: CENTER.longitude + (columnIndex - 1) * STEP.longitude,
            }),
            icon: new ColorDefaultIcon({
              label: labelPosition === 'center center' ? '信' : '信州大学',
              labelPosition,
              debug: true,
            }),
            extra: labelPosition,
            onClick: state => setSelectedId(state.id),
          }),
        ),
      ),
    [],
  );
  const selected = markers.find(marker => marker.id === selectedId);

  return (
    <MapViewContainer initialCamera={INIT_CAMERA} onMapClick={() => setSelectedId(null)}>
      <Markers states={markers} />
      {selected ? (
        <InfoBubble key={selected.id} marker={selected} bubbleColor="#ffffff" borderColor="#000000">
          <code>labelPosition: "{selected.extra as string}"</code>
        </InfoBubble>
      ) : null}
    </MapViewContainer>
  );
}
