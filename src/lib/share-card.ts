'use client';

// Share cards — renders a 1080x1920 (IG-story) branded card on a canvas and
// hands it to the native share sheet (navigator.share with files), falling
// back to a PNG download on desktop / unsupported browsers. This is the
// "every PR becomes a post" growth loop.

export interface ShareCardData {
  /** Small mono kicker above the headline, e.g. "NEW PR" / "MY WEEK". */
  title: string;
  /** The huge display line, e.g. `57' 3.25"` or `17.45 m`. */
  headline: string;
  /** Line under the headline, e.g. "Shot Put · Jun 10, 2026". */
  sub: string;
  /** Optional extra stat lines (kept short). */
  lines?: string[];
  /** Athlete name, rendered above the footer. */
  athlete?: string;
  /** Accent for the headline underline + delta lines: 'orange' | 'pb'. */
  accent?: 'orange' | 'pb';
}

const W = 1080;
const H = 1920;
const ORANGE = '#FF5A1F';
const ORANGE_DEEP = '#CF4015';
const PB_LIME = '#C8FF00';
const INK = '#0A0A0B';
const INK_SOFT = '#16161A';
const FG = '#FFFFFF';
const FG_MUTED = '#A1A1AA';

/** Resolve the concrete (next/font-mangled) family list behind a CSS var. */
function resolveFamily(cssVar: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback;
  const probe = document.createElement('span');
  probe.style.fontFamily = `var(${cssVar})`;
  probe.style.position = 'absolute';
  probe.style.visibility = 'hidden';
  document.body.appendChild(probe);
  const fam = getComputedStyle(probe).fontFamily;
  probe.remove();
  return fam || fallback;
}

function drawLogoMark(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  // The brand mark (ring / sector / trajectory / ball) in 48-unit art space.
  const u = (n: number) => x + (n / 48) * s;
  const v = (n: number) => y + (n / 48) * s;
  const w = (n: number) => (n / 48) * s;

  ctx.save();
  ctx.strokeStyle = FG;
  ctx.fillStyle = FG;
  ctx.lineCap = 'round';

  ctx.globalAlpha = 0.6;
  ctx.lineWidth = w(1.5);
  ctx.beginPath(); ctx.moveTo(u(24), v(32)); ctx.lineTo(u(16), v(10)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(u(24), v(32)); ctx.lineTo(u(32), v(10)); ctx.stroke();

  ctx.globalAlpha = 0.8;
  ctx.beginPath(); ctx.arc(u(24), v(32), w(5), 0, Math.PI * 2); ctx.stroke();

  ctx.globalAlpha = 1;
  ctx.lineWidth = w(2.5);
  ctx.beginPath();
  ctx.moveTo(u(24), v(30));
  ctx.quadraticCurveTo(u(20), v(16), u(28), v(12));
  ctx.stroke();
  ctx.beginPath(); ctx.arc(u(28), v(12), w(3.5), 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

/** Shrink-to-fit a single line of text. Returns the px size actually used. */
function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  family: string,
  maxPx: number,
  maxWidth: number,
  weight = '400',
): number {
  let px = maxPx;
  for (; px > 24; px -= 4) {
    ctx.font = `${weight} ${px}px ${family}`;
    if (ctx.measureText(text).width <= maxWidth) break;
  }
  return px;
}

export async function renderShareCard(data: ShareCardData): Promise<Blob> {
  if (typeof document !== 'undefined' && document.fonts?.ready) {
    try { await document.fonts.ready; } catch { /* draw with what we have */ }
  }

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas 2d unavailable');

  const display = resolveFamily('--font-display', 'Anton, sans-serif');
  const mono = resolveFamily('--font-mono', 'monospace');
  const sans = resolveFamily('--font-sans', 'sans-serif');
  const accent = data.accent === 'pb' ? PB_LIME : ORANGE;

  // ---- Background: ink with a subtle vertical lift + orange energy diagonal
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, INK_SOFT);
  bg.addColorStop(0.45, INK);
  bg.addColorStop(1, INK);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  const diag = ctx.createLinearGradient(W, 0, W - 560, 560);
  diag.addColorStop(0, ORANGE);
  diag.addColorStop(1, ORANGE_DEEP);
  ctx.fillStyle = diag;
  ctx.beginPath();
  ctx.moveTo(W, 0); ctx.lineTo(W - 420, 0); ctx.lineTo(W, 420);
  ctx.closePath();
  ctx.globalAlpha = 0.92;
  ctx.fill();
  ctx.restore();

  // ---- Brand eyebrow
  ctx.fillStyle = ORANGE;
  ctx.font = `600 34px ${mono}`;
  ctx.fillText('◆', 72, 132);
  ctx.fillStyle = FG;
  ctx.fillText('THROWINGTRACKER', 118, 132);

  // ---- Kicker
  ctx.fillStyle = accent;
  ctx.font = `600 52px ${mono}`;
  ctx.fillText(data.title.toUpperCase(), 72, 660);

  // ---- Headline (huge display, shrink to fit)
  ctx.fillStyle = FG;
  const hlPx = fitText(ctx, data.headline, display, 260, W - 144);
  ctx.font = `400 ${hlPx}px ${display}`;
  ctx.fillText(data.headline, 72, 660 + hlPx + 28);
  const afterHeadline = 660 + hlPx + 28;

  // accent underline
  ctx.fillStyle = accent;
  ctx.fillRect(72, afterHeadline + 36, 220, 12);

  // ---- Sub
  ctx.fillStyle = FG_MUTED;
  ctx.font = `500 44px ${sans}`;
  ctx.fillText(data.sub, 72, afterHeadline + 140);

  // ---- Extra lines
  let y = afterHeadline + 240;
  for (const line of data.lines ?? []) {
    ctx.fillStyle = accent;
    ctx.font = `600 40px ${mono}`;
    ctx.fillText(line, 72, y);
    y += 72;
  }

  // ---- Athlete + footer
  if (data.athlete?.trim()) {
    ctx.fillStyle = FG;
    const namePx = fitText(ctx, data.athlete.toUpperCase(), display, 86, W - 380);
    ctx.font = `400 ${namePx}px ${display}`;
    ctx.fillText(data.athlete.toUpperCase(), 72, H - 200);
  }
  ctx.fillStyle = FG_MUTED;
  ctx.font = `500 32px ${mono}`;
  ctx.fillText('throwing-tracker.vercel.app', 72, H - 110);

  drawLogoMark(ctx, W - 220, H - 268, 148);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png');
  });
}

export type ShareOutcome = 'shared' | 'downloaded' | 'failed';

/** Render + hand to the native share sheet, falling back to a download. */
export async function shareCard(data: ShareCardData, filename = 'throwingtracker.png'): Promise<ShareOutcome> {
  let blob: Blob;
  try {
    blob = await renderShareCard(data);
  } catch {
    return 'failed';
  }

  const file = new File([blob], filename, { type: 'image/png' });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (typeof nav.share === 'function' && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], title: data.title });
      return 'shared';
    } catch (e) {
      // user closed the sheet — treat as done, not as a failure to punish
      if ((e as Error)?.name === 'AbortError') return 'shared';
      // otherwise fall through to download
    }
  }

  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    return 'downloaded';
  } catch {
    return 'failed';
  }
}
