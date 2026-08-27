import AxeBuilder from '@axe-core/playwright';
import { chromium, expect, test } from '@playwright/test';
import { resolve } from 'node:path';

test('packaged extension popup and on-page reader work', async () => {
  const extensionPath = resolve('.output/chrome-mv3');
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium',
    headless: true,
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`]
  });
  try {
    let [worker] = context.serviceWorkers();
    worker ??= await context.waitForEvent('serviceworker');
    const extensionId = new URL(worker.url()).host;
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    await expect(popup.getByRole('heading', { name: 'Code Echo', exact: true })).toBeVisible();
    const popupScan = await new AxeBuilder({ page: popup }).analyze();
    expect(popupScan.violations.filter((item) => item.impact === 'serious' || item.impact === 'critical')).toEqual([]);

    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4173/');
    await expect(page.locator('#code-echo-root')).toHaveCount(1);
    await page.locator('.install-section code').evaluate((node) => {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(node);
      selection?.removeAllRanges();
      selection?.addRange(range);
    });
    await page.keyboard.press('Alt+Shift+E');
    await expect(page.locator('#code-echo-root #echo-reader')).toBeVisible();
    await expect(page.locator('#code-echo-root #echo-chunk')).toContainText('chrome');
    const readerScan = await new AxeBuilder({ page }).analyze();
    expect(readerScan.violations.filter((item) => item.impact === 'serious' || item.impact === 'critical')).toEqual([]);
  } finally {
    await context.close();
  }
});
