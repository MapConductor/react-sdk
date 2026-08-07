import type { CameraRestriction, GeoPoint, MapCameraPosition } from '@mapconductor/js-sdk-core';
import type { ReactNode } from 'react';

export interface SingletonMapContent {
  owner: string;
  children?: ReactNode;
  onMapClick?: (point: GeoPoint) => void;
  onCameraMoveStart?: (camera: MapCameraPosition) => void;
  onCameraMove?: (camera: MapCameraPosition) => void;
  onCameraMoveEnd?: (camera: MapCameraPosition) => void;
  /**
   * ページごとのカメラ可動範囲制限。
   *
   * 以前は「マップ生成時にしか反映されない」ため共有インスタンスでは扱えず、
   * これが要るページだけ専用インスタンスに逃がしていた。core の
   * `setCameraRestriction` で実行時に変更できるようになったので、共有インスタンスの
   * ままページごとに差し替えられる。
   */
  cameraRestriction?: CameraRestriction | null;
}
