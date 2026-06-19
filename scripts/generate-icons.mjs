import sharp from "sharp";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

const svgRaw = readFileSync(join(publicDir, "logo.svg"), "utf-8");

const bgColor = "#2563eb";

function makeIcon(size) {
  const padding = Math.round(size * 0.12);
  const inner = size - padding * 2;

  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" rx="${Math.round(size * 0.18)}" fill="${bgColor}"/>
    <g transform="translate(${padding}, ${padding})">
      <svg viewBox="280 258 465 312" width="${inner}" height="${inner}">
        ${svgRaw
          .replace(/fill="#000000"/g, 'fill="#ffffff"')
          .replace(/<svg[^>]*>/, "")
          .replace("</svg>", "")}
      </svg>
    </g>
  </svg>`;

  return svg;
}

const sizes = [
  { name: "apple-touch-icon.png", size: 180 },
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "favicon.png", size: 32 },
];

for (const { name, size } of sizes) {
  const svg = makeIcon(size);
  await sharp(Buffer.from(svg))
    .png()
    .toFile(join(publicDir, name));
  console.log(`Created ${name} (${size}x${size})`);
}

console.log("Done!");
