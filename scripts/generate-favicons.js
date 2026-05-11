const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const outDir = path.resolve(__dirname, "..", "public");

// Light-mode SVG (default) for PNG render targets
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#e11d48"/>
      <stop offset="100%" stop-color="#be123c"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" ry="112" fill="url(#g)"/>
  <text x="50%" y="52%" text-anchor="middle" dominant-baseline="central" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="260" font-weight="900" fill="#fff" letter-spacing="-10">W</text>
</svg>`;

// Maskable variant (no rounded corners) for iOS
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#e11d48"/>
      <stop offset="100%" stop-color="#be123c"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="0" ry="0" fill="url(#g)"/>
  <text x="50%" y="52%" text-anchor="middle" dominant-baseline="central" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="260" font-weight="900" fill="#fff" letter-spacing="-10">W</text>
</svg>`;

async function render(svgStr, size) {
  return sharp(Buffer.from(svgStr, "utf-8"))
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toBuffer();
}

async function main() {
  // PNG icon for older browser tab favicon
  const icon32 = await render(svg, 32);
  fs.writeFileSync(path.join(outDir, "favicon-32x32.png"), icon32);
  console.log("✓ public/favicon-32x32.png");

  // Apple touch icon
  const apple180 = await render(maskableSvg, 180);
  fs.writeFileSync(path.join(outDir, "apple-icon.png"), apple180);
  console.log("✓ public/apple-icon.png");

  // PWA icons from manifest
  const icon192 = await render(svg, 192);
  fs.writeFileSync(path.join(outDir, "icon-192x192.png"), icon192);
  console.log("✓ public/icon-192x192.png");

  const icon512 = await render(svg, 512);
  fs.writeFileSync(path.join(outDir, "icon-512x512.png"), icon512);
  console.log("✓ public/icon-512x512.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
