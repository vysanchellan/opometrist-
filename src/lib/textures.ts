import * as THREE from 'three';

/** Deterministic PRNG so the eye looks the same on every visit. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const canvas = (w: number, h: number) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('2D canvas unavailable');
  return { c, ctx };
};

/**
 * Sclera colour map. x = around the eye, y = from the limbus (top) to the back pole (bottom),
 * matching a sphere whose front cap was cut away and rotated to face +Z.
 */
export function makeScleraTexture(size = 1024) {
  const W = size;
  const H = size / 2;
  const { c, ctx } = canvas(W, H);
  const rand = rng(7);

  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#b9b8b6');
  g.addColorStop(0.035, '#ebe6de');
  g.addColorStop(0.12, '#f6f2ec');
  g.addColorStop(0.45, '#f1e7e0');
  g.addColorStop(0.8, '#e6cfc6');
  g.addColorStop(1, '#cfa9a0');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // soft blotches (subsurface-ish variation)
  for (let i = 0; i < 90; i++) {
    const x = rand() * W;
    const y = H * (0.15 + rand() * 0.85);
    const r = 20 + rand() * 70;
    const rg = ctx.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, `rgba(${200 + rand() * 40},${150 + rand() * 40},${140 + rand() * 30},0.12)`);
    rg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = rg;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // Vessels are collected as polylines and stroked in short runs (one draw call per run,
  // not per segment) — ~25× fewer canvas calls, so this stays cheap on mid-range phones.
  const strokeRun = (pts: number[], width: number, alpha: number) => {
    const minX = Math.min(...pts.filter((_, i) => i % 2 === 0));
    const maxX = Math.max(...pts.filter((_, i) => i % 2 === 0));
    const offsets = [0, ...(minX < 8 ? [W] : []), ...(maxX > W - 8 ? [-W] : [])];
    ctx.strokeStyle = `rgba(${150 + rand() * 40},${30 + rand() * 25},${35 + rand() * 20},${alpha})`;
    ctx.lineWidth = width;
    for (const dx of offsets) {
      ctx.beginPath();
      ctx.moveTo(pts[0]! + dx, pts[1]!);
      for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i]! + dx, pts[i + 1]!);
      ctx.stroke();
    }
  };

  const vessel = (x: number, y: number, ang: number, w: number, depth: number) => {
    let px = x;
    let py = y;
    let a = ang;
    let width = w;
    let run: number[] = [px, py];
    const steps = 40 + rand() * 50;
    for (let i = 0; i < steps && py > H * 0.035; i++) {
      a += (rand() - 0.5) * 0.5;
      // bias the vessel towards the limbus (upwards)
      a = a * 0.9 + (-Math.PI / 2) * 0.1;
      px += Math.cos(a) * 4;
      py += Math.sin(a) * 4;
      run.push(px, py);
      width *= 0.985;
      if (run.length >= 16) {
        strokeRun(run, width, 0.16 + 0.32 * (1 - py / H) * (width / 2.2));
        run = [px, py];
      }
      if (depth < 3 && rand() < 0.06)
        vessel(px, py, a + (rand() < 0.5 ? -1 : 1) * (0.5 + rand() * 0.6), width * 0.7, depth + 1);
    }
    if (run.length > 2) strokeRun(run, width, 0.16 + 0.32 * (1 - py / H) * (width / 2.2));
  };
  ctx.lineCap = 'round';
  for (let i = 0; i < 46; i++) {
    vessel(
      rand() * W,
      H * (0.3 + rand() * 0.55),
      -Math.PI / 2 + (rand() - 0.5) * 0.8,
      1.2 + rand() * 1.4,
      0,
    );
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}

export const RETINA_DISC = { x: -0.34, y: 0.03 };
export const RETINA_MACULA = { x: 0.06, y: -0.01 };

/** Retinal vessel tree. R = vessel, G = distance along tree (0–1), B = calibre. */
export function makeVeinTexture(size = 1024) {
  const S = size;
  const { c, ctx } = canvas(S, S);
  const rand = rng(21);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, S, S);
  ctx.globalCompositeOperation = 'lighten';
  ctx.lineCap = 'round';
  const px = (u: number) => (u * 0.5 + 0.5) * S;
  const py = (v: number) => (1 - (v * 0.5 + 0.5)) * S;
  const MAX = 1.7;

  const grow = (
    x: number,
    y: number,
    ang: number,
    w: number,
    len: number,
    dist: number,
    depth: number,
    curv: number,
  ) => {
    const step = 0.012;
    let a = ang;
    let d = dist;
    let width = w;
    let cx = x;
    let cy = y;
    const n = Math.floor(len / step);
    for (let i = 0; i < n; i++) {
      a += curv * step + (rand() - 0.5) * 0.18;
      const nx = cx + Math.cos(a) * step;
      const ny = cy + Math.sin(a) * step;
      // keep vessels away from the fovea
      const mx = nx - RETINA_MACULA.x;
      const my = ny - RETINA_MACULA.y;
      if (mx * mx + my * my < 0.012 + depth * 0.002) break;
      if (nx * nx + ny * ny > 1.02) break;
      const gch = Math.min(255, Math.floor((d / MAX) * 255));
      const bch = Math.floor(Math.min(1, width / 0.02) * 255);
      ctx.strokeStyle = `rgb(255,${gch},${bch})`;
      ctx.lineWidth = Math.max(1, width * S * 0.5);
      ctx.beginPath();
      ctx.moveTo(px(cx), py(cy));
      ctx.lineTo(px(nx), py(ny));
      ctx.stroke();
      cx = nx;
      cy = ny;
      d += step;
      width *= 0.994;
      if (depth < 5 && rand() < 0.05 + depth * 0.012) {
        const side = rand() < 0.5 ? -1 : 1;
        grow(
          cx,
          cy,
          a + side * (0.5 + rand() * 0.6),
          width * 0.68,
          len * (0.35 + rand() * 0.3),
          d,
          depth + 1,
          curv * 0.4 + side * rand() * 0.6,
        );
      }
    }
  };

  const D = RETINA_DISC;
  const mains: [number, number, number, number][] = [
    // angle, curvature, length, width
    [1.15, -1.25, 1.45, 0.022],
    [1.25, -1.2, 1.4, 0.016],
    [-1.15, 1.25, 1.45, 0.022],
    [-1.25, 1.2, 1.4, 0.016],
    [2.0, 0.35, 0.85, 0.016],
    [-2.0, -0.35, 0.85, 0.016],
    [2.8, 0.15, 0.65, 0.012],
    [-2.8, -0.15, 0.65, 0.012],
    [0.15, -0.3, 0.32, 0.007],
    [-0.15, 0.3, 0.32, 0.007],
  ];
  for (const [a, cv, len, w] of mains) grow(D.x, D.y, a, w, len, 0, 0, cv);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.NoColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** Letters seen through the floating lens (Scene 4 focus pull). */
export function makeFocusTexture(size = 1024, color = '#F6F3EE') {
  const { c, ctx } = canvas(size, size);
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const rows: [string, number][] = [
    ['E', 0.3],
    ['F  P', 0.15],
    ['T  O  Z', 0.1],
    ['L  P  E  D', 0.072],
  ];
  let y = size * 0.24;
  for (const [txt, s] of rows) {
    ctx.font = `700 ${Math.round(size * s)}px "Helvetica Neue", Arial, sans-serif`;
    ctx.fillText(txt, size / 2, y);
    y += size * s * 1.25 + size * 0.03;
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  return tex;
}
