/**
 * Declarative adjustments to a MapLibre style.
 *
 * A map in the MapConductor SDKs is drawn one of two ways: by a renderer
 * that takes a vector style directly (MapLibre, Mapbox, MapTiler), or by
 * rasterising the style to PNG tiles and handing those to a backend that
 * cannot read a style at all. Both start from the same `style.json`, so
 * "adjust the style" belongs before that fork. This package is that step.
 *
 * Its own package, not a corner of `@mapconductor/vectortile`: an app using
 * MapLibre in a browser can adjust a style without fetching the rasteriser,
 * and the numbers say that is worth a package — 190 KB of wasm here against
 * 705 KB there.
 *
 * Framework- and core-neutral, like its sibling. The mutations come back as
 * the JSON text the renderer bindings produced; the React layer hands that
 * to `parseStyleMutations` from `@mapconductor/js-sdk-core`, and a plain
 * script tag can read it however it likes.
 */
/**
 * Where the `.wasm` comes from.
 *
 * A URL in a browser; the bytes themselves anywhere `fetch` cannot read a
 * local file, which is every Node test run and every bundler that inlines
 * the asset.
 */
type WasmSource = string | URL | BufferSource;
interface WasmModule {
    default: (wasmUrl?: WasmSource | {
        module_or_path: WasmSource;
    }) => Promise<unknown>;
    compileStyle: (styleJson: string, rulesJson: string) => string;
    describeStyle: (styleJson: string) => string;
    rulesSchemaVersion: () => number;
}
/**
 * Loads and initialises the wasm module. Repeat calls share one instance.
 *
 * @param wasmUrl Overrides where the `.wasm` binary is fetched from. Needed
 *   when the asset is served from a CDN or a non-default base path.
 */
declare function loadStyleWasm(wasmUrl?: WasmSource): Promise<WasmModule>;
/** Which half of a split raster layer a change reaches. */
type StyleAffects = 'none' | 'ground' | 'labels' | 'both';
interface CompiledStyle {
    /** The adjusted document, to hand to a renderer or to rasterise. */
    readonly style: unknown;
    /**
     * The per-layer deltas, as the JSON text the compiler produced.
     *
     * Text rather than parsed values: the shape is defined by
     * `StyleMutation` in `@mapconductor/js-sdk-core`, and this package does
     * not depend on core -- the same build has to serve React, a plain
     * script tag, and anything else.
     */
    readonly mutationsJson: string;
    /**
     * Which half of a split raster layer has to be redrawn. A rule that only
     * recolours text need not invalidate every tile on screen.
     */
    readonly affects: StyleAffects;
    /**
     * False when the mutations alone cannot reproduce the document, so a
     * live map has to be given the document instead of being patched.
     */
    readonly patchable: boolean;
    /**
     * What the app should know: a rule that matched nothing, a change the
     * rasteriser will not draw, an expression it cannot evaluate.
     */
    readonly diagnostics: readonly string[];
}
/** One layer of a style, and the role the compiler would give it. */
interface StyleLayerInfo {
    readonly id: string;
    readonly kind: string;
    readonly sourceLayer: string | null;
    readonly roles: readonly string[];
    /** How each role was decided, in the same order as `roles`. */
    readonly evidence: readonly string[];
}
declare class VectorStyleError extends Error {
}
/**
 * Applies a rules document to a style document.
 *
 * @param style the `style.json`, as text or as the parsed object
 * @param rules the rules document, as text or as the parsed object
 * @throws VectorStyleError when either document cannot be read
 */
declare function compileStyle(style: string | object, rules: string | object, options?: {
    wasmUrl?: WasmSource;
}): Promise<CompiledStyle>;
/**
 * Every layer in the style, with the role this would give it.
 *
 * Rules are written against someone else's style, so being able to ask what
 * is in it -- and on what evidence a layer counts as a road -- is how the
 * rules get written in the first place.
 */
declare function describeStyle(style: string | object, options?: {
    wasmUrl?: WasmSource;
}): Promise<StyleLayerInfo[]>;
/**
 * The rules document version this build understands.
 *
 * Worth asking on the web and nowhere else: this package and the one that
 * writes the rules have their own versions, so an app can end up with a
 * newer wrapper over an older wasm.
 */
declare function rulesSchemaVersion(options?: {
    wasmUrl?: WasmSource;
}): Promise<number>;

export { type CompiledStyle, type StyleAffects, type StyleLayerInfo, VectorStyleError, type WasmSource, compileStyle, describeStyle, loadStyleWasm, rulesSchemaVersion };
