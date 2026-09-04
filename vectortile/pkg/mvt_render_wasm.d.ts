/* tslint:disable */
/* eslint-disable */

export class VectorTileRenderer {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * The default tile size, matching the SDK cores' raster layer default.
     */
    static defaultTileSize(): number;
    /**
     * Reasons the current style may not render as intended, as a JSON array
     * of strings. Covers unsupported layer types, sources that cannot be
     * fetched, layers pointing at undefined sources, and Mapbox `imports`.
     */
    diagnostics(): string;
    /**
     * Parses a `style.json`. Throws if the style is unusable.
     */
    constructor(style_json: string);
    /**
     * Source tiles needed to draw `z/x/y`, as a JSON array of
     * `{ sourceId, url, z, x, y, scale, offsetX, offsetY }`.
     *
     * The host must fetch these **in order** and pass the bytes back to
     * [`VectorTileRenderer::render`] positionally.
     */
    plan(z: number, x: number, y: number): string;
    /**
     * Rasterises `z/x/y` to PNG bytes.
     *
     * `data` is every fetched tile concatenated in plan order; `lengths` gives
     * each tile's byte length, with `0` marking a tile that failed to fetch or
     * came back empty.
     */
    render(z: number, x: number, y: number, tile_size: number, data: Uint8Array, lengths: Uint32Array): Uint8Array;
    /**
     * Supplies tile URL templates for a source, from resolved TileJSON.
     * Returns false if the style has no such source.
     */
    setSourceTiles(source_id: string, tiles_json: string, minzoom?: number | null, maxzoom?: number | null): boolean;
    /**
     * Replaces the style without discarding the renderer.
     *
     * Vector tiles the host already fetched stay valid — geometry is
     * unchanged, only the paint applied to it — so a recolour costs one
     * re-rasterise and no network traffic.
     */
    setStyle(style_json: string): void;
    /**
     * Sources that carry a TileJSON `url` but no inline `tiles`, as a JSON
     * array of `{ sourceId, url }`. The host resolves these and calls
     * [`VectorTileRenderer::setSourceTiles`].
     */
    unresolvedSources(): string;
    /**
     * Layer `type` values in this style that will not be drawn, as a JSON
     * array of strings. Lets the host warn instead of silently dropping them.
     */
    unsupportedLayerTypes(): string;
}

/**
 * Installs a panic hook that reports through `console.error` instead of an
 * opaque `unreachable` trap. Safe to call more than once.
 */
export function start(): void;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_vectortilerenderer_free: (a: number, b: number) => void;
    readonly vectortilerenderer_diagnostics: (a: number) => [number, number];
    readonly vectortilerenderer_new: (a: number, b: number) => [number, number, number];
    readonly vectortilerenderer_plan: (a: number, b: number, c: number, d: number) => [number, number];
    readonly vectortilerenderer_render: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number) => [number, number, number, number];
    readonly vectortilerenderer_setSourceTiles: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number, number];
    readonly vectortilerenderer_setStyle: (a: number, b: number, c: number) => [number, number];
    readonly vectortilerenderer_unresolvedSources: (a: number) => [number, number];
    readonly vectortilerenderer_unsupportedLayerTypes: (a: number) => [number, number];
    readonly vectortilerenderer_defaultTileSize: () => number;
    readonly start: () => void;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
