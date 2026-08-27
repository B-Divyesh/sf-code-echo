const button = document.getElementById('theme-button') as HTMLButtonElement | null;
const stored = localStorage.getItem('code-echo-theme');
document.documentElement.dataset.theme = stored === 'dark' || (!stored && matchMedia('(prefers-color-scheme:dark)').matches) ? 'dark' : 'light';
button?.addEventListener('click', () => {
  const dark = document.documentElement.dataset.theme !== 'dark';
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  localStorage.setItem('code-echo-theme', dark ? 'dark' : 'light');
  button.setAttribute('aria-label', dark ? 'Use light theme' : 'Use dark theme');
});
