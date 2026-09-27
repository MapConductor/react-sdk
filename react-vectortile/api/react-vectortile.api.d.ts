import React from 'react';

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
declare function VectorTileLayer({ style, tileSize: requestedTileSize, opacity, visible, maxZoom, headers, onDiagnostics, }: VectorTileLayerProps): React.ReactElement | null;

export { VectorTileLayer, type VectorTileLayerProps };
