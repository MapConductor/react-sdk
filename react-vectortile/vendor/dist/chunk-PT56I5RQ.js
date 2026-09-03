// src/wasm.ts
var modulePromise = null;
function loadWasm(wasmUrl) {
  if (!modulePromise) {
    modulePromise = (async () => {
      const mod = await import("../pkg/mvt_render_wasm.js");
      await mod.default(wasmUrl);
      return mod;
    })().catch((error) => {
      modulePromise = null;
      throw error;
    });
  }
  return modulePromise;
}

// src/TileCache.ts
var TileCache = class {
  /**
   * Budgeted in bytes, not entries. Counting entries is the easy mistake: a
   * basemap tile is 150-300 KB, so a few hundred of them is tens of
   * megabytes — enough to matter in a worker, and enough to abort the
   * process on the native platforms sharing this design.
   */
  constructor(maxBytes = 16 * 1024 * 1024) {
    this.maxBytes = maxBytes;
  }
  maxBytes;
  entries = /* @__PURE__ */ new Map();
  inFlight = /* @__PURE__ */ new Map();
  bytes = 0;
  /**
   * Returns the bytes for `url`, fetching via `fetcher` on a miss. A `null`
   * result (404, empty body) is cached too, so a known-missing tile is not
   * re-requested on every pan.
   */
  get(url, fetcher) {
    if (this.entries.has(url)) {
      const cached = this.entries.get(url) ?? null;
      this.entries.delete(url);
      this.entries.set(url, cached);
      return Promise.resolve(cached);
    }
    const pending = this.inFlight.get(url);
    if (pending) return pending;
    const request = fetcher(url).catch(() => null).then((bytes) => {
      this.inFlight.delete(url);
      this.set(url, bytes);
      return bytes;
    });
    this.inFlight.set(url, request);
    return request;
  }
  set(url, bytes) {
    this.entries.set(url, bytes);
    this.bytes += bytes?.byteLength ?? 0;
    while (this.bytes > this.maxBytes && this.entries.size > 1) {
      const oldest = this.entries.keys().next();
      if (oldest.done) break;
      this.bytes -= this.entries.get(oldest.value)?.byteLength ?? 0;
      this.entries.delete(oldest.value);
    }
  }
  clear() {
    this.entries.clear();
    this.inFlight.clear();
    this.bytes = 0;
  }
  get size() {
    return this.entries.size;
  }
};

// src/TileRenderCore.ts
function makeFetcher(headers) {
  const init = headers && Object.keys(headers).length > 0 ? { headers } : void 0;
  return async (url) => {
    const response = await fetch(url, init);
    if (response.status === 404 || response.status === 204) return null;
    if (!response.ok) throw new Error(`tile fetch failed: ${response.status} ${url}`);
    const buffer = await response.arrayBuffer();
    return buffer.byteLength === 0 ? null : new Uint8Array(buffer);
  };
}
async function resolveStyleText(style) {
  if (typeof style === "object") return JSON.stringify(style);
  if (/^\s*\{/.test(style)) return style;
  const response = await fetch(style);
  if (!response.ok) {
    throw new Error(`style fetch failed: ${response.status} ${style}`);
  }
  return response.text();
}
var TileRenderCore = class _TileRenderCore {
  constructor(renderer, tileSize, options) {
    this.renderer = renderer;
    this.tileSize = tileSize;
    this.cache = new TileCache(options.cacheBytes ?? 16 * 1024 * 1024);
    this.fetchTile = options.fetchTile ?? makeFetcher(options.headers);
  }
  renderer;
  tileSize;
  cache;
  fetchTile;
  disposed = false;
  static async create(options) {
    const [wasm, styleText] = await Promise.all([
      loadWasm(options.wasmUrl),
      resolveStyleText(options.style)
    ]);
    const renderer = new wasm.VectorTileRenderer(styleText);
    const core = new _TileRenderCore(renderer, options.tileSize ?? 512, options);
    await core.resolveTileJson(options.onWarning);
    return core;
  }
  /**
   * Swaps in a new style. The source tile cache is deliberately kept: the
   * vector geometry is unchanged, only the paint applied to it, so a
   * recolour needs no refetch.
   */
  async setStyle(styleText, onWarning) {
    this.renderer.setStyle(styleText);
    await this.resolveTileJson(onWarning);
  }
  /** Layer `type` values in the style that will not be drawn. */
  unsupportedLayerTypes() {
    return JSON.parse(this.renderer.unsupportedLayerTypes());
  }
  /**
   * Reasons the current style may not render as intended — unsupported layer
   * types, sources that cannot be fetched, layers pointing at undefined
   * sources, Mapbox `imports`.
   */
  diagnostics() {
    return JSON.parse(this.renderer.diagnostics());
  }
  /**
   * Sources declared with a TileJSON `url` carry no tile templates until the
   * document is fetched. The wasm core never does I/O, so resolution happens
   * here and is handed back in.
   */
  async resolveTileJson(onWarning) {
    const unresolved = JSON.parse(this.renderer.unresolvedSources());
    await Promise.all(
      unresolved.map(async ({ sourceId, url }) => {
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`${response.status}`);
          const doc = await response.json();
          if (!doc.tiles?.length) throw new Error("TileJSON has no `tiles`");
          this.renderer.setSourceTiles(
            sourceId,
            JSON.stringify(doc.tiles),
            doc.minzoom,
            doc.maxzoom
          );
        } catch (error) {
          onWarning?.(`could not resolve TileJSON for "${sourceId}": ${error}`);
        }
      })
    );
  }
  /** Renders one tile to PNG bytes. Returns null once disposed. */
  async renderTile(request) {
    if (this.disposed) return null;
    const { z, x, y } = request;
    const plan = JSON.parse(this.renderer.plan(z, x, y));
    const fetched = await Promise.all(
      plan.map((entry) => this.cache.get(entry.url, this.fetchTile))
    );
    if (this.disposed) return null;
    const lengths = new Uint32Array(fetched.length);
    let total = 0;
    fetched.forEach((bytes, i) => {
      const length = bytes?.byteLength ?? 0;
      lengths[i] = length;
      total += length;
    });
    const data = new Uint8Array(total);
    let offset = 0;
    for (const bytes of fetched) {
      if (!bytes) continue;
      data.set(bytes, offset);
      offset += bytes.byteLength;
    }
    return this.renderer.render(z, x, y, this.tileSize, data, lengths);
  }
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.cache.clear();
    this.renderer.free();
  }
};

export {
  loadWasm,
  TileCache,
  TileRenderCore
};
