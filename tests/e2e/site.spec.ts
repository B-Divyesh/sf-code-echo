import AxeBuilder from '@axe-core/playwright';
import { chromium, expect, test } from '@playwright/test';
import { resolve } from 'node:path';

const publicPages = ['/', '/demo/', '/privacy/', '/terms/', '/404/'];

for (const path of publicPages) {
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

test('@claim:chunk-reader reads a sample in visible, spoken chunks', async ({ page }) => {
  await page.goto('/demo/?demo=1');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.locator('#demo-chunk')).toHaveText('const');
  await expect(page.locator('#demo-spoken')).toHaveText('Says: const');
  await expect(page.locator('#demo-position')).toHaveText('1 / 13');
  await page.locator('#demo-next').click();
  await expect(page.locator('#demo-chunk')).toHaveText('parseHTTPResponse');
  await expect(page.locator('#demo-spoken')).toHaveText('Says: parse HTTP Response');
});

test('@claim:demo-isolation keeps sample data separate and resets it', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('code-echo-theme', 'real-data-must-remain'));
  await page.goto('/demo/?demo=1');
  await page.locator('#demo-source').fill('let temporarySample = 1;');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('demo:code-echo:source'))).toBe('let temporarySample = 1;');
  await expect(page.locator('#reset-demo')).toBeVisible();
  await page.locator('#reset-demo').click();
  await expect(page.locator('#demo-source')).toHaveValue(/parseHTTPResponse/);
  await expect(page.locator('#demo-status')).toContainText('Sample reset');
  expect(await page.evaluate(() => localStorage.getItem('code-echo-theme'))).toBe('real-data-must-remain');
  expect(await page.evaluate(() => Object.keys(localStorage).filter((key) => key.startsWith('code-echo-')))).toEqual(['code-echo-theme']);
});

test('@claim:no-code-upload sends no sample code away', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/demo/?demo=1');
  await page.locator('#demo-next').click();
  await page.locator('#demo-replay').click();
  const selectedText = await page.locator('#demo-source').inputValue();
  expect(requests.every((url) => new URL(url).origin === 'http://127.0.0.1:4173')).toBe(true);
  expect(requests.some((url) => url.includes(encodeURIComponent(selectedText)) || url.includes(selectedText))).toBe(false);
  const extensionRequests: string[] = [];
  const extension = await chromium.launchPersistentContext('', {
    channel: 'chromium',
    headless: true,
    args: [`--disable-extensions-except=${resolve('.output/chrome-mv3')}`, `--load-extension=${resolve('.output/chrome-mv3')}`]
  });
  try {
    extension.on('request', (request) => extensionRequests.push(request.url()));
    const extensionPage = await extension.newPage();
    await extensionPage.goto('http://127.0.0.1:4173/demo/');
    await extensionPage.locator('#demo-chunk').evaluate((node) => {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(node);
      selection?.removeAllRanges();
      selection?.addRange(range);
    });
    await extensionPage.locator('#demo-read').focus();
    await extensionPage.keyboard.press('Alt+Shift+E');
    await expect(extensionPage.locator('#code-echo-root #echo-reader')).toBeVisible();
    expect(extensionRequests.every((url) => url.startsWith('http://127.0.0.1:4173') || url.startsWith('chrome-extension://'))).toBe(true);
    expect(extensionRequests.some((url) => url.includes(encodeURIComponent(selectedText)) || url.includes(selectedText))).toBe(false);
  } finally {
    await extension.close();
  }
});

test('@claim:offline-reload keeps the demo reader usable after first visit', async ({ page, context }) => {
  await page.goto('/demo/?demo=1');
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await page.reload();
  await expect(page.locator('#demo-chunk')).toHaveText('const');
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('#demo-chunk')).toHaveText('const');
  await expect(page.locator('#demo-next')).toBeEnabled();
  await context.setOffline(false);
});

test('query demo entry redirects to the isolated sample reader', async ({ page }) => {
  await page.goto('/?demo=1');
  await expect(page).toHaveURL(/\/demo\/\?demo=1/);
  await expect(page.locator('#demo-chunk')).toHaveText('const');
});

test('keyboard skip link moves focus to main content', async ({ page }) => {
  await page.goto('/demo/');
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
});

test('390px layout keeps first-screen action and demo banner on screen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const action = page.getByRole('link', { name: 'Try it with sample code' });
  await expect(action).toBeVisible();
  const box = await action.boundingBox();
  expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(390);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  await page.goto('/demo/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  const scan = await new AxeBuilder({ page }).analyze();
  expect(scan.violations.filter((item) => item.impact === 'serious' || item.impact === 'critical')).toEqual([]);
});

test('routes have metadata and the static 404 page is distinct', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Code Echo — reads selected code aloud');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://code-echo.sociobot.in/');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /code-echo-social\.jpg$/);
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', '/apple-touch-icon.png');
  await page.goto('/404/');
  await expect(page.locator('h1')).toHaveText('This page is not in the workbench');
  await expect(page.getByRole('link', { name: 'Go home' })).toBeVisible();
});

test('dark treatment keeps serious accessibility checks clear', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('code-echo-theme', 'dark'));
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  const scan = await new AxeBuilder({ page }).analyze();
  expect(scan.violations.filter((item) => item.impact === 'serious' || item.impact === 'critical')).toEqual([]);
});
