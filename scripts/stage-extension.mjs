import { cp, mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const outputFiles = await readdir('.output').catch(() => []);
const zip = outputFiles.find((name) => name.endsWith('.zip') && name.includes('chrome'));

if (!zip) {
  throw new Error('Extension archive not found. Run npm run build:extension first.');
}

await mkdir('dist/site/downloads', { recursive: true });
await cp(join('.output', zip), 'dist/site/downloads/code-echo-chrome.zip');
