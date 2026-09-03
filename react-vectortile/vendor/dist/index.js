import {
  TileCache,
  TileRenderCore,
  loadWasm
} from "./chunk-PT56I5RQ.js";

// src/VectorTileProvider.ts
async function resolveStyleText(style) {
  if (typeof style === "object") return JSON.stringify(style);
  if (/^\s*\{/.test(style)) return style;
  const response = await fetch(style);
  if (!response.ok) {
    throw new Error(`style fetch failed: ${response.status} ${style}`);
  }
  return response.text();
}
var WorkerClient = class {
  constructor(worker) {
    this.worker = worker;
    worker.addEventListener("message", (event) => {
      const message = event.data;
      if (message.type !== "render") return;
      const entry = this.pending.get(message.id);
      if (!entry) return;
      this.pending.delete(message.id);
      if (message.error) entry.reject(new Error(message.error));
      else entry.resolve(message.result);
    });
    worker.addEventListener("error", (event) => {
      this.rejectAll(new Error(`tile worker failed: ${event.message}`));
    });
  }
  worker;
  nextId = 1;
  pending = /* @__PURE__ */ new Map();
  init(request) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const onMessage = (event) => {
        const message = event.data;
        if (message.type !== "init" || message.id !== id) return;
        this.worker.removeEventListener("message", onMessage);
        if (message.error) reject(new Error(message.error));
        else
          resolve({
            unsupportedLayerTypes: message.unsupportedLayerTypes ?? [],
            diagnostics: message.diagnostics ?? [],
            warnings: message.warnings ?? []
          });
      };
      this.worker.addEventListener("message", onMessage);
      this.worker.postMessage({ ...request, id });
    });
  }
  setStyle(styleText) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const onMessage = (event) => {
        const message = event.data;
        if (message.type !== "setStyle" || message.id !== id) return;
        this.worker.removeEventListener("message", onMessage);
        if (message.error) reject(new Error(message.error));
        else
          resolve({
            unsupportedLayerTypes: message.unsupportedLayerTypes ?? [],
            diagnostics: message.diagnostics ?? []
          });
      };
      this.worker.addEventListener("message", onMessage);
      this.worker.postMessage({ type: "setStyle", id, styleText });
    });
  }
  render(z, x, y) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.worker.postMessage({ type: "render", id, z, x, y });
    });
  }
  rejectAll(error) {
    for (const entry of this.pending.values()) entry.reject(error);
    this.pending.clear();
  }
  terminate() {
    this.worker.postMessage({ type: "dispose" });
    this.rejectAll(new Error("tile worker disposed"));
    this.worker.terminate();
  }
};
var VectorTileProvider = class _VectorTileProvider {
  constructor(mode, tileSize, unsupportedLayerTypes, diagnostics, client, core) {
    this.mode = mode;
    this.tileSize = tileSize;
    this.unsupportedLayerTypes = unsupportedLayerTypes;
    this.diagnostics = diagnostics;
    this.client = client;
    this.core = core;
  }
  mode;
  tileSize;
  unsupportedLayerTypes;
  diagnostics;
  client;
  core;
  disposed = false;
  static async create(options) {
    const wanted = options.worker ?? "auto";
    const tileSize = options.tileSize ?? 512;
    const reason = _VectorTileProvider.workerBlocker(options);
    if (wanted !== false && !reason) {
      return _VectorTileProvider.createWorkerBacked(options, tileSize);
    }
    if (wanted === true && reason) {
      options.onWarning?.(`falling back to main-thread rendering: ${reason}`);
    }
    const core = await TileRenderCore.create(options);
    const diagnostics = core.diagnostics();
    for (const message of diagnostics) options.onWarning?.(message);
    return new _VectorTileProvider(
      "inline",
      tileSize,
      core.unsupportedLayerTypes(),
      diagnostics,
      null,
      core
    );
  }
  /** Why a worker cannot be used, or null if one can. */
  static workerBlocker(options) {
    if (typeof Worker === "undefined") return "Worker is not available";
    if (options.fetchTile) return "a custom fetchTile hook was supplied";
    return null;
  }
  static async createWorkerBacked(options, tileSize) {
    const styleText = await resolveStyleText(options.style);
    const worker = options.workerFactory?.() ?? new Worker(new URL("./worker.js", import.meta.url), { type: "module" });
    const client = new WorkerClient(worker);
    const { unsupportedLayerTypes, diagnostics, warnings } = await client.init({
      type: "init",
      styleText,
      tileSize,
      cacheBytes: options.cacheBytes ?? 16 * 1024 * 1024,
      headers: options.headers,
      wasmUrl: options.wasmUrl ? String(options.wasmUrl) : void 0
    });
    for (const warning of warnings) options.onWarning?.(warning);
    for (const message of diagnostics) options.onWarning?.(message);
    return new _VectorTileProvider(
      "worker",
      tileSize,
      unsupportedLayerTypes,
      diagnostics,
      client,
      null
    );
  }
  /** Renders one tile to PNG bytes. Returns null once disposed. */
  async renderTile(request) {
    if (this.disposed) return null;
    if (this.client) return this.client.render(request.z, request.x, request.y);
    return this.core.renderTile(request);
  }
  /**
   * Replaces the style and returns the layer types the new one loses.
   *
   * Fetched vector tiles are kept: only the paint changes, so recolouring a
   * style costs a re-rasterise and no network traffic. Callers still need to
   * make the map refetch the *raster* tiles — pass a new `cacheKey` to
   * `urlTemplate()` and point the raster source at it.
   */
  async setStyle(style) {
    if (this.disposed) return this.diagnostics;
    const styleText = await resolveStyleText(style);
    const result = this.client ? await this.client.setStyle(styleText) : await this.setStyleInline(styleText);
    this.unsupportedLayerTypes = result.unsupportedLayerTypes;
    this.diagnostics = result.diagnostics;
    return this.diagnostics;
  }
  async setStyleInline(styleText) {
    await this.core.setStyle(styleText);
    return {
      unsupportedLayerTypes: this.core.unsupportedLayerTypes(),
      diagnostics: this.core.diagnostics()
    };
  }
  /**
   * Registers this provider on a tile server and returns the URL template a
   * raster layer should point at.
   */
  attachTo(server, routeId) {
    server.register(routeId, this);
    return server.urlTemplate({ routeId, tileSize: this.tileSize });
  }
  /** Releases the renderer and its worker. The provider stops serving tiles. */
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.client?.terminate();
    this.core?.dispose();
  }
};
export {
  TileCache,
  TileRenderCore,
  VectorTileProvider,
  loadWasm
};
