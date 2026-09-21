import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

const root = process.cwd();
const publicDir = path.join(root, 'public');
const sourcePath = path.join(publicDir, 'favicon-source.png');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024"><rect width="1024" height="1024" rx="190" fill="#1b100b"/><path d="M207 392h517v145c0 173-108 286-258 286S207 710 207 537V392Z" fill="#fff9f0"/><path d="M724 456h53c83 0 123 53 123 119s-40 119-123 119h-76v-76h71c35 0 52-16 52-43s-17-43-52-43h-48v-76Z" fill="#f3c17e"/><ellipse cx="466" cy="392" rx="258" ry="75" fill="#d6954e" stroke="#fff9f0" stroke-width="34"/><path d="M302 257c-28-53 21-77 0-127M467 257c-28-53 21-77 0-127M632 257c-28-53 21-77 0-127" fill="none" stroke="#f3c17e" stroke-width="34" stroke-linecap="round"/></svg>`;

await mkdir(publicDir, { recursive: true });
await sharp(Buffer.from(svg)).png().resize(1024, 1024).toFile(sourcePath);
for (const size of [16, 32, 180, 192, 512]) {
  const name = size === 180 ? 'apple-touch-icon.png' : size >= 192 ? `android-chrome-${size}x${size}.png` : `favicon-${size}x${size}.png`;
  await sharp(sourcePath).resize(size, size).png().toFile(path.join(publicDir, name));
}
await sharp(sourcePath).resize(48, 48).png().toFile(path.join(publicDir, 'favicon-48x48.png'));
const ico = await pngToIco([path.join(publicDir, 'favicon-16x16.png'), path.join(publicDir, 'favicon-32x32.png'), path.join(publicDir, 'favicon-48x48.png')]);
await import('node:fs/promises').then(fs => fs.writeFile(path.join(publicDir, 'favicon.ico'), ico));
console.log('Generated Good Day Coffee favicon assets.');
