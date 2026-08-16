import {
    BaseMapViewController,
    buildVisibleRegion,
    createGeoPoint,
    createMapCameraPosition,
    MapCapabilityStatus,
    WebMercatorZoomAltitudeConverter,
    type GeoPoint,
    type GeoRectBounds,
    type MapCameraPosition,
    type MapUISettings,
    type MapViewControllerInterface,
    type MutableMapServiceRegistry,
} from '@mapconductor/js-sdk-core';
import { TemplateMap, TemplateMapViewHolder } from './TemplateMap';
import {
    TemplateCircleController,
    TemplateCircleRenderer,
    TemplateGroundImageController,
    TemplateGroundImageRenderer,
    TemplateMarkerController,
    TemplateMarkerRenderer,
    TemplatePolygonController,
    TemplatePolygonRenderer,
    TemplatePolylineController,
    TemplatePolylineRenderer,
    TemplateRasterLayerController,
    TemplateRasterLayerRenderer,
} from './TemplateOverlays';

// ============================================================================
// B. コントローラ + E. イベント転送 + H. capability
// ============================================================================

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
export class TemplateMapViewController extends BaseMapViewController implements MapViewControllerInterface {
    readonly holder: TemplateMapViewHolder;

    private readonly circleController: TemplateCircleController;
    private readonly polylineController: TemplatePolylineController;
    private readonly polygonController: TemplatePolygonController;
    private readonly groundImageController: TemplateGroundImageController;
    private readonly rasterLayerController: TemplateRasterLayerController;
    private readonly markerController: TemplateMarkerController;

    /**
     * 統一ズーム（Google 準拠）と SDK の生ズームの相互変換。
     *
     * SDK のズームが Google と同じ体系なら `zoomOffset: 0`。
     * タイル 512px 系（Mapbox など）は `zoomOffset: 1`。
     * **較正値をコアに固定しないこと。**同じ SDK でもプラットフォームで違う値になる。
     */
    readonly zoomConverter = new WebMercatorZoomAltitudeConverter(undefined, 0);

    constructor(readonly map: TemplateMap) {
        super();
        this.holder = new TemplateMapViewHolder(null, map);

        this.circleController = new TemplateCircleController(new TemplateCircleRenderer(this.holder));
        this.polylineController = new TemplatePolylineController(new TemplatePolylineRenderer(this.holder));
        this.polygonController = new TemplatePolygonController(new TemplatePolygonRenderer(this.holder));
        this.groundImageController = new TemplateGroundImageController(
            new TemplateGroundImageRenderer(this.holder),
        );
        this.rasterLayerController = new TemplateRasterLayerController(
            new TemplateRasterLayerRenderer(this.holder),
        );
        this.markerController = new TemplateMarkerController(new TemplateMarkerRenderer(this.holder));

        // ★★ 忘れるとすべてが黙って効かなくなる ★★
        // compositionXxx / hasXxx / クリックカスケードは、ここに登録されたものしか見ない。
        // 移行時に調べたところ、**13 プロバイダのどれ 1 つとして呼んでいなかった**。
        // MapDriverConformance.checkOverlaySlots() で機械的に捕まえられる。
        this.registerOverlayController(this.markerController);
        this.registerOverlayController(this.circleController);
        this.registerOverlayController(this.groundImageController);
        this.registerOverlayController(this.polylineController);
        this.registerOverlayController(this.polygonController);
        this.registerOverlayController(this.rasterLayerController);

        this.installListeners();
    }

    // -- E. SDK イベントの転送（各 1 行） ---------------------------------------

    private installListeners(): void {
        this.map.onCameraChanged = () => {
            const position = this.readNativeCamera();
            this.notifyCameraMove(position);
            this.notifyCameraMoveEnd(position);
        };
        // タップ 1 か所ぶんの配線。**カスケードは書かない。**
        // 正準の順（marker → circle → groundImage → polyline → polygon → map）は
        // BaseMapViewController.dispatchTap が持っている。
        this.map.onClick = (offset) => {
            this.dispatchTap(this.holder.fromScreenOffsetSync(offset));
        };
    }

    // -- B. カメラ ---------------------------------------------------------------

    /**
     * SDK のカメラ → `MapCameraPosition`。**生ズームを統一ズームへ直すのを忘れない。**
     * ここがずれると、当たり判定の許容量が実際の縮尺と食い違い、
     * 「線や円をタップしても反応しない」という形で表面化する。
     */
    readNativeCamera(): MapCameraPosition {
        return createMapCameraPosition({
            position: this.map.center,
            zoom: this.zoomConverter.toUnifiedZoom(this.map.zoom, this.map.center.latitude),
            bearing: this.map.bearingDegrees,
            tilt: this.map.tiltDegrees,
            visibleRegion: this.buildVisibleRegion(),
        });
    }

    /** 4 隅を逆投影して可視範囲を組む。ホルダーの投影が唯一の入口。 */
    private buildVisibleRegion(): MapCameraPosition['visibleRegion'] {
        // 隅の割り当ても bounds の組み立てもコアの buildVisibleRegion が持つ。
        // ここに自前で書くと、隅を取り違えても何も落ちない（4 点とも埋まるので
        // bounds は正しく見える）。実際 ios-for-mapbox で入れ替わっていた。
        return buildVisibleRegion(this.holder, this.map.sizePx);
    }

    async moveCamera(position: MapCameraPosition): Promise<boolean> {
        this.apply(position);
        this.map.onCameraChanged?.();
        return true;
    }

    async animateCamera(position: MapCameraPosition, _durationMillis: number): Promise<boolean> {
        // アニメーション API を持たない SDK は即時反映でよい。
        // その場合は該当 capability を degraded で宣言すること。
        this.notifyCameraMoveStart(this.readNativeCamera());
        this.apply(position);
        this.map.onCameraChanged?.();
        return true;
    }

    async fitBounds(bounds: GeoRectBounds, _padding: number): Promise<boolean> {
        const center = bounds.center;
        if (!center) return false;
        this.map.center = createGeoPoint(center);
        this.map.onCameraChanged?.();
        return true;
    }

    private apply(position: MapCameraPosition): void {
        this.map.center = createGeoPoint(position.center);
        this.map.zoom = this.zoomConverter.toNativeZoom(position.zoom ?? 0, position.center.latitude);
        this.map.bearingDegrees = position.bearing ?? 0;
        this.map.tiltDegrees = position.tilt ?? 0;
    }

    // -- H. capability の宣言 -----------------------------------------------------

    /**
     * 実装点 H。**`unknown` と `unsupported` を混同しないこと。**
     *
     * 宣言が無い（`unknown`）は「まだ宣言していない」であって「使えない」ではない。
     * `unsupported` にすると**コアが動いている機能を止める**。
     * 別経路で動いているなら `degraded` / `approximated` にすること。
     */
    declareCapabilities(registry: MutableMapServiceRegistry): void {
        // 代役の投影は bearing / tilt を見ていないので、回転・傾斜させるとずれる。
        // 「動くが正確ではない」= approximated。unsupported ではない。
        registry.declare('cameraRotate', MapCapabilityStatus.approximated('投影が bearing を見ていない'));
        registry.declare('cameraTilt', MapCapabilityStatus.approximated('投影が tilt を見ていない'));
        // 動かないものだけ unsupported にする。**理由を必ず書く**
        // （書かないと診断ログがアプリ開発者に何も伝えない）。
        registry.declare(
            'markerDrag',
            MapCapabilityStatus.unsupported('代役の SDK はネイティブのマーカー引き当てを持たない'),
        );
    }

    // -- F. ドラッグ中のパン抑止 ---------------------------------------------------

    applyUISettings(settings: MapUISettings): void {
        this.map.dragPanEnabled = settings.scrollGesture !== false;
    }

    async clearOverlays(): Promise<void> {
        await this.markerController.clear();
        await this.circleController.clear();
        await this.polylineController.clear();
        await this.polygonController.clear();
        await this.groundImageController.clear();
        await this.rasterLayerController.clear();
    }

    /** 地図の破棄。登録済みコントローラの後始末はコアがやる。 */
    override destroy(): void {
        this.map.onCameraChanged = null;
        this.map.onClick = null;
        super.destroy();
    }

    /** 任意の地点をタップさせるテスト用の入口。 */
    simulateClick(position: GeoPoint): boolean {
        return this.dispatchTap(position);
    }
}
