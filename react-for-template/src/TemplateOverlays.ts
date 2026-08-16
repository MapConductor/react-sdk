import {
    AbstractCircleOverlayRenderer,
    AbstractGroundImageOverlayRenderer,
    AbstractMarkerController,
    AbstractPolygonOverlayRenderer,
    AbstractPolylineOverlayRenderer,
    AbstractMarkerOverlayRenderer,
    CircleController,
    CircleManager,
    createGeoPoint,
    GroundImageController,
    GroundImageManager,
    MarkerManager,
    PolygonController,
    PolygonManager,
    PolylineController,
    PolylineManager,
    RasterLayerController,
    RasterLayerManager,
    type CircleEntity,
    type CircleState,
    type GroundImageEntity,
    type GroundImageState,
    type AddParams,
    type ChangeParams,
    type GeoPoint,
    type MarkerEntity,
    type PolygonEntity,
    type PolygonState,
    type PolylineEntity,
    type PolylineState,
    type RasterLayerEntity,
    type RasterLayerOverlayRenderer,
    type RasterLayerState,
} from '@mapconductor/js-sdk-core';
import { TemplateMapViewHolder, type TemplateShape } from './TemplateMap';

// ============================================================================
// D. レンダラ 6 種 × onAdd / onChange / onRemove（実装点 25）
// ============================================================================
//
// **ここがドライバーの本体。**「MapConductor の状態」→「SDK のオブジェクト」の
// 翻訳だけを書く。差分計算・購読・順序・重複排除はすべてコアが済ませてある。
//
// **当たり判定は書かない。**コアの Manager が持っている（測地線ポリゴンの巻き数
// 判定、穴の除外、球面距離、線分への近接）。書くと二重になってずれる。

// -- 円 ----------------------------------------------------------------------

export class TemplateCircleRenderer extends AbstractCircleOverlayRenderer<
    TemplateMapViewHolder,
    TemplateShape
> {
    async createCircle(state: CircleState): Promise<TemplateShape | null> {
        // 円の輪郭が要る SDK は、コアの `circleToRing` を使うこと（測地線・
        // ±180 分割・リングの閉じ方まで面倒を見てくれる）。
        return this.holder.map.add(state.id, 'circle', [createGeoPoint(state.center)]);
    }

    async updateCircleProperties({
        circle,
        current,
    }: {
        circle: TemplateShape;
        current: CircleEntity<TemplateShape>;
        prev: CircleEntity<TemplateShape>;
    }): Promise<TemplateShape | null> {
        circle.points = [createGeoPoint(current.state.center)];
        return circle;
    }

    async removeCircle(entity: CircleEntity<TemplateShape>): Promise<void> {
        this.holder.map.remove(entity.state.id);
    }
}

/**
 * コントローラは差分も購読も持たない。
 *
 * **`kind` と `resolveTap` はコアの `CircleController` が持っている。**
 * 自前で `OverlayControllerLike` を組む（複数レンダラを束ねる「コンダクタ」を
 * 作る）ときだけ、`implements SlottedOverlayController` を明示して書くこと。
 * TypeScript は構造的型付けなので、書き忘れても型は通ってしまう。
 */
export class TemplateCircleController extends CircleController<TemplateShape> {
    constructor(renderer: TemplateCircleRenderer) {
        super({ circleManager: new CircleManager<TemplateShape>(), renderer });
    }
}

// -- ポリライン ---------------------------------------------------------------

export class TemplatePolylineRenderer extends AbstractPolylineOverlayRenderer<
    TemplateMapViewHolder,
    TemplateShape
> {
    async createPolyline(state: PolylineState): Promise<TemplateShape | null> {
        return this.holder.map.add(state.id, 'polyline', state.points.map(createGeoPoint));
    }

    async updatePolylineProperties({
        polyline,
        current,
    }: {
        polyline: TemplateShape;
        current: PolylineEntity<TemplateShape>;
        prev: PolylineEntity<TemplateShape>;
    }): Promise<TemplateShape | null> {
        polyline.points = current.state.points.map(createGeoPoint);
        return polyline;
    }

    async removePolyline(entity: PolylineEntity<TemplateShape>): Promise<void> {
        this.holder.map.remove(entity.state.id);
    }
}

export class TemplatePolylineController extends PolylineController<TemplateShape> {
    constructor(renderer: TemplatePolylineRenderer) {
        super({ polylineManager: new PolylineManager<TemplateShape>(), renderer });
    }
}

// -- ポリゴン -----------------------------------------------------------------

export class TemplatePolygonRenderer extends AbstractPolygonOverlayRenderer<
    TemplateMapViewHolder,
    TemplateShape
> {
    async createPolygon(state: PolygonState): Promise<TemplateShape | null> {
        // 穴（`state.holes`）を持てない SDK は、
        //  - 穴を無視する            → capability を `degraded` で宣言する
        //  - 外周を分割して穴を避ける → capability を `approximated` で宣言する
        // どちらでもよいが、**黙って無視しない**こと。
        return this.holder.map.add(state.id, 'polygon', state.points.map(createGeoPoint));
    }

    async updatePolygonProperties({
        polygon,
        current,
    }: {
        polygon: TemplateShape;
        current: PolygonEntity<TemplateShape>;
        prev: PolygonEntity<TemplateShape>;
    }): Promise<TemplateShape | null> {
        polygon.points = current.state.points.map(createGeoPoint);
        return polygon;
    }

    async removePolygon(entity: PolygonEntity<TemplateShape>): Promise<void> {
        this.holder.map.remove(entity.state.id);
    }
}

export class TemplatePolygonController extends PolygonController<TemplateShape> {
    constructor(renderer: TemplatePolygonRenderer) {
        super({ polygonManager: new PolygonManager<TemplateShape>(), renderer });
    }
}

// -- 地上画像 -----------------------------------------------------------------

export class TemplateGroundImageRenderer extends AbstractGroundImageOverlayRenderer<
    TemplateMapViewHolder,
    TemplateShape
> {
    async createGroundImage(state: GroundImageState): Promise<TemplateShape | null> {
        return this.holder.map.add(state.id, 'groundImage', [
            state.bounds.southWest,
            state.bounds.northEast,
        ].filter((p): p is NonNullable<typeof p> => p != null));
    }

    async updateGroundImageProperties({
        groundImage,
    }: {
        groundImage: TemplateShape;
        current: GroundImageEntity<TemplateShape>;
        prev: GroundImageEntity<TemplateShape>;
    }): Promise<TemplateShape | null> {
        return groundImage;
    }

    async removeGroundImage(entity: GroundImageEntity<TemplateShape>): Promise<void> {
        this.holder.map.remove(entity.state.id);
    }
}

export class TemplateGroundImageController extends GroundImageController<TemplateShape> {
    constructor(renderer: TemplateGroundImageRenderer) {
        super({ groundImageManager: new GroundImageManager<TemplateShape>(), renderer });
    }
}

// -- ラスターレイヤ -------------------------------------------------------------

/**
 * ラスターレイヤだけは抽象基底が無く、インタフェースを直に実装する
 * （GL 系はソースとレイヤをまとめて差し替えるのが最速なので、
 *  per-object の既定を押しつけていない）。
 */
export class TemplateRasterLayerRenderer implements RasterLayerOverlayRenderer<TemplateShape> {
    constructor(readonly holder: TemplateMapViewHolder) {}

    // ここを実装すると heatmap / geojson-layer / タイル方式マーカーが
    // まとめて動くようになる（どれもラスタータイルの重ね合わせで実装されている）。
    async onAdd(data: { state: RasterLayerState }[]): Promise<(TemplateShape | null)[]> {
        return data.map((p) => this.holder.map.add(p.state.id, 'rasterLayer', []));
    }

    async onChange(
        data: { current: RasterLayerEntity<TemplateShape> }[],
    ): Promise<(TemplateShape | null)[]> {
        return data.map((p) => p.current.layer ?? null);
    }

    async onRemove(data: RasterLayerEntity<TemplateShape>[]): Promise<void> {
        data.forEach((entity) => this.holder.map.remove(entity.state.id));
    }

    /** カメラが動くたびに呼ばれる。タイルの貼り直しが要る SDK はここで行う。 */
    async onCameraChanged(): Promise<void> {}

    async onPostProcess(): Promise<void> {}
}

export class TemplateRasterLayerController extends RasterLayerController<TemplateShape> {
    constructor(renderer: TemplateRasterLayerRenderer) {
        super({ rasterLayerManager: new RasterLayerManager<TemplateShape>(), renderer });
    }
}

// -- マーカー -----------------------------------------------------------------

export class TemplateMarkerRenderer extends AbstractMarkerOverlayRenderer<
    TemplateMapViewHolder,
    TemplateShape
> {
    constructor(holder: TemplateMapViewHolder) {
        super({ holder });
    }

    /**
     * ドラッグ中や位置更新でネイティブのマーカーを動かす。
     * 実際の SDK では `marker.setLngLat(...)` にあたる。
     */
    setMarkerPosition(markerEntity: MarkerEntity<TemplateShape>, position: GeoPoint): void {
        if (markerEntity.marker) markerEntity.marker.points = [position];
    }

    /**
     * `bitmapIcon` は**コアが用意した最終的なアイコン**。既定アイコンの合成も
     * ラベル描画も済んでいる。SDK のマーカーに載せるだけでよい。
     */
    async onAdd(data: AddParams[]): Promise<(TemplateShape | null)[]> {
        return data.map((params) =>
            this.holder.map.add(params.state.id, 'marker', [createGeoPoint(params.state.position)]),
        );
    }

    async onChange(data: ChangeParams<TemplateShape>[]): Promise<(TemplateShape | null)[]> {
        return data.map((params) => {
            const marker = params.current.marker;
            if (marker) marker.points = [createGeoPoint(params.current.state.position)];
            return marker ?? null;
        });
    }

    async onRemove(data: MarkerEntity<TemplateShape>[]): Promise<void> {
        data.forEach((entity) => this.holder.map.remove(entity.state.id));
    }

    /**
     * アニメーションを持たない SDK は空のままでよい。ただし
     * `animateStartListener` / `animateEndListener` を呼ばないなら、
     * その capability を `unsupported` で宣言すること（黙って無反応にしない）。
     */
    override async onAnimate(_entity: MarkerEntity<TemplateShape>): Promise<void> {}

    override async onPostProcess(): Promise<void> {}
}

export class TemplateMarkerController extends AbstractMarkerController<TemplateShape> {
    constructor(renderer: TemplateMarkerRenderer) {
        super({ markerManager: MarkerManager.defaultManager<TemplateShape>(), renderer });
    }
}
