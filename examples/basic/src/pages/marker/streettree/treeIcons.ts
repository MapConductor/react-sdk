import { ImageIcon } from '@mapconductor/js-sdk-core';

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
