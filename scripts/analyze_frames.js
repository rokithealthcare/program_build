import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const spriteSheetPath = 'd:/0. 개인/0D. 학습/바이브코딩/똥홈런게임/Referenc picture/Poop_start.png';
const frameWidth = 840;
const frameHeight = 840;
const cols = 8;
const totalFrames = 32;

function isBackgroundPixel(r, g, b) {
  const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
  if (maxDiff > 8) return false;
  return (r >= 220 && g >= 220 && b >= 220);
}

async function main() {
  console.log(`Analyzing spritesheet: ${spriteSheetPath}`);

  let minXUnion = frameWidth;
  let maxXUnion = 0;
  let minYUnion = frameHeight;
  let maxYUnion = 0;

  const frameBounds = [];

  for (let i = 0; i < totalFrames; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);

    const left = col * frameWidth;
    const top = row * frameHeight;

    // Extract frame pixels as raw buffer
    const raw = await sharp(spriteSheetPath)
      .extract({ left, top, width: frameWidth, height: frameHeight })
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

    let minX = width;
    let maxX = 0;
    let minY = height;
    let maxY = 0;
    let hasPixels = false;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (!visited[idx]) {
          hasPixels = true;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (hasPixels) {
      frameBounds.push({ frameIndex: i, minX, maxX, minY, maxY });
      if (minX < minXUnion) minXUnion = minX;
      if (maxX > maxXUnion) maxXUnion = maxX;
      if (minY < minYUnion) minYUnion = minY;
      if (maxY > maxYUnion) maxYUnion = maxY;
    } else {
      console.log(`Frame ${i} is completely transparent!`);
    }
  }

  console.log('\n--- Individual Frame Bounds ---');
  for (const b of frameBounds) {
    console.log(`Frame ${b.frameIndex.toString().padStart(2, '0')}: X=[${b.minX}, ${b.maxX}] (W=${b.maxX - b.minX + 1}), Y=[${b.minY}, ${b.maxY}] (H=${b.maxY - b.minY + 1})`);
  }

  console.log('\n--- Union Bounds ---');
  console.log(`X: [${minXUnion}, ${maxXUnion}], Width: ${maxXUnion - minXUnion + 1}`);
  console.log(`Y: [${minYUnion}, ${maxYUnion}], Height: ${maxYUnion - minYUnion + 1}`);

  // Calculate centered-crop horizontally, and align to bottom vertically
  // If we center the crop horizontally around 420:
  const originalCenterX = 420;
  const maxDistFromCenter = Math.max(originalCenterX - minXUnion, maxXUnion - originalCenterX);
  console.log(`\nMax horizontal distance from original center (420): ${maxDistFromCenter}`);
  console.log(`Symmetric Horizontal Crop: X = [${originalCenterX - maxDistFromCenter}, ${originalCenterX + maxDistFromCenter}]`);
  console.log(`Symmetric Width: ${2 * maxDistFromCenter + 1}`);
  console.log(`Vertical Crop (keeping bottom at 840 to preserve bottom-alignment): Y = [${minYUnion}, 840], Height = ${840 - minYUnion}`);
}

main().catch(err => {
  console.error(err);
});
