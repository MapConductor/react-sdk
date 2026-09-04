import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TileServerRegistry, createRasterLayerState, TileScheme } from '@mapconductor/js-sdk-core';
import { RasterLayer } from '@mapconductor/js-sdk-react';
import { VectorTileProvider } from '@mapconductor/vectortile';

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
 * Changing `style` recolours in place rather than rebuilding: the vector tiles
 * already fetched are reused, so only the rasterisation is redone.
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

    // Restyling keys off content, not object identity. A caller that builds its
    // style inline — which is exactly what a colour picker does — produces a new
    // object every render, and keying off identity would rerender the whole map
    // on every unrelated state change.
    const styleKey = useMemo(
        () => (typeof style === 'string' ? style : JSON.stringify(style)),
        [style],
    );
    // Read inside effects that must not re-run when the style changes.
    const styleRef = useRef(style);
    styleRef.current = style;

    // Bumped on every restyle and threaded into the tile URL. Without it the
    // new template is byte-identical to the old one, so the map serves the
    // raster tiles it already holds and nothing appears to change.
    const [styleVersion, setStyleVersion] = useState(0);

    // The service worker has to be controlling the page before any tile request
    // is made, otherwise the first requests 404 before the route exists.
    useEffect(() => {
        let cancelled = false;

        (async () => {
            tileServer.startServiceWorker('/tile-sw.js');
            await tileServer.waitForController();

            const provider = await VectorTileProvider.create({
                style: styleRef.current,
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
            setTemplate(provider.attachTo(tileServer, routeId, '0'));
        })().catch((error: unknown) => {
            onDiagnostics?.([`style could not be loaded: ${String(error)}`]);
        });

        return () => {
            cancelled = true;
            tileServer.unregister(routeId);
            providerRef.current?.dispose();
            providerRef.current = null;
        };
        // `style` is handled by the restyle effect below, not by rebuilding.
        // `headers` and `onDiagnostics` are deliberately not dependencies: a new
        // object identity each render would tear down and rebuild the renderer.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [routeId, tileServer, tileSize]);

    // Restyle in place. The vector tiles are unchanged — only the paint applied
    // to them — so this costs a re-rasterise and no network traffic.
    const appliedStyleKey = useRef<string | null>(null);
    useEffect(() => {
        const provider = providerRef.current;
        if (!provider || !template) return;
        // The boot effect already applied whatever style was current then.
        if (appliedStyleKey.current === null) {
            appliedStyleKey.current = styleKey;
            return;
        }
        if (appliedStyleKey.current === styleKey) return;
        appliedStyleKey.current = styleKey;

        let cancelled = false;
        provider
            .setStyle(styleRef.current)
            .then((diagnostics) => {
                if (cancelled) return;
                if (diagnostics.length > 0) onDiagnostics?.(diagnostics);
                setStyleVersion((version) => version + 1);
            })
            .catch((error: unknown) => {
                onDiagnostics?.([`style could not be applied: ${String(error)}`]);
            });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [styleKey, template]);

    // Re-derive the template when the style version moves, so the raster layer
    // points at a URL the map has not cached.
    useEffect(() => {
        const provider = providerRef.current;
        if (!provider || styleVersion === 0) return;
        setTemplate(provider.attachTo(tileServer, routeId, String(styleVersion)));
    }, [styleVersion, tileServer, routeId]);

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
        // Rebuilt when the route or the style version changes; opacity and
        // visibility are pushed onto the existing state below.
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
