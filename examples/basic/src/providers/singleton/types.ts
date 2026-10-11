import type { CameraRestriction, GeoPoint, MapCameraPosition, MapViewStyle } from '@mapconductor/js-sdk-core';
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
  /**
   * ページが指定する地図の見た目そのもの（ベクタースタイル）。
   *
   * 共有インスタンスなので、カメラ制限と同じ理由でここを通す。スタイルを
   * 自分で読めるバックエンド（MapLibre / Mapbox / MapTiler）はドキュメントを
   * 受け取り、読めないバックエンドは「ラスタライザが無い」と diagnostics で
   * 返す。**全プロバイダに渡す**こと: 一部だけ配線すると「型は通るが何も
   * 起きない prop」になる。
   */
  mapStyle?: MapViewStyle | null;
  onStyleDiagnostics?: (diagnostics: readonly string[]) => void;
}
