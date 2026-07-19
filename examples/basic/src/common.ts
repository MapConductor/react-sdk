import { useNavigate } from "react-router-dom";

export interface CameraState {
  lat: number;
  lng: number;
  zoom: number;
  bearing?: number;
  tilt?: number;
}

export interface InitialCamera {
  lat: number;
  lng: number;
  zoom: number;
  bearing?: number;
  tilt?: number;
}

export const DEFAULT_CAMERA: InitialCamera = { lat: 21.3069, lng: -157.8583, zoom: 10 };

// Update URL with camera state
export function updateCameraInURL(
  camera: CameraState,
  navigate: ReturnType<typeof useNavigate>
) {
  const params = new URLSearchParams(window.location.search);
  params.set('lat', camera.lat.toFixed(6));
  params.set('lng', camera.lng.toFixed(6));
  params.set('zoom', camera.zoom.toFixed(2));
  if (camera.bearing !== undefined) {
    params.set('bearing', camera.bearing.toFixed(2));
  }
  if (camera.tilt !== undefined) {
    params.set('tilt', camera.tilt.toFixed(2));
  }
  navigate({ search: `?${params.toString()}` }, { replace: true });
}
