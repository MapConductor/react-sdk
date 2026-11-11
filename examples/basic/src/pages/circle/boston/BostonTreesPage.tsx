import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  CircleTilingOptions,
  createCircleState,
  createGeoPoint,
  type CircleState,
  type GeoPoint,
} from '@mapconductor/js-sdk-core';
import { Circles, InfoBubble } from '@mapconductor/js-sdk-react';
import { useLocation } from 'react-router-dom';
import { ControlPanel } from '../../../components/ControlPanel';
import { MapViewContainer } from '../../../MapViewContainer';
import { useSampleI18n } from '../../../samples/i18n';
import { LoadingOverlay, type OverlayPhase } from '../../polygon/boston/BostonOverlays';
import { StackCheck } from './StackCheck';
import { loadTrees, nextPaint, TREE_GROUPS, type Tree, type TreeGroup, type TreesDoc } from './bostonTreesData';

/**
 * Every street and park tree of Boston (about 52,000 circles) drawn with one
 * <Circles> on top of the real map: the City of Boston's tree inventory (see
 * treesFile.ts for the file). Each circle is the tree's estimated crown, so it
 * keeps its size on the ground as the map zooms.
 *
 * Past CircleTilingOptions the SDK draws them as raster tiles; "Native" hands
 * every one to the map SDK instead, and the time from handing the list over to
 * every circle's onAdded is shown for both. Tapping a tree opens an InfoBubble
 * at its centre; tapping elsewhere closes it.
 */
type Label = { en: string; ja: string; 'es-419': string; de: string; th: string; hi: string };

/** How a tree group is drawn: the outline in the colour, the crown in the same colour at half alpha. */
export const TREE_STYLES: Record<TreeGroup, { color: string; label: Label }> = {
  maple: { color: '#E8590C', label: { en: 'Maple', ja: 'カエデ', 'es-419': 'Arce', de: 'Ahorn', th: 'เมเปิล', hi: 'मेपल' } },
  oak: { color: '#8C6239', label: { en: 'Oak', ja: 'ナラ・カシ', 'es-419': 'Roble', de: 'Eiche', th: 'โอ๊ก', hi: 'ओक' } },
  honeylocust: { color: '#FAB005', label: { en: 'Honeylocust', ja: 'アメリカサイカチ', 'es-419': 'Acacia de tres espinas', de: 'Gleditschie', th: 'ฮันนีโลคัสต์', hi: 'हनीलोकस्ट' } },
  linden: { color: '#12B886', label: { en: 'Linden', ja: 'シナノキ', 'es-419': 'Tilo', de: 'Linde', th: 'ลินเดน', hi: 'लिंडन' } },
  elm: { color: '#1C7ED6', label: { en: 'Elm', ja: 'ニレ', 'es-419': 'Olmo', de: 'Ulme', th: 'เอล์ม', hi: 'एल्म' } },
  flowering: { color: '#E64980', label: { en: 'Flowering', ja: '花木', 'es-419': 'De flor', de: 'Blühgehölz', th: 'ไม้ดอก', hi: 'फूलदार' } },
  conifer: { color: '#2B8A3E', label: { en: 'Conifer', ja: '針葉樹', 'es-419': 'Conífera', de: 'Nadelbaum', th: 'สน', hi: 'शंकुधारी' } },
  other: { color: '#868E96', label: { en: 'Other', ja: 'その他', 'es-419': 'Otros', de: 'Sonstige', th: 'อื่น ๆ', hi: 'अन्य' } },
};

/** '#RRGGBB' at `alpha`, as rgba(). */
function withAlpha(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

const DEFAULT_CAMERA = { lat: 42.3555, lng: -71.0605, zoom: 15 };
const TILED = CircleTilingOptions.Default;
const NATIVE = CircleTilingOptions.Disabled;

/** What the last tap hit: a tree, or nothing (`tree` null). */
interface Tap {
  seq: number;
  tree: Tree | null;
  point: GeoPoint | null;
}

/**
 * `?camera=lat,lng,zoom` and `?tiling=native` set where the page opens and how
 * it starts drawing, so a measurement sees the same view on every provider.
 * `?stack=1` adds tiled polygons, tiled roads and a marker round the trees
 * (StackCheck); `?trees=0` leaves the trees out, for the picture to compare with.
 */
function initialParams(): { camera: typeof DEFAULT_CAMERA; tiled: boolean; stack: boolean; trees: boolean } {
  if (typeof window === 'undefined') return { camera: DEFAULT_CAMERA, tiled: true, stack: false, trees: true };
  const params = new URLSearchParams(window.location.search);
  const [lat, lng, zoom] = (params.get('camera') ?? '').split(',').map(Number);
  const camera = [lat, lng, zoom].some(n => !Number.isFinite(n)) ? DEFAULT_CAMERA : { lat, lng, zoom };
  return {
    camera,
    tiled: params.get('tiling') !== 'native',
    stack: params.get('stack') === '1',
    trees: params.get('trees') !== '0',
  };
}

function formatRadius(metres: number): string {
  return `${metres.toFixed(1)} m`;
}

export function BostonTreesPage() {
  const { t } = useSampleI18n();
  const [initial] = useState(initialParams);
  // The page stays mounted when the provider changes; the trees then go onto the other map.
  const provider = useLocation().pathname.split('/').filter(Boolean)[0] ?? '';
  const [doc, setDoc] = useState<TreesDoc | null>(null);
  const [tiled, setTiled] = useState(initial.tiled);
  // False while a switch of tiling takes the trees off the map before handing them back.
  const [mounted, setMounted] = useState(initial.trees);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tap, setTap] = useState<Tap | null>(null);
  const [loadMs, setLoadMs] = useState(0);
  // Time from handing the list to <Circles> until every tree's onAdded ran, and until the frame after.
  const [addedMs, setAddedMs] = useState<number | null>(null);
  const [frameMs, setFrameMs] = useState<number | null>(null);
  const [progress, setProgress] = useState<OverlayPhase | null>(null);
  // How many times the list has gone onto the map; a measurement waits for the next one.
  const [round, setRound] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const start = performance.now();
    setProgress({ phase: 'download', loaded: 0, total: null });
    loadTrees(p => { if (!cancelled) setProgress(p); })
      .then(async loaded => {
        if (cancelled) return;
        setLoadMs(performance.now() - start);
        // Building the states blocks the main thread; show that phase first.
        setProgress({ phase: 'build' });
        await nextPaint();
        if (cancelled) return;
        setDoc(loaded);
        // Without the trees (`?trees=0`) nothing goes onto the map to wait for.
        if (!initial.trees) setProgress(null);
      })
      .catch(error => {
        if (cancelled) return;
        setProgress(null);
        setLoadError(String(error));
      });
    return () => { cancelled = true; };
  }, [initial.trees]);

  const onTapRef = useRef((_tree: Tree | null, _point: GeoPoint | null) => {});
  onTapRef.current = (tree, point) => setTap(prev => ({ seq: (prev?.seq ?? 0) + 1, tree, point }));
  // A tap on the map that hits no tree closes the bubble.
  const onMapClick = useCallback((point: GeoPoint) => onTapRef.current(null, point), []);

  // The overlay stays up until every tree of the list handed over has called
  // onAdded. Each hand-over (the first load, and each switch of tiling, which
  // takes the trees off the map first) is a new round; calls from an older
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

  // Every tree's state, built once.
  const built = useMemo(() => {
    if (!doc) return null;
    const start = performance.now();
    const onAdded = (state: CircleState) => {
      const r = roundRef.current;
      if (!r.waiting || r.ids.has(state.id)) return;
      r.ids.add(state.id);
      if (r.ids.size === r.total) {
        r.waiting = false;
        onAllAddedRef.current();
      }
    };
    const fills = Object.fromEntries(TREE_GROUPS.map(g => [g, withAlpha(TREE_STYLES[g].color, 0.5)])) as Record<TreeGroup, string>;
    const list = doc.trees.map(tree => createCircleState({
      id: tree.id,
      center: createGeoPoint({ latitude: tree.latitude, longitude: tree.longitude }),
      radiusMeters: tree.radiusMeters,
      fillColor: fills[tree.group],
      strokeColor: TREE_STYLES[tree.group].color,
      strokeWidth: 1,
      zIndex: 0,
      onClick: () => onTapRef.current(tree, createGeoPoint({ latitude: tree.latitude, longitude: tree.longitude })),
      onAdded,
    }));
    return { list, buildMs: performance.now() - start };
  }, [doc]);
  const states = built?.list ?? null;
  const buildMs = built?.buildMs ?? 0;

  // A new round each time the list goes onto a map (also another provider's).
  useLayoutEffect(() => {
    if (!states || !mounted) return;
    commitRef.current = performance.now();
    roundRef.current = { round: roundRef.current.round + 1, ids: new Set(), total: states.length, waiting: true };
    setRound(roundRef.current.round);
    setAddedMs(null);
    setFrameMs(null);
    setProgress({ phase: 'draw' });
  }, [states, mounted, provider]);

  // Switching: take the trees off the map, let that reach it, then hand them back
  // with the new tiling, so every tree is added again and calls onAdded again.
  const switchTiling = (next: boolean) => {
    if (next === tiled || !states || !initial.trees) return;
    setTap(null);
    setMounted(false);
    setTiled(next);
    setProgress({ phase: 'draw' });
    void nextPaint().then(() => nextPaint()).then(() => setMounted(true));
  };

  const counts = useMemo(() => {
    const byGroup = Object.fromEntries(TREE_GROUPS.map(g => [g, 0])) as Record<TreeGroup, number>;
    for (const tree of doc?.trees ?? []) byGroup[tree.group]++;
    return byGroup;
  }, [doc]);

  const stackCenter = useMemo(
    () => createGeoPoint({ latitude: initial.camera.lat, longitude: initial.camera.lng }),
    [initial.camera],
  );

  return (
    <MapViewContainer
      initialCamera={initial.camera}
      onMapClick={onMapClick}
      circleTilingOptions={tiled ? TILED : NATIVE}
    >
      {states && mounted && <Circles states={states} />}
      {initial.stack && <StackCheck center={stackCenter} />}
      {progress && <LoadingOverlay progress={progress} shapes="trees" />}
      {tap?.tree && tap.point && (
        <InfoBubble position={tap.point} contentPadding={8}>
          <TreeInfo tree={tap.tree} />
        </InfoBubble>
      )}
      <ControlPanel
        title={t({
          en: 'Boston trees',
          ja: 'ボストンの木',
          'es-419': 'Árboles de Boston',
          de: 'Bäume in Boston',
          th: 'ต้นไม้ในบอสตัน',
          hi: 'बोस्टन के पेड़',
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
        <TreeLegend counts={counts} />
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
              en: `${doc.trees.length.toLocaleString()} trees`,
              ja: `木 ${doc.trees.length.toLocaleString()} 本`,
              'es-419': `${doc.trees.length.toLocaleString()} árboles`,
              de: `${doc.trees.length.toLocaleString()} Bäume`,
              th: `ต้นไม้ ${doc.trees.length.toLocaleString()} ต้น`,
              hi: `${doc.trees.length.toLocaleString()} पेड़`,
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
            data-id={tap.tree?.id ?? ''}
            data-lat={tap.point?.latitude ?? ''}
            data-lng={tap.point?.longitude ?? ''}
          >
            {tap.tree
              ? `${t(TREE_STYLES[tap.tree.group].label)} · ${formatRadius(tap.tree.radiusMeters)}`
              : t({ en: 'No tree here', ja: 'ここに木はありません', 'es-419': 'Aquí no hay árbol', de: 'Hier ist kein Baum', th: 'ไม่มีต้นไม้ตรงนี้', hi: 'यहाँ कोई पेड़ नहीं' })}
          </p>
        )}
        <p className="control-panel-note" style={{ fontSize: 11 }}>
          {doc ? doc.attribution : null}
          <br />
          {t({
            en: 'A circle is the crown estimated from the trunk diameter (×22), not a measurement.',
            ja: '円は幹の直径（×22）から見積もった樹冠で、実測ではありません。',
            'es-419': 'Cada círculo es la copa estimada a partir del diámetro del tronco (×22), no una medición.',
            de: 'Ein Kreis ist die aus dem Stammdurchmesser (×22) geschätzte Krone, keine Messung.',
            th: 'วงกลมคือทรงพุ่มที่ประมาณจากเส้นผ่านศูนย์กลางลำต้น (×22) ไม่ใช่ค่าที่วัดจริง',
            hi: 'वृत्त तने के व्यास (×22) से अनुमानित छत्र है, मापा हुआ नहीं।',
          })}
        </p>
      </ControlPanel>
    </MapViewContainer>
  );
}

function TreeLegend({ counts }: { counts: Record<TreeGroup, number> }) {
  const { t } = useSampleI18n();
  return (
    <ul data-testid="tree-legend" style={{ listStyle: 'none', margin: '4px 0 8px', padding: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 8px', fontSize: 11 }}>
      {TREE_GROUPS.map(group => {
        const style = TREE_STYLES[group];
        return (
          <li key={group} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 6, background: withAlpha(style.color, 0.5), border: `1px solid ${style.color}`, flex: 'none' }} />
            {t(style.label)}
            {counts[group] > 0 && <span style={{ color: '#64748b' }}>{counts[group].toLocaleString()}</span>}
          </li>
        );
      })}
    </ul>
  );
}

/** What a tapped tree carries, shown in an InfoBubble at its centre. */
function TreeInfo({ tree }: { tree: Tree }) {
  const { t } = useSampleI18n();
  const rows: [string, string][] = [
    [t({ en: 'Group', ja: '種別', 'es-419': 'Grupo', de: 'Gruppe', th: 'กลุ่ม', hi: 'समूह' }), t(TREE_STYLES[tree.group].label)],
    [t({ en: 'Crown radius', ja: '樹冠の半径', 'es-419': 'Radio de la copa', de: 'Kronenradius', th: 'รัศมีทรงพุ่ม', hi: 'छत्र की त्रिज्या' }), formatRadius(tree.radiusMeters)],
  ];
  return (
    <table data-testid="tree-info" style={{ borderCollapse: 'collapse', fontSize: 12, lineHeight: 1.5 }}>
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
