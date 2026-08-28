import { buildReading } from '../../lib/reader';
import { DEFAULT_SETTINGS } from '../../lib/types';

const DEMO_PREFIX = 'demo:code-echo:';
const SAMPLE = 'const parseHTTPResponse = async (request_id) => await fetch(`/api/${request_id}`);';
const byId = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const demoMode = document.documentElement.dataset.demo === 'true';
let parts: Array<{ visual: string; spoken: string }> = [];
let index = 0;
let utterance: SpeechSynthesisUtterance | undefined;

if (!demoMode && new URLSearchParams(location.search).get('demo') === '1') location.replace('/demo/?demo=1');

function setupTheme() {
  const key = demoMode ? `${DEMO_PREFIX}theme` : 'code-echo-theme';
  const stored = localStorage.getItem(key);
  const dark = stored === 'dark' || (!stored && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  const button = byId<HTMLButtonElement>('theme-button');
  updateThemeLabel(button, dark);
  button.addEventListener('click', () => {
    const nextDark = document.documentElement.dataset.theme !== 'dark';
    document.documentElement.dataset.theme = nextDark ? 'dark' : 'light';
    localStorage.setItem(key, nextDark ? 'dark' : 'light');
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
  if (!document.getElementById('demo-source')) return;
  const source = byId<HTMLTextAreaElement>('demo-source');
  const read = byId<HTMLButtonElement>('demo-read');
  const replay = byId<HTMLButtonElement>('demo-replay');
  const prev = byId<HTMLButtonElement>('demo-prev');
  const next = byId<HTMLButtonElement>('demo-next');
  const rate = byId<HTMLInputElement>('demo-rate');
  const readSource = () => {
    parts = buildReading(source.value, { ...DEFAULT_SETTINGS, rate: Number(rate.value) });
    index = 0;
    if (!parts.length) {
      byId('demo-status').textContent = 'Add a code line first.';
      source.focus();
      return;
    }
    renderDemo();
  };
  rate.addEventListener('input', () => {
    byId<HTMLOutputElement>('demo-rate-output').value = `${Number(rate.value).toFixed(1)}×`;
    if (demoMode) localStorage.setItem(`${DEMO_PREFIX}rate`, rate.value);
  });
  source.addEventListener('input', () => { if (demoMode) localStorage.setItem(`${DEMO_PREFIX}source`, source.value); });
  read.addEventListener('click', () => { readSource(); speakDemo(); });
  replay.addEventListener('click', speakDemo);
  prev.addEventListener('click', () => { index = Math.max(0, index - 1); renderDemo(); speakDemo(); });
  next.addEventListener('click', () => { index = Math.min(parts.length - 1, index + 1); renderDemo(); speakDemo(); });

  if (demoMode) {
    source.value = localStorage.getItem(`${DEMO_PREFIX}source`) ?? SAMPLE;
    rate.value = localStorage.getItem(`${DEMO_PREFIX}rate`) ?? '0.9';
    byId<HTMLOutputElement>('demo-rate-output').value = `${Number(rate.value).toFixed(1)}×`;
    readSource();
    byId<HTMLButtonElement>('reset-demo').addEventListener('click', () => {
      for (const key of Object.keys(localStorage)) if (key.startsWith(DEMO_PREFIX)) localStorage.removeItem(key);
      source.value = SAMPLE;
      rate.value = '0.9';
      byId<HTMLOutputElement>('demo-rate-output').value = '0.9×';
      readSource();
      byId('demo-status').textContent = 'Sample reset. Nothing was saved to your reader.';
    });
  }
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
  if (!document.getElementById('offline-banner')) return;
  const banner = byId<HTMLElement>('offline-banner');
  const update = () => { banner.hidden = navigator.onLine; };
  update();
  addEventListener('online', update);
  addEventListener('offline', update);
}

setupSkipLink();
setupTheme();
setupDemo();
setupConnectionState();
if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => undefined));
