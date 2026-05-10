import sharp from "sharp";
import fs from "fs";

const svg = fs.readFileSync("public/favicon.svg");

// PNG sizes recommended by Google (48px multiples)
for (const size of [48, 96, 192]) {
  await sharp(svg)
    .resize(size, size)
    .png()
    .toFile(`public/icon-${size}.png`);
  console.log(`wrote public/icon-${size}.png`);
}

// 180x180 PNG for iOS home screen
await sharp(svg)
  .resize(180, 180)
  .png()
  .toFile("public/apple-icon.png");
console.log("wrote public/apple-icon.png");

// favicon.ico — 32x32 PNG embedded in ICO container (modern format, Vista+)
const png32 = await sharp(svg).resize(32, 32).png().toBuffer();
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);   // reserved
header.writeUInt16LE(1, 2);   // type = ICO
header.writeUInt16LE(1, 4);   // image count

const dirEntry = Buffer.alloc(16);
dirEntry.writeUInt8(32, 0);             // width (32; 0 means 256)
dirEntry.writeUInt8(32, 1);             // height
dirEntry.writeUInt8(0, 2);              // palette
dirEntry.writeUInt8(0, 3);              // reserved
dirEntry.writeUInt16LE(1, 4);           // color planes
dirEntry.writeUInt16LE(32, 6);          // bits/pixel
dirEntry.writeUInt32LE(png32.length, 8);
dirEntry.writeUInt32LE(22, 12);         // offset = 6 + 16

const ico = Buffer.concat([header, dirEntry, png32]);
fs.writeFileSync("public/favicon.ico", ico);
console.log(`wrote public/favicon.ico (${ico.length} bytes)`);
