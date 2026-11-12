import { test, expect } from '@playwright/test';

test('observatory previews each world and enters the selected football web', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Nothing exists/ })).toBeInViewport();
  for (const world of ['Nature', 'Mind', 'Music', 'Football']) {
    await page.getByRole('button', { name: `Preview ${world}`, exact: true }).click();
    await expect(page.getByRole('button', { name: `Preview ${world}`, exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.specimen-caption')).toContainText(world.toUpperCase());
  }
  await expect(page.locator('.observatory-preview')).toContainText('Can empty space win a match?');
  await page.getByRole('button', { name: 'Enter the rabbit hole', exact: true }).click();
  await expect(page).toHaveURL(/#journey\/football/);
  await expect(page.locator('.question-stage h1')).toBeVisible();
  expect(errors).toEqual([]);
});

test('mobile observatory works with reduced motion and opens Mind correctly', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Enter the rabbit hole', exact: true })).toBeInViewport();
  await page.getByRole('button', { name: 'Preview Mind', exact: true }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: '/tmp/observatory-mobile.png', fullPage: false });
  await page.getByRole('button', { name: 'Enter the rabbit hole', exact: true }).click();
  await expect(page).toHaveURL(/#journey\/dreams/);
});
