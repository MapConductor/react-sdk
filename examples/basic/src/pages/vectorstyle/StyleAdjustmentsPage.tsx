import { useCallback, useEffect, useMemo, useState } from 'react';
import type { MapDesignTypeInterface, MapViewStateInterface } from '@mapconductor/js-sdk-core';
import { buildStyleRules, createVectorStyle, LayerRole, NO_STYLE_RULES } from '@mapconductor/js-vectorstyle';
import { VectorTileRasteriser } from '@mapconductor/react-vectortile';
import { ControlPanel, SliderControl } from '../../components/ControlPanel';
import { MapViewContainer } from '../../MapViewContainer';
import { useSampleI18n } from '../../samples/i18n';
import { showBasemap } from '../common/showBasemap';

const INIT_CAMERA = { lat: 35.6812, lng: 139.7671, zoom: 12 };

/**
 * OpenStreetMap in the Shortbread schema: layers name a standard source
 * layer, so a rule can say "roads" without knowing this style's layer ids.
 * The same document the android and iOS samples adjust.
 */
const STYLE_URL = 'https://tiles.versatiles.org/assets/styles/colorful/style.json';

type Preset = 'roads' | 'night' | 'water' | 'asAuthored';

const PRESETS: readonly Preset[] = ['roads', 'night', 'water', 'asAuthored'];

const grey = (level: number) => {
    const channel = Math.round(Math.max(0, Math.min(1, level)) * 255);
    return `rgb(${channel},${channel},${channel})`;
};

/** android の `StylePreset` / iOS の `StylePreset` と同じ 4 つ。 */
function rulesFor(preset: Preset, roadLightness: number) {
    const road = grey(roadLightness);
    switch (preset) {
        case 'asAuthored':
            return NO_STYLE_RULES;
        case 'roads':
            return buildStyleRules((rules) => {
                rules.all({ color: '#000000' });
                rules.role(LayerRole.label, { visible: false });
                rules.role(LayerRole.roadCasing, { color: grey(0.19) });
                rules.role(LayerRole.road, { color: road, widthScale: 1.4 });
            });
        case 'night':
            return buildStyleRules((rules) => {
                rules.all({ colorFilter: { darken: 0.55 } });
                rules.role(LayerRole.road, { color: road });
                rules.role(LayerRole.water, { color: 'rgb(10,28,43)' });
            });
        case 'water':
            return buildStyleRules((rules) => {
                rules.all({ visible: false });
                rules.role(LayerRole.background, { visible: true, color: grey(0.95) });
                rules.role(LayerRole.water, { visible: true, color: 'rgb(46,112,184)' });
            });
    }
}

/**
 * The same adjustments on every backend, through whichever road that backend
 * can take.
 *
 * MapLibre, Mapbox and MapTiler read the style themselves: they are handed
 * the author's document and then the *differences* each rule change makes,
 * so moving the slider sets a few hundred paint properties and the map never
 * reloads a tile. Every other provider here has no vector renderer, and on
 * the web there is no rasteriser to draw the style into tiles for them yet —
 * they say so in the diagnostics rather than showing a map that quietly
 * ignored the rules. android and iOS have one, which is why the same page
 * there works everywhere.
 */
export function StyleAdjustmentsPage() {
    const { t } = useSampleI18n();
    // Held, not rebuilt: `createVectorStyle` compares a rasteriser by
    // identity, so a new one each render would look like a different style
    // and tear the map down on every frame. `@State` on iOS, `remember` on
    // android, `useMemo` here.
    const rasteriser = useMemo(() => new VectorTileRasteriser(), []);
    const [preset, setPreset] = useState<Preset>('roads');
    const [roadLightness, setRoadLightness] = useState(1);
    const [fromCurrentDesign, setFromCurrentDesign] = useState(false);
    const [styleJson, setStyleJson] = useState<string | null>(null);
    const [failure, setFailure] = useState<string | null>(null);
    const [diagnostics, setDiagnostics] = useState<readonly string[]>([]);
    const [mapViewState, setMapViewState] =
        useState<MapViewStateInterface<MapDesignTypeInterface<unknown>> | null>(null);
    const onStateReady = useCallback(
        (state: MapViewStateInterface<MapDesignTypeInterface<unknown>>) => setMapViewState(state),
        [],
    );

    // A style *is* the basemap, so the backend's own one comes down while
    // one is drawn — but only where it has to. `showBasemap` leaves the
    // three that read styles alone (they replace their own design), and
    // while adjusting the map's own style nothing is blanked at all: there
    // the point is the design the backend is already drawing.
    //
    // The page's own choice must not follow the shared map onto other pages.
    useEffect(() => {
        if (!mapViewState) return;
        showBasemap(mapViewState, fromCurrentDesign);
        return () => showBasemap(mapViewState, true);
    }, [mapViewState, fromCurrentDesign]);

    useEffect(() => {
        let cancelled = false;
        fetch(STYLE_URL)
            .then((response) => response.text())
            .then((text) => {
                if (!cancelled) setStyleJson(text);
            })
            .catch((error: unknown) => {
                if (!cancelled) setFailure(String(error));
            });
        return () => {
            cancelled = true;
        };
    }, []);

    // A new object on every slider frame, by design: what decides whether the
    // map reloads is the style's *key*, not its identity. Same rules, same
    // key, and the installed style takes the difference in place.
    const style = useMemo(() => {
        if (!fromCurrentDesign && !styleJson) return null;
        return createVectorStyle({
            document: fromCurrentDesign ? 'currentDesign' : { text: styleJson as string },
            rules: rulesFor(preset, roadLightness),
            rasteriser,
        });
    }, [fromCurrentDesign, styleJson, preset, roadLightness, rasteriser]);

    return (
        <MapViewContainer
            initialCamera={INIT_CAMERA}
            onStateReady={onStateReady}
            mapStyle={style}
            onStyleDiagnostics={setDiagnostics}
        >
            <ControlPanel
                title={t({
                    en: 'Style Adjustments',
                    ja: 'スタイル調整',
                    'es-419': 'Ajustes de estilo',
                    de: 'Stil-Anpassungen',
                    th: 'การปรับแต่งสไตล์',
                    hi: 'स्टाइल समायोजन',
                })}
            >
                <div className="button-grid">
                    {PRESETS.map((id) => (
                        <button
                            key={id}
                            type="button"
                            // 既存の `.control-panel button` のスタイルに乗る。
                            // 選択中だけインラインで差をつける（専用クラスを
                            // 増やすより、この 1 ページのためのもの）。
                            style={
                                id === preset
                                    ? { background: '#1f2937', color: '#f8fafc', borderColor: '#1f2937' }
                                    : undefined
                            }
                            onClick={() => setPreset(id)}
                        >
                            {t(PRESET_LABELS[id])}
                        </button>
                    ))}
                </div>

                <label className="checkbox-control">
                    <input
                        type="checkbox"
                        checked={fromCurrentDesign}
                        onChange={(event) => setFromCurrentDesign(event.target.checked)}
                    />
                    <span>
                        {t({
                            en: "Adjust the map's own style",
                            ja: '地図自身のスタイルを調整する',
                            'es-419': 'Ajustar el estilo propio del mapa',
                            de: 'Den eigenen Stil der Karte anpassen',
                            th: 'ปรับสไตล์ของแผนที่เอง',
                            hi: 'मानचित्र की अपनी शैली समायोजित करें',
                        })}
                    </span>
                </label>

                <SliderControl
                    label={t({
                        en: 'Road lightness',
                        ja: '道路の明るさ',
                        'es-419': 'Luminosidad de las vías',
                        de: 'Helligkeit der Straßen',
                        th: 'ความสว่างของถนน',
                        hi: 'सड़क की चमक',
                    })}
                    value={roadLightness}
                    min={0}
                    max={1}
                    step={0.01}
                    onChange={setRoadLightness}
                />

                {/* A rule that matched nothing, an adjustment this backend
                    would not take, a style that could not be read: these all
                    look like "it nearly worked" and nothing else reports them. */}
                {failure ? <p className="diagnostic error">{failure}</p> : null}
                {diagnostics.map((line) => (
                    <p key={line} className="diagnostic">
                        {line}
                    </p>
                ))}
            </ControlPanel>
        </MapViewContainer>
    );
}

const PRESET_LABELS = {
    roads: { en: 'Roads', ja: '道路', 'es-419': 'Vías', de: 'Straßen', th: 'ถนน', hi: 'सड़कें' },
    night: { en: 'Night', ja: 'ナイト', 'es-419': 'Noche', de: 'Nacht', th: 'กลางคืน', hi: 'रात' },
    water: { en: 'Water', ja: '水域', 'es-419': 'Agua', de: 'Wasser', th: 'น้ำ', hi: 'जल' },
    asAuthored: {
        en: 'As authored',
        ja: '元のまま',
        'es-419': 'Como se creó',
        de: 'Wie erstellt',
        th: 'ตามต้นฉบับ',
        hi: 'मूल रूप में',
    },
} as const;
