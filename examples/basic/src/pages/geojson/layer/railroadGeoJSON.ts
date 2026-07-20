import { ZipReaderStream } from '@zip.js/zip.js';
import { colorArgb, GeoJSONParser, type GeoJSONFeatureData } from '@mapconductor/react-geojson-layer';

interface RailroadStyleEntry {
  company: { name: string; lines: Array<{ name: string; color: string }> };
}

export interface RailroadGeoJSONSource {
  load(signal: AbortSignal): Promise<GeoJSONFeatureData[]>;
}

async function readArchive(stream: ReadableStream<Uint8Array>) {
  const entries = stream.pipeThrough(new ZipReaderStream()).getReader();
  let geoJSON: string | null = null;
  let styleJSON: string | null = null;
  try {
    for (;;) {
      const { done, value: entry } = await entries.read();
      if (done) break;
      if (!entry.readable) continue;
      const filename = entry.filename.toLowerCase();
      const usable = !entry.directory && !entry.filename.startsWith('__MACOSX/');
      if (usable && filename.endsWith('railroadsection.geojson')) geoJSON = await new Response(entry.readable).text();
      else if (usable && filename.endsWith('railroadsection.style.json')) styleJSON = await new Response(entry.readable).text();
      else await new Response(entry.readable).arrayBuffer();
    }
  } finally {
    await entries.cancel().catch(() => {});
  }
  if (geoJSON == null || styleJSON == null) throw new Error('Railroad GeoJSON archive is incomplete');
  const styles: unknown = JSON.parse(styleJSON);
  if (!Array.isArray(styles)) throw new Error('Railroad style JSON must be an array');
  return { geoJSON, styles: styles as RailroadStyleEntry[] };
}

function parseColor(value: unknown): number | null {
  if (typeof value !== 'string' || !/^#[0-9a-f]{6}$/i.test(value)) return null;
  const rgb = Number.parseInt(value.slice(1), 16);
  return colorArgb(255, (rgb >>> 16) & 0xff, (rgb >>> 8) & 0xff, rgb & 0xff);
}

function applyStyles(features: GeoJSONFeatureData[], styles: RailroadStyleEntry[]) {
  const colors = new Map<string, number>();
  for (const { company } of styles) {
    if (!company || !Array.isArray(company.lines)) continue;
    for (const line of company.lines) {
      const color = parseColor(line.color);
      if (color != null) colors.set(`${company.name}\0${line.name}`, color);
    }
  }
  return features.map(feature => {
    const company = feature.properties.N02_004;
    const line = feature.properties.N02_003;
    if (typeof company !== 'string' || typeof line !== 'string') return feature;
    const strokeColor = colors.get(`${company}\0${line}`);
    return strokeColor == null ? feature : { ...feature, strokeColor };
  });
}

export function createRailroadGeoJSONSource(url: string): RailroadGeoJSONSource {
  return {
    async load(signal) {
      const response = await fetch(url, { signal });
      if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`);
      const archive = await readArchive(response.body);
      const features = GeoJSONParser.parseFeatures(archive.geoJSON);
      if (features.length === 0) throw new Error('No GeoJSON features found');
      return applyStyles(features, archive.styles);
    },
  };
}

export const railroadGeoJSONSource = createRailroadGeoJSONSource(`${import.meta.env.BASE_URL}geojson/N02-22_GML.zip`);
