// Deterministic exports from official press-kit originals, never generated art.
// Usage: node scripts/prepare-game-brand.mjs <logo PNG> <lion hero PNG>
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const [logoPath, lionPath] = process.argv.slice(2);
if (!logoPath || !lionPath) throw new Error('Provide the official logo and lion hero PNG paths.');
const lionMeta = await sharp(lionPath).metadata();
if (lionMeta.width !== 2680 || lionMeta.height !== 3052) {
  throw new Error('Unexpected lion source dimensions; inspect the source and crop before exporting.');
}
await fs.mkdir('public/images', { recursive: true });
await sharp(logoPath).resize({ width: 492 }).webp({ quality: 90 }).toFile('public/images/game-logo.webp');
// The source is the official 2680x3052 lion illustration. This crop selects
// the blue mane and face while retaining the original strokes and colors.
const square = await sharp(lionPath)
  .extract({ left: 1000, top: 0, width: 960, height: 960 })
  .flatten({ background: '#191714' })
  .png().toBuffer();
const sizes = new Map([
  ['favicon-16x16.png', 16], ['favicon-32x32.png', 32], ['favicon-96x96.png', 96],
  ['apple-touch-icon.png', 180], ['android-chrome-192x192.png', 192],
  ['android-chrome-512x512.png', 512],
]);
for (const [name, size] of sizes) {
  await sharp(square).resize(size, size).png().toFile(path.join('public', name));
}
const icoSizes = [16, 32, 48, 96, 256];
const frames = await Promise.all(icoSizes.map(size => sharp(square).resize(size, size).png().toBuffer()));
const directory = Buffer.alloc(6 + frames.length * 16);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(frames.length, 4);
let offset = directory.length;
frames.forEach((frame, index) => {
  const entry = 6 + index * 16;
  directory[entry] = icoSizes[index] === 256 ? 0 : icoSizes[index];
  directory[entry + 1] = directory[entry];
  directory.writeUInt16LE(1, entry + 4);
  directory.writeUInt16LE(32, entry + 6);
  directory.writeUInt32LE(frame.length, entry + 8);
  directory.writeUInt32LE(offset, entry + 12);
  offset += frame.length;
});
await fs.writeFile('public/favicon.ico', Buffer.concat([directory, ...frames]));
console.log('Exported official game logo, lion-crop favicon set and five-resolution ICO.');
