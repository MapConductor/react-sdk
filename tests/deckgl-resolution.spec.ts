import { expect, test } from '@playwright/test';

const BASE = process.env.SAMPLE_BASE_URL ?? 'http://localhost:4003';

test.use({ deviceScaleFactor: 2 });

test('deck.gl keeps its drawing buffer at screen resolution after resize', async ({ page }) => {
  await page.goto(`${BASE}/deckgl/style-adjustments/en`);
  const canvas = page.locator('canvas').last();
  await expect(canvas).toBeVisible();

  const matchesScreen = () => canvas.evaluate(element => {
    const canvas = element as HTMLCanvasElement;
    return canvas.clientWidth > 0
      && Math.abs(canvas.width - canvas.clientWidth * window.devicePixelRatio) <= 1
      && Math.abs(canvas.height - canvas.clientHeight * window.devicePixelRatio) <= 1;
  });

  await expect.poll(matchesScreen).toBe(true);
  await page.setViewportSize({ width: 1000, height: 700 });
  await expect.poll(matchesScreen).toBe(true);
});
