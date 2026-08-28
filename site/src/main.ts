import { buildReading } from '../../lib/reader';
import { DEFAULT_SETTINGS } from '../../lib/types';

const BILLING_BASE = 'https://api.sociobot.in/api/v1/products/code-echo';
const LICENSE_KEY = 'sb_license:code-echo';
const CHECK_KEY = 'sb_license_check:code-echo';
const DAY = 86_400_000;
const byId = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

let parts: Array<{ visual: string; spoken: string }> = [];
let index = 0;
let utterance: SpeechSynthesisUtterance | undefined;

function setupTheme() {
  const stored = localStorage.getItem('code-echo-theme');
  const dark = stored === 'dark' || (!stored && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  const button = byId<HTMLButtonElement>('theme-button');
  updateThemeLabel(button, dark);
  button.addEventListener('click', () => {
    const nextDark = document.documentElement.dataset.theme !== 'dark';
    document.documentElement.dataset.theme = nextDark ? 'dark' : 'light';
    localStorage.setItem('code-echo-theme', nextDark ? 'dark' : 'light');
    updateThemeLabel(button, nextDark);
  });
}

function setupSkipLink() {
  const skipLink = document.querySelector<HTMLAnchorElement>('.skip-link');
  const main = byId<HTMLElement>('main');
  skipLink?.addEventListener('click', () => main.focus());
}

function updateThemeLabel(button: HTMLButtonElement, dark: boolean) {
  button.setAttribute('aria-label', dark ? 'Use light theme' : 'Use dark theme');
  const label = button.querySelector('span:last-child');
  if (label) label.textContent = dark ? 'Paper mode' : 'Ink mode';
}

function setupDemo() {
  const source = byId<HTMLTextAreaElement>('demo-source');
  const read = byId<HTMLButtonElement>('demo-read');
  const replay = byId<HTMLButtonElement>('demo-replay');
  const prev = byId<HTMLButtonElement>('demo-prev');
  const next = byId<HTMLButtonElement>('demo-next');
  const rate = byId<HTMLInputElement>('demo-rate');
  rate.addEventListener('input', () => { byId<HTMLOutputElement>('demo-rate-output').value = `${Number(rate.value).toFixed(1)}×`; });
  read.addEventListener('click', () => {
    const settings = { ...DEFAULT_SETTINGS, rate: Number(rate.value) };
    parts = buildReading(source.value, settings);
    index = 0;
    if (!parts.length) {
      byId('demo-status').textContent = 'Add a code line first.';
      source.focus();
      return;
    }
    renderDemo();
    speakDemo();
  });
  replay.addEventListener('click', speakDemo);
  prev.addEventListener('click', () => { index = Math.max(0, index - 1); renderDemo(); speakDemo(); });
  next.addEventListener('click', () => { index = Math.min(parts.length - 1, index + 1); renderDemo(); speakDemo(); });
}

function renderDemo() {
  const current = parts[index];
  if (!current) return;
  byId('demo-chunk').textContent = current.visual;
  byId('demo-spoken').textContent = `Says: ${current.spoken}`;
  byId('demo-position').textContent = `${index + 1} / ${parts.length}`;
  byId<HTMLButtonElement>('demo-prev').disabled = index === 0;
  byId<HTMLButtonElement>('demo-next').disabled = index === parts.length - 1;
  byId<HTMLButtonElement>('demo-replay').disabled = false;
}

function speakDemo() {
  const current = parts[index];
  if (!current) return;
  if (!('speechSynthesis' in window)) {
    byId('demo-status').textContent = 'Speech is unavailable here. The visible chunk controls still work.';
    return;
  }
  speechSynthesis.cancel();
  utterance = new SpeechSynthesisUtterance(current.spoken);
  utterance.rate = Number(byId<HTMLInputElement>('demo-rate').value);
  utterance.onstart = () => { byId('demo-status').textContent = `Speaking chunk ${index + 1}.`; };
  utterance.onend = () => { byId('demo-status').textContent = 'Finished. Replay or move to the next chunk.'; };
  utterance.onerror = (event) => {
    if (event.error !== 'canceled' && event.error !== 'interrupted') byId('demo-status').textContent = 'Speech could not start. Check your browser voice settings.';
  };
  speechSynthesis.speak(utterance);
}

function setupConnectionState() {
  const banner = byId<HTMLElement>('offline-banner');
  const update = () => { banner.hidden = navigator.onLine; };
  update();
  addEventListener('online', update);
  addEventListener('offline', update);
}

async function setupLicense() {
  const params = new URLSearchParams(location.search);
  const returned = params.get('license');
  if (returned) {
    localStorage.setItem(LICENSE_KEY, returned);
    params.delete('license');
    history.replaceState({}, '', `${location.pathname}${params.size ? `?${params}` : ''}${location.hash}`);
  }
  const form = byId<HTMLFormElement>('license-form');
  const input = byId<HTMLInputElement>('license-token');
  const status = byId('license-status');
  const showRequiredLicenseMessage = () => {
    input.setAttribute('aria-invalid', 'true');
    status.textContent = 'Paste a license token to verify it.';
  };
  input.addEventListener('invalid', showRequiredLicenseMessage);
  input.addEventListener('input', () => {
    input.setCustomValidity('');
    input.removeAttribute('aria-invalid');
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const token = input.value.trim();
    if (!token) {
      input.setCustomValidity('Paste a license token to verify it.');
      showRequiredLicenseMessage();
      input.reportValidity();
      return;
    }
    verifyLicense(token, true);
  });
  const token = returned || localStorage.getItem(LICENSE_KEY);
  const cached = JSON.parse(localStorage.getItem(CHECK_KEY) ?? 'null') as { valid: boolean; checkedAt: number; reason?: string } | null;
  if (cached?.valid) byId('license-status').textContent = 'Echo Pack license active. Paste it in the extension to install packs.';
  if (token && (!cached || Date.now() - cached.checkedAt > DAY || returned)) await verifyLicense(token, Boolean(returned));
}

async function verifyLicense(token: string, announce: boolean) {
  const status = byId('license-status');
  if (!navigator.onLine) {
    status.textContent = 'Connect once to verify this license.';
    return;
  }
  if (announce) status.textContent = 'Checking license…';
  try {
    const response = await fetch(`${BILLING_BASE}/verify?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error();
    const result = await response.json() as { valid: boolean; reason?: string };
    localStorage.setItem(LICENSE_KEY, token);
    localStorage.setItem(CHECK_KEY, JSON.stringify({ ...result, checkedAt: Date.now() }));
    status.textContent = result.valid ? 'License verified. Paste it in the extension to install packs.' : 'License no longer active. You can keep using the full free reader.';
  } catch {
    status.textContent = 'Verification is unavailable right now. Try again; the free reader is unaffected.';
  }
}

setupSkipLink();
setupTheme();
setupDemo();
setupConnectionState();
setupLicense();

if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => undefined));
