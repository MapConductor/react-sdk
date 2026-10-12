import { useCallback, useEffect, useMemo, useState } from 'react';
import { type MapDesignTypeInterface, type MapViewStateInterface } from '@mapconductor/js-sdk-core';
import { VectorTileLayer } from '@mapconductor/react-vectortile';
import { ControlPanel, SliderControl } from '../../components/ControlPanel';
import { MapViewContainer } from '../../MapViewContainer';
import { showBasemap } from '../common/showBasemap';
import { useSampleI18n } from '../../samples/i18n';
import type { Phrase } from '../../samples/language';
import {
    CATEGORY_ORDER,
    DEFAULT_PALETTE,
    TINTED,
    styleRulesFor,
    type Category,
    type ColourCategory,
    type Palette,
} from './categories';

const INIT_CAMERA = { lat: 35.6812, lng: 139.7671, zoom: 12 };

/**
 * OpenStreetMap data in the Shortbread schema, which is what lets the SDK give
 * every layer a role: a layer names a standard source layer, so the water can
 * be found without knowing this particular style's layer ids.
 */
const STYLE_URL = 'https://tiles.versatiles.org/assets/styles/colorful/style.json';


const CATEGORY_LABELS: Record<Category, Phrase> = {
    water: { en: 'Water', ja: '水域', 'es-419': 'Agua', de: 'Wasser', th: 'แหล่งน้ำ', hi: 'जल' },
    land: { en: 'Land', ja: '陸地', 'es-419': 'Terreno', de: 'Land', th: 'พื้นดิน', hi: 'भूमि' },
    street: { en: 'Roads', ja: '道路', 'es-419': 'Carreteras', de: 'Straßen', th: 'ถนน', hi: 'सड़कें' },
    building: { en: 'Buildings', ja: '建物', 'es-419': 'Edificios', de: 'Gebäude', th: 'อาคาร', hi: 'इमारतें' },
    label: { en: 'Labels', ja: 'ラベル', 'es-419': 'Etiquetas', de: 'Beschriftungen', th: 'ป้ายชื่อ', hi: 'लेबल' },
};

/**
 * Renders a MapLibre vector style as raster tiles, and repaints it live.
 *
 * The point of the colour pickers is not the colours. Changing them replaces
 * the style and re-rasterises the tiles already in memory — no vector tile is
 * fetched again, because the geometry did not change, only the paint applied to
 * it. That is what makes this practical on backends that cannot read a vector
 * style at all: they see an ordinary raster layer throughout.
 */
export function VectorTileLayerPage() {
    const { t } = useSampleI18n();
    const [baseStyle, setBaseStyle] = useState<object | null>(null);
    const [failure, setFailure] = useState<string | null>(null);
    const [palette, setPalette] = useState<Palette>(DEFAULT_PALETTE);
    const [hidden, setHidden] = useState<Record<Category, boolean>>({
        water: false,
        land: false,
        street: false,
        building: false,
        label: false,
    });
    const [strength, setStrength] = useState(0.6);
    const [opacity, setOpacity] = useState(1);
    const [diagnostics, setDiagnostics] = useState<string[]>([]);
    const [asBasemap, setAsBasemap] = useState(false);
    const [mapViewState, setMapViewState] =
        useState<MapViewStateInterface<MapDesignTypeInterface<unknown>> | null>(null);
    const onStateReady = useCallback(
        (state: MapViewStateInterface<MapDesignTypeInterface<unknown>>) => setMapViewState(state),
        [],
    );

    useEffect(() => {
        if (!mapViewState) return;
        showBasemap(mapViewState, !asBasemap);
        // The page's own choice must not follow the singleton map onto other pages.
        return () => showBasemap(mapViewState, true);
    }, [mapViewState, asBasemap]);

    useEffect(() => {
        let cancelled = false;
        fetch(STYLE_URL)
            .then((response) => response.json())
            .then((json: object) => {
                if (!cancelled) setBaseStyle(json);
            })
            .catch((error: unknown) => {
                if (!cancelled) setFailure(String(error));
            });
        return () => {
            cancelled = true;
        };
    }, []);

    /**
     * The knobs, as the rules handed to the layer: what to leave out and what
     * to blend towards. Memoised on the inputs that actually change them --
     * a slider emits on every frame, and compiling a 257-layer style per
     * frame for an unchanged palette would be waste.
     *
     * `undefined` rather than an empty rule set when nothing is adjusted: the
     * layer then never loads the compiler at all.
     */
    const rules = useMemo(
        () => styleRulesFor(hidden, palette, strength),
        [hidden, palette, strength],
    );

    return (
        <MapViewContainer initialCamera={INIT_CAMERA} onStateReady={onStateReady}>
            {baseStyle ? (
                <VectorTileLayer
                    style={baseStyle}
                    rules={rules}
                    opacity={opacity}
                    onDiagnostics={setDiagnostics}
                    asBasemap={asBasemap}
                />
            ) : null}
            <ControlPanel
                title={t({
                    en: 'Vector Tile Layer',
                    ja: 'ベクタータイルレイヤー',
                    'es-419': 'Capa de teselas vectoriales',
                    de: 'Vektorkachel-Ebene',
                    th: 'เลเยอร์เวกเตอร์ไทล์',
                    hi: 'वेक्टर टाइल लेयर',
                })}
            >
                <label className="checkbox-control">
                    <input
                        type="checkbox"
                        checked={asBasemap}
                        onChange={(event) => setAsBasemap(event.target.checked)}
                    />
                    <span>
                        {t({
                            en: 'As basemap (hide the provider\'s own)',
                            ja: 'ベースマップとして使う（プロバイダの地図を隠す）',
                            'es-419': 'Como mapa base (ocultar el del proveedor)',
                            de: 'Als Basiskarte (die des Anbieters ausblenden)',
                            th: 'ใช้เป็นแผนที่ฐาน (ซ่อนของผู้ให้บริการ)',
                            hi: 'बेसमैप के रूप में (प्रदाता का छिपाएँ)',
                        })}
                    </span>
                </label>
                {CATEGORY_ORDER.map((category) => (
                    <div className="slider-control" key={category}>
                        <span className="slider-label">
                            <label className="category-visibility">
                                <input
                                    type="checkbox"
                                    checked={!hidden[category]}
                                    onChange={(event) =>
                                        setHidden((current) => ({
                                            ...current,
                                            [category]: !event.target.checked,
                                        }))
                                    }
                                />
                                <span>{t(CATEGORY_LABELS[category])}</span>
                            </label>
                        </span>
                        {TINTED.includes(category as ColourCategory) ? (
                            <input
                                type="color"
                                aria-label={t(CATEGORY_LABELS[category])}
                                value={palette[category as ColourCategory]}
                                disabled={hidden[category]}
                                onChange={(event) =>
                                    setPalette((current) => ({
                                        ...current,
                                        [category]: event.target.value,
                                    }))
                                }
                            />
                        ) : null}
                    </div>
                ))}
                <SliderControl
                    label={t({
                        en: 'Tint strength',
                        ja: '色の強さ',
                        'es-419': 'Intensidad del tinte',
                        de: 'Farbstärke',
                        th: 'ความเข้มของสี',
                        hi: 'रंग की तीव्रता',
                    })}
                    value={strength}
                    min={0}
                    max={1}
                    onChange={setStrength}
                />
                <SliderControl
                    label={t({
                        en: 'Opacity',
                        ja: '透明度',
                        'es-419': 'Opacidad',
                        de: 'Deckkraft',
                        th: 'ความทึบ',
                        hi: 'अपारदर्शिता',
                    })}
                    value={opacity}
                    min={0}
                    max={1}
                    onChange={setOpacity}
                />
                <p className="control-panel-note">
                    {failure
                        ? t({
                              en: `The style could not be loaded: ${failure}`,
                              ja: `スタイルを読み込めませんでした: ${failure}`,
                              'es-419': `No se pudo cargar el estilo: ${failure}`,
                              de: `Der Stil konnte nicht geladen werden: ${failure}`,
                              th: `ไม่สามารถโหลดสไตล์ได้: ${failure}`,
                              hi: `स्टाइल लोड नहीं हो सकी: ${failure}`,
                          })
                        : t({
                              en: 'Recolouring reuses the vector tiles already fetched — only the rasterisation is redone. Unticking a category hides its layers, so they are never drawn. Labels ride on a second, transparent layer above the ground.',
                              ja: '色の変更は取得済みのベクタータイルを再利用し、ラスタライズだけをやり直します。チェックを外した種別はレイヤーごと非表示になり、描画されません。ラベルは地物の上に重なる透明なレイヤーに描かれます。',
                              'es-419': 'Recolorear reutiliza las teselas vectoriales ya descargadas: solo se rehace la rasterización. Las etiquetas van en una segunda capa transparente sobre el terreno.',
                              de: 'Das Umfärben nutzt die bereits geladenen Vektorkacheln weiter — nur die Rasterung wird wiederholt. Beschriftungen liegen auf einer zweiten, transparenten Ebene darüber.',
                              th: 'การเปลี่ยนสีใช้เวกเตอร์ไทล์ที่ดาวน์โหลดไว้แล้ว โดยทำแรสเตอร์ใหม่เท่านั้น ป้ายชื่อวาดบนเลเยอร์โปร่งใสอีกชั้นที่ซ้อนอยู่ด้านบน',
                              hi: 'रंग बदलने पर पहले से लाई गई वेक्टर टाइलें ही दोबारा उपयोग होती हैं — केवल रैस्टराइज़ेशन दोहराया जाता है। लेबल ऊपर एक अलग पारदर्शी लेयर पर बनते हैं।',
                          })}
                </p>
                {diagnostics.length > 0 ? (
                    <p className="control-panel-note">{diagnostics.join(' / ')}</p>
                ) : null}
            </ControlPanel>
        </MapViewContainer>
    );
}
