import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const pages = ['site/index.html', 'site/privacy/index.html', 'site/terms/index.html'];

describe('static accessibility contract', () => {
  for (const page of pages) {
    it(`${page} has core landmarks and exactly one h1`, async () => {
      const html = await readFile(page, 'utf8');
      expect(html).toMatch(/<html lang="en">/);
      expect(html).toMatch(/<title>[^<]+<\/title>/);
      expect(html).toMatch(/<main[\s>]/);
      expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
      expect(html).toMatch(/class="skip-link"/);
    });
  }

  it('gives every landing-page raster image dimensions and alt text', async () => {
    const html = await readFile('site/index.html', 'utf8');
    for (const image of html.match(/<img\s[^>]+>/g) ?? []) {
      expect(image).toMatch(/\salt="[^"]+"/);
      expect(image).toMatch(/\swidth="\d+"/);
      expect(image).toMatch(/\sheight="\d+"/);
    }
  });

  it('makes skip destinations focusable and license restore fields required', async () => {
    const [site, popup] = await Promise.all([
      readFile('site/index.html', 'utf8'),
      readFile('entrypoints/popup/index.html', 'utf8')
    ]);
    for (const source of [site, popup]) {
      expect(source).toMatch(/<main id="main" tabindex="-1">/);
      expect(source).toMatch(/<input id="license-token"[^>]+required[^>]+aria-describedby="license-status"/);
    }
  });

  it('explicitly ships a local favicon and responsive hero candidates', async () => {
    const [html, favicon] = await Promise.all([
      readFile('site/index.html', 'utf8'),
      readFile('site/public/favicon.svg', 'utf8')
    ]);
    expect(html).toMatch(/<link rel="icon" href="\/favicon\.svg" type="image\/svg\+xml"/);
    expect(favicon).toContain('<svg');
    expect(html).toContain('imagesrcset=');
    expect(html).toContain('imagesizes=');
    for (const format of ['avif', 'webp', 'jpg']) {
      expect(html).toContain(`hero-risograph-480.${format}`);
      expect(html).toContain(`hero-risograph-768.${format}`);
    }
    const heroImage = html.match(/<img\s[^>]+>/)?.[0] ?? '';
    expect(heroImage).toContain('srcset=');
    expect(heroImage).toContain('sizes=');
  });

  it('ships privacy, terms, generated-art disclosure, and no CDN scripts', async () => {
    const html = await readFile('site/index.html', 'utf8');
    expect(html).toContain('/privacy/');
    expect(html).toContain('/terms/');
    expect(html).toContain('Hero artwork was generated');
    expect(html).not.toMatch(/<script[^>]+src="https?:\/\//);
    expect(html).not.toMatch(/fonts\.(googleapis|gstatic)\.com/);
  });

  it('uses production billing without advertising an unregistered checkout, and ships static response policies', async () => {
    const [site, siteMain, popup, popupMain, manifest, config, serviceWorker] = await Promise.all([
      readFile('site/index.html', 'utf8'),
      readFile('site/src/main.ts', 'utf8'),
      readFile('entrypoints/popup/index.html', 'utf8'),
      readFile('entrypoints/popup/main.ts', 'utf8'),
      readFile('wxt.config.ts', 'utf8'),
      readFile('site/public/staticwebapp.config.json', 'utf8'),
      readFile('site/public/sw.js', 'utf8')
    ]);
    for (const source of [siteMain, popupMain, manifest]) {
      expect(source).toContain('https://api.sociobot.in');
      expect(source).not.toContain('pilot-api.sociobot.in');
    }
    expect(site).not.toContain('/checkout');
    expect(popup).not.toContain('/checkout');
    expect(site).toContain('Checkout is being prepared');
    expect(popup).toContain('checkout is being prepared');
    expect(config).toContain('Content-Security-Policy');
    expect(config).toContain('Permissions-Policy');
    expect(config).toContain('max-age=31536000, immutable');
    expect(config).toContain('".avif": "image/avif"');
    expect(config).toContain('".webmanifest": "application/manifest+json"');
    expect(serviceWorker).toContain("const CACHE = 'code-echo-site-v3'");
  });

  it('documents the Chromium-registered global replay shortcut', async () => {
    const [readme, site, popup, manifest] = await Promise.all([
      readFile('README.md', 'utf8'),
      readFile('site/index.html', 'utf8'),
      readFile('entrypoints/popup/index.html', 'utf8'),
      readFile('wxt.config.ts', 'utf8')
    ]);
    expect(readme).toContain('Ctrl+Shift+Y');
    expect(manifest).toContain('Ctrl+Shift+Y');
    for (const source of [site, popup]) {
      expect(source).toContain('Ctrl Shift Y');
      expect(source).not.toContain('Alt Shift R');
    }
    for (const source of [readme, site, popup, manifest]) {
      expect(source).not.toContain('Alt+Shift+R');
      expect(source).not.toContain('Alt+Shift+H');
    }
  });
});
