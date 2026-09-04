import { useEffect, useMemo, useState } from 'react';
import { VectorTileLayer } from '@mapconductor/react-vectortile';
import { ControlPanel, SliderControl } from '../../components/ControlPanel';
import { MapViewContainer } from '../../MapViewContainer';
import { useSampleI18n } from '../../samples/i18n';
import type { Phrase } from '../../samples/language';
import { recolour, type ColourCategory, type Palette } from './recolour';

const INIT_CAMERA = { lat: 35.6812, lng: 139.7671, zoom: 12 };

/**
 * OpenStreetMap data in the Shortbread schema, which is what makes recolouring
 * by category possible: layers name a standard source layer, so `water_polygons`
 * can be found without knowing this particular style's layer ids.
 */
const STYLE_URL = 'https://tiles.versatiles.org/assets/styles/colorful/style.json';

const DEFAULT_PALETTE: Palette = {
    water: '#3a7ca5',
    land: '#f2efe6',
    street: '#ffffff',
    building: '#d9d0c9',
};

const CATEGORY_ORDER: ColourCategory[] = ['water', 'land', 'street', 'building'];

const CATEGORY_LABELS: Record<ColourCategory, Phrase> = {
    water: { en: 'Water', ja: '水域', 'es-419': 'Agua', de: 'Wasser', th: 'แหล่งน้ำ', hi: 'जल' },
    land: { en: 'Land', ja: '陸地', 'es-419': 'Terreno', de: 'Land', th: 'พื้นดิน', hi: 'भूमि' },
    street: { en: 'Roads', ja: '道路', 'es-419': 'Carreteras', de: 'Straßen', th: 'ถนน', hi: 'सड़कें' },
    building: { en: 'Buildings', ja: '建物', 'es-419': 'Edificios', de: 'Gebäude', th: 'อาคาร', hi: 'इमारतें' },
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
    const [strength, setStrength] = useState(0.6);
    const [opacity, setOpacity] = useState(1);
    const [diagnostics, setDiagnostics] = useState<string[]>([]);

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

    // Recolouring the whole 324-layer style on every slider tick would be
    // wasteful, so it is memoised on the inputs that actually change it.
    const style = useMemo(
        () => (baseStyle ? recolour(baseStyle, palette, strength) : null),
        [baseStyle, palette, strength],
    );

    return (
        <MapViewContainer initialCamera={INIT_CAMERA}>
            {style ? (
                <VectorTileLayer
                    style={style}
                    opacity={opacity}
                    onDiagnostics={setDiagnostics}
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
                {CATEGORY_ORDER.map((category) => (
                    <label className="slider-control" key={category}>
                        <span className="slider-label">{t(CATEGORY_LABELS[category])}</span>
                        <input
                            type="color"
                            value={palette[category]}
                            onChange={(event) =>
                                setPalette((current) => ({
                                    ...current,
                                    [category]: event.target.value,
                                }))
                            }
                        />
                    </label>
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
                              en: 'Recolouring reuses the vector tiles already fetched — only the rasterisation is redone. Labels are not drawn.',
                              ja: '色の変更は取得済みのベクタータイルを再利用し、ラスタライズだけをやり直します。ラベルは描画されません。',
                              'es-419': 'Recolorear reutiliza las teselas vectoriales ya descargadas: solo se rehace la rasterización. Las etiquetas no se dibujan.',
                              de: 'Das Umfärben nutzt die bereits geladenen Vektorkacheln weiter — nur die Rasterung wird wiederholt. Beschriftungen werden nicht gezeichnet.',
                              th: 'การเปลี่ยนสีใช้เวกเตอร์ไทล์ที่ดาวน์โหลดไว้แล้ว โดยทำแรสเตอร์ใหม่เท่านั้น ป้ายชื่อจะไม่ถูกวาด',
                              hi: 'रंग बदलने पर पहले से लाई गई वेक्टर टाइलें ही दोबारा उपयोग होती हैं — केवल रैस्टराइज़ेशन दोहराया जाता है। लेबल नहीं बनाए जाते।',
                          })}
                </p>
                {diagnostics.length > 0 ? (
                    <p className="control-panel-note">{diagnostics.join(' / ')}</p>
                ) : null}
            </ControlPanel>
        </MapViewContainer>
    );
}
