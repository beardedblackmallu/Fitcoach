// Generates FitCoach brand source images for @capacitor/assets + PWA.
// The "F" is built from rectangles (no font dependency) so iOS and Android
// render an IDENTICAL lettermark — this is the permanent fix for the old
// platform mismatch. Run: node scripts/gen-icons.mjs
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const ORANGE = "#FF6400";
const CHARCOAL = "#1C1C1C";
const WHITE = "#FFFFFF";

mkdirSync("assets", { recursive: true });
mkdirSync("public", { recursive: true });

// Draw a bold condensed "F" as three rects, centered at (cx,cy).
// H = cap height, stemW = stem width.
function fPaths(cx, cy, H, stemW, color) {
  const totalW = H * 0.58;       // overall F width
  const barH = H * 0.17;         // crossbar thickness
  const midW = totalW * 0.72;    // middle bar length
  const x = cx - totalW / 2;
  const yTop = cy - H / 2;
  const midY = cy - H * 0.096;   // middle bar sits just above centre
  return `
    <rect x="${x}" y="${yTop}" width="${stemW}" height="${H}" fill="${color}"/>
    <rect x="${x}" y="${yTop}" width="${totalW}" height="${barH}" fill="${color}"/>
    <rect x="${x}" y="${midY}" width="${midW}" height="${barH}" fill="${color}"/>
  `;
}

function svg(w, h, inner) {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${inner}</svg>`
  );
}

async function png(buf, out, size) {
  await sharp(buf, { density: 384 }).resize(size, size).png().toFile(out);
  console.log("✓", out);
}

// 1) icon-only.png — full orange square + white F (OS masks corners)
const iconFull = svg(1024, 1024,
  `<rect width="1024" height="1024" fill="${ORANGE}"/>` +
  fPaths(512, 512, 520, 90, WHITE)
);

// 2) icon-foreground.png — white F only, scaled into the adaptive safe zone
const iconFg = svg(1024, 1024, fPaths(512, 512, 360, 62, WHITE));

// 3) icon-background.png — solid orange
const iconBg = svg(1024, 1024, `<rect width="1024" height="1024" fill="${ORANGE}"/>`);

// 4) splash.png / splash-dark.png — charcoal bg, centred orange rounded F tile
const splash = svg(2732, 2732,
  `<rect width="2732" height="2732" fill="${CHARCOAL}"/>` +
  `<rect x="1046" y="1046" width="640" height="640" rx="150" fill="${ORANGE}"/>` +
  fPaths(1366, 1366, 360, 62, WHITE)
);

await png(iconFull, "assets/icon-only.png", 1024);
await png(iconFg,   "assets/icon-foreground.png", 1024);
await png(iconBg,   "assets/icon-background.png", 1024);
await png(splash,   "assets/splash.png", 2732);
await png(splash,   "assets/splash-dark.png", 2732);

// PWA icons (explicit deliverables)
await png(iconFull, "public/icon-512.png", 512);
await png(iconFull, "public/icon-192.png", 192);

console.log("Done.");
