import sharp from 'sharp';

const spriteSheetPath = 'd:/0. 개인/0D. 학습/바이브코딩/똥홈런게임/Referenc picture/Poop_start.png';
const frameWidth = 840;
const frameHeight = 840;

function isBackgroundPixel(r, g, b) {
  // If color is close to white:
  if (r >= 240 && g >= 240 && b >= 240) {
    return true;
  }
  // If color is close to light gray:
  if (r >= 220 && g >= 220 && b >= 220) {
    const diffRG = Math.abs(r - g);
    const diffGB = Math.abs(g - b);
    const diffRB = Math.abs(r - b);
    if (diffRG <= 5 && diffGB <= 5 && diffRB <= 5) {
      return true;
    }
  }
  return false;
}

async function main() {
  const raw = await sharp(spriteSheetPath)
    .extract({ left: 0, top: 0, width: frameWidth, height: frameHeight })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const buffer = raw.data;
  const width = raw.info.width;
  const height = raw.info.height;

  let totalBoundaryPixels = 0;
  let classifiedAsBackground = 0;

  const checkPixel = (x, y) => {
    totalBoundaryPixels++;
    const idx = (y * width + x) * 4;
    const r = buffer[idx];
    const g = buffer[idx+1];
    const b = buffer[idx+2];
    if (isBackgroundPixel(r, g, b)) {
      classifiedAsBackground++;
    } else {
      console.log(`Non-bg boundary pixel at x=${x}, y=${y}: R=${r}, G=${g}, B=${b}`);
    }
  };

  // Check top and bottom
  for (let x = 0; x < width; x++) {
    checkPixel(x, 0);
    checkPixel(x, height - 1);
  }
  // Check left and right (excluding corners already checked)
  for (let y = 1; y < height - 1; y++) {
    checkPixel(0, y);
    checkPixel(width - 1, y);
  }

  console.log(`Boundary classification: ${classifiedAsBackground} / ${totalBoundaryPixels} (${(classifiedAsBackground/totalBoundaryPixels*100).toFixed(2)}%)`);
}

main();
