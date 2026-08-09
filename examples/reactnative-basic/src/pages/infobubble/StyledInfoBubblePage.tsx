import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  ColorDefaultIcon,
  GeoPoint,
  MapCameraPosition,
  createMarkerState,
} from '@mapconductor/js-sdk-core';
import { InfoBubbleCustom, Markers } from '@mapconductor/js-sdk-react/native';

import { MapViewContainer } from '../MapViewContainer';
import type { MapProvider } from '../../providers/types';

const INIT_CAMERA = MapCameraPosition.from({
  position: GeoPoint.from({ latitude: 37.7849, longitude: -122.4094, altitude: 0 }),
  zoom: 15,
  bearing: 0,
  tilt: 0,
});

export function StyledInfoBubblePage({ provider }: { provider: MapProvider }) {
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>('marker1');

  const markers = useMemo(() => {
    const marker1 = createMarkerState({
      id: 'marker1',
      position: GeoPoint.from({ latitude: 37.7749, longitude: -122.4194, altitude: 0 }),
      icon: new ColorDefaultIcon({
        fillColor: '#2563eb',
        label: '1',
        labelTextColor: '#ffffff',
        infoAnchor: { x: 0.5, y: 0.25 },
      }),
      clickable: true,
      draggable: true,
      onClick: (state) => setSelectedMarkerId(state.id),
    });
    const marker2 = createMarkerState({
      id: 'marker2',
      position: GeoPoint.from({ latitude: 37.7849, longitude: -122.4094, altitude: 0 }),
      icon: new ColorDefaultIcon({
        fillColor: '#ef4444',
        label: '2',
        labelTextColor: '#ffffff',
        infoAnchor: { x: 0.5, y: 0.25 },
      }),
      clickable: true,
      onClick: (state) => setSelectedMarkerId(state.id),
    });
    return [marker1, marker2];
  }, []);

  const activeMarker = markers.find((marker) => marker.id === selectedMarkerId);

  return (
    <View style={styles.mapContainer}>
      <MapViewContainer
        provider={provider}
        cameraPosition={INIT_CAMERA}
        mapId="info-bubble-styled"
        style={styles.map}
        onMapClick={() => setSelectedMarkerId(null)}
      >
        <Markers states={markers} />
        {activeMarker ? (
          // tailOffset {x:0, y:0.5} = 吹き出しの左端中央がマーカーに繋がる（右向きテール）。
          // 既定の装飾を使わず、中身を丸ごと自前で描く版。
          <InfoBubbleCustom marker={activeMarker} tailOffset={{ x: 0, y: 0.5 }}>
            <RightTailInfoBubble>
              <Text style={styles.rightTailText}>{activeMarker.position.toUrlValue(6)}</Text>
            </RightTailInfoBubble>
          </InfoBubbleCustom>
        ) : null}
      </MapViewContainer>

      <View style={styles.controlPanel}>
        <Text style={styles.title}>Styled InfoBubble</Text>
        <Text style={styles.note}>
          InfoBubbleCustom で吹き出しの見た目を自分で描きます。マーカー 1 はドラッグできます。
        </Text>
      </View>
    </View>
  );
}

/**
 * 左向きの尾を持つ吹き出し。android-sdk example-app の `RightTailInfoBubble`
 * (Canvas で Path を描くやつ) と、web の `.right-tail-info-bubble` CSS と
 * 同じ見た目にしてある: 白地 / 黒 2px 枠 / 角丸 4 / 青文字。
 *
 * RN には CSS の擬似要素が無いので、尾は「黒い三角形の上に一回り小さい白い三角形を
 * 重ねる」という web と同じ二枚重ねで作る。白い三角形の底辺が本体の左枠に食い込み、
 * 尾の付け根だけ枠線が消えて繋がって見える。
 */
function RightTailInfoBubble({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.rightTailRow}>
      <View style={styles.tailColumn}>
        <View style={styles.tailBorder} />
        <View style={styles.tailFill} />
      </View>
      <View style={styles.rightTailBody}>{children}</View>
    </View>
  );
}

const TAIL_WIDTH = 10;
const TAIL_HALF_HEIGHT = 7;
const BORDER_WIDTH = 2;

const styles = StyleSheet.create({
  mapContainer: { flex: 1, minWidth: 0, position: 'relative', overflow: 'hidden' },
  map: { flex: 1 },
  rightTailRow: { flexDirection: 'row', alignItems: 'center' },
  tailColumn: { width: TAIL_WIDTH, height: TAIL_HALF_HEIGHT * 2 },
  tailBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: TAIL_HALF_HEIGHT,
    borderBottomWidth: TAIL_HALF_HEIGHT,
    borderRightWidth: TAIL_WIDTH,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: '#000000',
  },
  tailFill: {
    position: 'absolute',
    left: BORDER_WIDTH,
    top: BORDER_WIDTH,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: TAIL_HALF_HEIGHT - BORDER_WIDTH,
    borderBottomWidth: TAIL_HALF_HEIGHT - BORDER_WIDTH,
    borderRightWidth: TAIL_WIDTH,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: '#ffffff',
  },
  rightTailBody: {
    marginLeft: -BORDER_WIDTH,
    maxWidth: 220,
    padding: 8,
    borderWidth: BORDER_WIDTH,
    borderColor: '#000000',
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  rightTailText: { color: '#2563eb', fontSize: 13, lineHeight: 18 },
  controlPanel: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 20,
    maxWidth: 360,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  title: { marginBottom: 8, color: '#111827', fontSize: 16, fontWeight: '700' },
  note: { color: '#475569', fontSize: 13, lineHeight: 18 },
});
