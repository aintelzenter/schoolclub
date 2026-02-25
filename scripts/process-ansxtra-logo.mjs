import sharp from 'sharp';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const inputPath = join(root, 'public', 'ansxtra-logo.png');
const outputPublic = join(root, 'public', 'ansxtra-logo.png');
const outputAppIcon = join(root, 'app', 'icon.png');
const tmpPublic = join(root, 'public', 'ansxtra-logo.tmp.png');
const tmpApp = join(root, 'app', 'icon.tmp.png');

// White threshold: treat pixels this close to white as background
const WHITE_THRESHOLD = 252;
const ALPHA_THRESHOLD = 5; // consider transparent for trim

async function main() {
  const image = sharp(inputPath);
  const meta = await image.metadata();
  const { width, height } = meta;
  const channels = 4; // rgba

  let { data } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const len = data.length;
  // Make white / near-white pixels transparent
  for (let i = 0; i < len; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r >= WHITE_THRESHOLD && g >= WHITE_THRESHOLD && b >= WHITE_THRESHOLD) {
      data[i + 3] = 0;
    }
  }

  // Find bounding box of non-transparent pixels (with small padding)
  let minX = width, minY = height, maxX = 0, maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      if (data[i + 3] > ALPHA_THRESHOLD) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const cropWidth = Math.max(1, maxX - minX + 1);
  const cropHeight = Math.max(1, maxY - minY + 1);
  const padding = Math.round(Math.min(cropWidth, cropHeight) * 0.08);
  const left = Math.max(0, minX - padding);
  const top = Math.max(0, minY - padding);
  const w = Math.min(width - left, cropWidth + 2 * padding);
  const h = Math.min(height - top, cropHeight + 2 * padding);

  // Extract cropped region from original buffer (we need to crop the buffer)
  const croppedBuffer = Buffer.alloc(w * h * channels);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const srcX = left + x;
      const srcY = top + y;
      const srcI = (srcY * width + srcX) * channels;
      const dstI = (y * w + x) * channels;
      for (let c = 0; c < channels; c++) croppedBuffer[dstI + c] = data[srcI + c];
    }
  }

  const pngOpts = { compressionLevel: 9 };
  const cropped = sharp(croppedBuffer, { raw: { width: w, height: h, channels } }).png(pngOpts);
  await cropped.toFile(tmpPublic);
  await sharp(croppedBuffer, { raw: { width: w, height: h, channels } })
    .png(pngOpts)
    .toFile(tmpApp);

  const { renameSync } = await import('fs');
  renameSync(tmpPublic, outputPublic);
  renameSync(tmpApp, outputAppIcon);

  console.log('Logo processed: transparent background, cropped to content.');
  console.log('Output:', outputPublic, outputAppIcon);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
