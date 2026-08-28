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
    await popup.keyboard.press('Tab');
    await expect(popup.locator('.skip-link')).toBeFocused();
    await popup.keyboard.press('Enter');
    await expect(popup.locator('main')).toBeFocused();
    const licenseToken = popup.locator('#license-token');
    await expect(licenseToken).toHaveAttribute('required', '');
    await popup.locator('#license-form button').click();
    await expect(licenseToken).toHaveAttribute('aria-invalid', 'true');
    await expect(popup.locator('#license-status')).toHaveText('Paste a license token to verify it.');
    const commands = await popup.evaluate(() => new Promise<chrome.commands.Command[]>((resolve) => chrome.commands.getAll(resolve)));
    expect(commands.find((command) => command.name === 'replay-latest')?.shortcut).toBe('Ctrl+Shift+Y');
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
    await page.locator('#demo-read').focus();
    await page.keyboard.press('Alt+Shift+E');
    await expect(page.locator('#code-echo-root #echo-reader')).toBeVisible();
    await expect(page.locator('#code-echo-root #echo-chunk')).toContainText('chrome');
    await expect.poll(() => page.locator('#code-echo-root').evaluate((host) => host.shadowRoot?.activeElement?.id)).toBe('echo-close');
    await page.keyboard.press('Tab');
    await expect.poll(() => page.locator('#code-echo-root').evaluate((host) => host.shadowRoot?.activeElement?.id)).toBe('echo-play');
    await page.keyboard.press('Shift+Tab');
    await expect.poll(() => page.locator('#code-echo-root').evaluate((host) => host.shadowRoot?.activeElement?.id)).toBe('echo-close');
    await page.keyboard.press('Escape');
    await expect(page.locator('#code-echo-root #echo-reader')).toBeHidden();
    await expect(page.locator('#demo-read')).toBeFocused();
    await page.keyboard.press('Control+Shift+Y');
    await expect(page.locator('#code-echo-root #echo-reader')).toBeVisible();
    const readerScan = await new AxeBuilder({ page }).analyze();
    expect(readerScan.violations.filter((item) => item.impact === 'serious' || item.impact === 'critical')).toEqual([]);
  } finally {
    await context.close();
  }
});
