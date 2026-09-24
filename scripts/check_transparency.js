import sharp from 'sharp';

const spriteSheetPath = 'd:/0. 개인/0D. 학습/바이브코딩/똥홈런게임/Referenc picture/Poop_start.png';

async function main() {
  const metadata = await sharp(spriteSheetPath).metadata();
  console.log(`Has alpha channel: ${metadata.hasAlpha}`);

  const raw = await sharp(spriteSheetPath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const buffer = raw.data;
  let transparentPixels = 0;
  for (let i = 3; i < buffer.length; i += 4) {
    if (buffer[i] < 255) {
      transparentPixels++;
    }
  }

  console.log(`Total pixels: ${buffer.length / 4}`);
  console.log(`Transparent pixels (A < 255): ${transparentPixels}`);
}

main().catch(err => {
  console.error(err);
});
