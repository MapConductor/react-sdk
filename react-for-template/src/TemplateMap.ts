import {
    createGeoPoint,
    MapViewHolderBase,
    type GeoPoint,
    type GeoPointInterface,
    type MapDesignTypeInterface,
    type Offset,
    type OverlayKind,
} from '@mapconductor/js-sdk-core';

// ============================================================================
// A. あなたが使う地図 SDK の代役
// ============================================================================
//
// ここだけを実際の SDK に置き換える。まわり（ホルダー・コントローラ・レンダラ）の
// **形はそのまま**使える。
//
// 代役なので描画はしない。カメラと投影と「置かれた図形」を覚えるだけ。
// それでも投影の往復・カメラの往復・オーバーレイの追加削除は本物と同じ手順で
// 動くので、適合スイートは意味のあるチェックになる。

/** 地図に置かれた図形 1 つ。実際の SDK では `maplibregl.Marker` などにあたる。 */
export interface TemplateShape {
    readonly id: string;
    readonly kind: OverlayKind;
    points: GeoPoint[];
}

const TILE_SIZE = 256;

/** 地図 SDK の代役。 */
export class TemplateMap {
    /** カメラ。実際の SDK では `map.getCenter()` / `getZoom()` にあたる。 */
    center: GeoPoint = createGeoPoint({ latitude: 0, longitude: 0 });
    zoom = 2;
    bearingDegrees = 0;
    tiltDegrees = 0;

    /** ビューポート。実際の SDK では `map.getCanvas()` の大きさ。 */
    sizePx: { width: number; height: number } = { width: 800, height: 600 };

    /** パンできるか。ドラッグ中だけ切る。 */
    dragPanEnabled = true;

    readonly shapes = new Map<string, TemplateShape>();

    /** SDK 側のイベント。ドライバーはこれをコアの受け口へ転送する（実装点 E）。 */
    onCameraChanged: (() => void) | null = null;
    onClick: ((offset: Offset) => void) | null = null;

    add(id: string, kind: OverlayKind, points: GeoPoint[]): TemplateShape {
        const shape: TemplateShape = { id, kind, points };
        this.shapes.set(id, shape);
        return shape;
    }

    remove(id: string): void {
        this.shapes.delete(id);
    }

    // -- 投影（実装点 A の本体） ------------------------------------------------

    /**
     * 地理座標 → 画面座標。
     *
     * 代役なので素の Web メルカトルで計算する。**bearing と tilt は無視している**ので、
     * 回転・傾斜させた状態では位置がずれる。だから `declareCapabilities()` で
     * `cameraRotate` / `cameraTilt` を `approximated` として宣言している
     * （`unsupported` ではない）。
     */
    project(position: GeoPointInterface): Offset {
        const world = worldPoint(position.latitude, position.longitude, this.zoom);
        const origin = worldPoint(this.center.latitude, this.center.longitude, this.zoom);
        return {
            x: world.x - origin.x + this.sizePx.width / 2,
            y: world.y - origin.y + this.sizePx.height / 2,
        };
    }

    /** 画面座標 → 地理座標。`project` の逆。 */
    unproject(offset: Offset): GeoPoint {
        const origin = worldPoint(this.center.latitude, this.center.longitude, this.zoom);
        return geoPointFromWorld(
            origin.x + offset.x - this.sizePx.width / 2,
            origin.y + offset.y - this.sizePx.height / 2,
            this.zoom,
        );
    }
}

function worldSize(zoom: number): number {
    return TILE_SIZE * Math.pow(2, zoom);
}

function worldPoint(latitude: number, longitude: number, zoom: number): Offset {
    const size = worldSize(zoom);
    // 極は Web メルカトルで無限大になるのでクランプする。地図 SDK はどれも同じことをしている。
    const clamped = Math.min(Math.max(latitude, -85.05112878), 85.05112878);
    const rad = (clamped * Math.PI) / 180;
    return {
        x: ((longitude + 180) / 360) * size,
        y: ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * size,
    };
}

function geoPointFromWorld(x: number, y: number, zoom: number): GeoPoint {
    const size = worldSize(zoom);
    const longitude = (x / size) * 360 - 180;
    const n = Math.PI - (2 * Math.PI * y) / size;
    const latitude = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
    return createGeoPoint({ latitude, longitude });
}

// ============================================================================
// A. ホルダー — 投影の唯一の注入点
// ============================================================================

/**
 * 実装点 A。**投影をここ以外に書かないこと。**
 *
 * コアの InfoBubble・タイル方式マーカーの当たり判定・マーカーアニメ・
 * `buildVisibleRegion` は、すべてここを通して画面座標を得る。
 *
 * 同期変換が用意できない SDK（WebView ブリッジなど）は `fromScreenOffsetSync` を
 * 実装せず、`fromScreenOffset` の async だけ実装する。コアは同期変換の有無を見て
 * 経路を変える（`ScreenProjectionRequirement`）。**同期を必須にしない。**
 */
export class TemplateMapViewHolder extends MapViewHolderBase<HTMLElement | null, TemplateMap> {
    constructor(
        readonly mapView: HTMLElement | null,
        readonly map: TemplateMap,
    ) {
        super();
    }

    toScreenOffset(position: GeoPointInterface): Offset {
        return this.map.project(position);
    }

    override fromScreenOffsetSync(offset: Offset): GeoPoint {
        return this.map.unproject(offset);
    }
}

// ============================================================================
// C. 地図デザイン型
// ============================================================================

/**
 * 実装点 C。SDK のスタイル指定を表す型。
 *
 * `MapDesignTypeInterface` が要求するのは `id` と `getValue()` の 2 つだけ。
 * `getValue()` は「同じ見た目か」の比較に使われるので、**見た目を決める要素を
 * すべて含めた文字列**を返すこと（id だけだと、同じ id で URL 違いのデザインを
 * 切り替えたときに再読み込みが走らない）。
 */
export interface TemplateMapDesignType extends MapDesignTypeInterface<string> {
    readonly styleUrl: string;
}

export class TemplateDesign implements TemplateMapDesignType {
    constructor(
        readonly id: string,
        readonly styleUrl: string,
    ) {}

    getValue(): string {
        return `mapDesign_id=${this.id},style=${this.styleUrl}`;
    }

    static readonly Standard = new TemplateDesign('standard', 'https://example.invalid/standard.json');
    static readonly Satellite = new TemplateDesign('satellite', 'https://example.invalid/satellite.json');
}
