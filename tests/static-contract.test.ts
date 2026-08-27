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

  it('ships privacy, terms, generated-art disclosure, and no CDN scripts', async () => {
    const html = await readFile('site/index.html', 'utf8');
    expect(html).toContain('/privacy/');
    expect(html).toContain('/terms/');
    expect(html).toContain('Hero artwork was generated');
    expect(html).not.toMatch(/<script[^>]+src="https?:\/\//);
    expect(html).not.toMatch(/fonts\.(googleapis|gstatic)\.com/);
  });
});
