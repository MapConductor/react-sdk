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
