import { writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import pngToIco from 'png-to-ico';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'public/icons/icon.svg');
const maskableSource = resolve(root, 'public/icons/icon-maskable.svg');

async function png(input, size, output) {
  await sharp(input)
    .resize(size, size, { fit: 'fill' })
    .png({ compressionLevel: 9 })
    .toFile(output);
  console.log(`wrote ${output}`);
}

const any = [
  [16, 'public/icons/favicon-16.png'],
  [32, 'public/icons/favicon-32.png'],
  [180, 'public/icons/apple-touch-icon.png'],
  [192, 'public/icons/icon-192.png'],
  [512, 'public/icons/icon-512.png'],
];

const maskable = [
  [192, 'public/icons/icon-maskable-192.png'],
  [512, 'public/icons/icon-maskable-512.png'],
];

for (const [size, file] of any) {
  await png(source, size, resolve(root, file));
}

for (const [size, file] of maskable) {
  await png(maskableSource, size, resolve(root, file));
}

const ico = await pngToIco([
  resolve(root, 'public/icons/favicon-16.png'),
  resolve(root, 'public/icons/favicon-32.png'),
]);
const icoPath = resolve(root, 'public/favicon.ico');
await writeFile(icoPath, ico);
console.log(`wrote ${icoPath}`);
