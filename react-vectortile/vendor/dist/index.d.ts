interface TileRequest {
    readonly x: number;
    readonly y: number;
    readonly z: number;
}
interface TileRenderCoreOptions {
    /** A `style.json` URL, its raw text, or the parsed object. */
    style: string | object;
    tileSize?: number;
    /** Source tile cache budget in bytes. Defaults to 16 MB. */
    cacheBytes?: number;
    wasmUrl?: string | URL;
    /**
     * Headers sent with every source tile request — auth tokens, API keys.
     * Plain data rather than a hook so it survives being cloned into a worker.
     */
    headers?: Record<string, string>;
    /**
     * Full control over source tile fetching. Not cloneable, so supplying this
     * forces main-thread rendering; use `headers` if that is all you need.
     */
    fetchTile?: (url: string) => Promise<Uint8Array | null>;
    onWarning?: (message: string) => void;
}
/**
 * The actual rendering pipeline: wasm renderer, source tile cache, and the
 * plan -> fetch -> rasterise loop.
 *
 * Deliberately free of any DOM or worker assumptions so the identical code path
 * runs on the main thread and inside a Web Worker. Only the transport around it
 * differs.
 */
declare class TileRenderCore {
    private readonly renderer;
    readonly tileSize: number;
    private readonly cache;
    private readonly fetchTile;
    private disposed;
    private constructor();
    static create(options: TileRenderCoreOptions): Promise<TileRenderCore>;
    /**
     * Swaps in a new style. The source tile cache is deliberately kept: the
     * vector geometry is unchanged, only the paint applied to it, so a
     * recolour needs no refetch.
     */
    setStyle(styleText: string, onWarning?: (message: string) => void): Promise<void>;
    /** Layer `type` values in the style that will not be drawn. */
    unsupportedLayerTypes(): string[];
    /**
     * Reasons the current style may not render as intended — unsupported layer
     * types, sources that cannot be fetched, layers pointing at undefined
     * sources, Mapbox `imports`.
     */
    diagnostics(): string[];
    /**
     * Sources declared with a TileJSON `url` carry no tile templates until the
     * document is fetched. The wasm core never does I/O, so resolution happens
     * here and is handed back in.
     */
    private resolveTileJson;
    /** Renders one tile to PNG bytes. Returns null once disposed. */
    renderTile(request: TileRequest): Promise<Uint8Array | null>;
    dispose(): void;
}

/** Matches `TileProvider` in `@mapconductor/js-sdk-core`. */
interface TileProvider {
    renderTile(request: TileRequest): Uint8Array | null | Promise<Uint8Array | null>;
}
/**
 * Structural shape of `LocalTileServer`, so this package works with the SDK
 * core without taking a hard dependency on it.
 */
interface TileServerLike {
    register(routeId: string, provider: TileProvider): void;
    unregister(routeId: string): void;
    urlTemplate(args: {
        routeId: string;
        tileSize: number;
        cacheKey?: string;
    }): string;
}
interface VectorTileProviderOptions extends TileRenderCoreOptions {
    /**
     * Run rendering in a Web Worker. `'auto'` (the default) uses one when the
     * environment supports it and the options allow it.
     *
     * Note this is the provider's own worker, not
     * `LocalTileServer.attachRenderer()`. That hook routes *every* tile route
     * through one worker and bypasses main-thread providers entirely, so using
     * it here would break a page that also has a heatmap or marker-tile layer.
     */
    worker?: boolean | 'auto';
    /**
     * Supplies the Worker instance. Needed for bundlers that cannot follow
     * `new URL('./worker.js', import.meta.url)`.
     */
    workerFactory?: () => Worker;
}
/**
 * Renders MapLibre vector styles to raster PNG tiles in the browser.
 *
 * Register it with a `LocalTileServer` and point a raster layer at the
 * resulting URL template — that is what lets map backends with no vector style
 * support (Google Maps, MapKit, Cesium, …) display the style.
 */
declare class VectorTileProvider implements TileProvider {
    /** Where rendering runs. `'inline'` means on the calling thread. */
    readonly mode: 'worker' | 'inline';
    readonly tileSize: number;
    /** Layer `type` values in the current style that will not be drawn. */
    unsupportedLayerTypes: string[];
    /**
     * Reasons the current style may not render as intended. Worth showing
     * the user: a style this renderer cannot use should explain itself
     * rather than quietly produce blank tiles.
     */
    diagnostics: string[];
    private readonly client;
    private readonly core;
    private disposed;
    private constructor();
    static create(options: VectorTileProviderOptions): Promise<VectorTileProvider>;
    /** Why a worker cannot be used, or null if one can. */
    private static workerBlocker;
    private static createWorkerBacked;
    /** Renders one tile to PNG bytes. Returns null once disposed. */
    renderTile(request: TileRequest): Promise<Uint8Array | null>;
    /**
     * Replaces the style and returns the layer types the new one loses.
     *
     * Fetched vector tiles are kept: only the paint changes, so recolouring a
     * style costs a re-rasterise and no network traffic. Callers still need to
     * make the map refetch the *raster* tiles — pass a new `cacheKey` to
     * `urlTemplate()` and point the raster source at it.
     */
    setStyle(style: string | object): Promise<string[]>;
    private setStyleInline;
    /**
     * Registers this provider on a tile server and returns the URL template a
     * raster layer should point at.
     */
    attachTo(server: TileServerLike, routeId: string): string;
    /** Releases the renderer and its worker. The provider stops serving tiles. */
    dispose(): void;
}

/**
 * LRU cache for fetched source tiles, with single-flight de-duplication.
 *
 * This is not an optimisation detail — it is load-bearing. Neighbouring target
 * tiles routinely need the same source tile (always, once overzoom kicks in: a
 * 4x magnified ancestor is shared by 16 target tiles), and a map SDK requests a
 * whole viewport at once. Without this the same `.pbf` would be fetched a dozen
 * times concurrently.
 */
declare class TileCache {
    private readonly maxBytes;
    private readonly entries;
    private readonly inFlight;
    private bytes;
    /**
     * Budgeted in bytes, not entries. Counting entries is the easy mistake: a
     * basemap tile is 150-300 KB, so a few hundred of them is tens of
     * megabytes — enough to matter in a worker, and enough to abort the
     * process on the native platforms sharing this design.
     */
    constructor(maxBytes?: number);
    /**
     * Returns the bytes for `url`, fetching via `fetcher` on a miss. A `null`
     * result (404, empty body) is cached too, so a known-missing tile is not
     * re-requested on every pan.
     */
    get(url: string, fetcher: (url: string) => Promise<Uint8Array | null>): Promise<Uint8Array | null>;
    private set;
    clear(): void;
    get size(): number;
}

/**
 * Loading shim for the wasm core.
 *
 * The generated bindings live in `pkg/`, produced by `npm run build:wasm`.
 * They are imported lazily so that merely importing this package does not
 * force a wasm fetch on pages that never render a tile.
 */
/** The subset of the generated binding this package uses. */
interface WasmRenderer {
    plan(z: number, x: number, y: number): string;
    render(z: number, x: number, y: number, tileSize: number, data: Uint8Array, lengths: Uint32Array): Uint8Array;
    setStyle(styleJson: string): void;
    unresolvedSources(): string;
    setSourceTiles(sourceId: string, tilesJson: string, minzoom?: number, maxzoom?: number): boolean;
    diagnostics(): string;
    unsupportedLayerTypes(): string;
    free(): void;
}
interface WasmModule {
    default: (input?: unknown) => Promise<unknown>;
    VectorTileRenderer: new (styleJson: string) => WasmRenderer;
}
/**
 * Loads and initialises the wasm module. Repeat calls share one instance.
 *
 * @param wasmUrl Overrides where the `.wasm` binary is fetched from. Needed
 *   when the asset is served from a CDN or a non-default base path.
 */
declare function loadWasm(wasmUrl?: string | URL): Promise<WasmModule>;

/** Messages exchanged with the rendering worker. */
interface WorkerInitRequest {
    readonly type: 'init';
    readonly id: number;
    /** Style JSON as text; the main thread never sends a URL it has resolved. */
    readonly styleText: string;
    readonly tileSize: number;
    readonly cacheBytes: number;
    readonly headers?: Record<string, string>;
    readonly wasmUrl?: string;
}
interface WorkerInitResponse {
    readonly type: 'init';
    readonly id: number;
    readonly error?: string;
    readonly unsupportedLayerTypes?: string[];
    readonly diagnostics?: string[];
    readonly warnings?: string[];
}
interface WorkerRenderRequest {
    readonly type: 'render';
    readonly id: number;
    readonly z: number;
    readonly x: number;
    readonly y: number;
}
interface WorkerRenderResponse {
    readonly type: 'render';
    readonly id: number;
    readonly result: Uint8Array | null;
    readonly error?: string;
}
interface WorkerSetStyleRequest {
    readonly type: 'setStyle';
    readonly id: number;
    readonly styleText: string;
}
interface WorkerSetStyleResponse {
    readonly type: 'setStyle';
    readonly id: number;
    readonly error?: string;
    readonly unsupportedLayerTypes?: string[];
    readonly diagnostics?: string[];
}
interface WorkerDisposeRequest {
    readonly type: 'dispose';
}
type WorkerRequest = WorkerInitRequest | WorkerRenderRequest | WorkerSetStyleRequest | WorkerDisposeRequest;
type WorkerResponse = WorkerInitResponse | WorkerRenderResponse | WorkerSetStyleResponse;

export { TileCache, type TileProvider, TileRenderCore, type TileRenderCoreOptions, type TileRequest, type TileServerLike, VectorTileProvider, type VectorTileProviderOptions, type WasmRenderer, type WorkerDisposeRequest, type WorkerInitRequest, type WorkerInitResponse, type WorkerRenderRequest, type WorkerRenderResponse, type WorkerRequest, type WorkerResponse, type WorkerSetStyleRequest, type WorkerSetStyleResponse, loadWasm };
