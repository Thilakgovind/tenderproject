/**
 * Flood-fills the dark night sky from the top of the Ripon Building image
 * and returns a transparent-sky PNG data URL with softly feathered edges
 * so the Ripon Building cleanly masks the hero typography in frontal view.
 */
export function createRiponForegroundMask(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      if (!w || !h) {
        reject(new Error('Image has zero dimensions'));
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('2D context unavailable'));
        return;
      }

      ctx.drawImage(img, 0, 0, w, h);
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;
      const total = w * h;

      // Classify dark, low-chroma night sky pixels
      const isSkyCandidate = (idx4: number): boolean => {
        const r = data[idx4];
        const g = data[idx4 + 1];
        const b = data[idx4 + 2];
        const maxC = Math.max(r, g, b);
        const minC = Math.min(r, g, b);
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        const chroma = maxC - minC;
        return lum < 52 && chroma < 24;
      };

      const visited = new Uint8Array(total);
      const isSky = new Uint8Array(total);
      const queue = new Int32Array(total);
      let head = 0;
      let tail = 0;

      const pushIfSky = (x: number, y: number) => {
        const p = y * w + x;
        if (visited[p]) return;
        visited[p] = 1;
        if (isSkyCandidate(p * 4)) {
          isSky[p] = 1;
          queue[tail++] = p;
        }
      };

      // Seed top edge across full width
      for (let x = 0; x < w; x++) {
        pushIfSky(x, 0);
      }

      // Seed upper left & right flanks above the roofline
      const maxLeftY = Math.floor(h * 0.28);
      for (let y = 0; y < maxLeftY; y++) {
        pushIfSky(0, y);
      }
      const maxRightY = Math.floor(h * 0.44);
      for (let y = 0; y < maxRightY; y++) {
        pushIfSky(w - 1, y);
      }

      // 4-connected BFS flood fill
      while (head < tail) {
        const p = queue[head++];
        const x = p % w;
        const y = (p - x) / w;

        if (x > 0) pushIfSky(x - 1, y);
        if (x < w - 1) pushIfSky(x + 1, y);
        if (y > 0) pushIfSky(x, y - 1);
        if (y < h - 1) pushIfSky(x, y + 1);
      }

      // Apply smooth 2px alpha feather along the sky/building boundary
      const alphaMap = new Uint8ClampedArray(total);
      for (let i = 0; i < total; i++) {
        alphaMap[i] = isSky[i] ? 0 : 255;
      }

      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const p = y * w + x;
          if (isSky[p]) continue;

          // Check 1-px and 2-px sky neighbors for smooth anti-aliased edge
          let skyNeighbors = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              if (isSky[(y + dy) * w + (x + dx)]) {
                skyNeighbors++;
              }
            }
          }

          if (skyNeighbors > 0) {
            const idx4 = p * 4;
            const lum = 0.299 * data[idx4] + 0.587 * data[idx4 + 1] + 0.114 * data[idx4 + 2];
            const chroma =
              Math.max(data[idx4], data[idx4 + 1], data[idx4 + 2]) -
              Math.min(data[idx4], data[idx4 + 1], data[idx4 + 2]);
            // Fade boundary fringe gently while keeping bright spire/LED signs crisp
            const edgeWeight = Math.max(0.25, 1 - skyNeighbors * 0.11);
            const brightnessBoost = lum > 80 || chroma > 35 ? 1 : edgeWeight;
            alphaMap[p] = Math.round(255 * brightnessBoost);
          }
        }
      }

      for (let i = 0; i < total; i++) {
        data[i * 4 + 3] = alphaMap[i];
      }

      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => reject(new Error('Failed to load Ripon Building image'));
    img.src = src;
  });
}
