// Generates the social share image public/og-image.png (1200x630) from an SVG.
// Re-run with `node scripts/make-og.mjs` after editing the text/colors below.
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '../public/og-image.png');

const W = 1200, H = 630;
const BRAND = 'UHonest';
const TAGLINE = 'The new hookup app';
const SUB = 'Meet and chat with people near you — free to join';
const DOMAIN = 'u-honest.vercel.app';

const svg = `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#5f0a87"/>
      <stop offset="1" stop-color="#a4508b"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.35" r="0.75">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.16"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <!-- rounded inner frame -->
  <rect x="40" y="40" width="${W - 80}" height="${H - 80}" rx="28"
        fill="none" stroke="#ffffff" stroke-opacity="0.18" stroke-width="2"/>

  <!-- heart mark -->
  <g transform="translate(600 168)">
    <path transform="translate(-34 -30) scale(2.1)"
          d="M16 29s-13-8.35-13-17a7 7 0 0 1 13-3 7 7 0 0 1 13 3c0 8.65-13 17-13 17z"
          fill="#ffffff"/>
  </g>

  <text x="600" y="330" text-anchor="middle"
        font-family="Segoe UI, Arial, sans-serif" font-size="128" font-weight="800"
        fill="#ffffff" letter-spacing="-2">${BRAND}</text>

  <text x="600" y="405" text-anchor="middle"
        font-family="Segoe UI, Arial, sans-serif" font-size="46" font-weight="700"
        fill="#ffffff" fill-opacity="0.96">${TAGLINE}</text>

  <text x="600" y="460" text-anchor="middle"
        font-family="Segoe UI, Arial, sans-serif" font-size="30" font-weight="400"
        fill="#ffffff" fill-opacity="0.82">${SUB}</text>

  <!-- domain pill -->
  <rect x="470" y="512" width="260" height="56" rx="28" fill="#ffffff" fill-opacity="0.14"/>
  <text x="600" y="549" text-anchor="middle"
        font-family="Segoe UI, Arial, sans-serif" font-size="26" font-weight="600"
        fill="#ffffff">${DOMAIN}</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(OUT);
console.log('Wrote', OUT);
