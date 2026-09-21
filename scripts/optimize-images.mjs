import { mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const sourceDir = path.join(root, 'public', 'images');
const outputDir = path.join(sourceDir, '3d');
await mkdir(outputDir, { recursive: true });
const files = (await readdir(sourceDir)).filter(file => /\.(jpe?g|png)$/i.test(file));
for (const file of files) {
  const name = file.replace(/\.[^.]+$/, '.webp');
  await sharp(path.join(sourceDir, file)).resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 78 }).toFile(path.join(outputDir, name));
}
await sharp(path.join(sourceDir, 'hero_coffee_cup_1789979797782.jpg')).resize(900, 900, { fit: 'cover' }).webp({ quality: 72 }).toFile(path.join(outputDir, 'hero-coffee-cup.webp'));
await sharp(path.join(sourceDir, 'hero_coffee_cup_1789979797782.jpg')).resize(1920, 1080, { fit: 'cover' }).webp({ quality: 72 }).toFile(path.join(sourceDir, 'hero-desktop.webp'));
await sharp(path.join(sourceDir, 'hero_coffee_cup_1789979797782.jpg')).resize(768, 1024, { fit: 'cover' }).webp({ quality: 72 }).toFile(path.join(sourceDir, 'hero-mobile.webp'));
await sharp(path.join(sourceDir, 'signature_latte.jpg')).resize(900, 700, { fit: 'cover' }).webp({ quality: 72 }).toFile(path.join(outputDir, 'category-coffee.webp'));
await sharp(path.join(sourceDir, 'croissant.jpg')).resize(900, 700, { fit: 'cover' }).webp({ quality: 72 }).toFile(path.join(outputDir, 'category-snacks.webp'));
await sharp(path.join(sourceDir, 'espresso.jpg')).resize(900, 700, { fit: 'cover' }).webp({ quality: 72 }).toFile(path.join(outputDir, 'ai-assistant.webp'));
console.log(`Optimized ${files.length} source images into ${outputDir}.`);
