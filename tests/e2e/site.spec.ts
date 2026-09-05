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

test('@claim:demo-isolation discards the sample on exit without touching reader data', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('code-echo-theme', 'real-data-must-remain'));
  await page.goto('/demo/?demo=1');
  await page.locator('#demo-source').fill('let temporarySample = 1;');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('demo:code-echo:source'))).toBe('let temporarySample = 1;');
  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page).toHaveURL(/\/$/);
  expect(await page.evaluate(() => Object.keys(localStorage).filter((key) => key.startsWith('demo:code-echo:')))).toEqual([]);
  expect(await page.evaluate(() => localStorage.getItem('code-echo-theme'))).toBe('real-data-must-remain');
  await page.goto('/demo/?demo=1');
  await expect(page.locator('#demo-source')).toHaveValue(/parseHTTPResponse/);
  await expect(page.locator('#demo-chunk')).toHaveText('const');
  await expect(page.locator('#reset-demo')).toBeVisible();
  await page.locator('#reset-demo').click();
  await expect(page.locator('#demo-status')).toContainText('Sample reset');
  expect(await page.evaluate(() => localStorage.getItem('code-echo-theme'))).toBe('real-data-must-remain');
  expect(await page.evaluate(() => Object.keys(localStorage).filter((key) => key.startsWith('demo:code-echo:')))).toEqual([]);
});

test('@claim:no-account-demo opens and reads the sample without account state', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/demo/?demo=1');
  await expect(page.locator('#demo-chunk')).toHaveText('const');
  await page.locator('#demo-next').click();
  await expect(page.locator('#demo-chunk')).toHaveText('parseHTTPResponse');
  expect(await page.evaluate(() => document.cookie)).toBe('');
  expect(await page.locator('input[type="password"], input[type="email"], form[action*="login" i]').count()).toBe(0);
  expect(requests.every((url) => new URL(url).origin === 'http://127.0.0.1:4173')).toBe(true);
});

test('@claim:no-code-upload sends no sample code away', async ({ page }) => {
  const requests: Array<{ url: string; body: string | null }> = [];
  page.on('request', (request) => requests.push({ url: request.url(), body: request.postData() }));
  await page.goto('/demo/?demo=1');
  await page.locator('#demo-next').click();
  await page.locator('#demo-replay').click();
  const selectedText = await page.locator('#demo-source').inputValue();
  expect(requests.every((request) => new URL(request.url).origin === 'http://127.0.0.1:4173')).toBe(true);
  expect(requests.some((request) => request.url.includes(encodeURIComponent(selectedText)) || request.url.includes(selectedText) || request.body?.includes(selectedText))).toBe(false);
  const extensionRequests: Array<{ url: string; body: string | null }> = [];
  const extension = await chromium.launchPersistentContext('', {
    channel: 'chromium',
    headless: true,
    args: [`--disable-extensions-except=${resolve('.output/chrome-mv3')}`, `--load-extension=${resolve('.output/chrome-mv3')}`]
  });
  try {
    extension.on('request', (request) => extensionRequests.push({ url: request.url(), body: request.postData() }));
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
    expect(extensionRequests.every((request) => request.url.startsWith('http://127.0.0.1:4173') || request.url.startsWith('chrome-extension://'))).toBe(true);
    expect(extensionRequests.some((request) => request.url.includes(encodeURIComponent(selectedText)) || request.url.includes(selectedText) || request.body?.includes(selectedText))).toBe(false);
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

test('reader and reader-control labels say what each action changes', async ({ page }) => {
  await page.goto('/demo/?demo=1');
  await expect(page.getByRole('button', { name: 'Show previous part' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Replay this part' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Show next part' })).toBeVisible();
  await page.goto('/');
  await expect(page.getByText('Split code names', { exact: true })).toBeVisible();
  await expect(page.getByText('Choose the amount to show', { exact: true })).toBeVisible();
});

test('theme button names the theme it will apply', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const button = page.getByRole('button', { name: 'Use dark theme' });
  await expect(button).toBeVisible();
  await expect(button.locator('span:last-child')).toBeVisible();
  await button.click();
  await expect(page.getByRole('button', { name: 'Use light theme' })).toBeVisible();
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

test('each public route has complete route-specific social metadata', async ({ page }) => {
  const expected: Array<[string, string, string]> = [
    ['/', 'Code Echo — reads selected code aloud', 'https://code-echo.sociobot.in/'],
    ['/demo/', 'Demo — Code Echo', 'https://code-echo.sociobot.in/demo/'],
    ['/privacy/', 'Privacy — Code Echo', 'https://code-echo.sociobot.in/privacy/'],
    ['/terms/', 'Terms — Code Echo', 'https://code-echo.sociobot.in/terms/'],
    ['/404/', 'Page not found — Code Echo', 'https://code-echo.sociobot.in/404/']
  ];
  for (const [path, title, canonical] of expected) {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical);
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', title);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', canonical);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /code-echo-social\.jpg$/);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', title);
    await expect(page.locator('meta[name="twitter:description"]')).toHaveCount(1);
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', /code-echo-social\.jpg$/);
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', '/apple-touch-icon.png');
  }
  await page.goto('/404/');
  await expect(page.locator('h1')).toHaveText('Page not found');
  await expect(page.getByRole('link', { name: 'Go home' })).toBeVisible();
});

test('every route uses the same primary navigation destinations', async ({ page }) => {
  const expected: Array<[string, string]> = [
    ['Demo', '/demo/'],
    ['How it works', '/#how'],
    ['Privacy', '/privacy/']
  ];
  for (const path of publicPages) {
    await page.goto(path);
    const links = page.locator('header nav[aria-label="Primary"] a');
    await expect(links).toHaveCount(3);
    await expect(links).toHaveText(expected.map((entry) => entry[0]!));
    for (let index = 0; index < expected.length; index += 1) {
      await expect(links.nth(index)).toHaveAttribute('href', expected[index]![1]);
    }
  }
});

test('internal navigation moves focus to the new route heading and announces it', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Privacy', exact: true }).first().click();
  await expect(page.locator('h1')).toBeFocused();
  await expect(page.locator('#route-announcement')).toHaveText('How Code Echo handles code');
  await page.goBack();
  await expect(page.locator('h1')).toBeFocused();
  await expect(page.locator('#route-announcement')).toContainText('Read selected code one part at a time');
});

test('dark treatment keeps serious accessibility checks clear', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('code-echo-theme', 'dark'));
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  const scan = await new AxeBuilder({ page }).analyze();
  expect(scan.violations.filter((item) => item.impact === 'serious' || item.impact === 'critical')).toEqual([]);
});
