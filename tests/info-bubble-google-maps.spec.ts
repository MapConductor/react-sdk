import { test, expect } from '@playwright/test';

test('InfoBubble is visible on MapLibre info-bubble-simple page', async ({ page }) => {
  await page.goto('/maplibre/info-bubble-simple');
  await page.waitForTimeout(4000);

  const bubble = page.locator('.bubble-content');
  await expect(bubble).toBeVisible();
});

test('InfoBubble is visible on Google Maps info-bubble-simple page (full reload)', async ({ page }) => {
  await page.goto('/google-maps/info-bubble-simple');
  await page.waitForTimeout(4000);

  const bubble = page.locator('.bubble-content');
  await expect(bubble).toBeVisible();
});

test('InfoBubble is visible on Google Maps after client-side navigation from another Google Maps page', async ({ page }) => {
  await page.goto('/google-maps/circle');
  await page.waitForTimeout(3000);

  await page.getByRole('button', { name: 'Simple Bubble' }).click();
  await page.waitForTimeout(4000);

  const bubble = page.locator('.bubble-content');
  await expect(bubble).toBeVisible();
});

// Reproduces the user-reported bug: switch provider MapLibre→Google Maps on the same page
test('InfoBubble is visible immediately after switching MapLibre→Google Maps', async ({ page }) => {
  // Start on MapLibre simple bubble page (bubble is visible)
  await page.goto('/maplibre/info-bubble-simple');
  await page.waitForTimeout(3000);
  await expect(page.locator('.bubble-content')).toBeVisible();

  // Switch provider to Google Maps
  await page.locator('select').first().selectOption('google');
  await page.waitForTimeout(4000);

  // Bubble should be visible immediately — without navigating away and back
  const bubble = page.locator('.bubble-content');
  await expect(bubble).toBeVisible();
});
