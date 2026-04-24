/**
 * Convert og-image.png to og-image.webp
 * Run once: npm install sharp --no-save && node scripts/convert-og-webp.mjs
 */
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { resolve } from 'path';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PUBLIC = resolve(__dirname, '../public');

let sharp;
try {
  const require = createRequire(import.meta.url);
  sharp = require('sharp');
} catch {
  console.error('sharp not installed. Run: npm install sharp --no-save');
  process.exit(1);
}

const src = resolve(PUBLIC, 'og-image.png');
const dest = resolve(PUBLIC, 'og-image.webp');

await sharp(src)
  .webp({ quality: 85 })
  .toFile(dest);

const before = (await import('fs')).statSync(src).size;
const after = (await import('fs')).statSync(dest).size;
console.log(`og-image.png  ${(before / 1024).toFixed(0)}KB`);
console.log(`og-image.webp ${(after / 1024).toFixed(0)}KB  (${Math.round((1 - after/before)*100)}% smaller)`);
