import { ImageIcon } from '@mapconductor/js-sdk-core';
import { isVerticalSide, type LabelSide } from './streetTreeLabels';

/** ラベルの文字の大きさ（CSS px）。ラベルの重なり判定もこの値で測る。 */
export const LABEL_TEXT_PX = 11;

/** ラベルの字体。SDK はこれを canvas の font と SVG の font-family にそのまま使う。 */
const LABEL_TYPE_FACE = 'sans-serif';

/**
 * 縁取りの太さ（CSS px）。SDK は `max(アイコンの scale, 2)` で、ラベルの幅と高さにこの 2 倍を足す。
 * 点とラベルのすき間も同じ値になる（`max(縁取り, 点の大きさ × 0.05)`）。
 */
export const LABEL_OUTLINE_PX = 2;

const labelSizes = new Map<string, { width: number; height: number }>();
let measureContext: CanvasRenderingContext2D | null = null;

/**
 * ラベルの幅と高さ（CSS px、縁取りを含む）。樹種名と向きごとに 1 回だけ測る。
 * SDK と同じ測り方（縦書きは 1 文字 1em に積み、列の幅は字の幅と 1em の大きい方）。
 */
export function labelSize(text: string, vertical: boolean): { width: number; height: number } {
  const key = `${vertical ? 'v' : 'h'}/${text}`;
  const cached = labelSizes.get(key);
  if (cached) return cached;
  measureContext ??= document.createElement('canvas').getContext('2d');
  const measure = (value: string) => {
    if (!measureContext) return value.length * LABEL_TEXT_PX * 0.6;
    measureContext.font = `${LABEL_TEXT_PX}px ${LABEL_TYPE_FACE}`;
    return measureContext.measureText(value).width;
  };
  const outline = LABEL_OUTLINE_PX * 2;
  let size: { width: number; height: number };
  if (vertical) {
    const glyphs = Array.from(text);
    let column = LABEL_TEXT_PX;
    for (const glyph of glyphs) column = Math.max(column, measure(glyph));
    size = { width: Math.ceil(column) + outline, height: glyphs.length * LABEL_TEXT_PX + outline };
  } else {
    size = { width: measure(text) + outline, height: LABEL_TEXT_PX + outline };
  }
  labelSizes.set(key, size);
  return size;
}

/**
 * 点の `side` 側に樹種名を添えたアイコン。
 *
 * SDK の `ImageIcon` のラベルを使う。点の画像は作り直さない -- タイル描画は点の画像と
 * 文字を別々に描くので、ラベル付きのアイコンをいくつ作っても点の画像は 1 枚のまま。
 * android-sdk / ios-sdk の `StreetTreeIcons.labelled` と同じ。
 */
export function labelledIcon(dot: ImageIcon, text: string, side: LabelSide): ImageIcon {
  return new ImageIcon(dot.image, {
    iconSize: dot.iconSize,
    anchor: { x: 0.5, y: 0.5 },
    infoAnchor: { x: 0.5, y: 0 },
    label: text,
    labelTextColor: '#282828',
    labelTextSize: LABEL_TEXT_PX,
    labelTypeFace: LABEL_TYPE_FACE,
    labelStrokeColor: '#FFFFFF',
    labelPosition: side,
    labelWritingMode: isVerticalSide(side) ? 'vertical-rl' : 'horizontal-tb',
  });
}

/**
 * One coloured dot per species, shared by every tree of that species.
 *
 * Baked once into a canvas. Building an icon per marker would measure icon
 * generation rather than drawing, and there are 144,183 markers against a
 * hundred or so species.
 */
/**
 * `sizeCssPx` は **CSS ピクセル**。タイルは 256px の canvas に描かれて 256 CSS px
 * として表示されるので、ここは devicePixelRatio を掛けない -- 掛けると画面が
 * 精細なほど大きくなってしまう。
 *
 * ios-sdk はポイント、android-sdk は dp で同じ 10 を使う。android は一時期ここだけ
 * 生ピクセルで作っていて、端末が精細なほど小さく見えていた。
 */
export function createSpeciesIcons(count: number, sizeCssPx = 10): ImageIcon[] {
  return Array.from({ length: count }, (_unused, index) => {
    const canvas = document.createElement('canvas');
    canvas.width = sizeCssPx;
    canvas.height = sizeCssPx;
    const context = canvas.getContext('2d');
    if (context) {
      const radius = sizeCssPx / 2 - 1;
      context.beginPath();
      context.arc(sizeCssPx / 2, sizeCssPx / 2, radius, 0, Math.PI * 2);
      context.fillStyle = speciesColour(index, count);
      context.fill();
      context.strokeStyle = 'rgba(0, 0, 0, 0.43)';
      context.lineWidth = 1;
      context.stroke();
    }
    return new ImageIcon(canvas, {
      iconSize: sizeCssPx,
      anchor: { x: 0.5, y: 0.5 },
      infoAnchor: { x: 0.5, y: 0 },
    });
  });
}

/**
 * Golden-angle hue rotation, so neighbouring species indices do not come out
 * as neighbouring colours. The last entry is the "other" bucket, which reads
 * as grey rather than competing with a named species for a hue.
 *
 * Matches android-sdk's StreetTreeIcons and ios-sdk's StreetTreeIcons, so a
 * species is the same colour on all three.
 */
function speciesColour(index: number, count: number): string {
  if (index === count - 1) return 'rgb(150, 150, 155)';
  return hsvToCss((index * 137.508) % 360, 0.7, 0.8);
}

function hsvToCss(hue: number, saturation: number, value: number): string {
  const sector = hue / 60;
  const chroma = value * saturation;
  const second = chroma * (1 - Math.abs((sector % 2) - 1));
  const [r, g, b] =
    sector < 1 ? [chroma, second, 0]
      : sector < 2 ? [second, chroma, 0]
        : sector < 3 ? [0, chroma, second]
          : sector < 4 ? [0, second, chroma]
            : sector < 5 ? [second, 0, chroma]
              : [chroma, 0, second];
  const base = value - chroma;
  const byte = (channel: number) => Math.round((channel + base) * 255);
  return `rgb(${byte(r)}, ${byte(g)}, ${byte(b)})`;
}
