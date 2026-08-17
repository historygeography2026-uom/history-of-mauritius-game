const fs = require('fs');
const { PNG } = require('pngjs');

const inputPath = 'public/images/dodo-mascot.png';
const outputPath = 'public/images/dodo-mascot.png';

fs.createReadStream(inputPath)
  .pipe(new PNG({ filterType: 4 }))
  .on('parsed', function() {
    console.log(`Image size: ${this.width} x ${this.height}`);

    const width = this.width;
    const height = this.height;
    const data = this.data;

    // Use flood fill from the borders to remove background while preserving any white details inside the mascot
    const visited = new Uint8Array(width * height);
    const queue = [];

    // Helper to get index
    function getIdx(x, y) {
      return (y * width + x) * 4;
    }

    // Helper to check if a pixel is background-like (white/near-white)
    function isWhite(x, y) {
      const idx = getIdx(x, y);
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];
      if (a < 50) return true; // already transparent
      // White threshold: if all channels are > 235 and standard deviation between channels is low (near neutral white)
      const minVal = Math.min(r, g, b);
      const maxVal = Math.max(r, g, b);
      return minVal > 230 && (maxVal - minVal) < 25;
    }

    // Seed from all 4 borders
    for (let x = 0; x < width; x++) {
      if (isWhite(x, 0)) { queue.push(x, 0); visited[0 * width + x] = 1; }
      if (isWhite(x, height - 1)) { queue.push(x, height - 1); visited[(height - 1) * width + x] = 1; }
    }
    for (let y = 0; y < height; y++) {
      if (isWhite(0, y)) { queue.push(0, y); visited[y * width + 0] = 1; }
      if (isWhite(width - 1, y)) { queue.push(width - 1, y); visited[y * width + (width - 1)] = 1; }
    }

    // BFS Flood Fill
    let head = 0;
    while (head < queue.length) {
      const cx = queue[head++];
      const cy = queue[head++];

      const idx = getIdx(cx, cy);
      // Make transparent
      data[idx + 3] = 0;

      const neighbors = [
        [cx + 1, cy],
        [cx - 1, cy],
        [cx, cy + 1],
        [cx, cy - 1]
      ];

      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const nVisitedIdx = ny * width + nx;
          if (!visited[nVisitedIdx]) {
            visited[nVisitedIdx] = 1;
            if (isWhite(nx, ny)) {
              queue.push(nx, ny);
            }
          }
        }
      }
    }

    // Post-process: smooth outer edge pixels (feathering)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = getIdx(x, y);
        if (data[idx + 3] > 0) {
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const minVal = Math.min(r, g, b);
          // If it's very close to white on edge (e.g. 210-245)
          if (minVal > 210) {
            // Check if any neighboring pixel is transparent
            let hasTransparentNeighbor = false;
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                  if (data[getIdx(nx, ny) + 3] === 0) {
                    hasTransparentNeighbor = true;
                    break;
                  }
                }
              }
              if (hasTransparentNeighbor) break;
            }
            if (hasTransparentNeighbor) {
              // Fade alpha proportionally to remove white halo
              const alphaFactor = Math.max(0, (255 - minVal) / 45);
              data[idx + 3] = Math.round(data[idx + 3] * alphaFactor);
            }
          }
        }
      }
    }

    const outStream = fs.createWriteStream(outputPath);
    this.pack().pipe(outStream);
    outStream.on('finish', () => {
      console.log('Successfully made dodo mascot background 100% transparent!');
    });
  });
