/* eslint-disable typescript/no-explicit-any */
// react-kml は実行時にブラウザへ動的 import する（同一オリジンの偽 URL 経由）ため、
// ビルド時に型を辿れない。このファイルの kml 参照が any になるのはそのため。
import { test, expect, type Page } from '@playwright/test';
import { buildSync } from 'esbuild';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

/**
 * android-sdk の `KMLParserTest.kt` / `KMLLoaderTest.kt` / `KMLStyleProviderTest.kt`
 * を移植した回帰テスト。react-kml のビルド済み dist を esbuild で自己完結 ESM に
 * まとめ、偽オリジン経由でブラウザに読み込んで実行する。dev server は不要。
 *
 * KMZ は `DecompressionStream('deflate-raw')`、テスト側の圧縮は
 * `CompressionStream('deflate-raw')` を使うため、ブラウザ（Chromium）内で回す。
 */

const DIST = path.resolve(__dirname, '../react-kml/dist/index.mjs');
const BUNDLE = path.join(mkdtempSync(path.join(tmpdir(), 'react-kml-test-')), 'react-kml.bundle.mjs');

buildSync({
    entryPoints: [DIST],
    bundle: true,
    format: 'esm',
    platform: 'browser',
    outfile: BUNDLE,
    define: { 'process.env.NODE_ENV': '"production"' },
    logLevel: 'silent',
});

const ORIGIN = 'https://react-kml.test';

async function loadKml(page: Page): Promise<void> {
    await page.route((url) => url.href.startsWith(`${ORIGIN}/`), (route) => {
        if (route.request().url().endsWith('/__react-kml.mjs')) {
            return route.fulfill({ path: BUNDLE, contentType: 'text/javascript' });
        }
        return route.fulfill({ body: '<!doctype html><title>react-kml test</title>', contentType: 'text/html' });
    });
    await page.goto(`${ORIGIN}/`);
}

const evalInKml = <T>(page: Page, fn: (kml: any) => T | Promise<T>): Promise<T> =>
    page.evaluate(async (source) => {
        const kml = await import('/__react-kml.mjs');
        // eslint-disable-next-line no-new-func
        const body = new Function(`return (${source})`)();
        return await body(kml);
    }, fn.toString()) as Promise<T>;

test.beforeEach(async ({ page }) => {
    await loadKml(page);
});

// android の KMLParserTest.parsesPlacemarkWithSharedStyle と同じ期待値。
// ff0000ff (aabbggrr) → argb(255, 255, 0, 0)。
const RED_ARGB = ((255 << 24) | (255 << 16)) | 0;

test.describe('KMLParser', () => {
    test('parses a placemark with a shared style', async ({ page }) => {
        const result = await evalInKml(page, (kml) => {
            const text = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2"><Document>
  <Style id="s"><LineStyle><color>ff0000ff</color><width>3</width></LineStyle></Style>
  <Placemark>
    <name>line</name>
    <styleUrl>#s</styleUrl>
    <LineString><coordinates>139.7,35.6,0 139.8,35.7,0</coordinates></LineString>
  </Placemark>
</Document></kml>`;
            const features = kml.KMLParser.parse(text);
            const feature = features[0];
            return {
                count: features.length,
                name: feature.properties.name,
                strokeWidth: feature.strokeWidth,
                strokeColor: feature.strokeColor,
                geometryType: feature.geometry.type,
                coordinateCount: feature.geometry.coordinates.length,
                firstLongitude: feature.geometry.coordinates[0].longitude,
            };
        });
        expect(result.count).toBe(1);
        expect(result.name).toBe('line');
        expect(result.strokeWidth).toBe(3);
        expect(result.strokeColor).toBe(RED_ARGB);
        expect(result.geometryType).toBe('LineString');
        expect(result.coordinateCount).toBe(2);
        expect(result.firstLongitude).toBeCloseTo(139.7, 9);
    });

    test('20,000-deep folder nesting does not overflow the stack', async ({ page }) => {
        const result = await evalInKml(page, (kml) => {
            const depth = 20_000;
            const text = '<?xml version="1.0"?><kml>' +
                '<Folder>'.repeat(depth) +
                '<Placemark><Point><coordinates>139.7,35.6</coordinates></Point></Placemark>' +
                '</Folder>'.repeat(depth) +
                '</kml>';
            const features = kml.KMLParser.parse(text);
            return { count: features.length, geometryType: features[0]?.geometry.type };
        });
        expect(result.count).toBe(1);
        expect(result.geometryType).toBe('Point');
    });

    test('20,000-deep nested MultiGeometry does not overflow the stack', async ({ page }) => {
        const result = await evalInKml(page, (kml) => {
            const depth = 20_000;
            const text = '<?xml version="1.0"?><kml><Placemark>' +
                '<MultiGeometry>'.repeat(depth) +
                '<Point><coordinates>139.7,35.6</coordinates></Point>' +
                '</MultiGeometry>'.repeat(depth) +
                '</Placemark></kml>';
            const features = kml.KMLParser.parse(text);
            let geometry = features[0].geometry;
            let unwrapped = 0;
            let singleChildEverywhere = true;
            while (geometry.type === 'GeometryCollection') {
                if (geometry.geometries.length !== 1) singleChildEverywhere = false;
                geometry = geometry.geometries[0];
                unwrapped++;
            }
            return { count: features.length, unwrapped, singleChildEverywhere, leafType: geometry.type };
        });
        expect(result.count).toBe(1);
        expect(result.unwrapped).toBe(20_000);
        expect(result.singleChildEverywhere).toBe(true);
        expect(result.leafType).toBe('Point');
    });

    test('MultiGeometry keeps sibling leaves and nesting', async ({ page }) => {
        const result = await evalInKml(page, (kml) => {
            const text = `<?xml version="1.0"?><kml><Document><Placemark><MultiGeometry>
  <Point><coordinates>1,2</coordinates></Point>
  <MultiGeometry>
    <LineString><coordinates>1,2 3,4</coordinates></LineString>
  </MultiGeometry>
  <Polygon><outerBoundaryIs><LinearRing>
    <coordinates>0,0 1,0 1,1 0,0</coordinates>
  </LinearRing></outerBoundaryIs></Polygon>
</MultiGeometry></Placemark></Document></kml>`;
            const collection = kml.KMLParser.parse(text)[0].geometry;
            return {
                type: collection.type,
                childCount: collection.geometries.length,
                first: collection.geometries[0].type,
                nestedType: collection.geometries[1].type,
                nestedChild: collection.geometries[1].geometries[0].type,
                third: collection.geometries[2].type,
            };
        });
        expect(result.type).toBe('GeometryCollection');
        expect(result.childCount).toBe(3);
        expect(result.first).toBe('Point');
        expect(result.nestedType).toBe('GeometryCollection');
        expect(result.nestedChild).toBe('LineString');
        expect(result.third).toBe('Polygon');
    });

    test('collects NetworkLinks including the legacy Url tag', async ({ page }) => {
        const result = await evalInKml(page, async (kml) => {
            const text = `<?xml version="1.0"?><kml><Document>
  <NetworkLink><Link><href>https://example.com/a.kml</href></Link></NetworkLink>
  <Folder>
    <NetworkLink><visibility>0</visibility><Link><href>hidden.kml</href></Link></NetworkLink>
    <NetworkLink><Url><href>legacy.kml</href></Url></NetworkLink>
  </Folder>
  <Placemark><Point><coordinates>1,2</coordinates></Point></Placemark>
</Document></kml>`;
            const document = await kml.KMLParser.parseDocument(text);
            return {
                featureCount: document.features.length,
                linkCount: document.networkLinks.length,
                firstHref: document.networkLinks[0].href,
                secondVisibility: document.networkLinks[1].visibility,
                thirdHref: document.networkLinks[2].href,
            };
        });
        expect(result.featureCount).toBe(1);
        expect(result.linkCount).toBe(3);
        expect(result.firstHref).toBe('https://example.com/a.kml');
        expect(result.secondVisibility).toBe(false);
        expect(result.thirdHref).toBe('legacy.kml');
    });
});

// ─── KMZ ─────────────────────────────────────────────────────────────────────

/**
 * テスト内で ZIP をバイト単位で組み立てるヘルパのソース。ブラウザ側の
 * evaluate に埋め込んで使う（Node 側では実行しない）。
 */
const ZIP_HELPERS = `
    const u16 = (n) => [n & 255, (n >> 8) & 255];
    const u32 = (n) => [n & 255, (n >> 8) & 255, (n >> 16) & 255, (n >> 24) & 255];
    const buildZip = (entries) => {
        // entries: { name, data: Uint8Array, method: 0 | 8, stored: Uint8Array }
        const chunks = [];
        const central = [];
        const encoder = new TextEncoder();
        let offset = 0;
        for (const entry of entries) {
            const nameBytes = encoder.encode(entry.name);
            const stored = entry.stored;
            const local = new Uint8Array([
                0x50, 0x4b, 0x03, 0x04,
                ...u16(20), ...u16(0), ...u16(entry.method), ...u16(0), ...u16(0),
                ...u32(0), ...u32(stored.length), ...u32(entry.data.length),
                ...u16(nameBytes.length), ...u16(0),
            ]);
            central.push({ nameBytes, method: entry.method, csize: stored.length, usize: entry.data.length, offset });
            chunks.push(local, nameBytes, stored);
            offset += local.length + nameBytes.length + stored.length;
        }
        let cdSize = 0;
        for (const c of central) {
            const record = new Uint8Array([
                0x50, 0x4b, 0x01, 0x02,
                ...u16(20), ...u16(20), ...u16(0), ...u16(c.method), ...u16(0), ...u16(0),
                ...u32(0), ...u32(c.csize), ...u32(c.usize),
                ...u16(c.nameBytes.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0),
                ...u32(0), ...u32(c.offset),
            ]);
            chunks.push(record, c.nameBytes);
            cdSize += record.length + c.nameBytes.length;
        }
        const eocd = new Uint8Array([
            0x50, 0x4b, 0x05, 0x06,
            ...u16(0), ...u16(0), ...u16(central.length), ...u16(central.length),
            ...u32(cdSize), ...u32(offset), ...u16(0),
        ]);
        chunks.push(eocd);
        const total = chunks.reduce((sum, c) => sum + c.length, 0);
        const out = new Uint8Array(total);
        let position = 0;
        for (const c of chunks) { out.set(c, position); position += c.length; }
        return out;
    };
    const deflateRaw = async (data) => {
        const stream = new Blob([data]).stream().pipeThrough(new CompressionStream('deflate-raw'));
        return new Uint8Array(await new Response(stream).arrayBuffer());
    };
    const pointKml = (lon, lat) =>
        '<?xml version="1.0"?><kml><Document><Placemark><Point><coordinates>' +
        lon + ',' + lat + '</coordinates></Point></Placemark></Document></kml>';
`;

const evalWithZip = <T>(page: Page, body: string): Promise<T> =>
    page.evaluate(async ({ helpers, source }) => {
        const kml = await import('/__react-kml.mjs');
        // eslint-disable-next-line no-new-func
        const fn = new Function('kml', `${helpers} return (async () => { ${source} })();`);
        return await fn(kml);
    }, { helpers: ZIP_HELPERS, source: body }) as Promise<T>;

test.describe('KMLParser KMZ', () => {
    test('parses a KMZ archive using the first .kml entry (stored)', async ({ page }) => {
        const result = await evalWithZip<{ count: number; type: string; lon: number }>(page, `
            const encoder = new TextEncoder();
            const icon = new Uint8Array([1, 2, 3]);
            const doc = encoder.encode(pointKml(139.7, 35.6));
            const second = encoder.encode(pointKml(0, 0));
            const zip = buildZip([
                { name: 'images/icon.png', data: icon, method: 0, stored: icon },
                { name: '__MACOSX/ignored.kml', data: icon, method: 0, stored: icon },
                { name: 'doc.kml', data: doc, method: 0, stored: doc },
                { name: 'second.kml', data: second, method: 0, stored: second },
            ]);
            const document = await kml.KMLParser.parseDocument(zip);
            return {
                count: document.features.length,
                type: document.features[0].geometry.type,
                lon: document.features[0].geometry.longitude,
            };
        `);
        expect(result.count).toBe(1);
        expect(result.type).toBe('Point');
        expect(result.lon).toBeCloseTo(139.7, 9);
    });

    test('parses a KMZ archive with a deflate-compressed entry', async ({ page }) => {
        const result = await evalWithZip<{ count: number; type: string; lon: number }>(page, `
            const encoder = new TextEncoder();
            const doc = encoder.encode(pointKml(139.7, 35.6));
            const zip = buildZip([
                { name: 'doc.kml', data: doc, method: 8, stored: await deflateRaw(doc) },
            ]);
            const document = await kml.KMLParser.parseDocument(zip);
            return {
                count: document.features.length,
                type: document.features[0].geometry.type,
                lon: document.features[0].geometry.longitude,
            };
        `);
        expect(result.count).toBe(1);
        expect(result.type).toBe('Point');
        expect(result.lon).toBeCloseTo(139.7, 9);
    });

    test('KMZ without a .kml entry rejects', async ({ page }) => {
        const result = await evalWithZip<{ message: string }>(page, `
            const encoder = new TextEncoder();
            const readme = encoder.encode('no kml here');
            const zip = buildZip([
                { name: 'readme.txt', data: readme, method: 0, stored: readme },
            ]);
            try {
                await kml.KMLParser.parseDocument(zip);
                return { message: '' };
            } catch (error) {
                return { message: String(error) };
            }
        `);
        expect(result.message).toContain('no .kml entry');
    });
});

// ─── KMLLoader ────────────────────────────────────────────────────────────────

/** ローダテストのスタブ環境を作るヘルパのソース（evaluate に埋め込む）。 */
const LOADER_HELPERS = `
    const kmlWithPoint = (name, links = []) => {
        const linkTags = links
            .map((href) => '<NetworkLink><Link><href>' + href + '</href></Link></NetworkLink>')
            .join('');
        return '<?xml version="1.0"?><kml><Document>' + linkTags +
            '<Placemark><name>' + name + '</name><Point><coordinates>1,2</coordinates></Point></Placemark>' +
            '</Document></kml>';
    };
    const loaderFor = (kml, documents, options = {}) => {
        const fetchLog = [];
        const errors = [];
        const loader = new kml.KMLLoader({
            maxDocuments: options.maxDocuments,
            onDocumentError: (url) => errors.push(url),
            fetch: async (url) => {
                fetchLog.push(url);
                const doc = documents[url];
                if (doc === undefined) throw new Error('not found: ' + url);
                return doc;
            },
        });
        return { loader, fetchLog, errors };
    };
    const names = (features) => features.map((f) => f.properties.name);
`;

const evalLoader = <T>(page: Page, body: string): Promise<T> =>
    page.evaluate(async ({ helpers, source }) => {
        const kml = await import('/__react-kml.mjs');
        // eslint-disable-next-line no-new-func
        const fn = new Function('kml', `${helpers} return (async () => { ${source} })();`);
        return await fn(kml);
    }, { helpers: LOADER_HELPERS, source: body }) as Promise<T>;

test.describe('KMLLoader', () => {
    test('follows absolute and relative NetworkLinks', async ({ page }) => {
        const result = await evalLoader<string[]>(page, `
            const { loader } = loaderFor(kml, {
                'https://example.com/maps/root.kml':
                    kmlWithPoint('root', ['sub/child.kml', 'https://other.com/abs.kml']),
                'https://example.com/maps/sub/child.kml': kmlWithPoint('child'),
                'https://other.com/abs.kml': kmlWithPoint('abs'),
            });
            return names(await loader.load('https://example.com/maps/root.kml'));
        `);
        expect(result).toEqual(['root', 'child', 'abs']);
    });

    test('cyclic links are fetched only once', async ({ page }) => {
        const result = await evalLoader<{ names: string[]; fetches: number }>(page, `
            const { loader, fetchLog } = loaderFor(kml, {
                'https://example.com/a.kml': kmlWithPoint('a', ['https://example.com/b.kml']),
                'https://example.com/b.kml': kmlWithPoint('b', ['https://example.com/a.kml']),
            });
            const features = await loader.load('https://example.com/a.kml');
            return { names: names(features), fetches: fetchLog.length };
        `);
        expect(result.names).toEqual(['a', 'b']);
        expect(result.fetches).toBe(2);
    });

    test('maxDocuments caps the chain', async ({ page }) => {
        const result = await evalLoader<string[]>(page, `
            const chain = {};
            for (let i = 0; i < 10; i++) {
                chain['https://example.com/' + i + '.kml'] =
                    kmlWithPoint('doc' + i, ['https://example.com/' + (i + 1) + '.kml']);
            }
            const { loader } = loaderFor(kml, chain, { maxDocuments: 3 });
            return names(await loader.load('https://example.com/0.kml'));
        `);
        expect(result).toEqual(['doc0', 'doc1', 'doc2']);
    });

    test('a failed link is skipped and reported', async ({ page }) => {
        const result = await evalLoader<{ names: string[]; errors: string[] }>(page, `
            const { loader, errors } = loaderFor(kml, {
                'https://example.com/root.kml':
                    kmlWithPoint('root', ['https://example.com/missing.kml', 'https://example.com/ok.kml']),
                'https://example.com/ok.kml': kmlWithPoint('ok'),
            });
            const features = await loader.load('https://example.com/root.kml');
            return { names: names(features), errors };
        `);
        expect(result.names).toEqual(['root', 'ok']);
        expect(result.errors).toEqual(['https://example.com/missing.kml']);
    });

    test('text input resolves relative links against baseUrl', async ({ page }) => {
        const result = await evalLoader<{ names: string[]; fetchLog: string[] }>(page, `
            const { loader, fetchLog } = loaderFor(kml, {
                'https://example.com/data/child.kml': kmlWithPoint('child'),
            });
            const features = await loader.load(
                kmlWithPoint('root', ['child.kml']),
                'https://example.com/data/root.kml',
            );
            return { names: names(features), fetchLog };
        `);
        expect(result.names).toEqual(['root', 'child']);
        expect(result.fetchLog).toEqual(['https://example.com/data/child.kml']);
    });

    test('text input without baseUrl skips relative links', async ({ page }) => {
        const result = await evalLoader<{ names: string[]; fetchLog: string[] }>(page, `
            const { loader, fetchLog } = loaderFor(kml, {
                'https://other.com/abs.kml': kmlWithPoint('abs'),
            });
            const features = await loader.load(
                kmlWithPoint('root', ['child.kml', 'https://other.com/abs.kml']),
            );
            return { names: names(features), fetchLog };
        `);
        expect(result.names).toEqual(['root', 'abs']);
        expect(result.fetchLog).toEqual(['https://other.com/abs.kml']);
    });

    test('resolveHref handles absolute, relative, and missing base', async ({ page }) => {
        const result = await evalInKml(page, (kml) => ({
            absolute: kml.KMLLoader.resolveHref('https://b.com/base.kml', 'https://a.com/x.kml'),
            relative: kml.KMLLoader.resolveHref('https://b.com/dir/base.kml', 'x.kml'),
            rooted: kml.KMLLoader.resolveHref('https://b.com/dir/base.kml', '/x.kml'),
            noBase: kml.KMLLoader.resolveHref(null, 'x.kml'),
        }));
        expect(result.absolute).toBe('https://a.com/x.kml');
        expect(result.relative).toBe('https://b.com/dir/x.kml');
        expect(result.rooted).toBe('https://b.com/x.kml');
        expect(result.noBase).toBeNull();
    });
});

// ─── KMLHitTester (polygon) ──────────────────────────────────────────────────

// ポリゴンのヒット判定。ピクセル許容差（lineTolSq）を渡しても内部（穴を除く）は
// 当たり、輪郭のすぐ外側は許容差の範囲で拾い、穴の中と遠方は外れる。
// android-sdk / ios-sdk の同名テストと同じ期待値。
test.describe('KMLHitTester polygon', () => {
    test('interior hits, hole and far-outside miss, near-outline hits', async ({ page }) => {
        const result = await evalInKml(page, (kml) => {
            const polygonKml = `<?xml version="1.0"?><kml><Document><Placemark><name>poly</name>
                <Polygon>
                  <outerBoundaryIs><LinearRing><coordinates>
                    139.744,35.688 139.762,35.688 139.762,35.676 139.744,35.676 139.744,35.688
                  </coordinates></LinearRing></outerBoundaryIs>
                  <innerBoundaryIs><LinearRing><coordinates>
                    139.750,35.685 139.756,35.685 139.756,35.680 139.750,35.680 139.750,35.685
                  </coordinates></LinearRing></innerBoundaryIs>
                </Polygon></Placemark></Document></kml>`;
            const features = kml.KMLParser.parse(polygonKml);
            const renderer = new kml.KMLTileRenderer(512);
            renderer.update(features, [], { strokeColor: 1, fillColor: 2, strokeWidth: 3, pointRadius: 8 });
            // processClick(point, 12, 13) が計算するのと同じ許容差
            const worldSize = 512 * Math.pow(2, 13);
            const lineTolSq = (12 / worldSize) ** 2;
            const name = (hit: any) => hit?.feature?.properties?.name ?? null;
            return {
                interiorWithTol: name(renderer.hitTest(139.746, 35.683, lineTolSq, undefined)),
                holeWithTol: name(renderer.hitTest(139.753, 35.6825, lineTolSq, undefined)),
                nearOutlineWithTol: name(renderer.hitTest(139.7435, 35.683, lineTolSq, undefined)),
                farOutsideWithTol: name(renderer.hitTest(139.735, 35.683, lineTolSq, undefined)),
                interiorDefault: name(renderer.hitTest(139.746, 35.683)),
                holeDefault: name(renderer.hitTest(139.753, 35.6825)),
                interiorNullTol: name(renderer.hitTest(139.746, 35.683, null, null)),
            };
        });
        expect(result.interiorWithTol).toBe('poly');
        expect(result.holeWithTol).toBeNull();
        expect(result.nearOutlineWithTol).toBe('poly');
        expect(result.farOutsideWithTol).toBeNull();
        expect(result.interiorDefault).toBe('poly');
        expect(result.holeDefault).toBeNull();
        expect(result.interiorNullTol).toBe('poly');
    });
});

// ─── KMLStyleProvider ────────────────────────────────────────────────────────

test.describe('DefaultKMLStyleProvider', () => {
    test('uses feature values before layer defaults', async ({ page }) => {
        const result = await evalInKml(page, (kml) => {
            const defaults = { strokeColor: 1, fillColor: 2, strokeWidth: 3, pointRadius: 4 };
            const feature = {
                geometry: { type: 'Empty' },
                properties: {},
                strokeColor: 10,
                pointRadius: 40,
                visible: true,
            };
            return kml.DefaultKMLStyleProvider(feature, defaults);
        });
        expect(result).toEqual({ strokeColor: 10, fillColor: 2, strokeWidth: 3, pointRadius: 40 });
    });
});
