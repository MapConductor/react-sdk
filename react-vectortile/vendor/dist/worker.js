import {
  TileRenderCore
} from "./chunk-PT56I5RQ.js";

// src/worker.ts
var ctx = self;
var core = null;
var ready = null;
function reply(message, transfer) {
  ctx.postMessage(message, transfer ?? []);
}
ctx.addEventListener("message", (event) => {
  const message = event.data;
  if (message.type === "init") {
    const warnings = [];
    ready = TileRenderCore.create({
      style: message.styleText,
      tileSize: message.tileSize,
      cacheBytes: message.cacheBytes,
      headers: message.headers,
      wasmUrl: message.wasmUrl,
      onWarning: (text) => warnings.push(text)
    });
    ready.then(
      (created) => {
        core = created;
        reply({
          type: "init",
          id: message.id,
          unsupportedLayerTypes: created.unsupportedLayerTypes(),
          diagnostics: created.diagnostics(),
          warnings
        });
      },
      (error) => {
        ready = null;
        reply({ type: "init", id: message.id, error: String(error) });
      }
    );
    return;
  }
  if (message.type === "setStyle") {
    const pending = core ? Promise.resolve(core) : ready;
    if (!pending) {
      reply({
        type: "setStyle",
        id: message.id,
        error: "worker received setStyle before init"
      });
      return;
    }
    pending.then(async (renderer) => {
      await renderer.setStyle(message.styleText);
      reply({
        type: "setStyle",
        id: message.id,
        unsupportedLayerTypes: renderer.unsupportedLayerTypes(),
        diagnostics: renderer.diagnostics()
      });
    }).catch((error) => {
      reply({ type: "setStyle", id: message.id, error: String(error) });
    });
    return;
  }
  if (message.type === "dispose") {
    core?.dispose();
    core = null;
    ready = null;
    return;
  }
  if (message.type === "render") {
    const pending = core ? Promise.resolve(core) : ready;
    if (!pending) {
      reply({
        type: "render",
        id: message.id,
        result: null,
        error: "worker received a render before init"
      });
      return;
    }
    pending.then(
      (renderer) => renderer.renderTile({ z: message.z, x: message.x, y: message.y })
    ).then((result) => {
      if (!result) {
        reply({ type: "render", id: message.id, result: null });
        return;
      }
      reply({ type: "render", id: message.id, result }, [result.buffer]);
    }).catch((error) => {
      reply({
        type: "render",
        id: message.id,
        result: null,
        error: String(error)
      });
    });
  }
});
