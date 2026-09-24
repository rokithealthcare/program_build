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

async function analyzeHorizontalDensity(frameIdx) {
  const col = frameIdx % cols;
  const row = Math.floor(frameIdx / cols);

  const raw = await sharp(spriteSheetPath)
    .extract({ left: col * frameWidth, top: row * frameHeight, width: frameWidth, height: frameHeight })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const buffer = raw.data;
  const width = raw.info.width;
  const height = raw.info.height;

  const density = new Array(width).fill(0);

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const idx = (y * width + x) * 4;
      if (!isBackgroundPixel(buffer[idx], buffer[idx+1], buffer[idx+2])) {
        density[x]++;
      }
    }
  }

  // Find continuous non-zero regions
  console.log(`\n--- Horizontal Density for Frame ${frameIdx} ---`);
  let inRegion = false;
  let startX = -1;
  for (let x = 0; x < width; x++) {
    if (density[x] > 0) {
      if (!inRegion) {
        startX = x;
        inRegion = true;
      }
    } else {
      if (inRegion) {
        console.log(`Region: x = [${startX}, ${x - 1}], width = ${x - startX}, max density = ${Math.max(...density.slice(startX, x))}`);
        inRegion = false;
      }
    }
  }
  if (inRegion) {
    console.log(`Region: x = [${startX}, ${width - 1}], width = ${width - startX}, max density = ${Math.max(...density.slice(startX))}`);
  }
}

async function main() {
  await analyzeHorizontalDensity(3);
  await analyzeHorizontalDensity(4);
  await analyzeHorizontalDensity(8);
  await analyzeHorizontalDensity(11);
}

main();
