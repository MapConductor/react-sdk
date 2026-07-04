import { useNavigate } from "react-router-dom";

export interface CameraState {
  lat: number;
  lng: number;
  zoom: number;
  bearing?: number;
  pitch?: number;
}

export interface InitialCamera {
  lat: number;
  lng: number;
  zoom: number;
  bearing?: number;
  pitch?: number;
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
  if (camera.pitch !== undefined) {
    params.set('pitch', camera.pitch.toFixed(2));
  }
  navigate({ search: `?${params.toString()}` }, { replace: true });
}
