import { test, expect, type Page, type Route } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

/**
 * RasterLayer の `userAgent` / `extraHeaders` が**実際にタイル要求へ載っているか**を、
 * 受け取る側で確かめる。
 *
 * 送る側のコードを読んでも分からない（タイルを取りに行くのは各地図ライブラリで、
 * 途中でヘッダが落ちても誰も知らせてくれない）ので、受け側を立てて届いたものを読む。
 * android-sdk / ios-sdk の `HeaderRecordingTileServer` と同じ考え方で、web では
 * Playwright の route 横取りがその役をする。
 *
 * ## 非対応も固定する
 *
 * 「載らないこと」を確かめるテストは、落とすためではなく**気づくため**にある。
 * ライブラリ側にフックが増えて載るようになったら、ここが落ちて対応表の更新を促す。
 * ただし「タイル要求が 1 本も来ていない」状態は非対応の証明にならない（地図が
 * そもそも動いていないだけかもしれない）ので、要求が来ていることを先に確かめる。
 *
 * サンプルアプリの dev server が必要: examples/basic で `npm run dev`（既定 http://localhost:4003）。
 */

const BASE = process.env.SAMPLE_BASE_URL ?? 'http://localhost:4003';

/** サンプルページ側（RasterLayerPage）と揃える。 */
const PROBE_HEADER_NAME = 'x-mapconductor-test'; // 受け取り側では小文字で来る
const PROBE_HEADER_VALUE = 'mapconductor-probe';
const PROBE_USER_AGENT = 'MapConductorRasterHeaderProbe/1.0';

/** 1x1 の PNG。中身は見ないので最小で足りる。 */
const TILE_PNG = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64',
);

/**
 * API キーが要るプロバイダは、鍵が無い環境では**動かないのが正常**なので飛ばす。
 * 鍵の有無はサンプルアプリの .env をそのまま見る（dev server が読むのと同じファイル）。
 */
const REQUIRED_KEY: Record<string, string | null> = {
    maplibre: null,
    leaflet: null,
    openlayers: null,
    cesium: null,
    maptiler: 'VITE_MAPTILER',
    mapbox: 'VITE_MAPBOX_ACCESS_TOKEN',
    azuremaps: 'VITE_AZURE_MAPS_SUBSCRIOTION_KEY',
    'google-maps': 'VITE_GOOGLE_MAPS_API_KEY',
    arcgis: 'VITE_ARCGIS_API_KEY',
    here: 'VITE_HERE_API_KEY',
    mapkit: 'VITE_MAPKIT_TOKEN',
    tomtom: 'VITE_TOMTOM_API_KEY',
    longdo: 'VITE_LONGDO',
};

const envKeys = (() => {
    const file = path.resolve(__dirname, '../examples/basic/.env');
    if (!fs.existsSync(file)) return new Set<string>();
    return new Set(
        fs
            .readFileSync(file, 'utf8')
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line.length > 0 && !line.startsWith('#'))
            .filter((line) => (line.split('=')[1] ?? '').trim().length > 0)
            .map((line) => line.split('=')[0].trim()),
    );
})();

interface Recorded {
    headers: Record<string, string>[];
}

/**
 * 計測用タイルの宛先を横取りして、届いたヘッダを記録する。
 *
 * 実サーバを立てずに済ませているが、記録するのは**ブラウザが実際に送り出したヘッダ**
 * なので、サーバを立てた場合と同じものが見える。
 */
async function recordTileHeaders(page: Page): Promise<Recorded> {
    const recorded: Recorded = { headers: [] };
    await page.route('**/__mc-header-probe/**', (route: Route) => {
        recorded.headers.push(route.request().headers());
        void route.fulfill({
            status: 200,
            contentType: 'image/png',
            headers: { 'Cache-Control': 'no-store' },
            body: TILE_PNG,
        });
    });
    return recorded;
}

/** 計測ページを開いて、タイル要求が来るまで待つ。 */
async function openProbe(page: Page, provider: string): Promise<Recorded> {
    const recorded = await recordTileHeaders(page);
    await page.goto(`${BASE}/${provider}/raster-layer/en?probeHeaders=1`);
    const close = page.locator('.sample-intro-close');
    if ((await close.count()) > 0) await close.click();
    await expect
        .poll(() => recorded.headers.length, {
            timeout: 30_000,
            message: `${provider}: タイル要求が 1 本も来ていない（地図自体が動いていない可能性）`,
        })
        .toBeGreaterThan(0);
    return recorded;
}

const anyHeader = (recorded: Recorded, name: string): string | undefined =>
    recorded.headers.map((headers) => headers[name]).find((value) => value !== undefined);

/**
 * 本件とは無関係の理由で計測できないプロバイダ。
 *
 * 動かない理由を書かずに落としたままにすると「ラスタヘッダが壊れている」に見え、
 * 黙って外すと「測って対応を確認した」に見える。理由付きで飛ばして、直ったら
 * 外せるようにしておく。
 */
// 2026-08-07 時点で空。Cesium は `useMarkerRenderingSupport` が useEffect の中から
// 呼ばれていた（Invalid hook call）のを直して測れるようになった。
const CANNOT_MEASURE: Record<string, string> = {};

function describeProvider(provider: string, run: () => void): void {
    const key = REQUIRED_KEY[provider];
    // eslint-disable-next-line playwright/no-skipped-test
    test.describe(provider, () => {
        test.skip(key != null && !envKeys.has(key), `${key} が設定されていないので測れない`);
        test.skip(provider in CANNOT_MEASURE, CANNOT_MEASURE[provider]);
        run();
    });
}

/** extraHeaders が載るプロバイダ。 */
const SUPPORTED = ['maplibre', 'maptiler', 'mapbox', 'azuremaps', 'leaflet', 'openlayers', 'cesium'];

/** 載らないプロバイダ。ライブラリ側にリクエスト書き換えの口が無い。 */
const UNSUPPORTED = ['google-maps', 'arcgis', 'here', 'mapkit', 'tomtom'];

for (const provider of SUPPORTED) {
    describeProvider(provider, () => {
        test('extraHeaders がタイル要求に載る', async ({ page }) => {
            const recorded = await openProbe(page, provider);
            expect(anyHeader(recorded, PROBE_HEADER_NAME)).toBe(PROBE_HEADER_VALUE);
        });

        test('userAgent は載らない（ブラウザが上書きを許さない）', async ({ page }) => {
            const recorded = await openProbe(page, provider);
            // 「対応しているプロバイダなら UA も載る」と読まれないよう、対応側でも固定する。
            expect(anyHeader(recorded, 'user-agent')).not.toBe(PROBE_USER_AGENT);
        });
    });
}

for (const provider of UNSUPPORTED) {
    describeProvider(provider, () => {
        test('extraHeaders も userAgent も載らない', async ({ page }) => {
            const recorded = await openProbe(page, provider);
            expect(anyHeader(recorded, PROBE_HEADER_NAME)).toBeUndefined();
            expect(anyHeader(recorded, 'user-agent')).not.toBe(PROBE_USER_AGENT);
        });
    });
}

test.describe('非対応プロバイダの通知', () => {
    test('無視される指定は console に出る', async ({ page }) => {
        // 黙って無視すると、利用者は「認証が通らない理由」を自分のサーバ側で探すことになる。
        const warnings: string[] = [];
        page.on('console', (message) => {
            if (message.type() === 'warning') warnings.push(message.text());
        });
        await openProbe(page, 'leaflet');
        expect(warnings.some((text) => text.includes('userAgent') && text.includes('RasterLayer'))).toBe(true);
    });
});
