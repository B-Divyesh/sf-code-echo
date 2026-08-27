import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

for (const path of ['/', '/privacy/', '/terms/']) {
  test(`${path} has no serious accessibility violations`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto(path);
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1')).toHaveCount(1);
    const scan = await new AxeBuilder({ page }).analyze();
    const serious = scan.violations.filter((item) => item.impact === 'serious' || item.impact === 'critical');
    expect(serious, serious.map((item) => `${item.id}: ${item.help}`).join('\n')).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test('interactive reader preview chunks an unfamiliar identifier', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Read this selection' }).click();
  await expect(page.locator('#demo-chunk')).toHaveText('const');
  await expect(page.locator('#demo-spoken')).toContainText('const');
  await expect(page.locator('#demo-position')).toHaveText(/1 \/ \d+/);
  await page.locator('#demo-next').click();
  await expect(page.locator('#demo-position')).toHaveText(/2 \/ \d+/);
});

test('390px layout keeps primary actions on screen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const download = page.getByRole('link', { name: /Download for Chrome/ });
  await expect(download).toBeVisible();
  const box = await download.boundingBox();
  expect(box).not.toBeNull();
  expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(390);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  const strip = page.locator('.confidence-strip .shell');
  expect(await strip.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
  const scan = await new AxeBuilder({ page }).analyze();
  expect(scan.violations.filter((item) => item.impact === 'serious' || item.impact === 'critical')).toEqual([]);
});

test('site load uses the local favicon and responsive hero without console errors', async ({ page }) => {
  const errors: string[] = [];
  const responses: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('response', (response) => responses.push(new URL(response.url()).pathname));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/favicon.svg');
  await expect(page.locator('.hero-art img')).toHaveAttribute('sizes', /max-width: 620px/);
  expect((await page.request.get('/favicon.svg')).status()).toBe(200);
  await expect.poll(() => responses.some((path) => /\/assets\/hero-risograph-(480|768)\.avif$/.test(path))).toBe(true);
  expect(responses).not.toContain('/favicon.ico');
  expect(errors).toEqual([]);
});

test('dark treatment keeps serious accessibility checks clear', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('code-echo-theme', 'dark'));
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  const scan = await new AxeBuilder({ page }).analyze();
  expect(scan.violations.filter((item) => item.impact === 'serious' || item.impact === 'critical')).toEqual([]);
});

test('offline state is announced without hiding the page', async ({ page, context }) => {
  await page.goto('/');
  await context.setOffline(true);
  await page.evaluate(() => window.dispatchEvent(new Event('offline')));
  await expect(page.locator('#offline-banner')).toBeVisible();
  await expect(page.locator('main')).toBeVisible();
  await context.setOffline(false);
});
