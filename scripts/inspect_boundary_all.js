import sharp from 'sharp';

const spriteSheetPath = 'd:/0. 개인/0D. 학습/바이브코딩/똥홈런게임/Referenc picture/Poop_start.png';
const frameWidth = 840;
const frameHeight = 840;
const cols = 8;

function isBackgroundPixel(r, g, b) {
  const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
  if (maxDiff > 8) return false;
  return (r >= 220 && g >= 220 && b >= 220);
}

async function checkFrameBoundary(frameIdx) {
  const col = frameIdx % cols;
  const row = Math.floor(frameIdx / cols);

  const left = col * frameWidth;
  const top = row * frameHeight;

  const raw = await sharp(spriteSheetPath)
    .extract({ left, top, width: frameWidth, height: frameHeight })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const buffer = raw.data;
  const width = raw.info.width;
  const height = raw.info.height;

  let nonBgList = [];

  const checkPixel = (x, y, borderName) => {
    const idx = (y * width + x) * 4;
    const r = buffer[idx];
    const g = buffer[idx+1];
    const b = buffer[idx+2];
    if (!isBackgroundPixel(r, g, b)) {
      nonBgList.push({ x, y, r, g, b, borderName });
    }
  };

  // Top
  for (let x = 0; x < width; x++) checkPixel(x, 0, 'top');
  // Bottom
  for (let x = 0; x < width; x++) checkPixel(x, height - 1, 'bottom');
  // Left
  for (let y = 1; y < height - 1; y++) checkPixel(0, y, 'left');
  // Right
  for (let y = 1; y < height - 1; y++) checkPixel(width - 1, y, 'right');

  console.log(`\nFrame ${frameIdx} Non-BG boundary pixels: ${nonBgList.length}`);
  if (nonBgList.length > 0) {
    const borders = {};
    for (const p of nonBgList) {
      borders[p.borderName] = (borders[p.borderName] || 0) + 1;
    }
    console.log('By border:', borders);
    console.log('Sample non-BG pixels:', nonBgList.slice(0, 10));
  }
}

async function main() {
  await checkFrameBoundary(3);
  await checkFrameBoundary(4);
  await checkFrameBoundary(8);
  await checkFrameBoundary(11);
}

main();
