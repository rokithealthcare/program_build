import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const spriteSheetPath = 'd:/0. 개인/0D. 학습/바이브코딩/똥홈런게임/Referenc picture/Poop_start.png';
const frameWidth = 840;
const frameHeight = 840;

function isBackgroundPixel(r, g, b) {
  const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
  if (maxDiff > 8) return false;
  return (r >= 220 && g >= 220 && b >= 220);
}

async function main() {
  const raw = await sharp(spriteSheetPath)
    .extract({ left: 0, top: 0, width: frameWidth, height: frameHeight })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const buffer = raw.data;
  const width = raw.info.width;
  const height = raw.info.height;

  // Visited array for BFS
  const visited = new Uint8Array(width * height);
  const queue = [];

  const enqueue = (x, y) => {
    const idx = y * width + x;
    if (visited[idx]) return;
    visited[idx] = 1;
    queue.push(idx);
  };

  // 1. Initialize queue with boundary pixels that match background
  for (let x = 0; x < width; x++) {
    const topIdx = 0 * width + x;
    if (isBackgroundPixel(buffer[topIdx * 4], buffer[topIdx * 4 + 1], buffer[topIdx * 4 + 2])) {
      enqueue(x, 0);
    }
    const botIdx = (height - 1) * width + x;
    if (isBackgroundPixel(buffer[botIdx * 4], buffer[botIdx * 4 + 1], buffer[botIdx * 4 + 2])) {
      enqueue(x, height - 1);
    }
  }

  for (let y = 1; y < height - 1; y++) {
    const leftIdx = y * width + 0;
    if (isBackgroundPixel(buffer[leftIdx * 4], buffer[leftIdx * 4 + 1], buffer[leftIdx * 4 + 2])) {
      enqueue(0, y);
    }
    const rightIdx = y * width + (width - 1);
    if (isBackgroundPixel(buffer[rightIdx * 4], buffer[rightIdx * 4 + 1], buffer[rightIdx * 4 + 2])) {
      enqueue(width - 1, y);
    }
  }

  // 2. BFS
  let head = 0;
  while (head < queue.length) {
    const currIdx = queue[head++];
    const cx = currIdx % width;
    const cy = Math.floor(currIdx / width);

    const neighbors = [
      [cx - 1, cy],
      [cx + 1, cy],
      [cx, cy - 1],
      [cx, cy + 1]
    ];

    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nIdx = ny * width + nx;
        if (!visited[nIdx]) {
          const r = buffer[nIdx * 4];
          const g = buffer[nIdx * 4 + 1];
          const b = buffer[nIdx * 4 + 2];
          if (isBackgroundPixel(r, g, b)) {
            enqueue(nx, ny);
          }
        }
      }
    }
  }

  console.log(`BFS finished. Visited (background) pixels: ${queue.length} / ${width * height} (${(queue.length / (width * height) * 100).toFixed(2)}%)`);

  // 3. Create transparent output buffer
  const outBuffer = Buffer.alloc(width * height * 4);
  let minX = width, maxX = 0, minY = height, maxY = 0;
  let nonBgCount = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const srcOffset = idx * 4;
      const outOffset = idx * 4;

      if (visited[idx]) {
        // Transparent background
        outBuffer[outOffset] = 0;
        outBuffer[outOffset + 1] = 0;
        outBuffer[outOffset + 2] = 0;
        outBuffer[outOffset + 3] = 0;
      } else {
        // Keep character pixel
        outBuffer[outOffset] = buffer[srcOffset];
        outBuffer[outOffset + 1] = buffer[srcOffset + 1];
        outBuffer[outOffset + 2] = buffer[srcOffset + 2];
        outBuffer[outOffset + 3] = 255; // Fully opaque

        nonBgCount++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  console.log(`Character bounds after floodfill: X=[${minX}, ${maxX}] (W=${maxX - minX + 1}), Y=[${minY}, ${maxY}] (H=${maxY - minY + 1})`);
  console.log(`Non-background pixels: ${nonBgCount}`);

  // Save the result using sharp
  const outDir = 'd:/0. 개인/0D. 학습/바이브코딩/똥홈런게임/assets/art/characters/child/animation/poop_start';
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  await sharp(outBuffer, { raw: { width, height, channels: 4 } })
    .png()
    .toFile(path.join(outDir, 'test_floodfill.png'));

  console.log('Saved test_floodfill.png to assets directory.');
}

main().catch(err => {
  console.error(err);
});
