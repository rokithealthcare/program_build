import sharp from 'sharp';

const spriteSheetPath = 'd:/0. 개인/0D. 학습/바이브코딩/똥홈런게임/Referenc picture/Poop_start.png';
const frameWidth = 960;
const frameHeight = 960;
const cols = 7;
const totalFrames = 32;

function isBackgroundPixel(r, g, b) {
  const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
  if (maxDiff > 8) return false;
  return (r >= 220 && g >= 220 && b >= 220);
}

async function main() {
  console.log(`Analyzing spritesheet assuming 960x960 frames...`);

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

    for (let x = 0; x < width; x++) {
      const topIdx = 0 * width + x;
      if (isBackgroundPixel(buffer[topIdx * 4], buffer[topIdx * 4 + 1], buffer[topIdx * 4 + 2])) enqueue(x, 0);
      const botIdx = (height - 1) * width + x;
      if (isBackgroundPixel(buffer[botIdx * 4], buffer[botIdx * 4 + 1], buffer[botIdx * 4 + 2])) enqueue(x, height - 1);
    }

    for (let y = 1; y < height - 1; y++) {
      const leftIdx = y * width + 0;
      if (isBackgroundPixel(buffer[leftIdx * 4], buffer[leftIdx * 4 + 1], buffer[leftIdx * 4 + 2])) enqueue(0, y);
      const rightIdx = y * width + (width - 1);
      if (isBackgroundPixel(buffer[rightIdx * 4], buffer[rightIdx * 4 + 1], buffer[rightIdx * 4 + 2])) enqueue(width - 1, y);
    }

    let head = 0;
    while (head < queue.length) {
      const currIdx = queue[head++];
      const cx = currIdx % width;
      const cy = Math.floor(currIdx / width);

      const neighbors = [[cx - 1, cy], [cx + 1, cy], [cx, cy - 1], [cx, cy + 1]];
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

    let minX = width, maxX = 0, minY = height, maxY = 0;
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
    }
  }

  console.log('--- Bounds with 960x960 ---');
  for (const b of frameBounds) {
    console.log(`Frame ${b.frameIndex.toString().padStart(2, '0')}: X=[${b.minX}, ${b.maxX}] (W=${b.maxX - b.minX + 1}), Y=[${b.minY}, ${b.maxY}] (H=${b.maxY - b.minY + 1})`);
  }
}

main().catch(err => console.error(err));
