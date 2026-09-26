import { test, expect } from '@playwright/test';

test.describe('TechTatva OS Workflows', () => {
  test('Homepage loads correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Tech Tatva')).toBeVisible();
  });

  // Example test for event registration rendering
  test('Events page loads and renders events', async ({ page }) => {
    await page.goto('/events');
    await expect(page.locator('h1').filter({ hasText: 'Events' })).toBeVisible();
  });
});
