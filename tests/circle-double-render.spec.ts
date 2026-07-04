import { test, expect } from '@playwright/test';

/**
 * Regression test for the double-circle bug on Google Maps.
 *
 * Root cause: GoogleMapCircleController.upsert() is async. On the second visit
 * to the Circle page, React StrictMode double-mounts the Circle component.
 * The first upsert suspends at `await createCircle()` before `this.circles.set()`
 * runs. The second upsert sees an empty `this.circles` and starts another
 * `createCircle()` — resulting in 2 circles on the map.
 *
 * Fix: `pendingCreates` Set guards against concurrent CREATE calls for the
 * same circle ID.
 */
test('Circle page shows exactly 1 circle on second visit (Circle → Polyline → Circle)', async ({ page }) => {
  // ── First visit ────────────────────────────────────────────────
  await page.goto('/google-maps/circle');
  await page.waitForTimeout(3000);

  const countAfterFirst: number = await page.evaluate(
    () => (window as unknown as { __mcDebug?: { getCircleCount(): number } }).__mcDebug?.getCircleCount() ?? -1
  );
  expect(countAfterFirst, 'First visit should show 1 circle').toBe(1);

  // ── Navigate to Polyline ────────────────────────────────────────
  await page.click('button:has-text("Polyline")');
  await page.waitForTimeout(1000);

  const countAfterPolyline: number = await page.evaluate(
    () => (window as unknown as { __mcDebug?: { getCircleCount(): number } }).__mcDebug?.getCircleCount() ?? -1
  );
  expect(countAfterPolyline, 'After navigating to Polyline, circle count should be 0').toBe(0);

  // ── Second visit to Circle ──────────────────────────────────────
  await page.click('button:has-text("Circle")');
  await page.waitForTimeout(3000);

  const countAfterSecond: number = await page.evaluate(
    () => (window as unknown as { __mcDebug?: { getCircleCount(): number } }).__mcDebug?.getCircleCount() ?? -1
  );
  expect(countAfterSecond, 'Second visit should show exactly 1 circle (not 2)').toBe(1);
});
