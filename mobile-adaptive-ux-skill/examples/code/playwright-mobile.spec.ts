import { test, expect, devices } from '@playwright/test';

const compactWidths = [320, 360, 390, 430];

for (const width of compactWidths) {
  test.describe(`compact ${width}px`, () => {
    test.use({ viewport: { width, height: 800 }, hasTouch: true });

    test('has no page-level horizontal overflow', async ({ page }) => {
      await page.goto('/');
      const overflow = await page.evaluate(() =>
        document.documentElement.scrollWidth > document.documentElement.clientWidth
      );
      expect(overflow).toBe(false);
    });
  });
}

test.describe('touch device journey', () => {
  test.use({ ...devices['iPhone 13'] });

  test('primary navigation is operable', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Primary' });
    await expect(nav).toBeVisible();
  });

  test('detail back preserves list state', async ({ page }) => {
    await page.goto('/items?query=linen&sort=recent');
    const before = page.url();

    await page.getByRole('link', { name: /open/i }).first().click();
    await page.goBack();

    expect(page.url()).toBe(before);
  });
});
