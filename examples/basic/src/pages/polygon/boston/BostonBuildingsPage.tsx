import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createGeoPoint, createPolygonState, type GeoPoint, type PolygonState } from '@mapconductor/js-sdk-core';
import { Polygons } from '@mapconductor/js-sdk-react';
import { ControlPanel } from '../../../components/ControlPanel';
import { MapViewContainer } from '../../../MapViewContainer';
import { useSampleI18n } from '../../../samples/i18n';

/**
 * Building footprints of central Boston from the Overture Maps buildings theme,
 * drawn with one <Polygons> on top of the real map.
 *
 * Three nested areas around Downtown Crossing — 0.8 x 1.1 km, 1.6 x 2.2 km and
 * 3.2 x 4.4 km — each building tagged with the smallest one that holds it, so
 * the page doubles as a load test. Tapping a building highlights it and names
 * it; tapping elsewhere says nothing was hit, which is what makes the page
 * usable for checking hit testing.
 */
interface Building {
  id: string;
  /** The smallest area (0, 1 or 2) the building fits in. */
  l: number;
  h: number | null;
  n?: string;
  rings: number[][];
}

interface BuildingsDoc {
  attribution: string;
  license: string;
  buildings: Building[];
}

const DEFAULT_CAMERA = { lat: 42.35545, lng: -71.0605, zoom: 16 };
const AREAS = [
  { level: 0, label: '0.8 × 1.1 km' },
  { level: 1, label: '1.6 × 2.2 km' },
  { level: 2, label: '3.2 × 4.4 km' },
] as const;
const TAPPED = 'rgba(37, 99, 235, 0.85)';

/** What the last tap hit: a building, or nothing (`building` null). */
interface Tap {
  seq: number;
  building: Building | null;
  /** Where the map said it was tapped, when the tap missed every building. */
  point: GeoPoint | null;
}

/**
 * `?camera=lat,lng,zoom` and `?area=0|1|2` set where the page opens and how much
 * of the data it starts with, so a measurement sees the same view on every
 * provider.
 */
function initialParams(): { camera: typeof DEFAULT_CAMERA; area: number } {
  if (typeof window === 'undefined') return { camera: DEFAULT_CAMERA, area: 0 };
  const params = new URLSearchParams(window.location.search);
  const [lat, lng, zoom] = (params.get('camera') ?? '').split(',').map(Number);
  const camera = [lat, lng, zoom].some(n => !Number.isFinite(n)) ? DEFAULT_CAMERA : { lat, lng, zoom };
  const area = AREAS.find(a => String(a.level) === params.get('area'))?.level ?? 0;
  return { camera, area };
}

// Darker for taller buildings; grey when the height is unknown.
function fillForHeight(height: number | null): string {
  if (height == null) return 'rgba(148, 163, 184, 0.6)';
  if (height < 15) return 'rgba(254, 240, 138, 0.7)';
  if (height < 30) return 'rgba(253, 186, 116, 0.7)';
  if (height < 60) return 'rgba(249, 115, 22, 0.7)';
  if (height < 120) return 'rgba(220, 38, 38, 0.7)';
  return 'rgba(127, 29, 29, 0.75)';
}

function toPoints(ring: number[]): GeoPoint[] {
  const points: GeoPoint[] = [];
  for (let i = 0; i < ring.length; i += 2) {
    points.push(createGeoPoint({ longitude: ring[i], latitude: ring[i + 1] }));
  }
  return points;
}

export function BostonBuildingsPage() {
  const { t } = useSampleI18n();
  const [doc, setDoc] = useState<BuildingsDoc | null>(null);
  const [initial] = useState(initialParams);
  const [area, setArea] = useState(initial.area);
  const [tap, setTap] = useState<Tap | null>(null);
  const [timing, setTiming] = useState<{ build: number; frame: number } | null>(null);
  const highlightedRef = useRef<{ state: PolygonState; fill: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${import.meta.env.BASE_URL}boston/boston-buildings.json`)
      .then(response => response.json() as Promise<BuildingsDoc>)
      .then(loaded => { if (!cancelled) setDoc(loaded); });
    return () => { cancelled = true; };
  }, []);

  // Moves the highlight to `state` (or clears it) and records the tap.
  const onTap = (state: PolygonState | null, building: Building | null, point: GeoPoint | null = null) => {
    const previous = highlightedRef.current;
    if (previous) previous.state.fillColor = previous.fill;
    highlightedRef.current = state ? { state, fill: state.fillColor } : null;
    if (state) state.fillColor = TAPPED;
    setTap(prev => ({ seq: (prev?.seq ?? 0) + 1, building, point }));
  };
  const onTapRef = useRef(onTap);
  onTapRef.current = onTap;
  const onMapClick = useCallback((point: GeoPoint) => onTapRef.current(null, null, point), []);

  // Every building's state, built once; the area only filters them.
  const allStates = useMemo(() => {
    if (!doc) return null;
    const start = performance.now();
    const states = doc.buildings.map(building => {
      const [outer, ...holes] = building.rings;
      return createPolygonState({
        id: building.id,
        points: toPoints(outer),
        holes: holes.map(toPoints),
        strokeColor: 'rgba(68, 64, 60, 0.8)',
        strokeWidth: 1,
        fillColor: fillForHeight(building.h),
        extra: building.id,
        onClick: event => onTapRef.current(event.state, building),
      });
    });
    return { states, build: performance.now() - start };
  }, [doc]);

  const shown = useMemo(() => {
    if (!doc || !allStates) return null;
    const states = allStates.states.filter((_, i) => doc.buildings[i].l <= area);
    const vertices = states.reduce((n, s) => n + s.points.length + s.holes.reduce((m, h) => m + h.length, 0), 0);
    return { states, vertices };
  }, [doc, allStates, area]);

  // Time from handing the list to <Polygons> until the frame after it: the
  // child's effect has registered the polygons by the time this one runs.
  const commitRef = useRef(0);
  useLayoutEffect(() => { commitRef.current = performance.now(); }, [shown]);
  useEffect(() => {
    if (!shown || !allStates) return;
    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => setTiming({ build: allStates.build, frame: performance.now() - commitRef.current }));
    });
    return () => cancelAnimationFrame(raf);
  }, [shown, allStates]);

  return (
    <MapViewContainer initialCamera={initial.camera} onMapClick={onMapClick}>
      {shown && <Polygons states={shown.states} />}
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
          {AREAS.map(a => (
            <button
              key={a.level}
              type="button"
              data-testid={`area-${a.level}`}
              className={a.level === area ? 'active' : undefined}
              onClick={() => setArea(a.level)}
            >
              {a.label}
            </button>
          ))}
        </div>
        {shown ? (
          <p className="control-panel-note" data-testid="stats">
            {t({
              en: `${shown.states.length.toLocaleString()} polygons, ${shown.vertices.toLocaleString()} vertices`,
              ja: `ポリゴン ${shown.states.length.toLocaleString()} 個・頂点 ${shown.vertices.toLocaleString()} 個`,
              'es-419': `${shown.states.length.toLocaleString()} polígonos, ${shown.vertices.toLocaleString()} vértices`,
              de: `${shown.states.length.toLocaleString()} Polygone, ${shown.vertices.toLocaleString()} Eckpunkte`,
              th: `โพลีกอน ${shown.states.length.toLocaleString()} รูป จุดยอด ${shown.vertices.toLocaleString()} จุด`,
              hi: `${shown.states.length.toLocaleString()} पॉलीगॉन, ${shown.vertices.toLocaleString()} शीर्ष`,
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
        {tap && (
          <p
            className="control-panel-note"
            data-testid="tap"
            data-seq={tap.seq}
            data-id={tap.building?.id ?? ''}
            data-lat={tap.point?.latitude ?? ''}
            data-lng={tap.point?.longitude ?? ''}
          >
            {tap.building
              ? `${tap.building.n ?? t({ en: 'Building', ja: '建物', 'es-419': 'Edificio', de: 'Gebäude', th: 'อาคาร', hi: 'इमारत' })} · ${
                  tap.building.h == null
                    ? t({ en: 'height unknown', ja: '高さ不明', 'es-419': 'altura desconocida', de: 'Höhe unbekannt', th: 'ไม่ทราบความสูง', hi: 'ऊँचाई अज्ञात' })
                    : `${tap.building.h} m`
                } · ${tap.building.id.slice(0, 8)}`
              : t({ en: 'No building here', ja: 'ここに建物はありません', 'es-419': 'Aquí no hay edificio', de: 'Hier ist kein Gebäude', th: 'ไม่มีอาคารตรงนี้', hi: 'यहाँ कोई इमारत नहीं' })}
          </p>
        )}
        <p className="control-panel-note" style={{ fontSize: 11 }}>
          {doc ? `${doc.attribution} (${doc.license})` : null}
        </p>
      </ControlPanel>
    </MapViewContainer>
  );
}
