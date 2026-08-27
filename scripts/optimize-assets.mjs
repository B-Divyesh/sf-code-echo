import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const source = 'assets/src/hero-risograph.png';
const variants = [480, 768, 1200];

await mkdir('site/public/assets', { recursive: true });
for (const width of variants) {
  const name = width === 1200 ? 'hero-risograph' : `hero-risograph-${width}`;
  const image = sharp(source).resize(width, Math.round(width * 2 / 3), { fit: 'cover' });
  await image.clone().avif({ quality: 50 }).toFile(`site/public/assets/${name}.avif`);
  await image.clone().webp({ quality: 82 }).toFile(`site/public/assets/${name}.webp`);
  await image.clone().jpeg({ quality: 78 }).toFile(`site/public/assets/${name}.jpg`);
}

await mkdir('public/icon', { recursive: true });
for (const size of [16, 32, 48, 128]) {
  await sharp('public/icon/icon.svg').resize(size, size).png().toFile(`public/icon/${size}.png`);
}
