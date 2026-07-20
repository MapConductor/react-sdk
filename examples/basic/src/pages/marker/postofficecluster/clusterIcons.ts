import { ImageIcon } from '@mapconductor/js-sdk-core';
import type { ClusterIconProvider } from '@mapconductor/react-marker-clustering';

function countLabel(count: number): string {
  if (count > 1_000) return '1k+';
  if (count > 200) return '200+';
  if (count > 100) return '100+';
  return String(count);
}

function drawCluster(background: HTMLImageElement, label: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = background.naturalWidth;
  canvas.height = background.naturalHeight;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D context is unavailable');
  context.drawImage(background, 0, 0);
  context.font = `bold ${Math.floor(background.naturalHeight * 0.35)}px sans-serif`;
  context.fillStyle = 'white';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(label, background.naturalWidth / 2, Math.floor(background.naturalHeight * 0.22));
  return canvas;
}

export function createClusterIconProvider(background: HTMLImageElement): ClusterIconProvider {
  const cache = new Map<string, ImageIcon>();
  return count => {
    const label = countLabel(count);
    const cached = cache.get(label);
    if (cached) return cached;
    const icon = new ImageIcon(drawCluster(background, label), { anchor: { x: 0.5, y: 0.5 } });
    cache.set(label, icon);
    return icon;
  };
}
