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
  const width = raw.info.width;

  console.log('Top row sample pixels (every 50th pixel):');
  for (let x = 0; x < width; x += 50) {
    const idx = x * 4;
    console.log(`x=${x}: R=${buffer[idx]}, G=${buffer[idx+1]}, B=${buffer[idx+2]}`);
  }

  console.log('\nColumn 0 sample pixels (every 50th pixel):');
  for (let y = 0; y < frameHeight; y += 50) {
    const idx = (y * width) * 4;
    console.log(`y=${y}: R=${buffer[idx]}, G=${buffer[idx+1]}, B=${buffer[idx+2]}`);
  }
}

main();
