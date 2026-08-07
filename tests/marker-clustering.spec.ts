import { test, expect, type Page } from '@playwright/test';

/**
 * Browser coverage for the marker-clustering rewrite and the OverlayCollector
 * update-handler change. Requires the sample app: `npm run dev` in
 * examples/basic (defaults to http://localhost:4003).
 */

const BASE = process.env.SAMPLE_BASE_URL ?? 'http://localhost:4003';
const SOURCE_MARKER_COUNT = 24_526;

function watchErrors(page: Page): string[] {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => {
        if (m.type() === 'error') errors.push(m.text());
    });
    return errors;
}

const markerCount = (page: Page) => page.locator('.leaflet-marker-icon').count();
/** Vector overlays land in per-overlay panes, not only `.leaflet-overlay-pane`. */
const vectorPathCount = (page: Page) => page.locator('.leaflet-container svg path').count();
const hullPathCount = (page: Page) =>
    page.locator('.leaflet-container path[stroke-width="2"]').count();

/** Sample pages open a "how to try this" modal that swallows pointer events. */
async function openSample(page: Page, path: string) {
    await page.goto(`${BASE}${path}`);
    const close = page.locator('.sample-intro-close');
    await expect.poll(() => close.count(), { timeout: 15_000 }).toBeGreaterThan(0);
    await close.click();
    await expect(close).toHaveCount(0);
}

/** Waits until the rendered marker count stops changing (clustering has settled). */
async function settle(page: Page, timeout = 25_000): Promise<number> {
    let previous = -1;
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
        await page.waitForTimeout(700);
        const current = await markerCount(page);
        if (current > 0 && current === previous) return current;
        previous = current;
    }
    return previous;
}

test.describe('marker clustering (Leaflet)', () => {
    test.slow();

    test('clusters 24,526 markers and re-clusters on zoom', async ({ page }) => {
        const errors = watchErrors(page);
        await openSample(page, '/leaflet/post-office-cluster/en');

        const clustered = await settle(page);
        expect(clustered).toBeGreaterThan(0);
        expect(clustered).toBeLessThan(SOURCE_MARKER_COUNT / 10);

        // The sample's custom overlay panes stack above the zoom control, so a
        // hit-tested click never lands on it; dispatch straight to the element.
        const zoomIn = page.locator('.leaflet-control-zoom-in');
        for (let i = 0; i < 3; i++) {
            await zoomIn.dispatchEvent('click');
            await page.waitForTimeout(500);
        }
        const zoomed = await settle(page);
        expect(zoomed).toBeGreaterThan(0);
        expect(zoomed).not.toBe(clustered);

        const zoomOut = page.locator('.leaflet-control-zoom-out');
        for (let i = 0; i < 3; i++) {
            await zoomOut.dispatchEvent('click');
            await page.waitForTimeout(500);
        }
        const zoomedOut = await settle(page);
        expect(zoomedOut).toBeGreaterThan(0);
        expect(zoomedOut).toBeLessThan(SOURCE_MARKER_COUNT / 10);

        expect(errors).toEqual([]);
    });

    test('debug hull polygons toggle on and off', async ({ page }) => {
        const errors = watchErrors(page);
        await openSample(page, '/leaflet/post-office-cluster/en');
        expect(await settle(page)).toBeGreaterThan(0);

        expect(await hullPathCount(page)).toBe(0);

        const toggle = page.locator('input[type="checkbox"]').first();
        await toggle.check();
        await expect.poll(() => hullPathCount(page), { timeout: 20_000 }).toBeGreaterThan(0);

        await toggle.uncheck();
        await expect.poll(() => hullPathCount(page), { timeout: 20_000 }).toBe(0);

        expect(errors).toEqual([]);
    });

    test('unmounting the cluster group leaves no markers behind', async ({ page }) => {
        const errors = watchErrors(page);
        await openSample(page, '/leaflet/post-office-cluster/en');
        expect(await settle(page)).toBeGreaterThan(0);

        // A sample that renders no markers of its own: the group's teardown must
        // hand every rendered marker back to the collector.
        await page.goto(`${BASE}/leaflet/raster-layer/en`);
        await page.waitForTimeout(4_000);
        expect(await markerCount(page)).toBe(0);

        expect(errors).toEqual([]);
    });
});

test.describe('OverlayCollector update handler', () => {
    test.slow();

    // The collector no longer delivers the value replayed at subscription time.
    // These pages exercise the paths that must still fire: composition (new
    // state instances) and in-place mutation (drag).
    const pages: Array<{ slug: string; expect: (page: Page) => Promise<number> }> = [
        { slug: 'marker', expect: markerCount },
        { slug: 'marker-animation', expect: markerCount },
        { slug: 'circle', expect: vectorPathCount },
        { slug: 'polyline', expect: vectorPathCount },
        { slug: 'polygon', expect: vectorPathCount },
        { slug: 'polygon-hole', expect: vectorPathCount },
    ];

    for (const { slug, expect: count } of pages) {
        test(`${slug} renders its overlays`, async ({ page }) => {
            const errors = watchErrors(page);
            await openSample(page, `/leaflet/${slug}/en`);
            await expect.poll(() => count(page), { timeout: 20_000 }).toBeGreaterThan(0);
            expect(errors).toEqual([]);
        });
    }

    test('post-office renders its tiled marker layer', async ({ page }) => {
        const errors = watchErrors(page);
        await openSample(page, '/leaflet/post-office/en');
        // 24,526 markers switch to tiled rendering, so they are raster tiles
        // rather than DOM markers.
        await expect
            .poll(() => page.locator('.leaflet-mc-raster-mc-marker-tiles-pane img').count(), { timeout: 25_000 })
            .toBeGreaterThan(0);
        expect(errors).toEqual([]);
    });

    test('circle slider updates the rendered stroke width', async ({ page }) => {
        const errors = watchErrors(page);
        await openSample(page, '/leaflet/circle/en');
        await expect.poll(() => vectorPathCount(page), { timeout: 20_000 }).toBeGreaterThan(0);

        const circlePath = page.locator('.leaflet-mc-circle-circle-pane path').first();
        const before = await circlePath.getAttribute('stroke-width');

        const strokeSlider = page.locator('input[type="range"]').nth(1);
        await strokeSlider.fill('8');
        await page.waitForTimeout(1_500);

        expect(await circlePath.getAttribute('stroke-width')).not.toBe(before);
        expect(errors).toEqual([]);
    });

    test('dragging a marker moves it (in-place MarkerState mutation)', async ({ page }) => {
        const errors = watchErrors(page);
        await openSample(page, '/leaflet/circle/en');
        await expect.poll(() => markerCount(page), { timeout: 20_000 }).toBeGreaterThan(0);

        // The circle sample's edge marker is draggable and drives the radius.
        const handle = page.locator('.leaflet-marker-icon').last();
        const box = await handle.boundingBox();
        expect(box).not.toBeNull();
        const from = { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 };

        await page.mouse.move(from.x, from.y);
        await page.mouse.down();
        await page.mouse.move(from.x + 60, from.y + 60, { steps: 15 });
        await page.mouse.up();
        await page.waitForTimeout(1_500);

        const moved = await handle.boundingBox();
        expect(moved).not.toBeNull();
        expect(Math.abs(moved!.x - box!.x) + Math.abs(moved!.y - box!.y)).toBeGreaterThan(20);

        expect(errors).toEqual([]);
    });
});

test.describe('marker clustering (MapLibre, GL rendering)', () => {
    test.slow();

    // MapLibre draws markers and polygons into WebGL, so there is nothing to
    // count in the DOM. Assert on what the canvas actually paints instead.
    test('renders clusters and paints debug hulls', async ({ page }) => {
        const errors = watchErrors(page);
        await openSample(page, '/maplibre/post-office-cluster/en');

        const canvas = page.locator('.maplibregl-canvas');
        await expect(canvas).toBeVisible();
        // Long settle so tile loading cannot be mistaken for a hull repaint.
        await page.waitForTimeout(12_000);
        const withoutHulls = await canvas.screenshot();

        await page.locator('input[type="checkbox"]').first().check();
        await page.waitForTimeout(6_000);
        const withHulls = await canvas.screenshot();

        expect(withHulls.equals(withoutHulls)).toBe(false);
        expect(errors).toEqual([]);
    });
});
