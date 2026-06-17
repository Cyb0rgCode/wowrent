import sharp from "sharp";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public", "cars");

const cars = [
  { file: "golf7.jpg", label: "Volkswagen Golf 7", color: "#1a365d" },
  { file: "clio5.jpg", label: "Renault Clio 5", color: "#2d3748" },
  { file: "tucson.jpg", label: "Hyundai Tucson", color: "#234e52" },
  { file: "c-class.jpg", label: "Mercedes C-Class", color: "#1a202c" },
  { file: "dokker.jpg", label: "Dacia Dokker", color: "#2a4365" },
  { file: "dmax.jpg", label: "Isuzu D-Max", color: "#322659" },
];

for (const car of cars) {
  const svg = `<svg width="800" height="500" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${car.color}"/>
        <stop offset="100%" stop-color="#000"/>
      </linearGradient>
    </defs>
    <rect width="800" height="500" fill="url(#bg)"/>
    <text x="400" y="220" text-anchor="middle" font-family="Arial,sans-serif" font-size="42" font-weight="bold" fill="white">${car.label}</text>
    <text x="400" y="280" text-anchor="middle" font-family="Arial,sans-serif" font-size="22" fill="#a0aec0">wowRent</text>
    <circle cx="250" cy="380" r="40" fill="none" stroke="#4a5568" stroke-width="8"/>
    <circle cx="250" cy="380" r="15" fill="#4a5568"/>
    <circle cx="550" cy="380" r="40" fill="none" stroke="#4a5568" stroke-width="8"/>
    <circle cx="550" cy="380" r="15" fill="#4a5568"/>
    <path d="M180 340 Q200 280 300 270 L500 270 Q580 280 620 340 Z" fill="none" stroke="#4a5568" stroke-width="4"/>
    <line x1="180" y1="340" x2="620" y2="340" stroke="#4a5568" stroke-width="4"/>
  </svg>`;

  await sharp(Buffer.from(svg)).jpeg({ quality: 90 }).toFile(join(outDir, car.file));
  console.log(`Created ${car.file}`);
}

console.log("Done!");
