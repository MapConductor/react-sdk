import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TileServerRegistry, createRasterLayerState, TileScheme } from '@mapconductor/js-sdk-core';
import { RasterLayer } from '@mapconductor/js-sdk-react';
import { VectorTileProvider } from '../vendor/dist/index.js';

export interface VectorTileLayerProps {
    /** A `style.json` URL, its raw text, or the parsed object. */
    style: string | object;
    /** Output tile size in pixels. Defaults to 512, matching the SDK cores. */
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
 * The backend only ever sees an ordinary raster layer, which is what makes this
 * work on Google Maps, MapKit, Cesium, OpenLayers and the rest — none of which
 * can render a vector style themselves.
 *
 * Rendering runs in a Web Worker, so a viewport's worth of tiles does not stall
 * the map. Symbol layers are not drawn.
 *
 * ```tsx
 * <VectorTileLayer style="https://example.com/style.json" opacity={0.9} />
 * ```
 */
export function VectorTileLayer({
    style,
    tileSize = 512,
    opacity = 1,
    visible = true,
    maxZoom = 22,
    headers,
    onDiagnostics,
}: VectorTileLayerProps): React.ReactElement | null {
    const routeId = useMemo(
        () => `vectortile-${Math.random().toString(36).slice(2, 10)}`,
        [],
    );
    const tileServer = useMemo(() => TileServerRegistry.get(), []);
    const providerRef = useRef<VectorTileProvider | null>(null);
    const [template, setTemplate] = useState<string | null>(null);

    // The service worker has to be controlling the page before any tile request
    // is made, otherwise the first requests 404 before the route exists.
    useEffect(() => {
        let cancelled = false;

        (async () => {
            tileServer.startServiceWorker('/tile-sw.js');
            await tileServer.waitForController();

            const provider = await VectorTileProvider.create({
                style,
                tileSize,
                headers,
                onWarning: (message: string) => onDiagnostics?.([message]),
            });
            if (cancelled) {
                provider.dispose();
                return;
            }
            providerRef.current = provider;
            if (provider.diagnostics.length > 0) onDiagnostics?.(provider.diagnostics);
            setTemplate(provider.attachTo(tileServer, routeId));
        })().catch((error: unknown) => {
            onDiagnostics?.([`style could not be loaded: ${String(error)}`]);
        });

        return () => {
            cancelled = true;
            tileServer.unregister(routeId);
            providerRef.current?.dispose();
            providerRef.current = null;
        };
        // `headers` and `onDiagnostics` are deliberately not dependencies: a new
        // object identity each render would tear down and rebuild the renderer.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [routeId, tileServer, style, tileSize]);

    const state = useMemo(() => {
        if (!template) return null;
        return createRasterLayerState({
            id: routeId,
            source: {
                type: 'UrlTemplate',
                template,
                tileSize,
                maxZoom,
                scheme: TileScheme.XYZ,
            },
            opacity,
            visible,
        });
        // Rebuilt only when the route changes; opacity and visibility are
        // pushed onto the existing state below.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [template, routeId, tileSize, maxZoom]);

    useEffect(() => {
        if (!state) return;
        state.opacity = Math.min(1, Math.max(0, opacity));
        state.visible = visible;
    }, [state, opacity, visible]);

    if (!state) return null;
    return <RasterLayer state={state} />;
}
