import { test, expect } from '@playwright/test';

test.describe('PET SLAM Combat & Arena Validation', () => {
  test('boots application and verifies canvas renders without fatal console errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignore known harmless network/adblocker telemetry warnings
        if (!text.includes('clarity') && !text.includes('favicon')) {
          consoleErrors.push(text);
        }
      }
    });

    page.on('pageerror', (err) => {
      consoleErrors.push(err.message);
    });

    // 1. Navigate to PET SLAM
    await page.goto('/');

    // 2. Expect App title
    await expect(page).toHaveTitle(/PET SLAM/i);

    // 3. Verify main root container exists
    const root = page.locator('#root');
    await expect(root).toBeVisible();

    // 4. Verify Combat Canvas renders
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 10000 });

    // 5. Assert 0 fatal JavaScript console crashes
    expect(consoleErrors).toHaveLength(0);
  });
});
