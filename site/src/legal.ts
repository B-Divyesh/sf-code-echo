const button = document.getElementById('theme-button') as HTMLButtonElement | null;
const stored = localStorage.getItem('code-echo-theme');
const setTheme = (dark: boolean) => {
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  button?.setAttribute('aria-label', dark ? 'Use light theme' : 'Use dark theme');
  const label = button?.querySelector('span:last-child');
  if (label) label.textContent = dark ? 'Use light theme' : 'Use dark theme';
};
setTheme(stored === 'dark' || (!stored && matchMedia('(prefers-color-scheme:dark)').matches));
button?.addEventListener('click', () => {
  const dark = document.documentElement.dataset.theme !== 'dark';
  setTheme(dark);
  localStorage.setItem('code-echo-theme', dark ? 'dark' : 'light');
});

const skipLink = document.querySelector<HTMLAnchorElement>('.skip-link');
const main = document.getElementById('main');
skipLink?.addEventListener('click', () => main?.focus());

const h1 = document.querySelector<HTMLElement>('h1');
const announcement = document.getElementById('route-announcement');
const shouldFocus = () => {
  const entry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  return sessionStorage.getItem('code-echo-route-focus') === 'true' || entry?.type === 'back_forward';
};
document.addEventListener('click', (event) => {
  const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href]');
  if (!link || link.target || event.defaultPrevented) return;
  const destination = new URL(link.href, location.href);
  if (destination.origin === location.origin && destination.pathname !== location.pathname) {
    sessionStorage.setItem('code-echo-route-focus', 'true');
  }
});
addEventListener('pageshow', () => {
  if (!h1 || !shouldFocus()) return;
  sessionStorage.removeItem('code-echo-route-focus');
  requestAnimationFrame(() => {
    h1.focus({ preventScroll: true });
    if (announcement) announcement.textContent = h1.textContent?.trim() ?? '';
  });
});
