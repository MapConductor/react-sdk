import type { GeoRectBounds } from '@mapconductor/js-sdk-core';
import type { StreetTree } from './streetTreeData';

/** 点のどちら側にラベルを描くか。 */
export type LabelSide = 'right' | 'left' | 'top' | 'bottom';

/** 点の上下に置くラベルは縦書きにする。横の通りでは点が横に詰まって並ぶので、横書きだと数本に 1 つしか名前を付けられない。 */
export function isVerticalSide(side: LabelSide): boolean {
  return side === 'top' || side === 'bottom';
}

interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

function overlaps(a: Rect, b: Rect): boolean {
  return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
}

/** 置いたラベルの箱。64px のマス目に振り分けて、近くだけを見る。 */
class PlacedRects {
  private static readonly CELL = 64;
  private readonly cells = new Map<string, Rect[]>();

  private keysOf(r: Rect): string[] {
    const keys: string[] = [];
    const cell = PlacedRects.CELL;
    for (let cx = Math.floor(r.left / cell); cx <= Math.floor(r.right / cell); cx++) {
      for (let cy = Math.floor(r.top / cell); cy <= Math.floor(r.bottom / cell); cy++) keys.push(`${cx},${cy}`);
    }
    return keys;
  }

  overlaps(r: Rect): boolean {
    return this.keysOf(r).some(key => this.cells.get(key)?.some(other => overlaps(other, r)) === true);
  }

  add(r: Rect): void {
    for (const key of this.keysOf(r)) {
      const list = this.cells.get(key);
      if (list) list.push(r);
      else this.cells.set(key, [r]);
    }
  }
}

export interface ChooseLabelsParams {
  trees: readonly StreetTree[];
  bounds: GeoRectBounds;
  zoom: number;
  /** ラベルのアイコンに掛かる倍率（タイルの iconScaleCallback と同じ値）。 */
  scale: number;
  dotSize: number;
  /** 点とラベルのすき間（SDK の配置と同じ値）。 */
  gap: number;
  labelSize: (text: string, vertical: boolean) => { width: number; height: number };
  /** 前回の道路名 -> 向き。 */
  previousSides?: ReadonlyMap<string, LabelSide>;
}

/**
 * 画面内の街路樹のうち、どれにどちら向きのラベルを付けるか。android-sdk の
 * `StreetTreeLabels`、ios-sdk の `StreetTreeLabels` と同じ規則。
 *
 * - 向きは**道路ごとに 1 つ**。道路の木の並びが横向きなら上か下、縦向きなら右か左
 *   （道路に直交する向き）。同じ通りのラベルが揃って並ぶ。
 * - 2 つの候補のうち、置けるラベルが多い方を選ぶ。木の多い道路から決める。
 *   ただし前回その道路で選んだ向き（`previousSides`）は、もう一方の 2/3 以上置けるなら
 *   そのまま使う。見えている範囲が変わるたびに数の多い方へ乗り換えると、パンするたびに
 *   ラベルが上下や左右で入れ替わる。
 * - すでに置いたラベルか、ほかの木の点の中心を覆うラベルは付けない（その木は点のまま）。
 *   ラベルは点の後に描かれるので、端が隣の点に少しかかるのは許す。
 * - 上下に置くラベルは縦書き（`isVerticalSide`）なので、縦書きの寸法で測る。
 *
 * 座標はカメラのズームでの CSS px。返り値は `trees` の添字 -> 向き。
 */
export function chooseLabels(params: ChooseLabelsParams): Map<number, LabelSide> {
  const { trees, bounds, zoom, scale, dotSize, gap: gapPx, labelSize, previousSides } = params;
  const southWest = bounds.southWest;
  const northEast = bounds.northEast;
  const sides = new Map<number, LabelSide>();
  if (!southWest || !northEast) return sides;
  const world = 256 * 2 ** zoom;
  const x = (longitude: number) => ((longitude + 180) / 360) * world;
  const y = (latitude: number) => {
    const phi = (latitude * Math.PI) / 180;
    return ((1 - Math.log(Math.tan(phi) + 1 / Math.cos(phi)) / Math.PI) / 2) * world;
  };

  // 道路ごとの、画面内の木
  const byRoad = new Map<string, number[]>();
  trees.forEach((tree, index) => {
    if (tree.latitude < southWest.latitude || tree.latitude > northEast.latitude) return;
    if (tree.longitude < southWest.longitude || tree.longitude > northEast.longitude) return;
    const members = byRoad.get(tree.roadName);
    if (members) members.push(index);
    else byRoad.set(tree.roadName, [index]);
  });

  const placed = new PlacedRects();
  const radius = (dotSize * scale) / 2;
  const gap = gapPx * scale;

  // 画面内のすべての点の中心。ラベルがほかの木の点の中心を覆わないかを見る
  const dots = new PlacedRects();
  for (const members of byRoad.values()) {
    for (const index of members) {
      const cx = x(trees[index].longitude);
      const cy = y(trees[index].latitude);
      dots.add({ left: cx - 0.5, top: cy - 0.5, right: cx + 0.5, bottom: cy + 0.5 });
    }
  }

  const roads = [...byRoad.entries()].sort((a, b) => b[1].length - a[1].length);
  for (const [road, members] of roads) {
    const xs = members.map(index => x(trees[index].longitude));
    const ys = members.map(index => y(trees[index].latitude));

    // 並びの向き（主成分）
    const mx = xs.reduce((sum, v) => sum + v, 0) / xs.length;
    const my = ys.reduce((sum, v) => sum + v, 0) / ys.length;
    let sxx = 0;
    let syy = 0;
    let sxy = 0;
    for (let i = 0; i < xs.length; i++) {
      const dx = xs[i] - mx;
      const dy = ys[i] - my;
      sxx += dx * dx;
      syy += dy * dy;
      sxy += dx * dy;
    }
    const angle = 0.5 * Math.atan2(2 * sxy, sxx - syy);
    const horizontal = Math.abs(Math.cos(angle)) >= Math.abs(Math.sin(angle));
    const candidates: LabelSide[] = horizontal ? ['top', 'bottom'] : ['right', 'left'];

    // 道路に沿って並べてから置いていく
    const order = xs.map((_, i) => i)
      .sort((a, b) => (xs[a] * Math.cos(angle) + ys[a] * Math.sin(angle)) - (xs[b] * Math.cos(angle) + ys[b] * Math.sin(angle)));

    const rect = (i: number, side: LabelSide): Rect => {
      const size = labelSize(trees[members[i]].species, isVerticalSide(side));
      const w = size.width * scale;
      const h = size.height * scale;
      const cx = xs[i];
      const cy = ys[i];
      switch (side) {
        case 'right': return { left: cx + radius + gap, top: cy - h / 2, right: cx + radius + gap + w, bottom: cy + h / 2 };
        case 'left': return { left: cx - radius - gap - w, top: cy - h / 2, right: cx - radius - gap, bottom: cy + h / 2 };
        case 'top': return { left: cx - w / 2, top: cy - radius - gap - h, right: cx + w / 2, bottom: cy - radius - gap };
        case 'bottom': return { left: cx - w / 2, top: cy + radius + gap, right: cx + w / 2, bottom: cy + radius + gap + h };
      }
    };

    const attempt = (side: LabelSide): Array<[number, Rect]> => {
      const own = new PlacedRects();
      const accepted: Array<[number, Rect]> = [];
      for (const i of order) {
        const r = rect(i, side);
        if (placed.overlaps(r) || own.overlaps(r) || dots.overlaps(r)) continue;
        own.add(r);
        accepted.push([i, r]);
      }
      return accepted;
    };

    const attempts = candidates.map(side => [side, attempt(side)] as const);
    const most = attempts.reduce((a, b) => (b[1].length > a[1].length ? b : a));
    const kept = attempts.find(([side]) => side === previousSides?.get(road));
    const best = kept && kept[1].length * 3 >= most[1].length * 2 ? kept : most;
    for (const [i, r] of best[1]) {
      placed.add(r);
      sides.set(members[i], best[0]);
    }
  }
  return sides;
}
