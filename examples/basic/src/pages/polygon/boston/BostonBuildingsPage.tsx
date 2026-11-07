import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createGeoPoint, createPolygonState, type GeoPoint, type PolygonState } from '@mapconductor/js-sdk-core';
import { Polygons } from '@mapconductor/js-sdk-react';
import { ControlPanel } from '../../../components/ControlPanel';
import { MapViewContainer } from '../../../MapViewContainer';
import { useSampleI18n } from '../../../samples/i18n';

/**
 * Building footprints of central Boston (about 0.8 x 1.1 km) from the Overture
 * Maps buildings theme, drawn with one <Polygons>.
 *
 * The copies control lays the same block out 2 x 2 or 4 x 4 times side by side,
 * so the page doubles as a load test for many polygons.
 */
interface BuildingsDoc {
  attribution: string;
  license: string;
  bbox: [number, number, number, number];
  buildings: { h: number | null; rings: number[][] }[];
}

const DEFAULT_CAMERA = { lat: 42.35545, lng: -71.0605, zoom: 16 };
const GRID_SIZES = [1, 2, 4] as const;
type GridSize = (typeof GRID_SIZES)[number];

/**
 * `?camera=lat,lng,zoom` and `?grid=1|2|4` set where the page opens and how many
 * copies it starts with, so a measurement sees the same view on every provider.
 */
function initialParams(): { camera: typeof DEFAULT_CAMERA; grid: GridSize } {
  if (typeof window === 'undefined') return { camera: DEFAULT_CAMERA, grid: 1 };
  const params = new URLSearchParams(window.location.search);
  const [lat, lng, zoom] = (params.get('camera') ?? '').split(',').map(Number);
  const camera = [lat, lng, zoom].some(n => !Number.isFinite(n)) ? DEFAULT_CAMERA : { lat, lng, zoom };
  const grid = GRID_SIZES.find(size => String(size) === params.get('grid')) ?? 1;
  return { camera, grid };
}
const TAPPED = 'rgba(37, 99, 235, 0.85)';

// Darker for taller buildings; grey when the height is unknown.
function fillForHeight(height: number | null): string {
  if (height == null) return 'rgba(148, 163, 184, 0.6)';
  if (height < 15) return 'rgba(254, 240, 138, 0.7)';
  if (height < 30) return 'rgba(253, 186, 116, 0.7)';
  if (height < 60) return 'rgba(249, 115, 22, 0.7)';
  if (height < 120) return 'rgba(220, 38, 38, 0.7)';
  return 'rgba(127, 29, 29, 0.75)';
}

function toPoints(ring: number[], dLng: number, dLat: number): GeoPoint[] {
  const points: GeoPoint[] = [];
  for (let i = 0; i < ring.length; i += 2) {
    points.push(createGeoPoint({ longitude: ring[i] + dLng, latitude: ring[i + 1] + dLat }));
  }
  return points;
}

function buildStates(doc: BuildingsDoc, grid: number, onTap: (height: number | null) => void): PolygonState[] {
  const [west, south, east, north] = doc.bbox;
  const states: PolygonState[] = [];
  for (let row = 0; row < grid; row++) {
    for (let column = 0; column < grid; column++) {
      // Copies go east and south of the original block.
      const dLng = column * (east - west);
      const dLat = -row * (north - south);
      doc.buildings.forEach((building, index) => {
        const [outer, ...holes] = building.rings;
        states.push(
          createPolygonState({
            id: `boston-${row}-${column}-${index}`,
            points: toPoints(outer, dLng, dLat),
            holes: holes.map(hole => toPoints(hole, dLng, dLat)),
            strokeColor: 'rgba(68, 64, 60, 0.8)',
            strokeWidth: 1,
            fillColor: fillForHeight(building.h),
            onClick: event => {
              event.state.fillColor = TAPPED;
              onTap(building.h);
            },
          })
        );
      });
    }
  }
  return states;
}

export function BostonBuildingsPage() {
  const { t } = useSampleI18n();
  const [doc, setDoc] = useState<BuildingsDoc | null>(null);
  const [initial] = useState(initialParams);
  const [grid, setGrid] = useState<GridSize>(initial.grid);
  const [tapped, setTapped] = useState<number | null | undefined>(undefined);
  const [timing, setTiming] = useState<{ build: number; frame: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${import.meta.env.BASE_URL}boston/boston-buildings.json`)
      .then(response => response.json() as Promise<BuildingsDoc>)
      .then(loaded => { if (!cancelled) setDoc(loaded); });
    return () => { cancelled = true; };
  }, []);

  const buildStartRef = useRef(0);
  const built = useMemo(() => {
    if (!doc) return null;
    const start = performance.now();
    const states = buildStates(doc, grid, setTapped);
    const vertices = states.reduce((n, s) => n + s.points.length + s.holes.reduce((m, h) => m + h.length, 0), 0);
    return { states, vertices, build: performance.now() - start };
  }, [doc, grid]);

  // Time from handing the list to <Polygons> until the frame after it: the
  // child's effect has registered the polygons by the time this one runs.
  useLayoutEffect(() => { buildStartRef.current = performance.now(); }, [built]);
  useEffect(() => {
    if (!built) return;
    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => setTiming({ build: built.build, frame: performance.now() - buildStartRef.current }));
    });
    return () => cancelAnimationFrame(raf);
  }, [built]);

  return (
    <MapViewContainer initialCamera={initial.camera}>
      {built && <Polygons states={built.states} />}
      <ControlPanel
        title={t({
          en: 'Boston buildings',
          ja: 'ボストンの建物',
          'es-419': 'Edificios de Boston',
          de: 'Gebäude in Boston',
          th: 'อาคารในบอสตัน',
          hi: 'बोस्टन की इमारतें',
        })}
      >
        <div className="button-grid" style={{ marginBottom: 8 }}>
          {GRID_SIZES.map(size => (
            <button
              key={size}
              type="button"
              data-testid={`grid-${size}`}
              className={size === grid ? 'active' : undefined}
              onClick={() => setGrid(size)}
            >
              {size === 1 ? '×1' : `${size}×${size}`}
            </button>
          ))}
        </div>
        {built ? (
          <p className="control-panel-note" data-testid="stats">
            {t({
              en: `${built.states.length.toLocaleString()} polygons, ${built.vertices.toLocaleString()} vertices`,
              ja: `ポリゴン ${built.states.length.toLocaleString()} 個・頂点 ${built.vertices.toLocaleString()} 個`,
              'es-419': `${built.states.length.toLocaleString()} polígonos, ${built.vertices.toLocaleString()} vértices`,
              de: `${built.states.length.toLocaleString()} Polygone, ${built.vertices.toLocaleString()} Eckpunkte`,
              th: `โพลีกอน ${built.states.length.toLocaleString()} รูป จุดยอด ${built.vertices.toLocaleString()} จุด`,
              hi: `${built.states.length.toLocaleString()} पॉलीगॉन, ${built.vertices.toLocaleString()} शीर्ष`,
            })}
            {timing && (
              <>
                <br />
                <span data-testid="timing">
                  {t({
                    en: `states ${timing.build.toFixed(0)} ms, next frame ${timing.frame.toFixed(0)} ms`,
                    ja: `state 作成 ${timing.build.toFixed(0)} ms・次のフレームまで ${timing.frame.toFixed(0)} ms`,
                    'es-419': `estados ${timing.build.toFixed(0)} ms, siguiente cuadro ${timing.frame.toFixed(0)} ms`,
                    de: `States ${timing.build.toFixed(0)} ms, nächster Frame ${timing.frame.toFixed(0)} ms`,
                    th: `สร้าง state ${timing.build.toFixed(0)} ms เฟรมถัดไป ${timing.frame.toFixed(0)} ms`,
                    hi: `state ${timing.build.toFixed(0)} ms, अगला फ़्रेम ${timing.frame.toFixed(0)} ms`,
                  })}
                </span>
              </>
            )}
          </p>
        ) : (
          <p className="control-panel-note">…</p>
        )}
        {tapped !== undefined && (
          <p className="control-panel-note">
            {tapped == null
              ? t({ en: 'Height unknown', ja: '高さ不明', 'es-419': 'Altura desconocida', de: 'Höhe unbekannt', th: 'ไม่ทราบความสูง', hi: 'ऊँचाई अज्ञात' })
              : t({
                  en: `Height ${tapped} m`,
                  ja: `高さ ${tapped} m`,
                  'es-419': `Altura ${tapped} m`,
                  de: `Höhe ${tapped} m`,
                  th: `ความสูง ${tapped} ม.`,
                  hi: `ऊँचाई ${tapped} मी`,
                })}
          </p>
        )}
        <p className="control-panel-note" style={{ fontSize: 11 }}>
          {doc ? `${doc.attribution} (${doc.license})` : null}
        </p>
      </ControlPanel>
    </MapViewContainer>
  );
}
