import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    TileServerRegistry,
    createRasterLayerState,
    TileScheme,
    type AttributionRule,
    type RasterLayerState,
} from '@mapconductor/js-sdk-core';
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
 * How long a layer being replaced stays up.
 *
 * Replacing a raster layer's source URL is implemented as remove-then-add, so
 * the layer vanishes for as long as the new source takes to fetch its first
 * tiles. Mounting the replacement alongside and dropping the old one a moment
 * later hands over instead. No signal says a raster source has drawn, so this
 * is a window rather than a wait: too short brings the flash back, too long
 * leaves two layers stacked, which costs a moment of overdraw and nothing else.
 *
 * Matches `HANDOVER_MS` in android-vectortile.
 */
const HANDOVER_MS = 900;

const clamp = (value: number): number => Math.min(1, Math.max(0, value));

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
    // Two routes from one provider. The user sees one map; the halves are
    // served, fetched and cached independently.
    const groundRoute = `${routeId}-ground`;
    const labelRoute = `${routeId}-labels`;

    const tileServer = useMemo(() => TileServerRegistry.get(), []);
    const providerRef = useRef<VectorTileProvider | null>(null);
    const [ready, setReady] = useState(false);

    /**
     * The credits the style's sources ask for, carried by the layers themselves.
     *
     * The map's attribution overlay is fed from the rules of every visible
     * raster layer, so a credit attached here appears without the host writing
     * any UI and disappears when the layer unmounts. Nothing else about this
     * layer can be wrong while still looking right: the tiles draw perfectly
     * whether or not anyone is credited for them.
     *
     * No zoom or bounds narrowing on the rules. A source's `maxzoom` is where
     * its tiles stop, not where its data stops being on screen — past it the
     * renderer magnifies the deepest tile it has, so the data is still shown
     * and still has to be credited. Crediting a little too often costs a line
     * of text; crediting too rarely breaks a licence.
     */
    const [credits, setCredits] = useState<AttributionRule[]>([]);

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

    // Bumped when glyphs land. The map only refetches a raster source whose URL
    // changed, so the generation has to reach the template.
    const [glyphGeneration, setGlyphGeneration] = useState(0);

    // Normally one each, briefly two while a replacement takes over.
    const [grounds, setGrounds] = useState<RasterLayerState[]>([]);
    const [labels, setLabels] = useState<RasterLayerState[]>([]);

    // Applied at creation so a layer never mounts at the wrong opacity, then
    // pushed onto the live states by the effect at the bottom.
    const opacityRef = useRef(opacity);
    opacityRef.current = opacity;
    const visibleRef = useRef(visible);
    visibleRef.current = visible;

    // Strictly increasing, so a replacement always stacks above what it
    // replaces. Restyles and glyph arrivals both draw from it.
    const labelDepth = useRef(0);

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

            // Glyphs arrive after the tiles that need them: a range is a round
            // trip and a tile at low zoom wants dozens, so tiles are drawn with
            // whatever is loaded and the overlay is replaced once more arrives.
            provider.onGlyphsLoaded = (generation: number) => {
                setGlyphGeneration(generation);
            };

            tileServer.register(groundRoute, provider.groundTiles);
            tileServer.register(labelRoute, provider.labelTiles);

            if (provider.diagnostics.length > 0) onDiagnostics?.(provider.diagnostics);
            setCredits(provider.attributions.map((attribution) => ({ attribution })));
            setReady(true);
        })().catch((error: unknown) => {
            onDiagnostics?.([`style could not be loaded: ${String(error)}`]);
        });

        return () => {
            cancelled = true;
            setReady(false);
            setGrounds([]);
            setLabels([]);
            tileServer.unregister(groundRoute);
            tileServer.unregister(labelRoute);
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
        if (!provider || !ready) return;
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
                setCredits(provider.attributions.map((attribution) => ({ attribution })));
                setStyleVersion((version) => version + 1);
            })
            .catch((error: unknown) => {
                onDiagnostics?.([`style could not be applied: ${String(error)}`]);
            });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [styleKey, ready]);

    /**
     * The ground: geometry only, and nothing a font does can invalidate it.
     *
     * Keyed by the style alone. A glyph range landing must not reach this
     * layer — that is the whole reason the halves are separate.
     */
    useEffect(() => {
        if (!ready) return;
        const next = createRasterLayerState({
            id: `${groundRoute}-s${styleVersion}`,
            source: {
                type: 'UrlTemplate',
                template: tileServer.urlTemplate({
                    routeId: groundRoute,
                    tileSize,
                    cacheKey: `s${styleVersion}`,
                }),
                tileSize,
                maxZoom,
                attributionRules: credits,
                scheme: TileScheme.XYZ,
            },
            opacity: clamp(opacityRef.current),
            visible: visibleRef.current,
            zIndex: 0,
        });
        setGrounds((prev) => [...prev, next]);
        const timer = setTimeout(() => setGrounds((prev) => prev.slice(-1)), HANDOVER_MS);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ready, styleVersion, credits, tileSize, maxZoom, groundRoute]);

    /**
     * The labels: replaced on a restyle and on every glyph arrival, always
     * above the ground and above the generation it takes over from.
     */
    useEffect(() => {
        if (!ready) return;
        labelDepth.current += 1;
        const next = createRasterLayerState({
            id: `${labelRoute}-s${styleVersion}-g${glyphGeneration}`,
            source: {
                type: 'UrlTemplate',
                template: tileServer.urlTemplate({
                    routeId: labelRoute,
                    tileSize,
                    cacheKey: `s${styleVersion}-g${glyphGeneration}`,
                }),
                tileSize,
                maxZoom,
                // Both halves carry the credit: the attribution overlay
                // deduplicates, so printing it twice costs nothing, and hiding
                // either half cannot silence it.
                attributionRules: credits,
                scheme: TileScheme.XYZ,
            },
            opacity: clamp(opacityRef.current),
            visible: visibleRef.current,
            zIndex: 1000 + labelDepth.current,
        });
        setLabels((prev) => [...prev, next]);
        const timer = setTimeout(() => setLabels((prev) => prev.slice(-1)), HANDOVER_MS);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ready, styleVersion, glyphGeneration, credits, tileSize, maxZoom, labelRoute]);

    // Pushed onto the existing states rather than rebuilding them: opacity and
    // visibility do not change what a tile contains, so nothing has to refetch.
    useEffect(() => {
        for (const state of [...grounds, ...labels]) {
            state.opacity = clamp(opacity);
            state.visible = visible;
        }
    }, [grounds, labels, opacity, visible]);

    if (grounds.length === 0) return null;
    return (
        <>
            {/* Ground first: the providers that ignore zIndex stack in mount
                order, so the labels have to be added after the ground. */}
            {grounds.map((state) => (
                <RasterLayer key={state.id} state={state} />
            ))}
            {labels.map((state) => (
                <RasterLayer key={state.id} state={state} />
            ))}
        </>
    );
}
