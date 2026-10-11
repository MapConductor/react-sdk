import {
    RasterTilePreferenceKey,
    TileServerRegistry,
    TileScheme,
    createRasterLayerState,
    type AttributionRule,
    type MapStyleHost,
    type RasterLayerState,
} from '@mapconductor/js-sdk-core';
import { VectorTileProvider } from '@mapconductor/vectortile';
import type { StyleAffects } from '@mapconductor/vectorstyle';
import type { VectorStyleRasterisation, VectorStyleRasteriser } from '@mapconductor/react-vectorstyle';

/** How long a burst of restyles is gathered into one redraw. */
const COALESCE_MS = 150;

/** The deepest zoom the renderer is asked to draw. */
const MAX_ZOOM = 22;

export interface VectorTileRasteriserOptions {
    /** Edge of a rendered tile in CSS pixels. The map's own preference wins. */
    readonly tileSize?: number;
    /** Sent with every source-tile, sprite and glyph request. */
    readonly headers?: Record<string, string>;
    /** Where the renderer's `.wasm` is served from, if not the default. */
    readonly wasmUrl?: string | URL;
    /** Path the tile service worker is registered from. */
    readonly serviceWorkerPath?: string;
}

/**
 * Draws a vector style for a map that cannot read one.
 *
 * ```tsx
 * <GoogleMapView
 *     state={state}
 *     mapStyle={createVectorStyle({ rules, rasteriser: new VectorTileRasteriser() })}
 * />
 * ```
 *
 * Google Maps, MapKit, HERE, ArcGIS, Leaflet, OpenLayers and the rest have
 * no vector renderer. This renders the same compiled document to tiles in
 * the browser and mounts them as the basemap, so the adjustments an app
 * writes once produce the same map on every backend. MapLibre, Mapbox and
 * MapTiler never call it — they are handed the document itself.
 *
 * ios-vectortile の `VectorTileRasteriser`、android-vectortile の同名クラスと
 * 対応する。世代の付け方、地と文字の分け方、restyle のまとめ方まで揃えてある。
 */
export class VectorTileRasteriser implements VectorStyleRasteriser {
    constructor(private readonly options: VectorTileRasteriserOptions = {}) {}

    install(host: MapStyleHost, styleJson: string, _affects: StyleAffects): VectorStyleRasterisation {
        return new Rasterisation(host, this.options, styleJson);
    }
}

/**
 * One installed rasterisation.
 *
 * Two layers, not one. A glyph range arriving must redraw the labels and
 * leave the ground alone, and a recolour that touches neither must redraw
 * nothing — so the halves carry separate generations, and the generation is
 * in the tile URL because a map only refetches a raster source whose URL
 * changed.
 */
class Rasterisation implements VectorStyleRasterisation {
    private readonly groupId = `vectorstyle-raster-${Math.random().toString(36).slice(2, 10)}`;
    private readonly tileServer = TileServerRegistry.get();
    private readonly groundRoute: string;
    private readonly labelRoute: string;

    private provider: VectorTileProvider | null = null;
    private disposed = false;
    /** Bumped per restyle request; a build for an older one is dropped. */
    private revision = 0;
    private pendingStyleJson: string | null = null;
    private pendingAffects: StyleAffects = 'none';
    private redrawTimer: ReturnType<typeof setTimeout> | null = null;
    private groundGeneration = 0;
    private labelGeneration = 0;
    private credits: AttributionRule[] = [];
    private tileSize: number;

    constructor(
        private readonly host: MapStyleHost,
        private readonly options: VectorTileRasteriserOptions,
        styleJson: string,
    ) {
        this.groundRoute = `${this.groupId}-geom`;
        this.labelRoute = `${this.groupId}-labels`;
        this.tileSize = options.tileSize ?? 512;
        void this.start(styleJson);
    }

    restyle(styleJson: string, affects: StyleAffects): void {
        if (this.disposed) return;
        // An empty rule set means “as authored”.  It has no affected role in
        // the style compiler, but it still has to replace the currently
        // rendered preset.  Treat it as a full redraw so raster backends do
        // not keep showing the previous preset forever.
        const redraw: StyleAffects = affects === 'none' ? 'both' : affects;
        this.revision += 1;
        this.pendingStyleJson = styleJson;
        this.pendingAffects = widen(this.pendingAffects, redraw);
        if (this.redrawTimer !== null) return;
        // A slider emits every frame. One document per burst, with the
        // periodic previews a continuous drag wants.
        this.redrawTimer = setTimeout(() => {
            this.redrawTimer = null;
            const latest = this.pendingStyleJson;
            const affectsNow = this.pendingAffects;
            const requested = this.revision;
            this.pendingStyleJson = null;
            this.pendingAffects = 'none';
            if (latest === null) return;
            void this.apply(latest, affectsNow, requested);
        }, COALESCE_MS);
    }

    dispose(): void {
        if (this.disposed) return;
        this.disposed = true;
        if (this.redrawTimer !== null) clearTimeout(this.redrawTimer);
        this.redrawTimer = null;
        this.pendingStyleJson = null;
        const current = this.provider;
        this.provider = null;
        this.tileServer.unregister(this.groundRoute);
        this.tileServer.unregister(this.labelRoute);
        current?.dispose();
        this.host.removeRaster(`${this.groupId}-geom`);
        this.host.removeRaster(`${this.groupId}-labels`);
    }

    // MARK: - private

    private async start(styleJson: string): Promise<void> {
        try {
            // The worker has to be controlling the page before any tile is
            // asked for, or the first requests 404 before the route exists.
            this.tileServer.startServiceWorker(this.options.serviceWorkerPath ?? '/tile-sw.js');
            await this.tileServer.waitForController();
            if (this.disposed) return;
            this.tileSize =
                this.options.tileSize ??
                this.host.serviceRegistry.get(RasterTilePreferenceKey)?.preferredTileSize ??
                512;
            await this.apply(styleJson, 'both', this.revision);
        } catch (error: unknown) {
            this.host.report([`the style could not be rasterised: ${describe(error)}`]);
        }
    }

    private async apply(styleJson: string, affects: StyleAffects, requested: number): Promise<void> {
        let created: VectorTileProvider;
        try {
            created = await VectorTileProvider.create({
                style: styleJson,
                tileSize: this.tileSize,
                cacheBytes: 48 * 1024 * 1024,
                persistSourceTiles: true,
                persistRenderedTiles: true,
                headers: this.options.headers,
                wasmUrl: this.options.wasmUrl,
            });
        } catch (error: unknown) {
            this.host.report([`the style could not be rasterised: ${describe(error)}`]);
            return;
        }
        // Built asynchronously, so by now the answer may be stale or the
        // whole thing taken off.
        if (this.disposed || requested !== this.revision) {
            created.dispose();
            return;
        }

        const previous = this.provider;
        this.provider = created;
        this.tileServer.register(this.groundRoute, created.groundTiles);
        this.tileServer.register(this.labelRoute, created.labelTiles);
        this.credits = created.attributions.map((attribution) => ({ attribution }));

        // Glyphs arrive after the tiles that need them: a range is a round
        // trip and a low zoom wants dozens, so tiles are drawn with what is
        // loaded and the labels are refetched once more is.
        created.onGlyphsLoaded = () => {
            if (this.disposed || this.provider !== created) return;
            this.labelGeneration += 1;
            this.host.upsertRaster(this.labelState());
        };

        if (affects === 'ground' || affects === 'both') this.groundGeneration += 1;
        if (affects === 'labels' || affects === 'both') this.labelGeneration += 1;
        previous?.dispose();

        if (created.diagnostics.length > 0) this.host.report(created.diagnostics);
        if (affects === 'ground' || affects === 'both') this.host.upsertRaster(this.groundState());
        if (affects === 'labels' || affects === 'both') this.host.upsertRaster(this.labelState());
    }

    /** Geometry only, drawn below everything, never invalidated by glyphs. */
    private groundState(): RasterLayerState {
        return createRasterLayerState({
            id: `${this.groupId}-geom`,
            source: {
                type: 'UrlTemplate',
                template: this.tileServer.urlTemplate({
                    routeId: this.groundRoute,
                    tileSize: this.tileSize,
                    cacheKey: `g${this.groundGeneration}`,
                }),
                tileSize: this.tileSize,
                maxZoom: MAX_ZOOM,
                attributionRules: this.credits,
                scheme: TileScheme.XYZ,
            },
            // Under everything the app declared, and under the labels.
            // A style *is* the basemap here.
            zIndex: -2,
        });
    }

    /** The transparent overlay the glyphs land on. */
    private labelState(): RasterLayerState {
        return createRasterLayerState({
            id: `${this.groupId}-labels`,
            source: {
                type: 'UrlTemplate',
                template: this.tileServer.urlTemplate({
                    routeId: this.labelRoute,
                    tileSize: this.tileSize,
                    cacheKey: `g${this.labelGeneration}`,
                }),
                tileSize: this.tileSize,
                maxZoom: MAX_ZOOM,
                // Both halves carry the credit, so hiding either one cannot
                // silence it; the overlay ends in `distinct`.
                attributionRules: this.credits,
                scheme: TileScheme.XYZ,
            },
            zIndex: -1,
        });
    }
}

/** Two changes in one burst affect whatever either of them affected. */
function widen(current: StyleAffects, next: StyleAffects): StyleAffects {
    if (current === 'none') return next;
    if (current === next) return current;
    return 'both';
}

function describe(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}
