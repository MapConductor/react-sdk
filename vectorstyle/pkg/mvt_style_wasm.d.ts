/* tslint:disable */
/* eslint-disable */

/**
 * Applies a rules document to a style document.
 *
 * Returns JSON: the adjusted style, the mutations, what they affect, and
 * the diagnostics — or `{"error": "..."}`.
 */
export function compileStyle(style_json: string, rules_json: string): string;

/**
 * The style's layers and the role each would be given, as a JSON array.
 */
export function describeStyle(style_json: string): string;

/**
 * The rules document version this build understands.
 *
 * Worth asking on the web and nowhere else: `@mapconductor/vectorstyle`
 * is its own npm package with its own version, so an app can end up with a
 * newer wrapper over an older wasm. Native platforms ship the host code and
 * the library together and cannot.
 */
export function rulesSchemaVersion(): number;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly compileStyle: (a: number, b: number, c: number, d: number, e: number) => void;
    readonly describeStyle: (a: number, b: number, c: number) => void;
    readonly rulesSchemaVersion: () => number;
    readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
    readonly __wbindgen_export: (a: number, b: number) => number;
    readonly __wbindgen_export2: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_export3: (a: number, b: number, c: number) => void;
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
