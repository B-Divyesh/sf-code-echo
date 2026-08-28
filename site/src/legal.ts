const button = document.getElementById('theme-button') as HTMLButtonElement | null;
const stored = localStorage.getItem('code-echo-theme');
const setTheme = (dark: boolean) => {
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  button?.setAttribute('aria-label', dark ? 'Use light theme' : 'Use dark theme');
  const label = button?.querySelector('span:last-child');
  if (label) label.textContent = dark ? 'Paper mode' : 'Ink mode';
};
setTheme(stored === 'dark' || (!stored && matchMedia('(prefers-color-scheme:dark)').matches));
button?.addEventListener('click', () => {
  const dark = document.documentElement.dataset.theme !== 'dark';
  setTheme(dark);
  localStorage.setItem('code-echo-theme', dark ? 'dark' : 'light');
});
