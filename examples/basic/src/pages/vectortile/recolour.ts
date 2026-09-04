/**
 * Repaints a MapLibre style by category, for the vector tile sample.
 *
 * Blends rather than replaces. A real basemap distinguishes forest from grass
 * from farmland with a dozen greens, and flattening them all to one picked
 * colour throws that away — the map stops looking like a map. Mixing each
 * layer's own colour toward the picked one keeps the internal variation and
 * still moves the whole palette.
 */

/** Which knob a layer answers to, derived from its Shortbread source layer. */
const CATEGORY_BY_SOURCE_LAYER: Record<string, ColourCategory> = {
    ocean: 'water',
    water_polygons: 'water',
    water_lines: 'water',
    dam_polygons: 'water',
    dam_lines: 'water',
    land: 'land',
    sites: 'land',
    streets: 'street',
    street_polygons: 'street',
    buildings: 'building',
};

export type ColourCategory = 'water' | 'land' | 'street' | 'building';

export type Palette = Record<ColourCategory, string>;

/** The paint property that carries a layer's colour, by layer type. */
const COLOUR_KEY: Record<string, string> = {
    fill: 'fill-color',
    line: 'line-color',
    background: 'background-color',
};

type Rgb = [number, number, number];

/**
 * Parses the colour notations a style actually uses: `#rgb`, `#rrggbb`,
 * `rgb(r,g,b)` and `hsl(h,s%,l%)`. Anything else — an expression, a named
 * colour — returns null and is left untouched, which is the safe outcome.
 */
function parseColour(value: unknown): Rgb | null {
    if (typeof value !== 'string') return null;
    const text = value.trim();

    const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text);
    if (hex) {
        const digits = hex[1];
        const wide =
            digits.length === 3
                ? digits
                      .split('')
                      .map((digit) => digit + digit)
                      .join('')
                : digits;
        return [
            parseInt(wide.slice(0, 2), 16),
            parseInt(wide.slice(2, 4), 16),
            parseInt(wide.slice(4, 6), 16),
        ];
    }

    const rgb = /^rgba?\(([^)]+)\)$/i.exec(text);
    if (rgb) {
        const parts = rgb[1].split(',').map((part) => Number.parseFloat(part));
        if (parts.length < 3 || parts.slice(0, 3).some(Number.isNaN)) return null;
        return [parts[0], parts[1], parts[2]];
    }

    const hsl = /^hsla?\(([^)]+)\)$/i.exec(text);
    if (hsl) {
        const parts = hsl[1].split(',').map((part) => Number.parseFloat(part));
        if (parts.length < 3 || parts.slice(0, 3).some(Number.isNaN)) return null;
        return hslToRgb(parts[0], parts[1] / 100, parts[2] / 100);
    }

    return null;
}

function hslToRgb(hue: number, saturation: number, lightness: number): Rgb {
    const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
    const sector = (((hue % 360) + 360) % 360) / 60;
    const second = chroma * (1 - Math.abs((sector % 2) - 1));
    const base = lightness - chroma / 2;

    const [r, g, b] =
        sector < 1 ? [chroma, second, 0]
        : sector < 2 ? [second, chroma, 0]
        : sector < 3 ? [0, chroma, second]
        : sector < 4 ? [0, second, chroma]
        : sector < 5 ? [second, 0, chroma]
        : [chroma, 0, second];

    return [
        Math.round((r + base) * 255),
        Math.round((g + base) * 255),
        Math.round((b + base) * 255),
    ];
}

function toHex([r, g, b]: Rgb): string {
    const channel = (value: number) =>
        Math.max(0, Math.min(255, Math.round(value)))
            .toString(16)
            .padStart(2, '0');
    return `#${channel(r)}${channel(g)}${channel(b)}`;
}

function mix(from: Rgb, to: Rgb, amount: number): Rgb {
    return [
        from[0] + (to[0] - from[0]) * amount,
        from[1] + (to[1] - from[1]) * amount,
        from[2] + (to[2] - from[2]) * amount,
    ];
}

interface StyleLayer {
    type: string;
    'source-layer'?: string;
    paint?: Record<string, unknown>;
}

interface Style {
    layers?: StyleLayer[];
}

/**
 * Returns a copy of `style` with every recognised layer's colour mixed toward
 * its category's picked colour.
 *
 * `strength` of 0 leaves the style alone; 1 flattens each category to a single
 * colour. Layers the style spec paints with an expression are skipped.
 */
export function recolour<T extends Style>(style: T, palette: Palette, strength: number): T {
    if (strength <= 0) return style;

    const targets = new Map<ColourCategory, Rgb>();
    for (const [category, value] of Object.entries(palette) as [ColourCategory, string][]) {
        const parsed = parseColour(value);
        if (parsed) targets.set(category, parsed);
    }

    const layers = (style.layers ?? []).map((layer) => {
        // The background layer has no source layer; it reads as land, which is
        // what it is — the colour showing wherever nothing else is drawn.
        const category =
            layer.type === 'background'
                ? 'land'
                : CATEGORY_BY_SOURCE_LAYER[layer['source-layer'] ?? ''];
        const target = category && targets.get(category);
        if (!target) return layer;

        const key = COLOUR_KEY[layer.type];
        if (!key) return layer;

        const current = parseColour(layer.paint?.[key]);
        if (!current) return layer;

        return {
            ...layer,
            paint: { ...layer.paint, [key]: toHex(mix(current, target, strength)) },
        };
    });

    return { ...style, layers };
}
