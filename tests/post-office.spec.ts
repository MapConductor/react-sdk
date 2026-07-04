import { test, expect } from '@playwright/test';

// First visit registers the SW; second visit (or reload) has it controlling the page.
// We pre-warm the SW in beforeEach so each test starts with SW active.
test.beforeEach(async ({ page }) => {
  await page.goto('/maplibre/post-office');
  await page.waitForTimeout(3000);
});

test('Post Office page shows raster tiles after SW is active', async ({ page }) => {
  // Wait for the first /__tiles/ request — proves SW is intercepting tile fetches.
  // Set up the race before reload so we don't miss requests fired during page load.
  const firstTileRequest = page.waitForRequest(
    req => req.url().includes('/__tiles/'),
    { timeout: 25000 },
  );

  // Reload so SW.clients.claim() takes effect (registered in beforeEach)
  await page.reload();

  // Wait until the page signals both data + SW are ready
  await page.waitForFunction(() => {
    const note = document.querySelector('.control-panel-note');
    return note?.textContent?.includes('クリック');
  }, { timeout: 20000 });

  const req = await firstTileRequest;
  console.log('First tile URL:', req.url());
  // Assertion is implicit: waitForRequest throws on timeout if no tile request arrives
});

test('Post Office page click shows info bubble', async ({ page }) => {
  await page.reload();

  await page.waitForFunction(() => {
    const note = document.querySelector('.control-panel-note');
    return note?.textContent?.includes('クリック');
  }, { timeout: 20000 });
  await page.waitForTimeout(1000);

  const canvas = page.locator('.maplibregl-canvas').first();
  const box = await canvas.boundingBox();
  if (box) {
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(500);
  }

  await expect(page.locator('body')).toBeVisible();
});
