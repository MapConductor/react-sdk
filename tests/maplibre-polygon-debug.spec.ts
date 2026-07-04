import { test } from '@playwright/test';

test('MapLibre polygon page - check layers/sources', async ({ page }) => {
  const logs: string[] = [];
  const errors: string[] = [];

  page.on('console', (msg) => {
    const text = msg.text();
    if (msg.type() === 'error') {
      if (!text.includes('icon')) errors.push(text);
    } else if (text.startsWith('[MC:Polygon]') || text.startsWith('[MC:MapLibre]')) {
      logs.push(text);
    }
  });

  await page.goto('/maplibre/polygon');
  await page.waitForTimeout(6000);

  console.log('\n=== [MC:Polygon] Logs ===');
  logs.forEach(l => console.log(l));

  console.log('\n=== Non-icon Errors ===');
  errors.forEach(e => console.log(e));

  const info = await page.evaluate(() => {
    const debug = (window as unknown as Record<string, { getStyleReady(): boolean; getStyleLoaded(): boolean; getLayerIds(): string[]; getSourceIds(): string[] }>).__mcMapLibreDebug;
    if (!debug) return { error: 'No __mcMapLibreDebug found' };
    return {
      styleReady: debug.getStyleReady(),
      styleLoaded: debug.getStyleLoaded(),
      layerIds: debug.getLayerIds().filter((id: string) => id.startsWith('mc-')),
    };
  });

  console.log('\n=== MapLibre State ===');
  console.log(JSON.stringify(info, null, 2));
});
