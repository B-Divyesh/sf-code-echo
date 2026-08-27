import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const source = 'assets/src/hero-risograph.png';
await sharp(source).resize(1200, 800, { fit: 'cover' }).avif({ quality: 50 }).toFile('site/public/assets/hero-risograph.avif');
await sharp(source).resize(1200, 800, { fit: 'cover' }).webp({ quality: 82 }).toFile('site/public/assets/hero-risograph.webp');
await sharp(source).resize(1200, 800, { fit: 'cover' }).jpeg({ quality: 78 }).toFile('site/public/assets/hero-risograph.jpg');

await mkdir('public/icon', { recursive: true });
for (const size of [16, 32, 48, 128]) {
  await sharp('public/icon/icon.svg').resize(size, size).png().toFile(`public/icon/${size}.png`);
}
