import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  createGeoPoint,
  createGeoRectBounds,
  createMarkerState,
  type GeoRectBounds,
  type ImageIcon,
  type MapCameraPosition,
  type MarkerState,
} from '@mapconductor/js-sdk-core';
import { createSpeciesIcons, LABEL_OUTLINE_PX, labelledIcon, labelSize } from './treeIcons';
import { chooseLabels, type LabelSide } from './streetTreeLabels';
import type { StreetTree, StreetTreeDataSource } from './streetTreeData';

/** これより寄ったら樹種名を付ける。 */
export const LABEL_MIN_ZOOM = 16;

/** 点の大きさ（CSS px）。 */
const DOT_SIZE = 10;

/** zoom > 15 の iconScaleCallback と同じ値。ラベルの重なりはこの大きさで測る。 */
export const LABEL_ICON_SCALE = 1.4;

/**
 * 見えている範囲が分からないときに使う、中心から上下左右 `AROUND_CENTER_PX` の箱。
 * web の地図は開いた直後のカメラに見えている範囲を持たないことがある。画面より広めに
 * 取っても、画面の外の木にラベルが付くだけで害は無い。
 */
const AROUND_CENTER_PX = 1024;

function aroundCenter(camera: MapCameraPosition): GeoRectBounds {
  const world = 256 * 2 ** camera.zoom;
  const { latitude, longitude } = camera.position;
  const x = ((longitude + 180) / 360) * world;
  const phi = (latitude * Math.PI) / 180;
  const y = ((1 - Math.log(Math.tan(phi) + 1 / Math.cos(phi)) / Math.PI) / 2) * world;
  const lng = (px: number) => (px / world) * 360 - 180;
  const lat = (py: number) => (Math.atan(Math.sinh(Math.PI * (1 - (2 * py) / world))) * 180) / Math.PI;
  return createGeoRectBounds({
    southWest: createGeoPoint({ latitude: lat(y + AROUND_CENTER_PX), longitude: lng(x - AROUND_CENTER_PX) }),
    northEast: createGeoPoint({ latitude: lat(y - AROUND_CENTER_PX), longitude: lng(x + AROUND_CENTER_PX) }),
  });
}

interface StreetTreeMarkerResult {
  error: string | null;
  markerStates: MarkerState[];
  trees: StreetTree[] | null;
  species: string[] | null;
  isLoading: boolean;
  /** カメラが止まったら呼ぶ。見えている木に樹種名を付け直す。 */
  relabel: (camera: MapCameraPosition) => void;
}

export function useStreetTreeMarkers(
  dataSource: StreetTreeDataSource,
  onMarkerClick: (marker: MarkerState) => void,
  /** 開いた直後の位置。web の地図は開いたときにカメラの停止を知らせないことがある。 */
  currentCamera?: () => MapCameraPosition | null,
): StreetTreeMarkerResult {
  const [trees, setTrees] = useState<StreetTree[] | null>(null);
  const [species, setSpecies] = useState<string[] | null>(null);
  const [icons, setIcons] = useState<ImageIcon[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    dataSource.load().then(data => {
      if (!active) return;
      setTrees(data.trees);
      setSpecies(data.species);
      setIcons(createSpeciesIcons(data.species.length, DOT_SIZE));
    }).catch(reason => {
      if (active) setError(String(reason));
    });
    return () => { active = false; };
  }, [dataSource]);

  const markerStates = useMemo(
    () => (trees ?? []).map((tree, index) =>
      createMarkerState({
        id: String(index),
        position: createGeoPoint({ latitude: tree.latitude, longitude: tree.longitude }),
        extra: tree,
        icon: icons?.[tree.speciesIndex] ?? null,
        onClick: onMarkerClick,
      })),
    [icons, onMarkerClick, trees],
  );

  // 付けているラベル（木の添字 -> 向き）と、道路ごとの前回の向き。
  const labelled = useRef(new Map<number, LabelSide>());
  const roadSides = useRef(new Map<string, LabelSide>());
  const labelIcons = useRef(new Map<string, ImageIcon>());
  // カメラは木を読み終える前に止まる。そのときの位置を覚えておき、読み終えたら付ける。
  const lastCamera = useRef<MapCameraPosition | null>(null);

  /**
   * 見えている木のうち、どれにどちら向きのラベルを付けるかを決め直し、変わった木だけ
   * アイコンを差し替える（`MarkerState.icon` をその場で書き換える）。android-sdk の
   * `StreetTreeViewModel.onCameraMoveEnd` と同じ。
   */
  const relabel = useCallback((camera: MapCameraPosition) => {
    lastCamera.current = camera;
    if (!trees || !icons || markerStates.length !== trees.length) return;
    let sides = new Map<number, LabelSide>();
    if (camera.zoom >= LABEL_MIN_ZOOM) {
      const bounds = camera.visibleRegion?.bounds ?? aroundCenter(camera);
      sides = chooseLabels({
        trees,
        bounds,
        zoom: camera.zoom,
        scale: LABEL_ICON_SCALE,
        dotSize: DOT_SIZE,
        gap: LABEL_OUTLINE_PX,
        labelSize,
        previousSides: roadSides.current,
      });
      for (const [index, side] of sides) roadSides.current.set(trees[index].roadName, side);
    }
    for (const index of labelled.current.keys()) {
      if (!sides.has(index)) markerStates[index].icon = icons[trees[index].speciesIndex];
    }
    for (const [index, side] of sides) {
      if (labelled.current.get(index) === side) continue;
      const tree = trees[index];
      const key = `${tree.speciesIndex}/${side}`;
      let icon = labelIcons.current.get(key);
      if (!icon) {
        icon = labelledIcon(icons[tree.speciesIndex], tree.species, side);
        labelIcons.current.set(key, icon);
      }
      markerStates[index].icon = icon;
    }
    labelled.current = sides;
  }, [icons, markerStates, trees]);

  useEffect(() => {
    labelled.current = new Map();
    labelIcons.current = new Map();
    const camera = lastCamera.current ?? currentCamera?.();
    if (camera) relabel(camera);
  }, [relabel, currentCamera]);

  return { error, markerStates, trees, species, isLoading: trees === null && error === null, relabel };
}
