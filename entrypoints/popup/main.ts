import { LANGUAGE_PACKS, PUNCTUATION_LABELS, type EchoSettings, type LicenseState } from '../../lib/types';
import { clearHistory, loadHistory, loadLicense, loadSettings, saveLicense, saveSettings } from '../../lib/storage';

const BILLING_BASE = 'https://api.sociobot.in/api/v1/products/code-echo';
const DAY = 86_400_000;
let settings: EchoSettings;
let license: LicenseState;

const byId = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const status = byId<HTMLParagraphElement>('action-status');
const licenseStatus = byId<HTMLParagraphElement>('license-status');

async function init() {
  [settings, license] = await Promise.all([loadSettings(), loadLicense()]);
  bindSettings();
  renderPunctuation();
  renderDictionary();
  await renderHistory();
  renderPacks();
  bindActions();
  if (!navigator.onLine) status.textContent = 'Offline. The local reader still works.';
  if (license.token && Date.now() - license.checkedAt > DAY) verifyLicense(license.token, false);
}

function bindSettings() {
  const rate = byId<HTMLInputElement>('rate');
  const volume = byId<HTMLInputElement>('volume');
  const size = byId<HTMLInputElement>('text-size');
  rate.value = String(settings.rate);
  volume.value = String(settings.volume);
  size.value = String(settings.textSize);
  byId<HTMLOutputElement>('rate-output').value = `${settings.rate.toFixed(1)}×`;
  byId<HTMLOutputElement>('volume-output').value = `${Math.round(settings.volume * 100)}%`;
  byId<HTMLOutputElement>('size-output').value = `${settings.textSize} px`;
  byId<HTMLSelectElement>('chunk-mode').value = settings.chunkMode;
  byId<HTMLSelectElement>('identifier-mode').value = settings.identifierMode;
  byId<HTMLSelectElement>('theme').value = settings.theme;
  byId<HTMLInputElement>('sync-enabled').checked = settings.syncEnabled;

  rate.addEventListener('input', () => {
    settings.rate = Number(rate.value);
    byId<HTMLOutputElement>('rate-output').value = `${settings.rate.toFixed(1)}×`;
    saveSettings(settings);
  });
  volume.addEventListener('input', () => {
    settings.volume = Number(volume.value);
    byId<HTMLOutputElement>('volume-output').value = `${Math.round(settings.volume * 100)}%`;
    saveSettings(settings);
  });
  size.addEventListener('input', () => {
    settings.textSize = Number(size.value);
    byId<HTMLOutputElement>('size-output').value = `${settings.textSize} px`;
    saveSettings(settings);
  });
  byId<HTMLSelectElement>('chunk-mode').addEventListener('change', (event) => updateSelect('chunkMode', event));
  byId<HTMLSelectElement>('identifier-mode').addEventListener('change', (event) => updateSelect('identifierMode', event));
  byId<HTMLSelectElement>('theme').addEventListener('change', (event) => updateSelect('theme', event));
}

function updateSelect(key: 'chunkMode' | 'identifierMode' | 'theme', event: Event) {
  settings = { ...settings, [key]: (event.currentTarget as HTMLSelectElement).value };
  saveSettings(settings);
}

function renderPunctuation() {
  const list = byId<HTMLFieldSetElement>('punctuation-list');
  list.replaceChildren();
  for (const [mark, name] of Object.entries(PUNCTUATION_LABELS)) {
    if (!['(', ')', '[', ']', '{', '}', '.', ',', ':', ';', '=', '=>', '!', '?', '_'].includes(mark)) continue;
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = settings.spokenPunctuation.includes(mark);
    checkbox.addEventListener('change', () => {
      settings.spokenPunctuation = checkbox.checked
        ? [...new Set([...settings.spokenPunctuation, mark])]
        : settings.spokenPunctuation.filter((item) => item !== mark);
      saveSettings(settings);
    });
    label.append(checkbox, document.createTextNode(`${mark} ${name}`));
    list.append(label);
  }
}

function renderDictionary() {
  const list = byId<HTMLUListElement>('dictionary-list');
  list.replaceChildren();
  for (const [token, spoken] of Object.entries(settings.dictionary)) {
    const li = document.createElement('li');
    const text = document.createElement('span');
    text.textContent = `${token} → ${spoken}`;
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.textContent = '×';
    remove.setAttribute('aria-label', `Remove pronunciation for ${token}`);
    remove.addEventListener('click', () => {
      delete settings.dictionary[token];
      saveSettings(settings);
      renderDictionary();
    });
    li.append(text, remove);
    list.append(li);
  }
}

async function renderHistory() {
  const history = await loadHistory();
  const list = byId<HTMLUListElement>('history-list');
  list.replaceChildren();
  byId('history-empty').hidden = history.length > 0;
  for (const item of history) {
    const li = document.createElement('li');
    const replay = document.createElement('button');
    replay.type = 'button';
    replay.textContent = item.text.replace(/\s+/g, ' ');
    replay.title = item.text;
    replay.addEventListener('click', () => sendToPage({ type: 'echo:read', text: item.text }));
    li.append(replay);
    list.append(li);
  }
}

function renderPacks() {
  const container = byId<HTMLDivElement>('pack-buttons');
  container.replaceChildren();
  for (const [key, pack] of Object.entries(LANGUAGE_PACKS)) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = license.valid ? `Install ${pack.label}` : `Locked · ${pack.label}`;
    button.disabled = !license.valid;
    button.addEventListener('click', () => {
      settings.dictionary = { ...settings.dictionary, ...pack.dictionary };
      saveSettings(settings);
      renderDictionary();
      licenseStatus.textContent = `${pack.label} pronunciations installed.`;
    });
    container.append(button);
  }
  const sync = byId<HTMLInputElement>('sync-enabled');
  sync.disabled = !license.valid;
  if (!license.valid && settings.syncEnabled) {
    settings.syncEnabled = false;
    sync.checked = false;
    saveSettings(settings);
  }
  if (license.valid) licenseStatus.textContent = 'Echo Pack active on this browser.';
  else if (license.reason && license.reason !== 'ok') licenseStatus.textContent = 'License no longer active. The free reader is unchanged.';
}

function bindActions() {
  byId('read-selection').addEventListener('click', () => sendToPage({ type: 'echo:read-selection' }));
  byId('clear-history').addEventListener('click', async () => {
    await clearHistory();
    await renderHistory();
    status.textContent = 'Local replay history cleared.';
  });
  byId<HTMLFormElement>('dictionary-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const token = byId<HTMLInputElement>('dictionary-token');
    const speech = byId<HTMLInputElement>('dictionary-speech');
    settings.dictionary[token.value.trim()] = speech.value.trim();
    saveSettings(settings);
    token.value = '';
    speech.value = '';
    renderDictionary();
    status.textContent = 'Pronunciation saved locally.';
    token.focus();
  });
  byId<HTMLInputElement>('sync-enabled').addEventListener('change', (event) => {
    settings.syncEnabled = (event.currentTarget as HTMLInputElement).checked && license.valid;
    saveSettings(settings);
  });
  byId<HTMLFormElement>('license-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const token = byId<HTMLInputElement>('license-token').value.trim();
    if (token) verifyLicense(token, true);
  });
  window.addEventListener('online', () => { status.textContent = 'Back online. Local reading was available throughout.'; });
  window.addEventListener('offline', () => { status.textContent = 'Offline. The local reader still works.'; });
}

async function sendToPage(message: object) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  try {
    await chrome.tabs.sendMessage(tab.id, message);
    window.close();
  } catch {
    status.textContent = 'This browser page blocks extensions. Try a documentation or code-review page.';
  }
}

async function verifyLicense(token: string, announce: boolean) {
  if (!navigator.onLine) {
    licenseStatus.textContent = license.valid ? 'Offline. Using the last verified license.' : 'Connect once to verify this license.';
    return;
  }
  if (announce) licenseStatus.textContent = 'Checking license…';
  try {
    const response = await fetch(`${BILLING_BASE}/verify?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error('verification unavailable');
    const result = await response.json() as { valid: boolean; reason?: string };
    license = { token, valid: result.valid, reason: result.reason, checkedAt: Date.now() };
    await saveLicense(license);
    renderPacks();
  } catch {
    licenseStatus.textContent = 'Could not verify right now. The free reader remains ready.';
  }
}

init();
