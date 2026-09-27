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
    /**
     * Keep rendered tiles in Cache Storage so a reload does not redraw them.
     * Off by default: a library helping itself to a user's disk quota behind
     * their back is not a favour.
     */
    persistRenderedTiles?: boolean;
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
/** What a request should draw. */
type TileContent = 
/** Ground and labels in one tile: the single-layer behaviour. */
'full'
/** Fills, lines and circles. No labels, no icons, no glyph dependency. */
 | 'ground'
/** Labels and icons on a transparent ground. */
 | 'labels';
declare class TileRenderCore {
    private readonly renderer;
    readonly tileSize: number;
    private readonly cache;
    private readonly fetchTile;
    private disposed;
    /** Glyph ranges somebody has already claimed, so two tiles do not both
     *  fetch the same one. */
    private readonly claimed;
    private glyphsInFlight;
    /** Bumped when glyphs arrive, so tiles drawn before them stop being
     *  served. Goes in the tile URL the host hands the map. */
    private generation;
    /**
     * Whether any tile has been drawn short of glyphs since the last handover.
     *
     * Most glyph arrivals change nothing: the ranges landed before anything
     * needed them. Handing over anyway makes the map refetch and redraw the
     * whole viewport to arrive at the same pixels.
     */
    private provisional;
    private notifyTimer;
    /** Rendered PNGs across page loads. Null when Cache Storage is absent. */
    private rendered;
    /** Identifies the style these tiles were drawn from, so a restyle simply
     *  misses rather than needing anything deleted. */
    private styleKey;
    /**
     * What this renderer draws, as a number that goes up whenever it draws
     * more.
     *
     * A cache keyed only by style and coordinates is keyed by *what the style
     * says*, not by *what the renderer did with it*. Kept in step with the
     * Android and iOS bindings: they cache the output of the same core.
     */
    static readonly outputVersion = 13;
    /**
     * Told when glyphs arrive and the tiles already on screen are missing
     * labels because of it. The host must make the map refetch — nothing else
     * will replace them.
     */
    onGlyphsLoaded: (() => void) | null;
    /** How long to let a burst of ranges settle before telling the host. */
    private readonly notifyQuietMs;
    /** How long to keep holding that window open while ranges are in flight. */
    private readonly notifyMaxWaitMs;
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
    /**
     * Fetches everything the plan asks for and packs it the way wasm takes it:
     * one concatenated buffer plus a length table, `0` for a tile that failed
     * to fetch.
     *
     * An array-of-arrays would need a marshaller on every platform; this needs
     * none, which is why the wasm, JNI and C surfaces all agree on the shape.
     * Returns null once disposed.
     */
    private packTiles;
    /** The generation to put in a tile URL, so tiles drawn short of their
     *  glyphs stop being served once the glyphs land. */
    get glyphGeneration(): number;
    /**
     * Renders one tile to PNG bytes, warming its glyphs first.
     *
     * The tile is drawn with whatever glyphs are already in, exactly as
     * MapLibre does it: waiting for the ranges means a tile at low zoom draws
     * nothing for many seconds. The ones that arrive later bring their labels
     * with them through {@link onGlyphsLoaded}.
     */
    renderTile(request: TileRequest, content?: TileContent, signal?: AbortSignal): Promise<Uint8Array | null>;
    /**
     * The grain the label layer is drawn at, as a multiple of the tile size.
     *
     * Labels are the one thing on a map read as *shapes*, so they show a tile's
     * resolution the way nothing else does; the geometry beneath them does not
     * need it.
     */
    static readonly labelResolution = 2;
    /** One 1x1 transparent PNG, served for every empty label tile. */
    private static readonly emptyTile;
    /**
     * Starts fetching the glyph ranges this tile wants, and returns whether it
     * is about to be drawn without some of them.
     *
     * Claiming is what stops two tiles wanting the same range from both paying
     * for it; a range that fails stays claimed, because a range the server does
     * not have will not appear on a retry.
     */
    private claimGlyphs;
    /**
     * Tells the host that tiles drawn before now are missing labels.
     *
     * Coalesced: a viewport's worth of ranges lands in a burst, and asking the
     * map to refetch on each one redraws everything dozens of times to reach
     * the same picture. The window is held open while ranges are still coming,
     * because arrivals are spread out and a window that closes between them is
     * a handover per range.
     */
    private glyphsArrived;
    /**
     * Renders the ground alone — fills, lines and circles, no labels or icons.
     *
     * Half of a split layer. Serve this and {@link renderLabelTile} as two
     * stacked raster layers and the map shows one: the halves are drawn in
     * parallel, and a font landing redraws only the transparent one, so a
     * label appearing never blanks the map underneath it.
     */
    renderGeometryTile(request: TileRequest): Promise<Uint8Array | null>;
    /**
     * Renders the labels and icons alone, on a transparent ground.
     *
     * The other half of a split layer. `placed` of zero means nothing was
     * drawn — water and fields are common — and `pixels` is then empty, so the
     * caller can serve one shared transparent image rather than encode a
     * megabyte of nothing.
     *
     * `pixels` is **premultiplied** RGBA. Handing it to a canvas as straight
     * alpha turns every halo grey.
     */
    renderLabelTile(request: TileRequest, tileSize?: number): Promise<{
        pixels: Uint8Array;
        placed: number;
    } | null>;
    /**
     * Fetches the glyph ranges this tile's labels need and hands them to the
     * renderer. Returns how many ranges were added.
     *
     * Labels are drawn with whatever is loaded at the moment the tile is
     * drawn, so a tile rendered before this resolves comes out bare and has to
     * be redrawn once it does. Call it before rendering, and redraw when the
     * count is non-zero.
     */
    warmGlyphs(request: TileRequest): Promise<number>;
    /** Whether any glyph has been loaded. Labels need at least one. */
    hasGlyphs(): boolean;
    /**
     * Fetches the style's sprite sheet, if it names one, and hands it over.
     * Returns how many icons it carried, or 0 when there is no sprite.
     *
     * Icons are drawn only where the sheet has them, so until this resolves a
     * style's shields and pins are simply absent.
     */
    loadSprite(pixelRatio?: number): Promise<number>;
    /** Whether the style names a sprite that has not been loaded yet. */
    needsSprite(): boolean;
    /**
     * Whether this tile has to be drawn on the CPU because the style paints
     * something a GPU path cannot — today, a patterned fill.
     */
    needsCpu(request: TileRequest): Promise<boolean>;
    /**
     * Credits the style's sources ask to be shown.
     *
     * The host must display these: a style is data under someone's licence,
     * and a basemap drawing OpenStreetMap requires the credit. May contain
     * HTML — the text is normally a link to the licence.
     */
    attributions(): string[];
    dispose(): void;
}

/** Matches `TileProvider` in `@mapconductor/js-sdk-core`. */
interface TileProvider {
    /**
     * @param signal aborted when the map stops waiting for this tile. Honouring
     *   it is optional but not free to skip: renderers are a fixed resource, so
     *   a doomed tile is drawn instead of one still on screen.
     */
    renderTile(request: TileRequest, signal?: AbortSignal): Uint8Array | null | Promise<Uint8Array | null>;
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
    /**
     * Renders one tile to PNG bytes. Returns null once disposed.
     *
     * `content` picks a half of the split layer. The default draws both into
     * one tile, which is the single-layer behaviour.
     */
    /**
     * Renders one tile to PNG bytes, both halves in one image.
     *
     * This is the shape a tile server calls; {@link renderContent} picks a half.
     */
    renderTile(request: TileRequest, signal?: AbortSignal): Promise<Uint8Array | null>;
    /**
     * Renders one half of the split layer, or both.
     *
     * @param signal aborted when the map stops waiting. A tile nobody will look
     *   at is drawn *instead of* one still on screen, not as well as it.
     */
    renderContent(request: TileRequest, content?: TileContent, signal?: AbortSignal): Promise<Uint8Array | null>;
    /**
     * The ground alone: fills, lines and circles, and no glyph dependency.
     *
     * Mount this and {@link labelTiles} as two stacked raster layers and the map
     * shows one map. The halves render in parallel, and a glyph range landing
     * redraws only the transparent one, so a label appearing never blanks the
     * map beneath it.
     */
    readonly groundTiles: TileProvider;
    /** The labels and icons alone, on a transparent ground. */
    readonly labelTiles: TileProvider;
    /**
     * Credits the style's sources ask to be shown.
     *
     * These are not optional. A style is data under someone's licence, and a
     * basemap drawing OpenStreetMap requires the credit. May contain HTML —
     * the credit is normally a link to the licence.
     */
    attributions: string[];
    /**
     * Told when glyphs arrive and the tiles already on screen were drawn
     * without them. Make the map refetch: nothing else will replace them.
     */
    onGlyphsLoaded: ((generation: number) => void) | null;
    /**
     * Replaces the style and returns the layer types the new one loses.
     *
     * Fetched vector tiles are kept: only the paint changes, so recolouring a
     * style costs a re-rasterise and no network traffic. Callers still need to
     * make the map refetch the *raster* tiles — re-run `attachTo()` with a new
     * `cacheKey` and point the raster source at the template it returns.
     */
    setStyle(style: string | object): Promise<string[]>;
    private setStyleInline;
    /**
     * Registers this provider on a tile server and returns the URL template a
     * raster layer should point at.
     *
     * Pass a `cacheKey` that changes whenever the style does. Without one a
     * restyle re-renders correctly and the map still shows the old colours,
     * because the raster tiles it already holds are keyed by a URL that did not
     * change — and that failure looks exactly like a renderer that ignored
     * `setStyle`.
     */
    attachTo(server: TileServerLike, routeId: string, cacheKey?: string): string;
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
 * Rendered PNG tiles kept across page loads, in the browser's Cache Storage.
 *
 * This does not make the first view of an area faster — nothing can, the tiles
 * have to be fetched and rasterised once. What it removes is paying that cost
 * *again* on the next visit. Within one session the map already caches raster
 * tiles itself, so this is specifically about surviving a reload.
 *
 * Entries are content-addressed, so a restyle simply misses rather than needing
 * explicit invalidation.
 *
 * Absent outside a secure context and in Node, where `caches` is undefined.
 * {@link RenderedTileCache.open} answers null there and every caller treats a
 * missing cache as a miss, so nothing else has to know.
 */
declare class RenderedTileCache {
    private readonly store;
    private constructor();
    /** Null where Cache Storage is unavailable — Node, or an insecure origin. */
    static open(name?: string): Promise<RenderedTileCache | null>;
    /**
     * Cache Storage is keyed by Request, so a key has to look like a URL.
     *
     * The scheme is deliberately not http: nothing should ever try to fetch
     * one of these, and a relative key would resolve against whatever page
     * happened to be open.
     */
    private static url;
    get(key: string): Promise<Uint8Array | null>;
    put(key: string, bytes: Uint8Array): Promise<void>;
    clear(): Promise<void>;
}

/**
 * Loading shim for the wasm core.
 *
 * The generated bindings live in `pkg/`, produced by `npm run build:wasm`.
 * They are imported lazily so that merely importing this package does not
 * force a wasm fetch on pages that never render a tile.
 */
/** Labels and icons drawn on a transparent ground. */
interface WasmLabelTile {
    /** How many labels were placed. Zero means the tile is empty. */
    readonly placed: number;
    /**
     * Takes the **premultiplied** RGBA pixels, leaving this empty. Crossing
     * the wasm boundary copies, and a label tile is megabytes, so it is moved
     * rather than cloned.
     */
    takePixels(): Uint8Array;
    free(): void;
}
/** The subset of the generated binding this package uses. */
interface WasmRenderer {
    plan(z: number, x: number, y: number): string;
    render(z: number, x: number, y: number, tileSize: number, data: Uint8Array, lengths: Uint32Array): Uint8Array;
    /** The ground alone: fills, lines and circles, no labels or icons. */
    renderGeometry(z: number, x: number, y: number, tileSize: number, data: Uint8Array, lengths: Uint32Array): Uint8Array;
    /** Labels and icons alone, on a transparent ground. */
    renderLabels(z: number, x: number, y: number, tileSize: number, data: Uint8Array, lengths: Uint32Array): WasmLabelTile;
    /** Labels and icons on a transparent ground, encoded as a PNG. */
    renderLabelsPng(z: number, x: number, y: number, tileSize: number, data: Uint8Array, lengths: Uint32Array): WasmLabelTile;
    /** Draws labels over pixels the caller already has, in place. */
    drawLabels(z: number, x: number, y: number, tileSize: number, rgba: Uint8Array, data: Uint8Array, lengths: Uint32Array): number;
    glyphsUrlTemplate(): string | undefined;
    neededGlyphs(z: number, x: number, y: number, data: Uint8Array, lengths: Uint32Array): string;
    addGlyphs(pbf: Uint8Array): number;
    hasGlyphs(): boolean;
    spriteUrls(pixelRatio: number): string;
    addSprite(json: string, png: Uint8Array): number;
    needsSprite(): boolean;
    needsCpu(z: number, data: Uint8Array, lengths: Uint32Array): boolean;
    /** Credits the style's sources ask to be shown. May contain HTML. */
    attributions(): string;
    setStyle(styleJson: string): void;
    unresolvedSources(): string;
    setSourceTiles(sourceId: string, tilesJson: string, minzoom?: number, maxzoom?: number): boolean;
    diagnostics(): string;
    unsupportedLayerTypes(): string;
    free(): void;
}
interface WasmModule {
    default: (input?: unknown) => Promise<unknown>;
    /**
     * `displayTileSize` is the CSS px one tile covers on screen -- not the
     * pixel count a render is asked for. It sets the size the style draws at
     * and the zoom its expressions are read at; left out it is 512.
     */
    VectorTileRenderer: new (styleJson: string, displayTileSize?: number) => WasmRenderer;
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
    /** Credits the style's sources ask to be shown. The host must display
     *  these; may contain HTML. */
    readonly attributions?: string[];
}
interface WorkerRenderRequest {
    readonly type: 'render';
    readonly id: number;
    readonly z: number;
    readonly x: number;
    readonly y: number;
    /** Which half of a split layer to draw. Absent means both in one tile. */
    readonly content?: TileContent;
}
/**
 * Pushed by the worker, not answered to a request: glyphs arrived and the tiles
 * already on screen were drawn without them.
 */
interface WorkerGlyphsEvent {
    readonly type: 'glyphs';
    readonly generation: number;
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
/**
 * Give up on a render already sent.
 *
 * A map that has panned away is not owed the tile it stopped waiting for, and
 * the renderer is a fixed resource: a doomed tile is drawn *instead of* one
 * still on screen.
 */
interface WorkerAbortRequest {
    readonly type: 'abort';
    /** The id of the render to drop. Unknown ids are ignored. */
    readonly id: number;
}
interface WorkerDisposeRequest {
    readonly type: 'dispose';
}
type WorkerRequest = WorkerAbortRequest | WorkerInitRequest | WorkerRenderRequest | WorkerSetStyleRequest | WorkerDisposeRequest;
type WorkerResponse = WorkerGlyphsEvent | WorkerInitResponse | WorkerRenderResponse | WorkerSetStyleResponse;

export { RenderedTileCache, TileCache, type TileContent, type TileProvider, TileRenderCore, type TileRenderCoreOptions, type TileRequest, type TileServerLike, VectorTileProvider, type VectorTileProviderOptions, type WasmRenderer, type WorkerAbortRequest, type WorkerDisposeRequest, type WorkerGlyphsEvent, type WorkerInitRequest, type WorkerInitResponse, type WorkerRenderRequest, type WorkerRenderResponse, type WorkerRequest, type WorkerResponse, type WorkerSetStyleRequest, type WorkerSetStyleResponse, loadWasm };
