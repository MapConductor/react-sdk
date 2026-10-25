/* tslint:disable */
/* eslint-disable */

/**
 * A drawn label tile: transparent ground, labels and icons over it.
 */
export class LabelTile {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Takes the **premultiplied** RGBA pixels, `tileSize * tileSize * 4`
     * bytes, leaving this empty.
     *
     * Named for what it does: crossing into JS copies the buffer, and a tile
     * at label resolution is megabytes, so it is moved rather than cloned.
     * Premultiplied, not straight -- encoding it as straight alpha turns
     * every halo grey.
     */
    takePixels(): Uint8Array;
    /**
     * How many labels were placed. Zero means the tile is empty and the host
     * should serve one shared transparent image rather than encoding this.
     */
    readonly placed: number;
}

export class VectorTileRenderer {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Adds one fetched glyph range PBF. Returns how many glyphs it carried.
     */
    addGlyphs(pbf: Uint8Array): number;
    /**
     * Adds the fetched sprite sheet. Returns how many icons it carried.
     */
    addSprite(json: string, png: Uint8Array): number;
    /**
     * Credits the style's sources ask to be shown, as a JSON array of
     * strings.
     *
     * The host must display these: a style is data under someone's licence.
     * May contain HTML, because a credit is normally a link to the licence.
     */
    attributions(): string;
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
     * Draws labels and icons over pixels the host already has, in place.
     *
     * `rgba` must hold exactly `tileSize * tileSize * 4` bytes and is read as
     * **straight** alpha, which is what a WebGL readback is. Returns how many
     * labels were placed.
     */
    drawLabels(z: number, x: number, y: number, tile_size: number, rgba: Uint8Array, data: Uint8Array, lengths: Uint32Array): number;
    /**
     * The style's `glyphs` URL template, or `undefined` when it names none.
     */
    glyphsUrlTemplate(): string | undefined;
    /**
     * Whether any glyph has been loaded. Labels need at least one.
     */
    hasGlyphs(): boolean;
    /**
     * URLs of the glyph ranges this tile's labels need and the store has not
     * got, as a JSON array of strings.
     *
     * Empty when the style names no template or everything is already loaded.
     */
    neededGlyphs(z: number, x: number, y: number, data: Uint8Array, lengths: Uint32Array): string;
    /**
     * Whether this tile has to be drawn on the CPU because the style paints
     * something a GPU path cannot -- today, a patterned fill.
     */
    needsCpu(z: number, data: Uint8Array, lengths: Uint32Array): boolean;
    /**
     * Whether the style names a sprite the renderer has not been given yet.
     */
    needsSprite(): boolean;
    /**
     * Parses a `style.json`. Throws if the style is unusable.
     * `displayTileSize` is how many CSS px one tile covers where the page
     * shows it -- not the pixel count a render is asked for (a label pass
     * draws at twice the pixels, and a 256 px tile is still 256 px wide on
     * screen however many pixels it carries). It sets the size the style
     * draws at and the zoom its expressions are read at; leaving it out
     * keeps 512, which is what a raster source declared at 512 gets.
     */
    constructor(style_json: string, display_tile_size?: number | null);
    /**
     * Source tiles needed to draw `z/x/y`, as a JSON array of
     * `{ sourceId, url, z, x, y, scale, offsetX, offsetY, labelsOnly }`.
     *
     * `labelsOnly` marks a neighbour the label pass wants so a name at the
     * tile edge can be drawn whole. Nothing else reads those tiles, so a host
     * drawing the ground alone can leave their entries null and skip the
     * fetch -- but it must leave the *entries*, because the bytes are handed
     * back positionally.
     *
     * The host must fetch these **in order** and pass the bytes back to
     * [`VectorTileRenderer::render`] positionally.
     */
    plan(z: number, x: number, y: number): string;
    /**
     * Features in the tile as a JSON array; see `Renderer::query_features_json`.
     * Empty strings mean "no restriction". A filter that is not JSON errors.
     */
    queryFeatures(z: number, x: number, y: number, data: Uint8Array, lengths: Uint32Array, source_layer: string, filter_json: string, text: string, limit: number): string;
    /**
     * Rasterises `z/x/y` to PNG bytes.
     *
     * `data` is every fetched tile concatenated in plan order; `lengths` gives
     * each tile's byte length, with `0` marking a tile that failed to fetch or
     * came back empty.
     */
    render(z: number, x: number, y: number, tile_size: number, data: Uint8Array, lengths: Uint32Array): Uint8Array;
    /**
     * Rasterises the ground alone -- fills, lines and circles, no labels or
     * icons -- to PNG bytes.
     *
     * The half of a split layer that a GPU can draw and that fonts arriving
     * never invalidate.
     */
    renderGeometry(z: number, x: number, y: number, tile_size: number, data: Uint8Array, lengths: Uint32Array): Uint8Array;
    /**
     * Draws the labels and icons alone, on a transparent ground.
     *
     * The other half of a split layer: this is redrawn on its own when a font
     * arrives, leaving the ground untouched.
     */
    renderLabels(z: number, x: number, y: number, tile_size: number, data: Uint8Array, lengths: Uint32Array): LabelTile;
    /**
     * Draws the labels and icons alone, on a transparent ground, as a PNG.
     *
     * What a browser actually wants: a raster layer loads an image, and
     * turning raw pixels into one through a canvas costs more than the
     * drawing did. Returns an empty array when nothing was placed, so the
     * host can serve one shared transparent tile instead of encoding a
     * megabyte of nothing.
     */
    renderLabelsPng(z: number, x: number, y: number, tile_size: number, data: Uint8Array, lengths: Uint32Array): LabelTile;
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
     * The sprite sheet's `.json` and `.png` URLs at `pixelRatio`, as a JSON
     * array of two strings, or `[]` when the style names no sprite.
     */
    spriteUrls(pixel_ratio: number): string;
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
    readonly __wbg_labeltile_free: (a: number, b: number) => void;
    readonly __wbg_vectortilerenderer_free: (a: number, b: number) => void;
    readonly labeltile_placed: (a: number) => number;
    readonly labeltile_takePixels: (a: number, b: number) => void;
    readonly vectortilerenderer_addGlyphs: (a: number, b: number, c: number, d: number) => void;
    readonly vectortilerenderer_addSprite: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
    readonly vectortilerenderer_attributions: (a: number, b: number) => void;
    readonly vectortilerenderer_diagnostics: (a: number, b: number) => void;
    readonly vectortilerenderer_drawLabels: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number) => void;
    readonly vectortilerenderer_glyphsUrlTemplate: (a: number, b: number) => void;
    readonly vectortilerenderer_hasGlyphs: (a: number) => number;
    readonly vectortilerenderer_neededGlyphs: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number) => void;
    readonly vectortilerenderer_needsCpu: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
    readonly vectortilerenderer_needsSprite: (a: number) => number;
    readonly vectortilerenderer_new: (a: number, b: number, c: number, d: number) => void;
    readonly vectortilerenderer_plan: (a: number, b: number, c: number, d: number, e: number) => void;
    readonly vectortilerenderer_queryFeatures: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number, p: number) => void;
    readonly vectortilerenderer_render: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number) => void;
    readonly vectortilerenderer_renderGeometry: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number) => void;
    readonly vectortilerenderer_renderLabels: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number) => void;
    readonly vectortilerenderer_renderLabelsPng: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number) => void;
    readonly vectortilerenderer_setSourceTiles: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => void;
    readonly vectortilerenderer_setStyle: (a: number, b: number, c: number, d: number) => void;
    readonly vectortilerenderer_spriteUrls: (a: number, b: number, c: number) => void;
    readonly vectortilerenderer_unresolvedSources: (a: number, b: number) => void;
    readonly vectortilerenderer_unsupportedLayerTypes: (a: number, b: number) => void;
    readonly vectortilerenderer_defaultTileSize: () => number;
    readonly start: () => void;
    readonly __wbindgen_export: (a: number, b: number, c: number) => void;
    readonly __wbindgen_export2: (a: number, b: number) => number;
    readonly __wbindgen_export3: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
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
