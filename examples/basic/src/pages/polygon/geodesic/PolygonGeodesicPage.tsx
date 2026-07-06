import { useMemo, useState } from 'react';
import {
  ColorDefaultIcon,
  GeoPoint,
  MarkerAnimation,
  createMarkerState,
  createPolygonState,
  type GeoPoint as GeoPointType,
  type PolygonEvent,
} from '@mapconductor/js-sdk-core';
import { InfoBubble, Marker, Polygon } from '@mapconductor/js-sdk-react';
import { ControlPanel } from '../../../components/ControlPanel';
import { MapViewContainer, useSampleMapViewState } from '../../../MapViewContainer';

const INIT_CAMERA = { lat: 30.0, lng: 20.0, zoom: 2 };

interface ClickedPolygon {
  position: GeoPointType;
  label: string;
  markerColor: string;
  sequence: number;
}

export function PolygonGeodesicPage() {
  const mapViewState = useSampleMapViewState(INIT_CAMERA);
  const [clickedPolygon, setClickedPolygon] = useState<ClickedPolygon | null>(null);
  const points = useMemo(() => [
    GeoPoint.fromLongLat(23.66, 56.42, 5000),
    GeoPoint.fromLongLat(13.39, 2.95, 5000),
    GeoPoint.fromLongLat(-87.82, 38.58, 5000),
    GeoPoint.fromLongLat(23.66, 56.42, 5000),
  ], []);
  const handlePolygonClick = (label: string) => (event: PolygonEvent) => {
    setClickedPolygon((current) => ({
      position: event.clicked,
      label,
      markerColor: event.state.strokeColor,
      sequence: (current?.sequence ?? 0) + 1,
    }));
  };
  const polygons = useMemo(() => [
    createPolygonState({
      id: 'linear-triangle',
      points,
      fillColor: 'rgba(37, 99, 235, 0.5)',
      strokeColor: '#2563eb',
      strokeWidth: 2,
      geodesic: false,
      onClick: handlePolygonClick('Linear Triangle'),
    }),
    createPolygonState({
      id: 'geodesic-triangle',
      points,
      fillColor: 'rgba(245, 158, 11, 0.5)',
      strokeColor: '#f59e0b',
      strokeWidth: 2,
      geodesic: true,
      zIndex: 3,
      onClick: handlePolygonClick('Geodesic Triangle'),
    }),
  ], [points]);
  const marker = useMemo(
    () => clickedPolygon
      ? createMarkerState({
          id: `polygon-geodesic-click-${clickedPolygon.sequence}`,
          position: clickedPolygon.position,
          icon: new ColorDefaultIcon(clickedPolygon.markerColor, {
            label: 'P',
            labelTextColor: '#ffffff',
          }),
          animation: MarkerAnimation.Drop,
        })
      : null,
    [clickedPolygon],
  );

  return (
    <MapViewContainer state={mapViewState}>
      {polygons.map(polygon => <Polygon key={polygon.id} state={polygon} />)}
      {marker && (
        <>
          <Marker state={marker} />
          <InfoBubble marker={marker}>
            <div className="bubble-content">{clickedPolygon?.label}</div>
          </InfoBubble>
        </>
      )}
      <ControlPanel title="Polygon Geodesic">
        <p className="control-panel-note">Blue uses straight screen-space edges. Orange uses geodesic interpolation.</p>
      </ControlPanel>
    </MapViewContainer>
  );
}
