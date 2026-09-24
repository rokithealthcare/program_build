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
  console.log('Sample pixels from top-left:');
  for (let i = 0; i < 10; i++) {
    const idx = i * 4;
    console.log(`Pixel ${i}: R=${buffer[idx]}, G=${buffer[idx+1]}, B=${buffer[idx+2]}, A=${buffer[idx+3]}`);
  }
}

main();
