import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const pages = ['site/index.html', 'site/demo/index.html', 'site/privacy/index.html', 'site/terms/index.html', 'site/404/index.html'];

describe('static site contract', () => {
  for (const page of pages) {
    it(`${page} has accessible structure and route metadata`, async () => {
      const html = await readFile(page, 'utf8');
      expect(html).toMatch(/<html lang="en"/);
      expect(html).toMatch(/<title>[^<]+<\/title>/);
      expect(html).toMatch(/<main[\s>]/);
      expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
      expect(html).toMatch(/class="skip-link"/);
      expect(html).toContain('rel="canonical"');
      expect(html).toContain('og:title');
      expect(html).toContain('twitter:card');
      expect(html).toContain('apple-touch-icon');
      expect(html).toContain('/privacy/');
      expect(html).toContain('/terms/');
    });
  }

  it('uses the required plain title and sample action', async () => {
    const html = await readFile('site/index.html', 'utf8');
    expect(html).toContain('Code Echo — reads selected code aloud');
    expect(html).toContain('Read selected code <em>one piece at a time</em>');
    expect(html).toContain('For developers and learners who lose their place in unfamiliar code.');
    expect(html).toContain('Try it with sample code');
    expect(html).toContain('Free core reader. Code stays on your device. Works offline after setup.');
  });

  it('ships an isolated demo, real 404, generated social image, and response policies', async () => {
    const [demo, notFound, config, serviceWorker, claims] = await Promise.all([
      readFile('site/demo/index.html', 'utf8'),
      readFile('site/404/index.html', 'utf8'),
      readFile('site/public/staticwebapp.config.json', 'utf8'),
      readFile('site/public/sw.js', 'utf8'),
      readFile('.factory/claims.json', 'utf8')
    ]);
    expect(demo).toContain('data-demo="true"');
    expect(demo).toContain('Demo — sample data, nothing is saved');
    expect(demo).toContain('Reset demo');
    expect(demo).toContain('Start for real');
    expect(notFound).toContain('This page is not in the workbench');
    expect(config).toContain('"statusCode": 404');
    expect(config).toContain('Content-Security-Policy');
    expect(config).toContain('X-Content-Type-Options');
    expect(serviceWorker).toContain("const CACHE = 'code-echo-site-v4'");
    expect(claims).toContain('@claim:offline-reload');
  });

  it('has local assets, no CDN scripts, and a browser-compatible Playwright pin', async () => {
    const [html, packageJson, favicon] = await Promise.all([
      readFile('site/index.html', 'utf8'),
      readFile('package.json', 'utf8'),
      readFile('site/public/favicon.svg', 'utf8')
    ]);
    expect(html).toContain('/assets/code-echo-social.jpg');
    expect(html).toContain('/apple-touch-icon.png');
    expect(html).not.toMatch(/<script[^>]+src="https?:\/\//);
    expect(html).not.toMatch(/fonts\.(googleapis|gstatic)\.com/);
    expect(packageJson).toContain('"@playwright/test": "1.58.2"');
    expect(favicon).toContain('<svg');
  });
});
