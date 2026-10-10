import { OverlayKind, GeoPoint, MapViewHolderBase, Offset, GeoPointInterface, MapDesignTypeInterface, CircleController, AbstractCircleOverlayRenderer, CircleState, CircleEntity, GroundImageController, AbstractGroundImageOverlayRenderer, GroundImageState, GroundImageEntity, AbstractMarkerController, AbstractMarkerOverlayRenderer, MarkerEntity, AddParams, ChangeParams, PolygonController, AbstractPolygonOverlayRenderer, PolygonState, PolygonEntity, PolylineController, AbstractPolylineOverlayRenderer, PolylineState, PolylineEntity, RasterLayerController, RasterLayerOverlayRenderer, RasterLayerState, RasterLayerEntity, BaseMapViewController, MapViewControllerInterface, WebMercatorZoomAltitudeConverter, MapCameraPosition, GeoRectBounds, MutableMapServiceRegistry, MapUISettings, MapViewStateInterface, MapViewStyle, MapViewState } from '@mapconductor/js-sdk-core';
import * as react from 'react';
import { ReactNode } from 'react';

/** 地図に置かれた図形 1 つ。実際の SDK では `maplibregl.Marker` などにあたる。 */
interface TemplateShape {
    readonly id: string;
    readonly kind: OverlayKind;
    points: GeoPoint[];
}
/** 地図 SDK の代役。 */
declare class TemplateMap {
    /** カメラ。実際の SDK では `map.getCenter()` / `getZoom()` にあたる。 */
    center: GeoPoint;
    zoom: number;
    bearingDegrees: number;
    tiltDegrees: number;
    /** ビューポート。実際の SDK では `map.getCanvas()` の大きさ。 */
    sizePx: {
        width: number;
        height: number;
    };
    /** パンできるか。ドラッグ中だけ切る。 */
    dragPanEnabled: boolean;
    readonly shapes: Map<string, TemplateShape>;
    /** SDK 側のイベント。ドライバーはこれをコアの受け口へ転送する（実装点 E）。 */
    onCameraChanged: (() => void) | null;
    onClick: ((offset: Offset) => void) | null;
    add(id: string, kind: OverlayKind, points: GeoPoint[]): TemplateShape;
    remove(id: string): void;
    /**
     * 地理座標 → 画面座標。
     *
     * 代役なので素の Web メルカトルで計算する。**bearing と tilt は無視している**ので、
     * 回転・傾斜させた状態では位置がずれる。だから `declareCapabilities()` で
     * `cameraRotate` / `cameraTilt` を `approximated` として宣言している
     * （`unsupported` ではない）。
     */
    project(position: GeoPointInterface): Offset;
    /** 画面座標 → 地理座標。`project` の逆。 */
    unproject(offset: Offset): GeoPoint;
}
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
declare class TemplateMapViewHolder extends MapViewHolderBase<HTMLElement | null, TemplateMap> {
    readonly mapView: HTMLElement | null;
    readonly map: TemplateMap;
    constructor(mapView: HTMLElement | null, map: TemplateMap);
    toScreenOffset(position: GeoPointInterface): Offset;
    fromScreenOffsetSync(offset: Offset): GeoPoint;
}
/**
 * 実装点 C。SDK のスタイル指定を表す型。
 *
 * `MapDesignTypeInterface` が要求するのは `id` と `getValue()` の 2 つだけ。
 * `getValue()` は「同じ見た目か」の比較に使われるので、**見た目を決める要素を
 * すべて含めた文字列**を返すこと（id だけだと、同じ id で URL 違いのデザインを
 * 切り替えたときに再読み込みが走らない）。
 */
interface TemplateMapDesignType extends MapDesignTypeInterface<string> {
    readonly styleUrl: string;
}
declare class TemplateDesign implements TemplateMapDesignType {
    readonly id: string;
    readonly styleUrl: string;
    constructor(id: string, styleUrl: string);
    getValue(): string;
    static readonly Standard: TemplateDesign;
    static readonly Satellite: TemplateDesign;
}

declare class TemplateCircleRenderer extends AbstractCircleOverlayRenderer<TemplateMapViewHolder, TemplateShape> {
    createCircle(state: CircleState): Promise<TemplateShape | null>;
    updateCircleProperties({ circle, current, }: {
        circle: TemplateShape;
        current: CircleEntity<TemplateShape>;
        prev: CircleEntity<TemplateShape>;
    }): Promise<TemplateShape | null>;
    removeCircle(entity: CircleEntity<TemplateShape>): Promise<void>;
}
/**
 * コントローラは差分も購読も持たない。
 *
 * **`kind` と `resolveTap` はコアの `CircleController` が持っている。**
 * 自前で `OverlayControllerLike` を組む（複数レンダラを束ねる「コンダクタ」を
 * 作る）ときだけ、`implements SlottedOverlayController` を明示して書くこと。
 * TypeScript は構造的型付けなので、書き忘れても型は通ってしまう。
 */
declare class TemplateCircleController extends CircleController<TemplateShape> {
    constructor(renderer: TemplateCircleRenderer);
}
declare class TemplatePolylineRenderer extends AbstractPolylineOverlayRenderer<TemplateMapViewHolder, TemplateShape> {
    createPolyline(state: PolylineState): Promise<TemplateShape | null>;
    updatePolylineProperties({ polyline, current, }: {
        polyline: TemplateShape;
        current: PolylineEntity<TemplateShape>;
        prev: PolylineEntity<TemplateShape>;
    }): Promise<TemplateShape | null>;
    removePolyline(entity: PolylineEntity<TemplateShape>): Promise<void>;
}
declare class TemplatePolylineController extends PolylineController<TemplateShape> {
    constructor(renderer: TemplatePolylineRenderer);
}
declare class TemplatePolygonRenderer extends AbstractPolygonOverlayRenderer<TemplateMapViewHolder, TemplateShape> {
    createPolygon(state: PolygonState): Promise<TemplateShape | null>;
    updatePolygonProperties({ polygon, current, }: {
        polygon: TemplateShape;
        current: PolygonEntity<TemplateShape>;
        prev: PolygonEntity<TemplateShape>;
    }): Promise<TemplateShape | null>;
    removePolygon(entity: PolygonEntity<TemplateShape>): Promise<void>;
}
declare class TemplatePolygonController extends PolygonController<TemplateShape> {
    constructor(renderer: TemplatePolygonRenderer);
}
declare class TemplateGroundImageRenderer extends AbstractGroundImageOverlayRenderer<TemplateMapViewHolder, TemplateShape> {
    createGroundImage(state: GroundImageState): Promise<TemplateShape | null>;
    updateGroundImageProperties({ groundImage, }: {
        groundImage: TemplateShape;
        current: GroundImageEntity<TemplateShape>;
        prev: GroundImageEntity<TemplateShape>;
    }): Promise<TemplateShape | null>;
    removeGroundImage(entity: GroundImageEntity<TemplateShape>): Promise<void>;
}
declare class TemplateGroundImageController extends GroundImageController<TemplateShape> {
    constructor(renderer: TemplateGroundImageRenderer);
}
/**
 * ラスターレイヤだけは抽象基底が無く、インタフェースを直に実装する
 * （GL 系はソースとレイヤをまとめて差し替えるのが最速なので、
 *  per-object の既定を押しつけていない）。
 */
declare class TemplateRasterLayerRenderer implements RasterLayerOverlayRenderer<TemplateShape> {
    readonly holder: TemplateMapViewHolder;
    constructor(holder: TemplateMapViewHolder);
    onAdd(data: {
        state: RasterLayerState;
    }[]): Promise<(TemplateShape | null)[]>;
    onChange(data: {
        current: RasterLayerEntity<TemplateShape>;
    }[]): Promise<(TemplateShape | null)[]>;
    onRemove(data: RasterLayerEntity<TemplateShape>[]): Promise<void>;
    /** カメラが動くたびに呼ばれる。タイルの貼り直しが要る SDK はここで行う。 */
    onCameraChanged(): Promise<void>;
    onPostProcess(): Promise<void>;
}
declare class TemplateRasterLayerController extends RasterLayerController<TemplateShape> {
    constructor(renderer: TemplateRasterLayerRenderer);
}
declare class TemplateMarkerRenderer extends AbstractMarkerOverlayRenderer<TemplateMapViewHolder, TemplateShape> {
    constructor(holder: TemplateMapViewHolder);
    /**
     * ドラッグ中や位置更新でネイティブのマーカーを動かす。
     * 実際の SDK では `marker.setLngLat(...)` にあたる。
     */
    setMarkerPosition(markerEntity: MarkerEntity<TemplateShape>, position: GeoPoint): void;
    /**
     * `bitmapIcon` は**コアが用意した最終的なアイコン**。既定アイコンの合成も
     * ラベル描画も済んでいる。SDK のマーカーに載せるだけでよい。
     */
    onAdd(data: AddParams[]): Promise<(TemplateShape | null)[]>;
    onChange(data: ChangeParams<TemplateShape>[]): Promise<(TemplateShape | null)[]>;
    onRemove(data: MarkerEntity<TemplateShape>[]): Promise<void>;
    /**
     * アニメーションを持たない SDK は空のままでよい。ただし
     * `animateStartListener` / `animateEndListener` を呼ばないなら、
     * その capability を `unsupported` で宣言すること（黙って無反応にしない）。
     */
    onAnimate(_entity: MarkerEntity<TemplateShape>): Promise<void>;
    onPostProcess(): Promise<void>;
}
declare class TemplateMarkerController extends AbstractMarkerController<TemplateShape> {
    constructor(renderer: TemplateMarkerRenderer);
}

/**
 * 実装点 B。
 *
 * ## 書くもの
 *  - `holder`（投影の注入点）
 *  - `readNativeCamera()`（SDK のカメラ → `MapCameraPosition`）
 *  - `moveCamera` / `animateCamera` / `fitBounds`
 *
 * ## 書かないもの
 *  - クリックのカスケード … `dispatchTap(position)` を呼ぶだけ
 *  - Capable ファサードの 22 メソッド … `registerOverlayController` するだけ
 *  - マーカーのドラッグの状態遷移 … `DefaultMarkerEventController`
 */
declare class TemplateMapViewController extends BaseMapViewController implements MapViewControllerInterface {
    readonly map: TemplateMap;
    readonly holder: TemplateMapViewHolder;
    private readonly circleController;
    private readonly polylineController;
    private readonly polygonController;
    private readonly groundImageController;
    private readonly rasterLayerController;
    private readonly markerController;
    /**
     * 統一ズーム（Google 準拠）と SDK の生ズームの相互変換。
     *
     * SDK のズームが Google と同じ体系なら `zoomOffset: 0`。
     * タイル 512px 系（Mapbox など）は `zoomOffset: 1`。
     * **較正値をコアに固定しないこと。**同じ SDK でもプラットフォームで違う値になる。
     */
    readonly zoomConverter: WebMercatorZoomAltitudeConverter;
    constructor(map: TemplateMap);
    private installListeners;
    /**
     * SDK のカメラ → `MapCameraPosition`。**生ズームを統一ズームへ直すのを忘れない。**
     * ここがずれると、当たり判定の許容量が実際の縮尺と食い違い、
     * 「線や円をタップしても反応しない」という形で表面化する。
     */
    readNativeCamera(): MapCameraPosition;
    /** 4 隅を逆投影して可視範囲を組む。ホルダーの投影が唯一の入口。 */
    private buildVisibleRegion;
    moveCamera(position: MapCameraPosition): Promise<boolean>;
    animateCamera(position: MapCameraPosition, _durationMillis: number): Promise<boolean>;
    fitBounds(bounds: GeoRectBounds, _padding: number): Promise<boolean>;
    private apply;
    /**
     * 実装点 H。**`unknown` と `unsupported` を混同しないこと。**
     *
     * 宣言が無い（`unknown`）は「まだ宣言していない」であって「使えない」ではない。
     * `unsupported` にすると**コアが動いている機能を止める**。
     * 別経路で動いているなら `degraded` / `approximated` にすること。
     */
    declareCapabilities(registry: MutableMapServiceRegistry): void;
    applyUISettings(settings: MapUISettings): void;
    clearOverlays(): Promise<void>;
    /** 地図の破棄。登録済みコントローラの後始末はコアがやる。 */
    destroy(): void;
    /** 任意の地点をタップさせるテスト用の入口。 */
    simulateClick(position: GeoPoint): boolean;
}

/**
 * 実装点 G。**残るのは 3 つだけ。**
 *
 *  - `mapDesignType`（プロバイダ固有の型）
 *  - プロバイダ型のホルダー
 *  - `getMapViewHolder()` の絞り込み
 *
 * カメラの保持・`moveCameraTo` の 2 種・`fitBounds`・`attachController`・
 * `uiSettings`・`id` はコアの `MapViewState` が持つ。
 *
 * ## `optimisticCameraUpdate` は web だけ既定 true
 *
 * web の地図エンジンはカメライベントが非同期なので、`moveCamera` の直後に
 * `state.cameraPosition` を読んでも古い値が返らないよう、要求値を先に反映する。
 * android / iOS は push で同期的に返るので false。**ここだけ既定が違う。**
 */
declare class TemplateViewState extends MapViewState<TemplateMapDesignType> {
    private _mapDesignType;
    mapViewHolder: TemplateMapViewHolder | null;
    constructor({ id, mapDesignType, cameraPosition, }?: {
        id?: string;
        mapDesignType?: TemplateMapDesignType;
        cameraPosition?: MapCameraPosition;
    });
    get mapDesignType(): TemplateMapDesignType;
    set mapDesignType(value: TemplateMapDesignType);
}
declare function useTemplateViewState(params?: {
    id?: string;
    mapDesignType?: TemplateMapDesignType;
    cameraPosition?: MapCameraPosition;
}): MapViewStateInterface<TemplateMapDesignType>;
/**
 * アプリ開発者が書くのはこれ。実際のドライバーでは `useEffect` の中で
 * SDK の地図を `container` にマウントする。
 *
 * ```tsx
 * <TemplateMapView state={state}>
 *     <Marker position={point} />
 *     <Polygon state={polygonState} />
 * </TemplateMapView>
 * ```
 */
declare function TemplateMapView({ state, mapStyle, onStyleDiagnostics, children, }: {
    state: MapViewStateInterface<TemplateMapDesignType>;
    /**
     * 実装点。**全プロバイダが同じ名前で受けること。** 何が起きるかはこの
     * バックエンドが宣言した能力で決まる: `VectorStyleSupportKey` も
     * `VectorStyleMutationSupportKey` も宣言していなければ、スタイルは
     * ラスタータイルとして届く。
     *
     * android / iOS では `style`。JS だけ違う理由は `MapViewBaseProps` に。
     */
    mapStyle?: MapViewStyle | null;
    onStyleDiagnostics?: (diagnostics: readonly string[]) => void;
    children?: ReactNode;
}): react.JSX.Element;

export { TemplateCircleController, TemplateCircleRenderer, TemplateDesign, TemplateGroundImageController, TemplateGroundImageRenderer, TemplateMap, type TemplateMapDesignType, TemplateMapView, TemplateMapViewController, TemplateMapViewHolder, TemplateMarkerController, TemplateMarkerRenderer, TemplatePolygonController, TemplatePolygonRenderer, TemplatePolylineController, TemplatePolylineRenderer, TemplateRasterLayerController, TemplateRasterLayerRenderer, type TemplateShape, TemplateViewState, useTemplateViewState };
