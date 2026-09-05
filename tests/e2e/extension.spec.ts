import AxeBuilder from '@axe-core/playwright';
import { chromium, expect, test, type Page } from '@playwright/test';
import { resolve } from 'node:path';

async function launchExtension() {
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium',
    headless: true,
    args: [`--disable-extensions-except=${resolve('.output/chrome-mv3')}`, `--load-extension=${resolve('.output/chrome-mv3')}`]
  });
  let [worker] = context.serviceWorkers();
  worker ??= await context.waitForEvent('serviceworker');
  const extensionId = new URL(worker.url()).host;
  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${extensionId}/popup.html`);
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/');
  return { context, popup, page };
}

async function selectCode(page: Page, text: string) {
  await page.evaluate((selected) => {
    document.getElementById('claim-source')?.remove();
    const source = document.createElement('pre');
    source.id = 'claim-source';
    source.tabIndex = 0;
    source.textContent = selected;
    document.querySelector('main')?.append(source);
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(source);
    selection?.removeAllRanges();
    selection?.addRange(range);
    source.focus();
  }, text);
}

async function openSelection(page: Page, text: string) {
  await selectCode(page, text);
  await page.keyboard.press('Alt+Shift+E');
  await expect(page.locator('#code-echo-root #echo-reader')).toBeVisible();
}

async function closeReader(page: Page) {
  await page.keyboard.press('Escape');
  await expect(page.locator('#code-echo-root #echo-reader')).toBeHidden();
}

async function setReaderSelect(popup: Page, id: string, value: string) {
  await popup.locator(id).selectOption(value);
  const key = id === '#chunk-mode' ? 'chunkMode' : 'identifierMode';
  await expect.poll(() => popup.evaluate((settingKey) => new Promise<unknown>((resolve) => {
    chrome.storage.local.get('echoSettings', (result) => resolve((result.echoSettings as Record<string, unknown> | undefined)?.[settingKey]));
  }), key)).toBe(value);
}

test('@claim:extension-controls opens selected code and replays it with the documented shortcuts', async () => {
  test.setTimeout(20_000);
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
    await popup.locator('#chunk-mode').selectOption('line');
    await popup.locator('#identifier-mode').selectOption('spell');
    await popup.locator('summary').filter({ hasText: 'Punctuation to speak' }).click();
    await popup.locator('#punctuation-list input').first().uncheck();
    await popup.locator('summary').filter({ hasText: 'Pronunciation dictionary' }).click();
    await popup.locator('#dictionary-token').fill('HTTP');
    await popup.locator('#dictionary-speech').fill('H T T P');
    await popup.locator('#dictionary-form button').click();
    await expect(popup.locator('#dictionary-list')).toContainText('HTTP → H T T P');
    await expect.poll(() => popup.evaluate(() => new Promise<unknown>((resolve) => chrome.storage.local.get('echoSettings', resolve)))).toMatchObject({
      echoSettings: expect.objectContaining({ chunkMode: 'line', identifierMode: 'spell', dictionary: expect.objectContaining({ HTTP: 'H T T P' }) })
    });
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

test('@claim:free-core-reader keeps reading controls available without a license', async () => {
  test.setTimeout(30_000);
  const { context, popup, page } = await launchExtension();
  try {
    expect(await popup.evaluate(() => new Promise((resolve) => chrome.storage.local.get('echoLicense', resolve)))).toEqual({});
    await expect(popup.locator('#rate')).toBeEnabled();
    await expect(popup.locator('#text-size')).toBeEnabled();
    await expect(popup.locator('#chunk-mode')).toBeEnabled();
    await expect(popup.locator('#pack-buttons button')).toHaveCount(3);
    expect(await popup.locator('#pack-buttons button').evaluateAll((buttons) => buttons.every((button) => (button as HTMLButtonElement).disabled))).toBe(true);

    await openSelection(page, 'HTTP');
    await expect(page.locator('#code-echo-root #echo-spoken')).toHaveText('Says: HTTP');
    await closeReader(page);

    await popup.getByText('Pronunciation dictionary', { exact: true }).click();
    await popup.locator('#dictionary-token').fill('HTTP');
    await popup.locator('#dictionary-speech').fill('H T T P');
    await popup.locator('#dictionary-form button').click();
    await expect(popup.locator('#dictionary-list')).toContainText('HTTP → H T T P');

    await openSelection(page, 'HTTP');
    await expect(page.locator('#code-echo-root #echo-spoken')).toHaveText('Says: H T T P');
    await closeReader(page);
    await page.keyboard.press('Control+Shift+Y');
    await expect(page.locator('#code-echo-root #echo-reader')).toBeVisible();
    await expect(page.locator('#code-echo-root #echo-chunk')).toHaveText('HTTP');
    await popup.reload();
    await expect(popup.locator('#history-list')).toContainText('HTTP');
  } finally {
    await context.close();
  }
});

test('@claim:in-tray-replay replays the current part when R is pressed in the reader', async () => {
  const { context, page } = await launchExtension();
  try {
    await openSelection(page, 'replayPart');
    await expect(page.locator('#code-echo-root #echo-chunk')).toHaveText('replayPart');
    await page.keyboard.press('r');
    await expect(page.locator('#code-echo-root #echo-status')).toContainText('Replay');
    await expect(page.locator('#code-echo-root #echo-spoken')).toHaveText('Says: replay Part');
  } finally {
    await context.close();
  }
});

test('@claim:punctuation-control changes the spoken parts for a saved punctuation choice', async () => {
  test.setTimeout(30_000);
  const { context, popup, page } = await launchExtension();
  try {
    await openSelection(page, 'alpha.beta');
    await page.locator('#code-echo-root #echo-next').click();
    await expect(page.locator('#code-echo-root #echo-chunk')).toHaveText('.');
    await expect(page.locator('#code-echo-root #echo-spoken')).toHaveText('Says: dot');
    await closeReader(page);

    await popup.getByText('Punctuation to speak', { exact: true }).click();
    await popup.locator('#punctuation-list label', { hasText: '. dot' }).locator('input').uncheck();
    await expect.poll(() => popup.evaluate(() => new Promise<unknown>((resolve) => {
      chrome.storage.local.get('echoSettings', (result) => resolve((result.echoSettings as { spokenPunctuation?: string[] }).spokenPunctuation?.includes('.')));
    }))).toBe(false);

    await openSelection(page, 'alpha.beta');
    await expect(page.locator('#code-echo-root #echo-position')).toHaveText('1 / 2');
    await page.locator('#code-echo-root #echo-next').click();
    await expect(page.locator('#code-echo-root #echo-chunk')).toHaveText('beta');
    await expect(page.locator('#code-echo-root #echo-spoken')).toHaveText('Says: beta');
  } finally {
    await context.close();
  }
});

test('@claim:identifier-modes changes spoken code names in all three reader modes', async () => {
  test.setTimeout(30_000);
  const { context, popup, page } = await launchExtension();
  try {
    await setReaderSelect(popup, '#identifier-mode', 'split');
    await openSelection(page, 'parseHTTPResponse');
    await expect(page.locator('#code-echo-root #echo-spoken')).toHaveText('Says: parse HTTP Response');
    await closeReader(page);

    await setReaderSelect(popup, '#identifier-mode', 'literal');
    await openSelection(page, 'parseHTTPResponse');
    await expect(page.locator('#code-echo-root #echo-spoken')).toHaveText('Says: parseHTTPResponse');
    await closeReader(page);

    await setReaderSelect(popup, '#identifier-mode', 'spell');
    await openSelection(page, 'parseHTTPResponse');
    await expect(page.locator('#code-echo-root #echo-spoken')).toHaveText('Says: p a r s e H T T P R e s p o n s e');
  } finally {
    await context.close();
  }
});

test('@claim:chunk-modes changes the visible sequence for syntax, words, and lines', async () => {
  test.setTimeout(30_000);
  const { context, popup, page } = await launchExtension();
  const source = 'foo.bar\nbaz qux';
  try {
    await setReaderSelect(popup, '#chunk-mode', 'syntax');
    await openSelection(page, source);
    await expect(page.locator('#code-echo-root #echo-chunk')).toHaveText('foo');
    await expect(page.locator('#code-echo-root #echo-position')).toHaveText('1 / 5');
    await closeReader(page);

    await setReaderSelect(popup, '#chunk-mode', 'words');
    await openSelection(page, source);
    await expect(page.locator('#code-echo-root #echo-chunk')).toHaveText('foo.bar');
    await expect(page.locator('#code-echo-root #echo-position')).toHaveText('1 / 3');
    await page.locator('#code-echo-root #echo-next').click();
    await expect(page.locator('#code-echo-root #echo-chunk')).toHaveText('baz');
    await closeReader(page);

    await setReaderSelect(popup, '#chunk-mode', 'line');
    await openSelection(page, source);
    await expect(page.locator('#code-echo-root #echo-chunk')).toHaveText('foo.bar');
    await expect(page.locator('#code-echo-root #echo-position')).toHaveText('1 / 2');
    await page.locator('#code-echo-root #echo-next').click();
    await expect(page.locator('#code-echo-root #echo-chunk')).toHaveText('baz qux');
  } finally {
    await context.close();
  }
});

test('@claim:pronunciation-overrides changes the spoken form for a saved acronym', async () => {
  test.setTimeout(30_000);
  const { context, popup, page } = await launchExtension();
  try {
    await openSelection(page, 'HTTP');
    await expect(page.locator('#code-echo-root #echo-spoken')).toHaveText('Says: HTTP');
    await closeReader(page);

    await popup.getByText('Pronunciation dictionary', { exact: true }).click();
    await popup.locator('#dictionary-token').fill('HTTP');
    await popup.locator('#dictionary-speech').fill('H T T P');
    await popup.locator('#dictionary-form button').click();
    await expect(popup.locator('#dictionary-list')).toContainText('HTTP → H T T P');

    await openSelection(page, 'HTTP');
    await expect(page.locator('#code-echo-root #echo-spoken')).toHaveText('Says: H T T P');
  } finally {
    await context.close();
  }
});
