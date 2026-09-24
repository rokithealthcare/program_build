import sharp from 'sharp';

const spriteSheetPath = 'd:/0. 개인/0D. 학습/바이브코딩/똥홈런게임/Referenc picture/Poop_start.png';
const frameWidth = 840;
const frameHeight = 840;

async function main() {
  const raw = await sharp(spriteSheetPath)
    .extract({ left: 0, top: 0, width: frameWidth, height: frameHeight })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const buffer = raw.data;
  const colors = {};

  for (let i = 0; i < buffer.length; i += 4) {
    const r = buffer[i];
    const g = buffer[i+1];
    const b = buffer[i+2];
    const key = `${r},${g},${b}`;
    colors[key] = (colors[key] || 0) + 1;
  }

  // Sort colors by frequency
  const sorted = Object.entries(colors).sort((a, b) => b[1] - a[1]);
  console.log('Most frequent colors in Frame 0:');
  for (let i = 0; i < Math.min(20, sorted.length); i++) {
    console.log(`Color [${sorted[i][0]}]: ${sorted[i][1]} pixels (${(sorted[i][1] / (frameWidth * frameHeight) * 100).toFixed(2)}%)`);
  }
}

main();
