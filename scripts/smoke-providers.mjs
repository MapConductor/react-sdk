// Smoke-test every provider in examples/basic after the 0.2.0 dependency bump.
//
// Verifies four independent signals per page, because any one alone lies:
//   - a map surface exists with non-zero size (catches "component never mounted")
//   - tile/asset requests succeeded          (catches "mounted but no data")
//   - no console errors                      (catches "rendered but threw")
//   - screenshots differ between providers   (catches "the page ignored the
//     provider entirely" - hello-map/camera-sync are hard-wired to MapLibre and
//     showProviderSelector:false, so testing those makes all 16 runs identical
//     and the suite passes without testing anything)

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';

const BASE = process.env.BASE ?? 'http://localhost:4003';
const OUT = process.env.OUT ?? './smoke-shots';

const PROVIDERS = process.env.PROVIDERS ? process.env.PROVIDERS.split(',') : [
  'maplibre', 'mapbox', 'leaflet', 'openlayers', 'arcgis', 'arcgis-3d',
  'mapkit', 'azuremaps', 'cesium', 'here', 'tomtom', 'maptiler',
  'longdo', 'mappls', 'google-maps', 'google-maps-3d',
];

// Mirrors unavailableProviders in examples/basic/src/samples/sampleRegistry.ts.
const UNAVAILABLE = {
  'geojson-basic': ['google-maps-3d', 'cesium'],
  'geojson-layer': ['google-maps-3d', 'cesium'],
  'kml-layer': ['google-maps-3d', 'cesium'],
  'heatmap-layer': ['google-maps-3d', 'cesium'],
};

const PAGES = (process.env.PAGES ?? 'map').split(',');

// Noise unrelated to this release.
const IGNORE_CONSOLE = [
  /Download the React DevTools/i, /React Router Future Flag/i, /favicon/i,
  /\[vite\]/i, /Deprecation/i, /WebGL: INVALID_OPERATION/i,
  /Unrecognized feature/i, /source map/i, /Failed to decode downloaded font/i,
];

async function visit(ctx, provider, page) {
  const p = await ctx.newPage();
  const consoleErrors = [];
  const failedRequests = [];
  let okResponses = 0;

  p.on('console', (m) => {
    if (m.type() !== 'error') return;
    const t = m.text();
    if (IGNORE_CONSOLE.some((r) => r.test(t))) return;
    consoleErrors.push(t.slice(0, 300));
  });
  p.on('pageerror', (e) => consoleErrors.push('pageerror: ' + String(e.message).slice(0, 300)));
  p.on('response', (r) => {
    if (r.status() >= 400) failedRequests.push(`${r.status()} ${r.url().slice(0, 140)}`);
    else okResponses++;
  });
  p.on('requestfailed', (r) => {
    const f = r.failure()?.errorText ?? 'failed';
    if (/ERR_ABORTED/.test(f)) return;
    failedRequests.push(`${f} ${r.url().slice(0, 140)}`);
  });

  const url = `${BASE}/${provider}/${page}/en`;
  let surface = 0;
  let box = null;
  let shot = Buffer.alloc(0);
  try {
    await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await p.waitForTimeout(9000); // Cesium / ArcGIS 3D settle slowly.

    const sel = 'canvas, .leaflet-container, .gm-style, .H_Map';
    surface = await p.locator(sel).count();
    if (surface) box = await p.locator(sel).first().boundingBox();

    // Screenshot only the map region, so unrelated chrome (nav, prose) cannot
    // make two different providers look identical or two identical ones differ.
    const stage = p.locator('.sample-map-stage, .sample-map-padding').first();
    const target = (await stage.count()) ? stage : p.locator('body');
    shot = await target.screenshot({ type: 'png' });
    writeFileSync(`${OUT}/${provider}__${page}.png`, shot);
  } catch (e) {
    consoleErrors.push('navigation: ' + String(e.message).slice(0, 200));
  }
  await p.close();

  return {
    provider, page, surface,
    size: box ? `${Math.round(box.width)}x${Math.round(box.height)}` : null,
    okResponses,
    md5: shot.length ? createHash('md5').update(shot).digest('hex').slice(0, 10) : null,
    shotBytes: shot.length,
    failedRequests: [...new Set(failedRequests)].slice(0, 6),
    consoleErrors: [...new Set(consoleErrors)].slice(0, 6),
  };
}

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({
  viewport: { width: 1400, height: 900 },
  deviceScaleFactor: 1,
  ignoreHTTPSErrors: true,
});

const results = [];
for (const page of PAGES) {
  const skip = UNAVAILABLE[page] ?? [];
  for (const provider of PROVIDERS) {
    if (skip.includes(provider)) {
      console.log(`${(provider + '/' + page).padEnd(30)} SKIP (unavailableProviders)`);
      continue;
    }
    let r = await visit(ctx, provider, page);
    if (r.surface === 0 || r.consoleErrors.length || r.failedRequests.length) {
      r = await visit(ctx, provider, page); // one retry for a flaky tile fetch
    }
    const ok = r.surface > 0 && r.consoleErrors.length === 0 && r.failedRequests.length === 0;
    results.push({ ...r, ok });
    console.log(
      `${(provider + '/' + page).padEnd(30)} ${ok ? 'OK  ' : 'CHECK'} ` +
      `surface=${r.surface} size=${r.size ?? '-'} net_ok=${r.okResponses} md5=${r.md5 ?? '-'}` +
      (r.failedRequests.length ? `\n    NET: ${r.failedRequests.join('\n         ')}` : '') +
      (r.consoleErrors.length ? `\n    ERR: ${r.consoleErrors.join('\n         ')}` : ''),
    );
  }
}

await browser.close();
writeFileSync(`${OUT}/results-${PAGES.join('_')}.json`, JSON.stringify(results, null, 2));

const bad = results.filter((r) => !r.ok);
console.log(`\n${results.length - bad.length}/${results.length} OK`);
if (bad.length) console.log('CHECK: ' + bad.map((b) => b.provider + '/' + b.page).join(', '));

// Guard against a suite that passes without testing anything.
for (const page of PAGES) {
  const forPage = results.filter((r) => r.page === page && r.md5);
  const byMd5 = new Map();
  for (const r of forPage) byMd5.set(r.md5, [...(byMd5.get(r.md5) ?? []), r.provider]);
  const dupes = [...byMd5.values()].filter((v) => v.length > 1);
  if (dupes.length) {
    console.log(`\n!! ${page}: identical renders across providers -> ${dupes.map((d) => d.join('=')).join(', ')}`);
  } else {
    console.log(`\n${page}: all ${forPage.length} provider renders are distinct`);
  }
}
