import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  computeWGS84DistanceBetween,
  createGeoPoint,
  createPolylineState,
  PolylineTilingOptions,
  type GeoPoint,
  type PolylineState,
} from '@mapconductor/js-sdk-core';
import { InfoBubble, Polylines } from '@mapconductor/js-sdk-react';
import { ControlPanel } from '../../../components/ControlPanel';
import { MapViewContainer } from '../../../MapViewContainer';
import { useSampleI18n } from '../../../samples/i18n';
import { LoadingOverlay, type OverlayPhase } from '../../polygon/boston/BostonOverlays';
import { loadRoads, nextPaint, ROAD_CLASSES, type Road, type RoadClass, type RoadsDoc } from './bostonRoadsData';

/**
 * Every road of Boston (about 55,000 polylines) drawn with one <Polylines> on
 * top of the real map: Overture `transportation/segment`, cut at the city
 * boundary (see bostonRoadsData.ts for the file).
 *
 * Bigger roads are drawn wider and on top. Past PolylineTilingOptions the SDK
 * draws them as raster tiles; "Native" hands every one to the map SDK instead,
 * and the time from handing the list over to every polyline's onAdded is shown
 * for both. Tapping a road opens an InfoBubble at the nearest point on it;
 * tapping elsewhere closes it.
 */
type Label = { en: string; ja: string; 'es-419': string; de: string; th: string; hi: string };

/** How a road class is drawn: colour, width in CSS px, zIndex (bigger roads on top). */
export const ROAD_STYLES: Record<RoadClass, { color: string; width: number; zIndex: number; label: Label }> = {
  highway: { color: '#E8590C', width: 5, zIndex: 6, label: { en: 'Highway', ja: '高速・幹線', 'es-419': 'Autopista', de: 'Autobahn', th: 'ทางหลวง', hi: 'राजमार्ग' } },
  primary: { color: '#F08C00', width: 4, zIndex: 5, label: { en: 'Primary', ja: '主要道', 'es-419': 'Principal', de: 'Hauptstraße', th: 'ถนนสายหลัก', hi: 'मुख्य सड़क' } },
  secondary: { color: '#FAB005', width: 3.5, zIndex: 4, label: { en: 'Secondary', ja: '二次道', 'es-419': 'Secundaria', de: 'Nebenstraße', th: 'ถนนสายรอง', hi: 'द्वितीयक सड़क' } },
  tertiary: { color: '#FFD43B', width: 3, zIndex: 3, label: { en: 'Tertiary', ja: '三次道', 'es-419': 'Terciaria', de: 'Verbindungsstraße', th: 'ถนนสายย่อย', hi: 'तृतीयक सड़क' } },
  local: { color: '#868E96', width: 2, zIndex: 2, label: { en: 'Local', ja: '生活道路', 'es-419': 'Local', de: 'Anliegerstraße', th: 'ถนนในชุมชน', hi: 'स्थानीय सड़क' } },
  service: { color: '#ADB5BD', width: 1.5, zIndex: 1, label: { en: 'Service', ja: '構内道路', 'es-419': 'De servicio', de: 'Zufahrt', th: 'ถนนบริการ', hi: 'सर्विस रोड' } },
  path: { color: '#74B816', width: 1, zIndex: 0, label: { en: 'Path', ja: '歩道・小径', 'es-419': 'Sendero', de: 'Weg', th: 'ทางเดิน', hi: 'पथ' } },
};

const DEFAULT_CAMERA = { lat: 42.3555, lng: -71.0605, zoom: 15 };
const TILED = PolylineTilingOptions.Default;
const NATIVE = PolylineTilingOptions.Disabled;

/** What the last tap hit: a road, or nothing (`road` null). */
interface Tap {
  seq: number;
  road: Road | null;
  /** Where the bubble goes: the nearest point on the road, or the map click's point. */
  point: GeoPoint | null;
}

/**
 * `?camera=lat,lng,zoom` and `?tiling=native` set where the page opens and how
 * it starts drawing, so a measurement sees the same view on every provider.
 */
function initialParams(): { camera: typeof DEFAULT_CAMERA; tiled: boolean } {
  if (typeof window === 'undefined') return { camera: DEFAULT_CAMERA, tiled: true };
  const params = new URLSearchParams(window.location.search);
  const [lat, lng, zoom] = (params.get('camera') ?? '').split(',').map(Number);
  const camera = [lat, lng, zoom].some(n => !Number.isFinite(n)) ? DEFAULT_CAMERA : { lat, lng, zoom };
  return { camera, tiled: params.get('tiling') !== 'native' };
}

function toPoints(path: number[]): GeoPoint[] {
  const points: GeoPoint[] = [];
  for (let i = 0; i < path.length; i += 2) points.push(createGeoPoint({ longitude: path[i], latitude: path[i + 1] }));
  return points;
}

/** The length of a road in metres: the sum of its segments' geodesic lengths. */
export function roadLength(points: readonly GeoPoint[]): number {
  let metres = 0;
  for (let i = 1; i < points.length; i++) metres += computeWGS84DistanceBetween(points[i - 1], points[i]);
  return metres;
}

function formatLength(metres: number): string {
  return metres >= 1000 ? `${(metres / 1000).toFixed(2)} km` : `${Math.round(metres).toLocaleString('en-US')} m`;
}

export function BostonRoadsPage() {
  const { t } = useSampleI18n();
  const [initial] = useState(initialParams);
  const [doc, setDoc] = useState<RoadsDoc | null>(null);
  const [tiled, setTiled] = useState(initial.tiled);
  // False while a switch of tiling takes the roads off the map before handing them back.
  const [mounted, setMounted] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tap, setTap] = useState<Tap | null>(null);
  const [loadMs, setLoadMs] = useState(0);
  // Time from handing the list to <Polylines> until every road's onAdded ran, and until the frame after.
  const [addedMs, setAddedMs] = useState<number | null>(null);
  const [frameMs, setFrameMs] = useState<number | null>(null);
  const [progress, setProgress] = useState<OverlayPhase | null>(null);
  // How many times the list has gone onto the map; a measurement waits for the next one.
  const [round, setRound] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const start = performance.now();
    setProgress({ phase: 'download', loaded: 0, total: null });
    loadRoads(p => { if (!cancelled) setProgress(p); })
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
  }, []);

  const onTapRef = useRef((_road: Road | null, _point: GeoPoint | null) => {});
  onTapRef.current = (road, point) => setTap(prev => ({ seq: (prev?.seq ?? 0) + 1, road, point }));
  // A tap on the map that hits no road closes the bubble.
  const onMapClick = useCallback((point: GeoPoint) => onTapRef.current(null, point), []);

  // The overlay stays up until every road of the list handed over has called
  // onAdded. Each hand-over (the first load, and each switch of tiling, which
  // takes the roads off the map first) is a new round; calls from an older
  // round are ignored.
  const commitRef = useRef(0);
  const roundRef = useRef<{ round: number; ids: Set<string>; total: number; waiting: boolean }>({
    round: 0, ids: new Set(), total: 0, waiting: false,
  });
  const onAllAddedRef = useRef(() => {});
  onAllAddedRef.current = () => {
    const added = performance.now() - commitRef.current;
    setAddedMs(added);
    setProgress(null);
    requestAnimationFrame(() => requestAnimationFrame(() => setFrameMs(performance.now() - commitRef.current)));
  };

  // Every road's state, built once.
  const built = useMemo(() => {
    if (!doc) return null;
    const start = performance.now();
    const onAdded = (state: PolylineState) => {
      const r = roundRef.current;
      if (!r.waiting || r.ids.has(state.id)) return;
      r.ids.add(state.id);
      if (r.ids.size === r.total) {
        r.waiting = false;
        onAllAddedRef.current();
      }
    };
    const list = doc.roads.map(road => {
      const style = ROAD_STYLES[road.cls];
      return createPolylineState({
        id: road.id,
        points: toPoints(road.path),
        strokeColor: style.color,
        strokeWidth: style.width,
        zIndex: style.zIndex,
        onClick: event => onTapRef.current(road, event.clicked),
        onAdded,
      });
    });
    return { list, buildMs: performance.now() - start };
  }, [doc]);
  const states = built?.list ?? null;
  const buildMs = built?.buildMs ?? 0;

  // A new round each time the list goes onto the map.
  useLayoutEffect(() => {
    if (!states || !mounted) return;
    commitRef.current = performance.now();
    roundRef.current = { round: roundRef.current.round + 1, ids: new Set(), total: states.length, waiting: true };
    setRound(roundRef.current.round);
    setAddedMs(null);
    setFrameMs(null);
    setProgress({ phase: 'draw' });
  }, [states, mounted]);

  // Switching: take the roads off the map, let that reach it, then hand them back
  // with the new tiling, so every road is added again and calls onAdded again.
  const switchTiling = (next: boolean) => {
    if (next === tiled || !states) return;
    setTap(null);
    setMounted(false);
    setTiled(next);
    setProgress({ phase: 'draw' });
    void nextPaint().then(() => nextPaint()).then(() => setMounted(true));
  };

  const counts = useMemo(() => {
    const byClass = Object.fromEntries(ROAD_CLASSES.map(c => [c, 0])) as Record<RoadClass, number>;
    let vertices = 0;
    for (const road of doc?.roads ?? []) {
      byClass[road.cls]++;
      vertices += road.path.length / 2;
    }
    return { byClass, vertices };
  }, [doc]);

  const tapLength = useMemo(() => (tap?.road ? roadLength(toPoints(tap.road.path)) : null), [tap]);

  return (
    <MapViewContainer
      initialCamera={initial.camera}
      onMapClick={onMapClick}
      polylineTilingOptions={tiled ? TILED : NATIVE}
    >
      {states && mounted && <Polylines states={states} />}
      {progress && <LoadingOverlay progress={progress} shapes="roads" />}
      {tap?.road && tap.point && tapLength != null && (
        <InfoBubble position={tap.point} contentPadding={8}>
          <RoadInfo road={tap.road} length={tapLength} />
        </InfoBubble>
      )}
      <ControlPanel
        title={t({
          en: 'Boston roads',
          ja: 'ボストンの道路',
          'es-419': 'Calles de Boston',
          de: 'Straßen in Boston',
          th: 'ถนนในบอสตัน',
          hi: 'बोस्टन की सड़कें',
        })}
      >
        <div className="button-grid" style={{ marginBottom: 8 }}>
          <button type="button" data-testid="tiling-tiles" className={tiled ? 'active' : undefined} onClick={() => switchTiling(true)}>
            {t({ en: 'Tiles', ja: 'タイル', 'es-419': 'Teselas', de: 'Kacheln', th: 'ไทล์', hi: 'टाइलें' })}
          </button>
          <button type="button" data-testid="tiling-native" className={!tiled ? 'active' : undefined} onClick={() => switchTiling(false)}>
            {t({ en: 'Native', ja: 'ネイティブ', 'es-419': 'Nativo', de: 'Nativ', th: 'เนทีฟ', hi: 'नेटिव' })}
          </button>
        </div>
        {loadError && <p className="control-panel-note" data-testid="load-error">{loadError}</p>}
        <RoadLegend counts={counts.byClass} />
        {doc ? (
          <p
            className="control-panel-note"
            data-testid="stats"
            data-tiling={tiled ? 'tiles' : 'native'}
            data-round={round}
            data-added-ms={addedMs?.toFixed(0) ?? ''}
            data-frame-ms={frameMs?.toFixed(0) ?? ''}
          >
            {t({
              en: `${doc.roads.length.toLocaleString()} roads, ${counts.vertices.toLocaleString()} vertices`,
              ja: `道路 ${doc.roads.length.toLocaleString()} 本・頂点 ${counts.vertices.toLocaleString()} 個`,
              'es-419': `${doc.roads.length.toLocaleString()} calles, ${counts.vertices.toLocaleString()} vértices`,
              de: `${doc.roads.length.toLocaleString()} Straßen, ${counts.vertices.toLocaleString()} Eckpunkte`,
              th: `ถนน ${doc.roads.length.toLocaleString()} เส้น จุดยอด ${counts.vertices.toLocaleString()} จุด`,
              hi: `${doc.roads.length.toLocaleString()} सड़कें, ${counts.vertices.toLocaleString()} शीर्ष`,
            })}
            <br />
            <span data-testid="timing">
              {t({
                en: `load ${loadMs.toFixed(0)} ms, states ${buildMs.toFixed(0)} ms`,
                ja: `読み込み ${loadMs.toFixed(0)} ms・state 作成 ${buildMs.toFixed(0)} ms`,
                'es-419': `carga ${loadMs.toFixed(0)} ms, estados ${buildMs.toFixed(0)} ms`,
                de: `Laden ${loadMs.toFixed(0)} ms, States ${buildMs.toFixed(0)} ms`,
                th: `โหลด ${loadMs.toFixed(0)} ms สร้าง state ${buildMs.toFixed(0)} ms`,
                hi: `लोड ${loadMs.toFixed(0)} ms, state ${buildMs.toFixed(0)} ms`,
              })}
              {addedMs != null && (
                <>
                  <br />
                  {t({
                    en: `${tiled ? 'Tiles' : 'Native'}: every onAdded ${addedMs.toFixed(0)} ms${frameMs != null ? `, next frame ${frameMs.toFixed(0)} ms` : ''}`,
                    ja: `${tiled ? 'タイル' : 'ネイティブ'}: 全 onAdded まで ${addedMs.toFixed(0)} ms${frameMs != null ? `・次のフレームまで ${frameMs.toFixed(0)} ms` : ''}`,
                    'es-419': `${tiled ? 'Teselas' : 'Nativo'}: todos los onAdded ${addedMs.toFixed(0)} ms${frameMs != null ? `, siguiente cuadro ${frameMs.toFixed(0)} ms` : ''}`,
                    de: `${tiled ? 'Kacheln' : 'Nativ'}: alle onAdded ${addedMs.toFixed(0)} ms${frameMs != null ? `, nächster Frame ${frameMs.toFixed(0)} ms` : ''}`,
                    th: `${tiled ? 'ไทล์' : 'เนทีฟ'}: onAdded ครบ ${addedMs.toFixed(0)} ms${frameMs != null ? ` เฟรมถัดไป ${frameMs.toFixed(0)} ms` : ''}`,
                    hi: `${tiled ? 'टाइलें' : 'नेटिव'}: सभी onAdded ${addedMs.toFixed(0)} ms${frameMs != null ? `, अगला फ़्रेम ${frameMs.toFixed(0)} ms` : ''}`,
                  })}
                </>
              )}
            </span>
          </p>
        ) : (
          <p className="control-panel-note">…</p>
        )}
        {tap && (
          <p
            className="control-panel-note"
            data-testid="tap"
            data-seq={tap.seq}
            data-id={tap.road?.id ?? ''}
            data-lat={tap.point?.latitude ?? ''}
            data-lng={tap.point?.longitude ?? ''}
          >
            {tap.road
              ? `${t(ROAD_STYLES[tap.road.cls].label)}${tap.road.name ? ` · ${tap.road.name}` : ''}${tapLength != null ? ` · ${formatLength(tapLength)}` : ''}`
              : t({ en: 'No road here', ja: 'ここに道路はありません', 'es-419': 'Aquí no hay calle', de: 'Hier ist keine Straße', th: 'ไม่มีถนนตรงนี้', hi: 'यहाँ कोई सड़क नहीं' })}
          </p>
        )}
        <p className="control-panel-note" style={{ fontSize: 11 }}>
          {doc ? `${doc.attribution} (${doc.license})` : null}
        </p>
      </ControlPanel>
    </MapViewContainer>
  );
}

function RoadLegend({ counts }: { counts: Record<RoadClass, number> }) {
  const { t } = useSampleI18n();
  return (
    <ul data-testid="road-legend" style={{ listStyle: 'none', margin: '4px 0 8px', padding: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 8px', fontSize: 11 }}>
      {ROAD_CLASSES.map(cls => {
        const style = ROAD_STYLES[cls];
        return (
          <li key={cls} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 18, height: Math.max(1, style.width), borderRadius: style.width / 2, background: style.color, flex: 'none' }} />
            {t(style.label)}
            {counts[cls] > 0 && <span style={{ color: '#64748b' }}>{counts[cls].toLocaleString()}</span>}
          </li>
        );
      })}
    </ul>
  );
}

/** What a tapped road carries, shown in an InfoBubble at the nearest point on it. */
function RoadInfo({ road, length }: { road: Road; length: number }) {
  const { t } = useSampleI18n();
  const rows: [string, string][] = [
    [t({ en: 'Class', ja: '種別', 'es-419': 'Tipo', de: 'Klasse', th: 'ประเภท', hi: 'वर्ग' }), t(ROAD_STYLES[road.cls].label)],
  ];
  if (road.name) rows.push([t({ en: 'Name', ja: '名前', 'es-419': 'Nombre', de: 'Name', th: 'ชื่อ', hi: 'नाम' }), road.name]);
  rows.push([t({ en: 'Length', ja: '長さ', 'es-419': 'Longitud', de: 'Länge', th: 'ความยาว', hi: 'लंबाई' }), formatLength(length)]);
  return (
    <table data-testid="road-info" style={{ borderCollapse: 'collapse', fontSize: 12, lineHeight: 1.5 }}>
      <tbody>
        {rows.map(([key, value]) => (
          <tr key={key}>
            <th style={{ textAlign: 'left', fontWeight: 600, paddingRight: 10, whiteSpace: 'nowrap', color: '#475569' }}>{key}</th>
            <td style={{ whiteSpace: 'nowrap' }}>{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
