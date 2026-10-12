import { LayerRole, buildStyleRules, NO_STYLE_RULES, type StyleRules } from '@mapconductor/react-vectorstyle';

/** A category that can be painted as well as switched off. */
export type ColourCategory = 'water' | 'land' | 'street' | 'building';

/** Everything the page can switch off, painted or not. */
export type Category = ColourCategory | 'label';

export type Palette = Record<ColourCategory, string>;

/**
 * What the sample's knobs are, and the roles each one reaches.
 *
 * Several roles per knob, because a knob is a thing on the map and a role is
 * a thing in the style. What a reader calls "land" is the background the map
 * is drawn on (`background`) *plus* the landuse patches on it (`land`) *plus*
 * the sites (`landuse`) — paint or hide only the middle one and the ground
 * stays exactly as it was. "Water" is both the areas and the rivers
 * (`waterway`).
 *
 * Roles rather than the style's own layer ids: the same word means the same
 * thing in someone else's style, which is the point of them. android-sdk の
 * `VectorTileCategory` と ios-sdk の `VectorTileCategory` も同じ並び・同じ
 * 既定色。
 */
export const ROLES_BY_CATEGORY: Record<Category, string[]> = {
    water: [LayerRole.water, LayerRole.waterway],
    land: [LayerRole.background, LayerRole.land, LayerRole.landuse],
    // A casing is a road too, so this reaches it.
    street: [LayerRole.road],
    building: [LayerRole.building],
    // Every symbol layer: place names, POIs, road shields, the one-way
    // arrows painted along a street. On the raster path these are the
    // transparent overlay, so switching them off empties that half.
    label: [LayerRole.label],
};

export const CATEGORY_ORDER: Category[] = ['water', 'land', 'street', 'building', 'label'];

/**
 * The categories with a colour, in order.
 *
 * Labels are not among them. Not an oversight: the tint pulls every matched
 * layer towards one colour, and doing that to text would flatten the whole
 * legend — the green of a park label, the blue of a river's — by merely
 * opening the page. They can still be switched off, which is what a label
 * knob is actually wanted for.
 */
export const TINTED: ColourCategory[] = ['water', 'land', 'street', 'building'];

export const DEFAULT_PALETTE: Palette = {
    water: '#3a7ca5',
    land: '#f2efe6',
    street: '#ffffff',
    building: '#d9d0c9',
};

/**
 * The knobs as the rules handed to the layer.
 *
 * Unticking a category switches its layers off in the document the renderer
 * is given, so they are not drawn at all. A colour *blends* rather than
 * replaces: a real basemap tells forest from grass from farmland with a dozen
 * greens, and flattening each category to one picked colour throws that away
 * — the map stops looking like a map. `strength` of 0 leaves the style as its
 * author wrote it, and nothing is compiled at all.
 */
export function styleRulesFor(
    hidden: Record<Category, boolean>,
    palette: Palette,
    strength: number,
): StyleRules | undefined {
    const gone = CATEGORY_ORDER.filter((category) => hidden[category]);
    if (gone.length === 0 && strength <= 0) return undefined;
    const rules = buildStyleRules((r) => {
        for (const category of gone) {
            for (const role of ROLES_BY_CATEGORY[category]) r.role(role, { visible: false });
        }
        if (strength <= 0) return;
        for (const category of TINTED) {
            if (hidden[category]) continue;
            for (const role of ROLES_BY_CATEGORY[category]) {
                r.role(role, { colorFilter: { mix: { color: palette[category], amount: strength } } });
            }
        }
    });
    return rules.json === NO_STYLE_RULES.json ? undefined : rules;
}
