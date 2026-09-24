import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const spriteSheetPath = 'd:/0. 개인/0D. 학습/바이브코딩/똥홈런게임/Referenc picture/Poop_start.png';
const outDir = 'd:/0. 개인/0D. 학습/바이브코딩/똥홈런게임/assets/art/characters/child/animation/poop_start';

const frameWidth = 960;
const frameHeight = 960;
const cols = 7;
const totalFrames = 32;

// Bounding box dimensions for the final cropped asset
const cropX = 160;
const cropY = 0;
const cropWidth = 640;
const cropHeight = 960;

function isBackgroundPixel(r, g, b) {
  const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
  if (maxDiff > 8) return false;
  return (r >= 220 && g >= 220 && b >= 220);
}

async function extractAndCleanFrames() {
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
    console.log(`Created output directory: ${outDir}`);
  }

  console.log(`Starting extraction of ${totalFrames} frames from spritesheet...`);

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

    // Visited array for BFS flood fill
    const visited = new Uint8Array(width * height);
    const queue = [];

    const enqueue = (x, y) => {
      const idx = y * width + x;
      if (visited[idx]) return;
      visited[idx] = 1;
      queue.push(idx);
    };

    // 1. Initialize BFS queue with boundary pixels matching background
    for (let x = 0; x < width; x++) {
      const topIdx = x; // 0 * width + x
      if (isBackgroundPixel(buffer[topIdx * 4], buffer[topIdx * 4 + 1], buffer[topIdx * 4 + 2])) {
        enqueue(x, 0);
      }
      const botIdx = (height - 1) * width + x;
      if (isBackgroundPixel(buffer[botIdx * 4], buffer[botIdx * 4 + 1], buffer[botIdx * 4 + 2])) {
        enqueue(x, height - 1);
      }
    }

    for (let y = 1; y < height - 1; y++) {
      const leftIdx = y * width;
      if (isBackgroundPixel(buffer[leftIdx * 4], buffer[leftIdx * 4 + 1], buffer[leftIdx * 4 + 2])) {
        enqueue(0, y);
      }
      const rightIdx = y * width + (width - 1);
      if (isBackgroundPixel(buffer[rightIdx * 4], buffer[rightIdx * 4 + 1], buffer[rightIdx * 4 + 2])) {
        enqueue(width - 1, y);
      }
    }

    // 2. Perform BFS to find all connected background pixels
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

    // 3. Create transparent image data buffer (RGBA)
    const outBuffer = Buffer.alloc(width * height * 4);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const offset = idx * 4;

        if (visited[idx]) {
          // Transparent background
          outBuffer[offset] = 0;
          outBuffer[offset + 1] = 0;
          outBuffer[offset + 2] = 0;
          outBuffer[offset + 3] = 0;
        } else {
          // Opaque character pixels
          outBuffer[offset] = buffer[offset];
          outBuffer[offset + 1] = buffer[offset + 1];
          outBuffer[offset + 2] = buffer[offset + 2];
          outBuffer[offset + 3] = 255;
        }
      }
    }

    // 4. Crop the transparent frame to cropX, cropY, cropWidth, cropHeight
    // and save as PNG
    const frameNum = String(i + 1).padStart(3, '0');
    const outFileName = `child_poop_start_${frameNum}.png`;
    const outFilePath = path.join(outDir, outFileName);

    await sharp(outBuffer, { raw: { width, height, channels: 4 } })
      .extract({ left: cropX, top: cropY, width: cropWidth, height: cropHeight })
      .png()
      .toFile(outFilePath);

    console.log(`Saved frame ${frameNum} to ${outFileName} (${cropWidth}x${cropHeight})`);
  }

  console.log('All 32 frames extracted successfully!');
}

extractAndCleanFrames().catch(err => {
  console.error('Error during frame extraction:', err);
  process.exit(1);
});
