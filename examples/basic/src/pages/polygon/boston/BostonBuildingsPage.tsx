import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createGeoPoint, createPolygonState, type GeoPoint, type PolygonState } from '@mapconductor/js-sdk-core';
import { InfoBubble, Polygons } from '@mapconductor/js-sdk-react';
import { ControlPanel } from '../../../components/ControlPanel';
import { MapViewContainer } from '../../../MapViewContainer';
import { useSampleI18n } from '../../../samples/i18n';
import { loadDataset, nextPaint, type Building, type BuildingsDoc, type Dataset } from './bostonData';
import { LAND_USE_STYLES, LandUseLegend, LoadingOverlay, PolygonInfo, type OverlayPhase } from './BostonOverlays';

/**
 * Polygons of Boston drawn with one <Polygons> on top of the real map.
 *
 * - Downtown: Overture building footprints in three nested areas around
 *   Downtown Crossing — 0.8 x 1.1 km, 1.6 x 2.2 km and 3.2 x 4.4 km — each
 *   building tagged with the smallest one that holds it.
 * - City buildings / city parcels: the whole city (about 100,000 polygons
 *   each), a load test. See bostonData.ts for where those files come from.
 *
 * Tapping a polygon highlights it and names it; tapping elsewhere says nothing
 * was hit, which is what makes the page usable for checking hit testing.
 */
const DATASETS: { key: Dataset; label: string }[] = [
  { key: 'downtown', label: 'Downtown' },
  { key: 'buildings', label: 'City buildings' },
  { key: 'parcels', label: 'City parcels' },
];

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
  /** Where the tap landed: the polygon event's point, or the map click's. */
  point: GeoPoint | null;
}

/**
 * `?camera=lat,lng,zoom`, `?data=downtown|buildings|parcels` and `?area=0|1|2`
 * set where the page opens and what it starts with, so a measurement sees the
 * same view on every provider.
 */
function initialParams(): { camera: typeof DEFAULT_CAMERA; area: number; dataset: Dataset } {
  if (typeof window === 'undefined') return { camera: DEFAULT_CAMERA, area: 0, dataset: 'downtown' };
  const params = new URLSearchParams(window.location.search);
  const [lat, lng, zoom] = (params.get('camera') ?? '').split(',').map(Number);
  const camera = [lat, lng, zoom].some(n => !Number.isFinite(n)) ? DEFAULT_CAMERA : { lat, lng, zoom };
  const area = AREAS.find(a => String(a.level) === params.get('area'))?.level ?? 0;
  const dataset = DATASETS.find(d => d.key === params.get('data'))?.key ?? 'downtown';
  return { camera, area, dataset };
}

// Parcels: by land use (Property Assessment). Buildings: darker for taller,
// grey when the height is unknown.
function fillFor(dataset: Dataset, building: Building): string {
  if (dataset === 'parcels') return LAND_USE_STYLES[building.use ?? 'unknown'].fill;
  const height = building.h;
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
  const [dataset, setDataset] = useState<Dataset>(initial.dataset);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tap, setTap] = useState<Tap | null>(null);
  const [timing, setTiming] = useState<{ build: number; frame: number } | null>(null);
  const highlightedRef = useRef<{ state: PolygonState; fill: string } | null>(null);

  const [loadMs, setLoadMs] = useState(0);
  // Non-null while a dataset is on its way; drives the loading overlay.
  const [progress, setProgress] = useState<OverlayPhase | null>(null);
  useEffect(() => {
    let cancelled = false;
    const start = performance.now();
    setDoc(null);
    setTiming(null);
    setLoadError(null);
    setProgress({ phase: 'download', loaded: 0, total: null });
    highlightedRef.current = null;
    loadDataset(dataset, p => { if (!cancelled) setProgress(p); })
      .then(async loaded => {
        if (cancelled) return;
        setLoadMs(performance.now() - start);
        // Building the states blocks the main thread; show that phase first.
        setProgress({ phase: 'build' });
        await nextPaint();
        if (!cancelled) setDoc(loaded);
      })
      .catch(error => {
        if (cancelled) return;
        setProgress(null);
        setLoadError(String(error));
      });
    return () => { cancelled = true; };
  }, [dataset]);

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
        strokeColor: dataset === 'parcels' ? 'rgba(71, 85, 105, 0.7)' : 'rgba(68, 64, 60, 0.8)',
        strokeWidth: 1,
        fillColor: fillFor(dataset, building),
        extra: building.id,
        onClick: event => onTapRef.current(event.state, building, event.clicked),
      });
    });
    return { states, build: performance.now() - start };
    // `dataset` changes only together with `doc`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  useLayoutEffect(() => {
    commitRef.current = performance.now();
    if (shown) setProgress(p => (p ? { phase: 'draw' } : p));
  }, [shown]);
  useEffect(() => {
    if (!shown || !allStates) return;
    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => {
        setTiming({ build: allStates.build, frame: performance.now() - commitRef.current });
        setProgress(null);
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [shown, allStates]);

  return (
    <MapViewContainer initialCamera={initial.camera} onMapClick={onMapClick}>
      {shown && <Polygons states={shown.states} />}
      {progress && <LoadingOverlay progress={progress} />}
      {tap?.building && tap.point && (
        <InfoBubble position={tap.point} contentPadding={8}>
          <PolygonInfo building={tap.building} />
        </InfoBubble>
      )}
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
          {DATASETS.map(d => (
            <button
              key={d.key}
              type="button"
              data-testid={`data-${d.key}`}
              className={d.key === dataset ? 'active' : undefined}
              onClick={() => setDataset(d.key)}
            >
              {d.label}
            </button>
          ))}
        </div>
        {dataset === 'downtown' && (
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
        )}
        {loadError && <p className="control-panel-note" data-testid="load-error">{loadError}</p>}
        {dataset === 'parcels' && <LandUseLegend />}
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
                    en: `load ${loadMs.toFixed(0)} ms, states ${timing.build.toFixed(0)} ms, next frame ${timing.frame.toFixed(0)} ms`,
                    ja: `読み込み ${loadMs.toFixed(0)} ms・state 作成 ${timing.build.toFixed(0)} ms・次のフレームまで ${timing.frame.toFixed(0)} ms`,
                    'es-419': `carga ${loadMs.toFixed(0)} ms, estados ${timing.build.toFixed(0)} ms, siguiente cuadro ${timing.frame.toFixed(0)} ms`,
                    de: `Laden ${loadMs.toFixed(0)} ms, States ${timing.build.toFixed(0)} ms, nächster Frame ${timing.frame.toFixed(0)} ms`,
                    th: `โหลด ${loadMs.toFixed(0)} ms สร้าง state ${timing.build.toFixed(0)} ms เฟรมถัดไป ${timing.frame.toFixed(0)} ms`,
                    hi: `लोड ${loadMs.toFixed(0)} ms, state ${timing.build.toFixed(0)} ms, अगला फ़्रेम ${timing.frame.toFixed(0)} ms`,
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
            {tap.building?.use
              ? `${tap.building.n} · ${t(LAND_USE_STYLES[tap.building.use].label)}`
              : tap.building
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
