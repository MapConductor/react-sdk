/* eslint-disable typescript/no-explicit-any */
// core は実行時にブラウザへ動的 import する（同一オリジンの偽 URL 経由）ため、
// ビルド時に型を辿れない。このファイルの core 参照が any になるのはそのため。
import { test, expect, type Page } from '@playwright/test';
import path from 'node:path';

/**
 * android-sdk と揃えた core の契約を、実際にブラウザ上で回して固定する回帰テスト。
 *
 * `js-sdk-core` にはユニットテストのランナーが無く、これらの振る舞いはビルドが通るだけでは
 * 守られない（既定値・正規化・差分判定はすべて型に現れない）。ここで押さえておかないと、
 * android-sdk と揃えた意味論が静かに戻る。
 *
 * サンプルアプリの dev server が必要: examples/basic で `npm run dev`
 * （既定 http://localhost:4003）。同一オリジンにするためだけに使い、ページ自体は開かない。
 */

const BASE = process.env.SAMPLE_BASE_URL ?? 'http://localhost:4003';
const CORE_DIST = path.resolve(__dirname, '../js-sdk-core/dist/index.mjs');

/**
 * ビルド済み core を同一オリジンの偽 URL から配信して dynamic import できるようにする。
 * `js-sdk-core` の dist は外部 import を持たない自己完結 ESM なので、これだけで動く。
 */
async function loadCore(page: Page): Promise<void> {
    await page.route('**/__mapconductor-core.mjs', (route) =>
        route.fulfill({ path: CORE_DIST, contentType: 'text/javascript' }),
    );
    await page.goto(BASE);
    await page.waitForFunction(() => document.readyState !== 'loading');
}

const evalInCore = <T>(page: Page, fn: (core: any) => T | Promise<T>): Promise<T> =>
    page.evaluate(async (source) => {
        const core = await import('/__mapconductor-core.mjs');
        // eslint-disable-next-line no-new-func
        const body = new Function(`return (${source})`)();
        return await body(core);
    }, fn.toString()) as Promise<T>;

test.beforeEach(async ({ page }) => {
    await loadCore(page);
});

test.describe('クリック座標の wrap 正規化', () => {
    // android-sdk は PolylineEvent / PolygonEvent / CircleEvent / GroundImageEvent の
    // コンストラクタで clicked.wrap() を行い、どの配送経路でも wrap 漏れが起きないようにしている。
    // TS の *Event は素の interface なので、配送の出口 = dispatchClick で同じ保証を与えている。

    test('wrapClickedPoint がプレーンオブジェクトも正規化する', async ({ page }) => {
        const result = await evalInCore(page, (core) => ({
            east: core.wrapClickedPoint({ latitude: 10, longitude: 190 }).longitude,
            west: core.wrapClickedPoint({ latitude: 10, longitude: -190 }).longitude,
            // 極を越えた緯度は反対側から回り込み、経度が 180 ずれる
            // （android-sdk GeoPoint.wrap と同じ: 100 → -90 + 10 = -80）
            pole: (() => {
                const p = core.wrapClickedPoint({ latitude: 100, longitude: 0 });
                return { lat: p.latitude, lng: p.longitude };
            })(),
            nullIn: core.wrapClickedPoint(null),
        }));

        expect(result.east).toBe(-170);
        expect(result.west).toBe(170);
        expect(result.pole.lat).toBeCloseTo(-80, 9);
        expect(Math.abs(result.pole.lng)).toBeCloseTo(180, 9);
        expect(result.nullIn).toBeNull();
    });

    test('4種のコントローラの dispatchClick が clicked を正規化して配送する', async ({ page }) => {
        const result = await evalInCore(page, (core) => {
            const stubRenderer = {
                onAdd: async () => [],
                onChange: async () => [],
                onRemove: async () => {},
                onPostProcess: async () => {},
            };
            const stubManager = {
                allEntities: () => [],
                getEntity: () => null,
                hasEntity: () => false,
                registerEntity: () => {},
                removeEntity: () => null,
                clear: () => {},
                find: () => null,
            };
            const out: Record<string, { onClick: number; listener: number } | string> = {};

            const bounds = core.createGeoRectBounds({
                southWest: core.createGeoPoint({ latitude: 0, longitude: 0 }),
                northEast: core.createGeoPoint({ latitude: 1, longitude: 1 }),
            });

            const cases: [string, any, any][] = [
                [
                    'polygon',
                    new (class extends core.PolygonController {})({
                        polygonManager: stubManager,
                        renderer: stubRenderer,
                    }),
                    core.createPolygonState({
                        points: [
                            core.createGeoPoint({ latitude: 0, longitude: 179 }),
                            core.createGeoPoint({ latitude: 1, longitude: -179 }),
                            core.createGeoPoint({ latitude: 2, longitude: 179 }),
                        ],
                    }),
                ],
                [
                    'polyline',
                    new (class extends core.PolylineController {})({
                        polylineManager: stubManager,
                        renderer: stubRenderer,
                    }),
                    core.createPolylineState({
                        points: [
                            core.createGeoPoint({ latitude: 0, longitude: 179 }),
                            core.createGeoPoint({ latitude: 1, longitude: -179 }),
                        ],
                    }),
                ],
                [
                    'circle',
                    new (class extends core.CircleController {})({
                        circleManager: stubManager,
                        renderer: stubRenderer,
                    }),
                    core.createCircleState({
                        center: core.createGeoPoint({ latitude: 0, longitude: 180 }),
                        radiusMeters: 1000,
                    }),
                ],
                [
                    'groundImage',
                    new (class extends core.GroundImageController {})({
                        groundImageManager: stubManager,
                        renderer: stubRenderer,
                    }),
                    core.createGroundImageState({ bounds, imageUrl: 'x.png' }),
                ],
            ];

            for (const [name, controller, state] of cases) {
                let viaOnClick: number | null = null;
                let viaListener: number | null = null;
                state.onClick = (e: any) => { viaOnClick = e.clicked.longitude; };
                controller.setOnClickListener((e: any) => { viaListener = e.clicked.longitude; });
                // プロバイダが組み立てるのと同じ「wrap() を持たないプレーンな点」を渡す
                controller.dispatchClick({ state, clicked: { latitude: 5, longitude: 200 } });
                out[name] = { onClick: viaOnClick!, listener: viaListener! };
            }

            // GroundImage の clicked は null 許容（android-sdk の GroundImageEvent と同じ）
            const giController = cases[3][1];
            let nullClicked: unknown = 'not-called';
            const giState = cases[3][2];
            giController.setOnClickListener(null);
            giState.onClick = (e: any) => { nullClicked = e.clicked; };
            giController.dispatchClick({ state: giState, clicked: null });
            out.groundImageNull = nullClicked === null ? 'null' : String(nullClicked);

            return out;
        });

        // 経度 200 → -160 に正規化されて、state.onClick とリスナー両方に届く
        for (const kind of ['polygon', 'polyline', 'circle', 'groundImage']) {
            expect(result[kind], `${kind} の clicked`).toEqual({ onClick: -160, listener: -160 });
        }
        expect(result.groundImageNull).toBe('null');
    });
});

test.describe('既定値の android-sdk 一致', () => {
    test('GroundImage の tileSize 既定は 512', async ({ page }) => {
        // android-sdk の GroundImageTileProvider.DEFAULT_TILE_SIZE と同値。
        // 以前は <GroundImage> の useEffect が `?? 256` で 512 を上書きしていた。
        const result = await evalInCore(page, (core) => {
            const bounds = core.createGeoRectBounds({
                southWest: core.createGeoPoint({ latitude: 35, longitude: 139 }),
                northEast: core.createGeoPoint({ latitude: 36, longitude: 140 }),
            });
            return {
                constant: core.GROUND_IMAGE_DEFAULT_TILE_SIZE,
                stateDefault: core.createGroundImageState({ bounds, imageUrl: 'x.png' }).tileSize,
                explicit: core.createGroundImageState({ bounds, imageUrl: 'x.png', tileSize: 256 }).tileSize,
            };
        });
        expect(result).toEqual({ constant: 512, stateDefault: 512, explicit: 256 });
    });

    test('MarkerState.zIndex は未指定なら null、明示的な 0 とは区別される', async ({ page }) => {
        // android-sdk / ios-sdk は Int? 既定 null。null は「未指定」で、renderer は
        // 緯度による自動 z-order にフォールバックする（`state.zIndex ?: calculateZIndex(...)`）。
        const result = await evalInCore(page, (core) => {
            const at = () => core.createGeoPoint({ latitude: 0, longitude: 0 });
            const unset = core.createMarkerState({ position: at() });
            const zero = core.createMarkerState({ position: at(), zIndex: 0 });
            return {
                unset: unset.zIndex,
                zero: zero.zIndex,
                // fingerprint は Kotlin の null.hashCode() == 0 に合わせるので同値
                sameFingerprint: unset.fingerPrint().zIndex === zero.fingerPrint().zIndex,
                copyKeepsNull: unset.copy({}).zIndex,
                copyCanSetZero: unset.copy({ zIndex: 0 }).zIndex,
            };
        });
        expect(result.unset).toBeNull();
        expect(result.zero).toBe(0);
        expect(result.sameFingerprint).toBe(true);
        expect(result.copyKeepsNull).toBeNull();
        expect(result.copyCanSetZero).toBe(0);
    });

    test('MarkerState.copy() は animation を引き継ぐ', async ({ page }) => {
        // android / ios は copy が animation を落としていた（跳ねているマーカーを
        // copy(position) すると止まる）。コピーであることは「アニメーションをやめる」
        // 意味を持たないので 3 者とも引き継ぐ。React は元からこの挙動。
        const result = await evalInCore(page, (core) => {
            const at = () => core.createGeoPoint({ latitude: 35, longitude: 139 });
            const bouncing = core.createMarkerState({ position: at(), animation: 'Bounce' });
            const plain = core.createMarkerState({ position: at() });
            plain.animation = 'Drop';
            return {
                carriedOver: bouncing.copy({ position: at() }).animation,
                overridden: bouncing.copy({ animation: 'Drop' }).animation,
                cleared: bouncing.copy({ animation: null }).animation,
                // 生成後に付けたものも引き継ぐ
                setAfterConstruction: plain.copy().animation,
            };
        });
        expect(result.carriedOver).toBe('Bounce');
        expect(result.overridden).toBe('Drop');
        expect(result.cleared).toBeNull();
        expect(result.setAfterConstruction).toBe('Drop');
    });

    test('findMarkersInBounds は空 bounds で落ちない', async ({ page }) => {
        // 空 bounds は center / northEast が null になる。以前は非 null 断定
        // （android は !!、React は !）だったので、isEmpty ガードを外すと落ちる形だった。
        const result = await evalInCore(page, (core) => {
            const geocell = new core.HexGeocellImpl({ projection: core.WebMercator });
            const manager = new core.MarkerManager(geocell, 2000);
            const empty = core.createGeoRectBounds();
            return {
                emptyBoundsIsEmpty: empty.isEmpty,
                emptyCenter: empty.center,
                resultForEmpty: manager.findMarkersInBounds(empty).length,
            };
        });
        expect(result.emptyBoundsIsEmpty).toBe(true);
        expect(result.emptyCenter).toBeNull();
        expect(result.resultForEmpty).toBe(0);
    });
});

test.describe('ポリゴンの穴ユニオン', () => {
    test('state 生成では union せず、明示的に呼んだときだけ統合する', async ({ page }) => {
        // android-sdk は PolygonComponent（コンポーネント層）でのみ union する。
        // ctor / copy() / setter でも union すると unionHolesInPlace 1回で最大4回走り、
        // しかも unionHoleRings は CW に巻き直すので再入力が再処理になる。
        const result = await evalInCore(page, (core) => {
            const ring = (x: number, y: number) => [
                core.createGeoPoint({ latitude: y, longitude: x }),
                core.createGeoPoint({ latitude: y, longitude: x + 1 }),
                core.createGeoPoint({ latitude: y + 1, longitude: x + 1 }),
                core.createGeoPoint({ latitude: y + 1, longitude: x }),
            ];
            const holes = [ring(0, 0), ring(0.5, 0.5)]; // 重なる2つ
            const state = core.createPolygonState({
                points: [
                    core.createGeoPoint({ latitude: -5, longitude: -5 }),
                    core.createGeoPoint({ latitude: -5, longitude: 5 }),
                    core.createGeoPoint({ latitude: 5, longitude: 5 }),
                ],
                holes,
            });
            const afterCtor = state.holes.length;
            const identity = state.holes === holes;
            const afterCopy = state.copy({ holes }).holes.length;
            core.unionHolesInPlace(state);
            const afterUnion = state.holes.length;
            // 冪等性: もう一度呼んでも増減しない
            core.unionHolesInPlace(state);
            return { afterCtor, identity, afterCopy, afterUnion, afterTwice: state.holes.length };
        });

        expect(result.afterCtor).toBe(2);
        expect(result.identity).toBe(true);
        expect(result.afterCopy).toBe(2);
        expect(result.afterUnion).toBe(1);
        expect(result.afterTwice).toBe(1);
    });
});

test.describe('CameraRestriction', () => {
    test('空判定と個別 prop からの正規化', async ({ page }) => {
        const result = await evalInCore(page, (core) => ({
            none: core.isEmptyCameraRestriction(core.NoCameraRestriction),
            nullish: core.isEmptyCameraRestriction(null),
            emptyBounds: core.isEmptyCameraRestriction({ bounds: core.createGeoRectBounds() }),
            zoomOnly: core.isEmptyCameraRestriction({ minZoom: 3 }),
            resolved: core.resolveCameraRestriction({ minZoom: 3, maxZoom: 10 }),
            resolvedEmpty: core.resolveCameraRestriction({}),
            // cameraRestriction が個別 prop より優先される
            precedence: core.resolveCameraRestriction({
                cameraRestriction: { minZoom: 1 },
                minZoom: 9,
            }).minZoom,
        }));
        expect(result.none).toBe(true);
        expect(result.nullish).toBe(true);
        expect(result.emptyBounds).toBe(true);
        expect(result.zoomOnly).toBe(false);
        expect(result.resolved).toMatchObject({ minZoom: 3, maxZoom: 10 });
        expect(result.resolvedEmpty).toBeNull();
        expect(result.precedence).toBe(1);
    });

    test('クランプ補正が android-sdk と同じ意味論で効く', async ({ page }) => {
        // android-sdk BaseMapViewController.cameraRestrictionCorrection の移植。
        // ε（ZOOM_EPS=1e-3 / COORD_EPS=1e-7）未満の差は補正しない。これが無いと
        // 再適用 → moveend → 再補正 の無限ループになる。
        const result = await evalInCore(page, (core) => {
            class TestController extends core.BaseMapViewController {
                moved: any = null;
                moveCamera(position: any) { this.moved = position; return Promise.resolve(true); }
                // protected はランタイムには存在しないので、そのまま呼べる
                correct(camera: any) { return this.cameraRestrictionCorrection(camera); }
                restricted() { return this.hasCameraRestriction(); }
                idle(camera: any) { return this.applyCameraRestrictionOnIdle(camera); }
            }
            const at = (lat: number, lng: number, zoom: number) =>
                core.createMapCameraPosition({
                    position: core.createGeoPoint({ latitude: lat, longitude: lng }),
                    zoom,
                });

            const c = new TestController();
            c.setCameraRestriction({
                bounds: core.createGeoRectBounds({
                    southWest: core.createGeoPoint({ latitude: 35, longitude: 139 }),
                    northEast: core.createGeoPoint({ latitude: 36, longitude: 140 }),
                }),
                minZoom: 5,
                maxZoom: 12,
            });

            const inside = c.correct(at(35.5, 139.5, 8));
            const outsideLat = c.correct(at(40, 139.5, 8));
            const outsideLng = c.correct(at(35.5, 150, 8));
            const tooFarOut = c.correct(at(35.5, 139.5, 2));
            const tooFarIn = c.correct(at(35.5, 139.5, 20));
            // ε 未満のはみ出しは補正しない
            const withinEpsilon = c.correct(at(36 + 1e-9, 139.5, 8));
            const withinZoomEpsilon = c.correct(at(35.5, 139.5, 12 + 1e-4));

            const idleMoved = c.idle(at(40, 139.5, 8));

            // 空の制限を渡すと解除される
            const cleared = new TestController();
            cleared.setCameraRestriction(core.NoCameraRestriction);

            return {
                hasRestriction: c.restricted(),
                inside,
                outsideLat: outsideLat && { lat: outsideLat.position.latitude, lng: outsideLat.position.longitude },
                outsideLng: outsideLng && { lat: outsideLng.position.latitude, lng: outsideLng.position.longitude },
                tooFarOutZoom: tooFarOut && tooFarOut.zoom,
                tooFarInZoom: tooFarIn && tooFarIn.zoom,
                withinEpsilon,
                withinZoomEpsilon,
                idleMoved,
                idleMovedTo: c.moved && c.moved.position.latitude,
                clearedHasRestriction: cleared.restricted(),
            };
        });

        expect(result.hasRestriction).toBe(true);
        expect(result.inside).toBeNull();
        expect(result.outsideLat).toEqual({ lat: 36, lng: 139.5 });
        expect(result.outsideLng).toEqual({ lat: 35.5, lng: 140 });
        expect(result.tooFarOutZoom).toBe(5);
        expect(result.tooFarInZoom).toBe(12);
        expect(result.withinEpsilon).toBeNull();
        expect(result.withinZoomEpsilon).toBeNull();
        expect(result.idleMoved).toBe(true);
        expect(result.idleMovedTo).toBe(36);
        expect(result.clearedHasRestriction).toBe(false);
    });
});

test.describe('BaseMapViewController', () => {
    test('mapInitialized が sticky に配送される', async ({ page }) => {
        // リスナー登録前に初期化が完了しても取りこぼさない（android-sdk と同じ）。
        // React の effect はマウント後に張られるので、このレースは全プロバイダにあった。
        const result = await evalInCore(page, (core) => {
            class TestController extends core.BaseMapViewController {
                fireInit() { this.notifyMapInitialized(); }
            }
            // 初期化 → 後からリスナー登録
            const late = new TestController();
            late.fireInit();
            let lateCalls = 0;
            late.setMapInitializedListener(() => { lateCalls++; });

            // リスナー登録 → 初期化（従来どおり）
            const early = new TestController();
            let earlyCalls = 0;
            early.setMapInitializedListener(() => { earlyCalls++; });
            early.fireInit();

            // 二重配送しない
            late.fireInit();
            late.setMapInitializedListener(() => { lateCalls++; });

            return { lateCalls, earlyCalls };
        });
        expect(result.lateCalls).toBe(1);
        expect(result.earlyCalls).toBe(1);
    });

    test('登録したオーバーレイコントローラにカメラ変更が伝播する', async ({ page }) => {
        // android-sdk の registerOverlayController 相当。これがあることで
        // react-marker-clustering が protected な cameraMoveEndCallback を覗く必要がなくなった。
        const result = await evalInCore(page, (core) => {
            class TestController extends core.BaseMapViewController {
                fireMoveEnd(camera: any) { this.notifyCameraMoveEnd(camera); }
            }
            const c = new TestController();
            const seen: number[] = [];
            const overlay = { onCameraChanged: (cam: any) => { seen.push(cam.zoom); } };
            c.registerOverlayController(overlay);
            c.registerOverlayController(overlay); // 二重登録は無視される

            let userCallbacks = 0;
            c.setCameraMoveEndListener(() => { userCallbacks++; });

            const cam = (zoom: number) =>
                core.createMapCameraPosition({
                    position: core.createGeoPoint({ latitude: 0, longitude: 0 }),
                    zoom,
                });

            c.fireMoveEnd(cam(5));
            c.unregisterOverlayController(overlay);
            c.fireMoveEnd(cam(6));

            return { seen, registered: c.getOverlayControllers().length, userCallbacks };
        });
        // 登録中の1回だけ受け取り、解除後は届かない。利用者コールバックは両方とも呼ばれる。
        expect(result.seen).toEqual([5]);
        expect(result.registered).toBe(0);
        expect(result.userCallbacks).toBe(2);
    });
});

test.describe('MarkerIngestionEngine', () => {
    test('変化していないタイル済みマーカーを再登録しない', async ({ page }) => {
        // android-sdk MarkerIngestionEngine の `unchanged` ガード。無関係な再レンダーで
        // 同じ一覧が再送されただけのとき、これが無いと可視タイルが毎回全部再描画される。
        const result = await evalInCore(page, async (core) => {
            const geocell = new core.HexGeocellImpl({ projection: core.WebMercator });
            const markerManager = new core.MarkerManager(geocell, 2000);
            const renderer = {
                onAdd: async (batch: any[]) => batch.map((_, i) => 'marker-' + i),
                onChange: async (batch: any[]) => batch.map(() => 'changed'),
                onRemove: async () => {},
                onPostProcess: async () => {},
                onAnimate: async () => {},
            };
            const icon = new core.ColorDefaultIcon({ fillColor: '#FF0000' }).toBitmapIcon();
            const tiledMarkerIds = new Set<string>();
            const states = [0, 1, 2].map((i) =>
                core.createMarkerState({
                    id: 'm' + i,
                    position: core.createGeoPoint({ latitude: i, longitude: 0 }),
                }),
            );
            const ingest = (data: any[]) =>
                core.ingestMarkers({
                    data,
                    markerManager,
                    renderer,
                    defaultMarkerIcon: icon,
                    tilingEnabled: true,
                    tiledMarkerIds,
                    shouldTile: () => true,
                });

            const first = await ingest(states);
            const second = await ingest(states); // 同じ一覧を再送
            // 1件だけ動かす
            states[1].setPosition(core.createGeoPoint({ latitude: 99, longitude: 0 }));
            const third = await ingest(states);

            return {
                firstChanged: first.tiledDataChanged,
                firstHasTiled: first.hasTiledMarkers,
                secondChanged: second.tiledDataChanged,
                thirdChanged: third.tiledDataChanged,
                tiledCount: tiledMarkerIds.size,
                allTiled: markerManager.allEntities().every((e: any) => e.tiling === true),
            };
        });

        expect(result.firstChanged).toBe(true);
        expect(result.firstHasTiled).toBe(true);
        expect(result.secondChanged).toBe(false); // ← 再送だけでは変化扱いにしない
        expect(result.thirdChanged).toBe(true);
        expect(result.tiledCount).toBe(3);
        expect(result.allTiled).toBe(true);
    });

    test('タイル ↔ ネイティブの遷移と削除を扱う', async ({ page }) => {
        const result = await evalInCore(page, async (core) => {
            const geocell = new core.HexGeocellImpl({ projection: core.WebMercator });
            const markerManager = new core.MarkerManager(geocell, 2000);
            const renderer = {
                onAdd: async (batch: any[]) => batch.map((_, i) => 'marker-' + i),
                onChange: async (batch: any[]) => batch.map(() => 'changed'),
                onRemove: async () => {},
                onPostProcess: async () => {},
                onAnimate: async () => {},
            };
            const icon = new core.ColorDefaultIcon({ fillColor: '#FF0000' }).toBitmapIcon();
            const tiledMarkerIds = new Set<string>();
            const states = [0, 1].map((i) =>
                core.createMarkerState({
                    id: 'm' + i,
                    position: core.createGeoPoint({ latitude: i, longitude: 0 }),
                }),
            );
            const ingest = (data: any[], shouldTile: (s: any) => boolean) =>
                core.ingestMarkers({
                    data, markerManager, renderer, defaultMarkerIcon: icon,
                    tilingEnabled: true, tiledMarkerIds, shouldTile,
                });

            await ingest(states, () => true);
            const toNative = await ingest(states, () => false);
            const nativeEntities = markerManager.allEntities().map((e: any) => ({
                tiling: e.tiling,
                hasMarker: e.marker != null,
            }));

            const backToTiled = await ingest(states, () => true);
            const removed = await ingest([states[0]], () => true);

            return {
                toNativeChanged: toNative.tiledDataChanged,
                toNativeHasTiled: toNative.hasTiledMarkers,
                nativeEntities,
                backChanged: backToTiled.tiledDataChanged,
                removedChanged: removed.tiledDataChanged,
                remaining: markerManager.allEntities().length,
                tiledCount: tiledMarkerIds.size,
            };
        });

        expect(result.toNativeChanged).toBe(true);
        expect(result.toNativeHasTiled).toBe(false);
        // タイル解除後は tiling=false かつプロバイダのマーカーを持つ
        expect(result.nativeEntities).toEqual([
            { tiling: false, hasMarker: true },
            { tiling: false, hasMarker: true },
        ]);
        expect(result.backChanged).toBe(true);
        expect(result.removedChanged).toBe(true);
        expect(result.remaining).toBe(1);
        expect(result.tiledCount).toBe(1);
    });
});

test.describe('公開 API の形', () => {
    test('GeoRectBounds.isEmpty はプロパティ', async ({ page }) => {
        // android-sdk / ios-sdk はプロパティ。以前は React だけメソッドだった。
        const result = await evalInCore(page, (core) => {
            const empty = core.createGeoRectBounds();
            const full = core.createGeoRectBounds({
                southWest: core.createGeoPoint({ latitude: 0, longitude: 0 }),
                northEast: core.createGeoPoint({ latitude: 1, longitude: 1 }),
            });
            const grown = core.createGeoRectBounds();
            grown.extend(core.createGeoPoint({ latitude: 5, longitude: 5 }));
            return {
                type: typeof empty.isEmpty,
                empty: empty.isEmpty,
                full: full.isEmpty,
                // extend した後は空でなくなる（getter が毎回評価される）
                grown: grown.isEmpty,
            };
        });
        expect(result.type).toBe('boolean');
        expect(result.empty).toBe(true);
        expect(result.full).toBe(false);
        expect(result.grown).toBe(false);
    });

    test('MapUISettings.Default / .None が companion object 形式で公開される', async ({ page }) => {
        const result = await evalInCore(page, (core) => ({
            allEnabled: Object.values(core.MapUISettings.Default).every((v) => v === true),
            allDisabled: Object.values(core.MapUISettings.None).every((v) => v === false),
            legacyDefault: core.DefaultMapUISettings === undefined,
            legacyNone: core.NoMapUISettings === undefined,
            resolvePartial: core.resolveMapUISettings({ zoomGesture: false }),
        }));
        expect(result.allEnabled).toBe(true);
        expect(result.allDisabled).toBe(true);
        expect(result.legacyDefault).toBe(true);
        expect(result.legacyNone).toBe(true);
        expect(result.resolvePartial).toEqual({
            scrollGesture: true,
            zoomGesture: false,
            rotateGesture: true,
            tiltGesture: true,
        });
    });

    test('geodesy の公開名は android-sdk と同一のまま', async ({ page }) => {
        // 内部の自由関数だけを android 名（densifyAlongGeodesic 等）に揃えたので、
        // ファサード経由の公開名が変わっていないことを固定する。
        const result = await evalInCore(page, (core) => ({
            wgs84: Object.keys(core.WGS84Geodesic).sort(),
            planarHasInterpolate: typeof core.Planar.createInterpolatePoints === 'function',
            planarHasPointOnLine: typeof core.Planar.pointOnLineOrNull === 'function',
            sphericalHasDistance: typeof core.Spherical.computeDistanceBetween === 'function',
            // 内部名がパッケージルートに漏れていない
            leakedInternal:
                core.densifyAlongGeodesic === undefined &&
                core.geodesicPointOnLineOrNull === undefined,
        }));

        expect(result.wgs84).toEqual(
            expect.arrayContaining(['createInterpolatePoints', 'pointOnLineOrNull']),
        );
        expect(result.planarHasInterpolate).toBe(true);
        expect(result.planarHasPointOnLine).toBe(true);
        expect(result.sphericalHasDistance).toBe(true);
        expect(result.leakedInternal).toBe(true);
    });

    test('デッドコードが公開面から消えている', async ({ page }) => {
        const result = await evalInCore(page, (core) => {
            const geocell = new core.HexGeocellImpl({ projection: core.WebMercator });
            const manager = new core.MarkerManager(geocell, 2000);
            const state = core.createMarkerState({
                position: core.createGeoPoint({ latitude: 0, longitude: 0 }),
            });
            return {
                // Kotlin の open fun を移植した残骸。呼び出し元ゼロだった。
                openGetEntity: typeof (manager as any).openGetEntity,
                // 公開 interface に載っておらず未使用だったドラッグ API。
                // 実際のドラッグ抑止は AbstractMarkerController 側の WeakMap で動いている。
                beginDrag: typeof (state as any).beginDrag,
                endDrag: typeof (state as any).endDrag,
                setDragPosition: typeof (state as any).setDragPosition,
                isDragging: typeof (state as any).isDragging,
            };
        });
        expect(result).toEqual({
            openGetEntity: 'undefined',
            beginDrag: 'undefined',
            endDrag: 'undefined',
            setDragPosition: 'undefined',
            isDragging: 'undefined',
        });
    });
});

test.describe('OverlayCollector のデバウンス', () => {
    test('連続 add を1回の通知にまとめる', async ({ page }) => {
        // android-sdk OverlayCollector と同じ窓（add 5ms / 100件、remove 5ms / 300件）。
        // 以前は <Marker> を1つマウントするたびに composition が1回走っていた。
        const result = await evalInCore(page, async (core) => {
            const collector = new core.OverlayCollector();
            const notifications: number[] = [];
            collector.subscribe((map: Map<string, unknown>) => notifications.push(map.size));
            // subscribe 直後の初回配送は同期
            const initial = notifications.length;

            for (let i = 0; i < 10; i++) collector.add({ id: 'a' + i });
            const immediatelyAfterAdds = notifications.length;
            // コレクション自体は同期で最新
            const sizeRightAway = collector.values().length;

            await new Promise((r) => setTimeout(r, 60));
            const afterWindow = notifications.length;
            const lastSize = notifications[notifications.length - 1];

            // 100 件に達したら窓を待たず即フラッシュ
            const before = notifications.length;
            for (let i = 0; i < 100; i++) collector.add({ id: 'b' + i });
            const afterThreshold = notifications.length;

            return {
                initial,
                immediatelyAfterAdds,
                sizeRightAway,
                afterWindow,
                lastSize,
                flushedOnThreshold: afterThreshold > before,
            };
        });

        expect(result.initial).toBe(1);
        // 10 回 add しても窓の間は通知されない
        expect(result.immediatelyAfterAdds).toBe(1);
        // ただし values() は即座に最新
        expect(result.sizeRightAway).toBe(10);
        // 窓が閉じたら1回だけ通知
        expect(result.afterWindow).toBe(2);
        expect(result.lastSize).toBe(10);
        expect(result.flushedOnThreshold).toBe(true);
    });

    test('applyDiff / replaceAll は即時通知のまま', async ({ page }) => {
        // android-sdk でも replaceAll は debounceBatch を通さず flow.value を直接置く。
        const result = await evalInCore(page, (core) => {
            const collector = new core.OverlayCollector();
            const notifications: number[] = [];
            collector.subscribe((map: Map<string, unknown>) => notifications.push(map.size));

            collector.applyDiff([{ id: 'x' }, { id: 'y' }], []);
            const afterDiff = notifications.length;
            collector.replaceAll([{ id: 'z' }]);
            const afterReplace = notifications.length;
            return { afterDiff, afterReplace, sizes: notifications };
        });
        expect(result.afterDiff).toBe(2);
        expect(result.afterReplace).toBe(3);
        expect(result.sizes).toEqual([0, 2, 1]);
    });
});

test.describe('OverlayCollector の in-place 更新サンプリング', () => {
    // membership（add / remove）が debounce なのに対し、既に入っている state の
    // in-place 変更は sample: 5ms 窓につき1回、id ごと最新の1件だけを配る。
    // android-sdk の `sample(updateDebounce)` / ios-sdk の `scheduleUpdate()` と同じ。
    //
    // evalInCore はコールバックを文字列化して復元するので、テスト用 state のヘルパは
    // 関数の中に直接書く（クロージャは渡らない）。

    test('1つの窓の中の連続変更は1回にまとまる', async ({ page }) => {
        const result = await evalInCore(page, async (core) => {
            const makeState = (id: string) => {
                const listeners = new Set<(v: unknown) => void>();
                return {
                    id,
                    asObservable: () => ({
                        subscribe: (fn: (v: unknown) => void) => {
                            listeners.add(fn);
                            return () => listeners.delete(fn);
                        },
                    }),
                    mutate: () => listeners.forEach((fn) => fn(null)),
                };
            };
            const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

            const collector = new core.OverlayCollector();
            const updates: string[] = [];
            collector.setUpdateHandler((s: { id: string }) => updates.push(s.id));

            const state = makeState('a');
            collector.add(state);
            await sleep(40);

            // ドラッグ相当: 1つの窓の中で何度も発火させる
            for (let i = 0; i < 20; i++) state.mutate();
            const duringWindow = updates.length;
            await sleep(40);
            const afterWindow = updates.slice();

            // 次の窓の変更はきちんと届く（debounce と違い、変更が続いても枯れない）
            state.mutate();
            await sleep(40);

            return { duringWindow, afterWindow, final: updates };
        });

        expect(result.duringWindow).toBe(0);
        expect(result.afterWindow).toEqual(['a']);
        expect(result.final).toEqual(['a', 'a']);
    });

    test('membership の通知が保留中なら先に出してから update を配る', async ({ page }) => {
        // membership は debounce なので窓が延びる。そのまま待つと、購読者がまだ知らない
        // state の update が先着しかねない。
        const result = await evalInCore(page, async (core) => {
            const makeState = (id: string) => {
                const listeners = new Set<(v: unknown) => void>();
                return {
                    id,
                    asObservable: () => ({
                        subscribe: (fn: (v: unknown) => void) => {
                            listeners.add(fn);
                            return () => listeners.delete(fn);
                        },
                    }),
                    mutate: () => listeners.forEach((fn) => fn(null)),
                };
            };
            const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

            const collector = new core.OverlayCollector();
            const log: string[] = [];
            collector.subscribe(() => log.push('membership'));
            collector.setUpdateHandler((s: { id: string }) => log.push('update:' + s.id));

            const a = makeState('a');
            collector.add(a);
            a.mutate();
            // 3ms 後にもう1件 add して membership の窓を延ばす
            await sleep(3);
            collector.add(makeState('b'));

            await sleep(60);
            return log;
        });

        // subscribe 直後の初回配送 → membership → update の順
        expect(result).toEqual(['membership', 'membership', 'update:a']);
    });

    test('窓の間に外された state には配らない', async ({ page }) => {
        const result = await evalInCore(page, async (core) => {
            const makeState = (id: string) => {
                const listeners = new Set<(v: unknown) => void>();
                return {
                    id,
                    asObservable: () => ({
                        subscribe: (fn: (v: unknown) => void) => {
                            listeners.add(fn);
                            return () => listeners.delete(fn);
                        },
                    }),
                    mutate: () => listeners.forEach((fn) => fn(null)),
                };
            };
            const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

            const collector = new core.OverlayCollector();
            const updates: string[] = [];
            collector.setUpdateHandler((s: { id: string }) => updates.push(s.id));

            const a = makeState('a');
            const b = makeState('b');
            collector.add(a);
            collector.add(b);
            await sleep(40);

            a.mutate();
            b.mutate();
            collector.remove('a'); // 窓が閉じる前に外す
            await sleep(40);

            return updates;
        });

        expect(result).toEqual(['b']);
    });
});
