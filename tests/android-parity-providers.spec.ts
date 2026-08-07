import { test, expect, type Page } from '@playwright/test';

/**
 * プロバイダを実際に動かして、android-sdk 揃えの変更が描画・イベント経路を壊していないことを見る。
 *
 * core 側の意味論そのものは `android-parity-core.spec.ts` が直接押さえている。こちらは
 * 「実プロバイダを通しても同じ結果になるか」の担保で、特に次の変更の回帰網になる:
 * - PolygonState から穴のユニオンを外し、コンポーネント層のみに戻したこと
 * - AbstractMarkerController の取り込みを MarkerIngestionEngine に切り出したこと
 * - OverlayCollector に add/remove のバッチ窓を入れたこと（同期 notify → 非同期バッチ）
 * - BaseMapViewController の sticky mapInitialized とオーバーレイレジストリ
 *
 * サンプルアプリの dev server が必要: examples/basic で `npm run dev`（既定 http://localhost:4003）。
 * API キー不要の Leaflet / MapLibre / OpenLayers のみを対象にする。
 */

const BASE = process.env.SAMPLE_BASE_URL ?? 'http://localhost:4003';

function watchErrors(page: Page): string[] {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => {
        if (m.type() === 'error') errors.push(m.text());
    });
    return errors;
}

/**
 * サンプルページは「試し方」モーダルを出すので、閉じないとポインタイベントが通らない。
 * モーダルを持たないページもあるので、出なければそのまま進む。
 */
async function openSample(page: Page, path: string): Promise<void> {
    await page.goto(`${BASE}${path}`);
    await expect(page.locator('.leaflet-container, .maplibregl-canvas')).not.toHaveCount(0, {
        timeout: 20_000,
    });
    const close = page.locator('.sample-intro-close');
    if ((await close.count()) > 0) {
        await close.click();
        await expect(close).toHaveCount(0);
    }
}

/** Leaflet の SVG パスに含まれるサブパス数 = 外周リング + 穴リングの数。 */
const ringCounts = (page: Page) =>
    page.evaluate(() =>
        Array.from(document.querySelectorAll('.leaflet-container svg path'))
            .map((p) => ({
                rings: ((p.getAttribute('d') ?? '').match(/M/g) ?? []).length,
                fillRule: p.getAttribute('fill-rule'),
            }))
            .filter((p) => p.fillRule === 'evenodd'),
    );

test.describe('ポリゴンの穴（Leaflet / SVG で実測）', () => {
    test('重なる2つの穴が1つに統合されて描画される', async ({ page }) => {
        // サンプルは重なり合う穴を2つ定義している（各3頂点 = 頂点マーカー6個）。
        // ユニオンが「コンポーネント層で1回だけ」効いていれば、描画されるリングは
        // 外周1 + 統合後の穴1 = 2 になる。
        //
        // ユニオンが全く効かなければ 3（穴が2つ別々に残る）、
        // 二重適用で巻き方向が壊れれば穴が抜けない/形が崩れるので、この数で両方を検出できる。
        const errors = watchErrors(page);
        await openSample(page, '/leaflet/polygon-hole/en');
        await page.waitForTimeout(2_500);

        const paths = await ringCounts(page);
        expect(paths, 'even-odd 塗りのポリゴンが1つ描画される').toHaveLength(1);
        expect(paths[0].rings, '外周 + 統合された穴1つ').toBe(2);

        // 穴の頂点マーカーは統合前の元データぶん（2穴 × 3頂点）が出る。
        // ここが 6 なのに描画リングが 2 であることが「統合された」ことの裏取りになる。
        const vertexMarkers = await page.locator('.leaflet-marker-icon').count();
        expect(vertexMarkers).toBe(6);

        expect(errors).toEqual([]);
    });
});

test.describe('クリックイベントの配送', () => {
    test('ポリゴン内クリックが正規化された座標でハンドラに届く', async ({ page }) => {
        // core 側は dispatchClick が範囲外の点を wrap することを直接検証している。
        // ここでは「プロバイダ → コントローラ → state.onClick」の経路が通っていることと、
        // 届いた座標が正規化済みの範囲に収まっていることを見る。
        const errors = watchErrors(page);
        await openSample(page, '/leaflet/polygon-click/en');
        await page.waitForTimeout(2_500);

        const container = page.locator('.leaflet-container');
        const box = await container.boundingBox();
        expect(box).not.toBeNull();

        // サンプルのマップはビューポートより大きいことがあるので、
        // 必ず画面内に収まる座標を選ぶ。
        const viewport = page.viewportSize()!;
        const x = Math.min(Math.max(box!.x + box!.width / 2, 10), viewport.width - 10);
        const y = Math.min(Math.max(box!.y + box!.height / 2, 10), viewport.height - 10);
        await page.mouse.click(x, y);
        await page.waitForTimeout(1_200);

        const texts = await page.evaluate(() =>
            Array.from(document.querySelectorAll('[class*=bubble], [class*=Bubble]')).map(
                (e) => (e as HTMLElement).innerText,
            ),
        );
        const hit = texts.find((tx) => /Inside|Outside/.test(tx));
        expect(hit, `クリックがハンドラに届く（received: ${JSON.stringify(texts)}）`).toBeTruthy();

        const coords = hit!.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
        expect(coords, `座標が表示される（received: ${hit}）`).not.toBeNull();
        const lat = Number(coords![1]);
        const lng = Number(coords![2]);
        expect(lat).toBeGreaterThanOrEqual(-90);
        expect(lat).toBeLessThanOrEqual(90);
        expect(lng).toBeGreaterThanOrEqual(-180);
        expect(lng).toBeLessThanOrEqual(180);

        expect(errors).toEqual([]);
    });
});

test.describe('描画のスモーク（変更の巻き添えが無いこと）', () => {
    // OverlayCollector のデバウンス化は同期 notify → 非同期バッチへの挙動変更なので、
    // オーバーレイ種別ごとに「最終的にちゃんと出る」ことを見ておく。
    const overlayPages = [
        { page: 'polygon', expectVector: true },
        { page: 'polyline', expectVector: true },
        { page: 'circle', expectVector: true },
        { page: 'polygon-hole', expectVector: true },
        { page: 'ground-image', expectVector: false },
        { page: 'marker', expectVector: false },
    ] as const;

    for (const { page: samplePage, expectVector } of overlayPages) {
        test(`${samplePage} が Leaflet で描画される`, async ({ page }) => {
            const errors = watchErrors(page);
            await openSample(page, `/leaflet/${samplePage}/en`);
            await page.waitForTimeout(2_500);

            const markers = await page.locator('.leaflet-marker-icon').count();
            const vectors = await page.locator('.leaflet-container svg path').count();
            expect(markers + vectors, 'オーバーレイが1つ以上描画される').toBeGreaterThan(0);
            if (expectVector) {
                expect(vectors, 'ベクタオーバーレイが描画される').toBeGreaterThan(0);
            }
            expect(errors).toEqual([]);
        });
    }

    test('UI Settings ページが動く（MapUISettings.Default リネームの回帰）', async ({ page }) => {
        // DefaultMapUISettings → MapUISettings.Default に変えたので、
        // 実際に uiSettings を読む経路が壊れていないことを確認する。
        const errors = watchErrors(page);
        await openSample(page, '/leaflet/ui-settings/en');
        await page.waitForTimeout(2_000);
        await expect(page.locator('.leaflet-container')).toHaveCount(1);
        expect(errors).toEqual([]);
    });

    test('大量マーカーが MapLibre でタイル描画される（取り込みエンジン切り出しの回帰）', async ({ page }) => {
        // MarkerIngestionEngine への切り出しと MarkerEntity.tiling 追加の回帰網。
        // タイル経路が壊れると、ここでマーカーもタイルも出なくなる。
        test.slow();
        const errors = watchErrors(page);
        await openSample(page, '/maplibre/post-office/en');
        await page.waitForTimeout(12_000);

        const rendered = await page.evaluate(() => {
            const canvas = document.querySelector('.maplibregl-canvas') as HTMLCanvasElement | null;
            return { hasCanvas: canvas != null, width: canvas?.width ?? 0 };
        });
        expect(rendered.hasCanvas).toBe(true);
        expect(rendered.width).toBeGreaterThan(0);
        expect(errors).toEqual([]);
    });
});

/** 最大ズームのタイル群の x 範囲。タイルは常に 256px 角なので、パン量をズームに依らず測れる。 */
const tileXRange = (page: Page) =>
    page.evaluate(() => {
        const tiles = Array.from(document.querySelectorAll('.leaflet-tile'))
            .map((el) => (el as HTMLImageElement).src.match(/\/(\d+)\/(\d+)\/(\d+)\.png/))
            .filter((m): m is RegExpMatchArray => m != null)
            .map((m) => ({ z: Number(m[1]), x: Number(m[2]) }));
        const z = Math.max(...tiles.map((v) => v.z));
        const xs = tiles.filter((v) => v.z === z).map((v) => v.x);
        return { z, min: Math.min(...xs), max: Math.max(...xs) };
    });

/** 西向きに大きくドラッグする（= 地図は東へ動く）。1回あたりおよそ画面幅ぶん。 */
async function panFarEast(page: Page, times = 4): Promise<void> {
    const box = await page.locator('.leaflet-container').boundingBox();
    const viewport = page.viewportSize()!;
    const y = Math.min(Math.max(box!.y + box!.height / 2, 60), viewport.height - 60);
    for (let i = 0; i < times; i++) {
        await page.mouse.move(viewport.width - 60, y);
        await page.mouse.down();
        await page.mouse.move(80, y, { steps: 12 });
        await page.mouse.up();
        await page.waitForTimeout(700);
    }
    await page.waitForTimeout(1_500);
}

test.describe('CameraRestriction が共有マップインスタンスに効く', () => {
    // サンプルアプリはプロバイダごとに1つのマップインスタンスを使い回す。以前は
    // restrictBounds がマップ生成時にしか反映できず、これが要るページだけ専用インスタンスに
    // 逃がしていた（MapViewContainer の useDedicatedInstance）。実行時適用ができるように
    // なったのでその回避策を外した。ここはその撤去が実際に効いていることの担保。
    test.slow();

    test('制限ありページではパンがクランプされ、他ページには残らない', async ({ page }) => {
        const errors = watchErrors(page);

        // polygon-hole は経度 140.0..142.8 に制限している。
        await openSample(page, '/leaflet/polygon-hole/en');
        await page.waitForTimeout(1_500);
        const restrictedBefore = await tileXRange(page);
        await panFarEast(page);
        const restrictedAfter = await tileXRange(page);
        const restrictedShift = restrictedAfter.min - restrictedBefore.min;

        // 制限の東端をタイル x に直した値。カメラ中心がここでクランプされるので、
        // 可視範囲は「東端 + 画面半分」までしか行けない。
        const eastEdgeTileX = ((142.8 + 180) / 360) * 2 ** restrictedAfter.z;
        const halfViewportTiles = page.viewportSize()!.width / 256 / 2;
        expect(
            restrictedAfter.max,
            '制限の東端を大きく越えない（カメラ中心がクランプされている）',
        ).toBeLessThan(eastEdgeTileX + halfViewportTiles + 4);

        // 同じ共有インスタンスで制限の無いページへ移動すると、自由にパンできる。
        await openSample(page, '/leaflet/polyline/en');
        await page.waitForTimeout(1_500);
        const freeBefore = await tileXRange(page);
        await panFarEast(page);
        const freeAfter = await tileXRange(page);
        const freeShift = freeAfter.min - freeBefore.min;

        // ドラッグ量は同じなので、タイル単位の移動量もズームに依らずほぼ同じになるはず。
        // 制限ページ側だけが明確に小さいことを見る。
        expect(freeShift, '制限が解除されて大きく移動できる').toBeGreaterThan(15);
        expect(restrictedShift, '制限ページではほとんど動けない').toBeLessThan(freeShift / 2);

        expect(errors).toEqual([]);
    });
});
