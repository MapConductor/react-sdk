import React from 'react';
import { MapStyleHost } from '@mapconductor/js-sdk-core';
import { StyleAffects } from '@mapconductor/vectorstyle';
import { VectorStyleRasteriser, VectorStyleRasterisation } from '@mapconductor/react-vectorstyle';

interface VectorTileLayerProps {
    /** A `style.json` URL, its raw text, or the parsed object. */
    style: string | object;
    /**
     * Output tile size in pixels. Left out, the backend decides: a provider
     * that has registered a `RasterTilePreference` is answered, and anything
     * else gets 512.
     *
     * Bigger tiles are cheaper for the same screen -- the per-tile costs scale
     * with the count -- but ArcGIS's 3D SceneView picks the level as though
     * every tile were 256 pixels, so handing it 512 makes it fetch one level
     * deeper and four times as many tiles.
     */
    tileSize?: number;
    opacity?: number;
    visible?: boolean;
    maxZoom?: number;
    /** Headers sent with every source tile request — auth tokens, API keys. */
    headers?: Record<string, string>;
    /**
     * Reasons the style may not render as intended: undrawn layer types,
     * sources that cannot be fetched, Mapbox `imports`. Worth surfacing — the
     * failure mode that matters is a blank tile.
     */
    onDiagnostics?: (messages: string[]) => void;
    /**
     * The style is the basemap, not a layer over one.
     *
     * On a map that renders vector styles itself (MapLibre, Mapbox, MapTiler
     * -- anything registering `VectorStyleSupportKey`) this hands the style
     * over directly and mounts no raster layer at all: the fast path, and the
     * one an offline package will take. The style then *replaces* the map's
     * design and `opacity` does not apply. Elsewhere it changes nothing here;
     * the app blanks the map's own basemap (a `None` design) and the opaque
     * raster tiles are the map.
     */
    asBasemap?: boolean;
}
/**
 * Draws a MapLibre vector style on any map backend, by rendering it to raster
 * tiles in the browser and serving them through the SDK's local tile server.
 *
 * The backend only ever sees ordinary raster layers, which is what makes this
 * work on Google Maps, MapKit, Cesium, OpenLayers and the rest — none of which
 * can render a vector style themselves.
 *
 * Rendering runs in a Web Worker, so a viewport's worth of tiles does not stall
 * the map.
 *
 * Two layers are mounted, not one: the ground (fills, lines, circles) and a
 * transparent label overlay above it. To the map and the user they read as one
 * map. The halves render in parallel, and a glyph range landing redraws only
 * the transparent one, so a label appearing never blanks the map beneath it.
 *
 * Changing `style` recolours in place rather than rebuilding: the vector tiles
 * already fetched are reused, so only the rasterisation is redone.
 *
 * ```tsx
 * <VectorTileLayer style="https://example.com/style.json" opacity={0.9} />
 * ```
 */
declare function VectorTileLayer({ style, tileSize: requestedTileSize, opacity, visible, maxZoom, headers, onDiagnostics, asBasemap, }: VectorTileLayerProps): React.ReactElement | null;

interface VectorTileRasteriserOptions {
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
declare class VectorTileRasteriser implements VectorStyleRasteriser {
    private readonly options;
    constructor(options?: VectorTileRasteriserOptions);
    install(host: MapStyleHost, styleJson: string, _affects: StyleAffects): VectorStyleRasterisation;
}

export { VectorTileLayer, type VectorTileLayerProps, VectorTileRasteriser, type VectorTileRasteriserOptions };
