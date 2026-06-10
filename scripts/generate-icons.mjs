// Brand icon generator — rasterizes the ThrowingTracker mark (orange gradient
// tile + white throwing ring / sector lines / trajectory / shot) directly to
// PNG with zero dependencies (node:zlib only). SVG icons can't cover iOS
// home-screen or maskable-Android slots, hence baked PNGs.
//
// Usage: node scripts/generate-icons.mjs   (writes into /public)

import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PUBLIC = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

// ---- Brand art, in the 48-unit space of the source SVG ----------------------
const ORANGE_A = [0xff, 0x5a, 0x1f]; // --color-orange
const ORANGE_B = [0xcf, 0x40, 0x15]; // --color-orange-ink
const TILE_RADIUS = 10; // rx of the rounded tile, in art units

const RING = { cx: 24, cy: 32, r: 5, w: 1.5, alpha: 0.8 };
const SECTORS = [
  { x1: 24, y1: 32, x2: 16, y2: 10, w: 1.5, alpha: 0.6 },
  { x1: 24, y1: 32, x2: 32, y2: 10, w: 1.5, alpha: 0.6 },
];
const TRAJ = { p0: [24, 30], p1: [20, 16], p2: [28, 12], w: 2.5, alpha: 1 };
const BALL = { cx: 28, cy: 12, r: 3.5, alpha: 1 };

// Pre-sample the quadratic trajectory into segments once.
const TRAJ_SEGS = [];
{
  const pts = [];
  for (let i = 0; i <= 64; i++) {
    const t = i / 64;
    const a = (1 - t) * (1 - t), b = 2 * (1 - t) * t, c = t * t;
    pts.push([
      a * TRAJ.p0[0] + b * TRAJ.p1[0] + c * TRAJ.p2[0],
      a * TRAJ.p0[1] + b * TRAJ.p1[1] + c * TRAJ.p2[1],
    ]);
  }
  for (let i = 0; i < pts.length - 1; i++) TRAJ_SEGS.push([pts[i], pts[i + 1]]);
}

function distSeg(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const lenSq = dx * dx + dy * dy || 1e-9;
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const ex = px - (x1 + t * dx), ey = py - (y1 + t * dy);
  return Math.hypot(ex, ey);
}

/** White-overlay alpha of the mark at an art-space point. */
function markAlpha(u, v) {
  let a = 0;
  for (const s of SECTORS) {
    if (distSeg(u, v, s.x1, s.y1, s.x2, s.y2) <= s.w / 2) a = Math.max(a, s.alpha);
  }
  const dRing = Math.abs(Math.hypot(u - RING.cx, v - RING.cy) - RING.r);
  if (dRing <= RING.w / 2) a = Math.max(a, RING.alpha);
  for (const [[x1, y1], [x2, y2]] of TRAJ_SEGS) {
    if (distSeg(u, v, x1, y1, x2, y2) <= TRAJ.w / 2) { a = Math.max(a, TRAJ.alpha); break; }
  }
  if (Math.hypot(u - BALL.cx, v - BALL.cy) <= BALL.r) a = Math.max(a, BALL.alpha);
  return a;
}

/** Coverage of the rounded tile (1 inside, 0 outside) at an art-space point. */
function tileCoverage(u, v, rounded) {
  if (!rounded) return 1;
  const r = TILE_RADIUS;
  const qx = Math.abs(u - 24) - (24 - r);
  const qy = Math.abs(v - 24) - (24 - r);
  const d = Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
  return d <= 0 ? 1 : 0;
}

/**
 * Render one icon.
 *  - rounded: transparent rounded-tile corners (purpose "any" icons)
 *  - artScale: shrink art around center (maskable safe zone / apple breathing room)
 *  - opaque:  no alpha relief at all (apple-touch-icon)
 */
function render(size, { rounded = true, artScale = 1, opaque = false } = {}) {
  const SS = 3; // supersample factor (AA)
  const big = size * SS;
  const px = Buffer.alloc(size * size * 4);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let rAcc = 0, gAcc = 0, bAcc = 0, aAcc = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          // sample center in art space
          const fx = (x * SS + sx + 0.5) / big;
          const fy = (y * SS + sy + 0.5) / big;
          let u = fx * 48, v = fy * 48;
          // scale art toward center (safe zone)
          u = 24 + (u - 24) / artScale;
          v = 24 + (v - 24) / artScale;

          const cov = opaque ? 1 : tileCoverage(fx * 48, fy * 48, rounded);
          if (cov === 0) continue; // transparent sample

          // gradient along the tile diagonal (use untransformed coords)
          const t = Math.max(0, Math.min(1, (fx * 48 + fy * 48) / 96));
          let cr = ORANGE_A[0] + (ORANGE_B[0] - ORANGE_A[0]) * t;
          let cg = ORANGE_A[1] + (ORANGE_B[1] - ORANGE_A[1]) * t;
          let cb = ORANGE_A[2] + (ORANGE_B[2] - ORANGE_A[2]) * t;

          const wa = markAlpha(u, v);
          if (wa > 0) {
            cr = 255 * wa + cr * (1 - wa);
            cg = 255 * wa + cg * (1 - wa);
            cb = 255 * wa + cb * (1 - wa);
          }
          rAcc += cr; gAcc += cg; bAcc += cb; aAcc += 255;
        }
      }
      const n = SS * SS;
      const i = (y * size + x) * 4;
      const alpha = aAcc / n;
      // premultiply-style average: color samples only exist where covered
      const w = aAcc > 0 ? aAcc / 255 : 1;
      px[i] = Math.round(rAcc / w);
      px[i + 1] = Math.round(gAcc / w);
      px[i + 2] = Math.round(bAcc / w);
      px[i + 3] = Math.round(alpha);
    }
  }
  return encodePNG(size, size, px);
}

// ---- Minimal PNG encoder (8-bit RGBA, filter 0) ------------------------------
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const out = Buffer.alloc(8 + data.length + 4);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'ascii');
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}

function encodePNG(width, height, rgba) {
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---- Outputs -----------------------------------------------------------------
const FILES = [
  ['icon-192.png', render(192)],
  ['icon-512.png', render(512)],
  // maskable: full-bleed background, art inside the ~80% safe zone
  ['icon-maskable-192.png', render(192, { rounded: false, artScale: 0.78 })],
  ['icon-maskable-512.png', render(512, { rounded: false, artScale: 0.78 })],
  // apple-touch-icon: opaque full-bleed; iOS applies its own corner mask
  ['apple-touch-icon.png', render(180, { opaque: true, artScale: 0.92 })],
];

for (const [name, buf] of FILES) {
  writeFileSync(join(PUBLIC, name), buf);
  console.log(`wrote public/${name} (${(buf.length / 1024).toFixed(1)} KB)`);
}
