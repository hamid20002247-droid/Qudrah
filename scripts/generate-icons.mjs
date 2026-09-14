/**
 * Build favicon + PWA/Apple icons from the vector mark.
 * Run: node scripts/generate-icons.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svgPath = join(root, "public/icons/icon.svg");
const outDir = join(root, "public/icons");
const appDir = join(root, "src/app");

mkdirSync(outDir, { recursive: true });

const svg = readFileSync(svgPath);
const base = sharp(svg, { density: 384 });

async function png(size, dest) {
  await base
    .clone()
    .resize(size, size, { fit: "fill" })
    .png({ compressionLevel: 9, palette: size <= 48 })
    .toFile(dest);
  const { size: bytes } = await sharp(dest).metadata().then(async () => {
    const buf = readFileSync(dest);
    return { size: buf.length };
  });
  console.log(`✓ ${dest.replace(root + "\\", "").replace(root + "/", "")} (${bytes} B)`);
}

// Browser / PWA / Google
await png(16, join(outDir, "icon-16.png"));
await png(32, join(outDir, "icon-32.png"));
await png(48, join(outDir, "icon-48.png"));
await png(180, join(outDir, "apple-touch-icon.png"));
await png(192, join(outDir, "icon-192.png"));
await png(512, join(outDir, "icon-512.png"));

// Maskable: same full-bleed teal (safe zone already padded in SVG)
await png(192, join(outDir, "maskable-192.png"));
await png(512, join(outDir, "maskable-512.png"));

// Next.js App Router conventions
await png(32, join(appDir, "icon.png"));
await png(180, join(appDir, "apple-icon.png"));

// Multi-size favicon.ico (16 + 32)
const ico16 = await sharp(svg, { density: 384 })
  .resize(16, 16)
  .png()
  .toBuffer();
const ico32 = await sharp(svg, { density: 384 })
  .resize(32, 32)
  .png()
  .toBuffer();
writeFileSync(join(root, "public/favicon.ico"), buildIco([
  { size: 16, png: ico16 },
  { size: 32, png: ico32 },
]));
console.log("✓ public/favicon.ico");

/** Minimal ICO writer: PNG-compressed images (Vista+) */
function buildIco(images) {
  const count = images.length;
  const headerSize = 6 + count * 16;
  let offset = headerSize;
  const entries = [];
  for (const img of images) {
    entries.push({
      width: img.size >= 256 ? 0 : img.size,
      height: img.size >= 256 ? 0 : img.size,
      bytes: img.png.length,
      offset,
      png: img.png,
    });
    offset += img.png.length;
  }
  const buf = Buffer.alloc(offset);
  buf.writeUInt16LE(0, 0);
  buf.writeUInt16LE(1, 2);
  buf.writeUInt16LE(count, 4);
  let entryAt = 6;
  for (const e of entries) {
    buf.writeUInt8(e.width, entryAt);
    buf.writeUInt8(e.height, entryAt + 1);
    buf.writeUInt8(0, entryAt + 2);
    buf.writeUInt8(0, entryAt + 3);
    buf.writeUInt16LE(1, entryAt + 4);
    buf.writeUInt16LE(32, entryAt + 6);
    buf.writeUInt32LE(e.bytes, entryAt + 8);
    buf.writeUInt32LE(e.offset, entryAt + 12);
    e.png.copy(buf, e.offset);
    entryAt += 16;
  }
  return buf;
}
