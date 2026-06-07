/**
 * Chart theme bridge.
 *
 * Charts (Recharts + raw canvas) need concrete color strings, not CSS vars.
 * This reads the broadcast design tokens out of :root via getComputedStyle so
 * the same chart code reads correctly in BOTH the dark (default) and paper
 * registers — the theme is re-read on demand each render.
 *
 * SSR-safe: when `window`/`document` is undefined we return the dark-register
 * hex literals (dark is the default), so server render and first paint agree.
 */

export interface ChartTheme {
  // Surfaces / structure
  bg: string;        // app background
  surface: string;   // panel / canvas surface
  border: string;    // grid lines / borders
  ring: string;      // canvas distance rings (slightly lighter than border)
  // Text
  fg: string;        // primary foreground
  fgMuted: string;   // axis / legend text (must clear 4.5:1 in both modes)
  // Accents
  lime: string;      // PB / best / accent
  onLime: string;    // text on lime
  positive: string;
  negative: string;
  foul: string;
  // Per-event hues
  event: Record<string, string>;
}

// Dark-register fallbacks (dark is the DEFAULT). Mirror globals.css @theme.
const FALLBACK: ChartTheme = {
  bg: '#0A0A0B',
  surface: '#101013',
  border: '#222228',
  ring: '#2E2E36',
  fg: '#FFFFFF',
  fgMuted: '#A1A1AA',
  lime: '#C8FF00',
  onLime: '#0A0A0B',
  positive: '#4ADE80',
  negative: '#FB7185',
  foul: '#71717A',
  event: {
    'shot-put': '#FF8A3D',
    'discus': '#38BDF8',
    'hammer': '#A78BFA',
    'weight-throw': '#F472B6',
    'javelin': '#2DD4BF',
  },
};

// Memoize per register so we don't pay getComputedStyle on every draw frame.
// Keyed by whether the .dark class is present, since that flips the token set.
let cache: { key: string; theme: ChartTheme } | null = null;

function readVar(style: CSSStyleDeclaration, name: string, fallback: string): string {
  const v = style.getPropertyValue(name).trim();
  return v || fallback;
}

/**
 * Read the live chart theme from CSS custom properties.
 * Returns the dark fallbacks during SSR / when the DOM is unavailable.
 */
export function getChartTheme(): ChartTheme {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return FALLBACK;
  }

  const root = document.documentElement;
  const key = root.classList.contains('dark') ? 'dark' : 'paper';
  if (cache && cache.key === key) return cache.theme;

  const s = getComputedStyle(root);

  const theme: ChartTheme = {
    bg: readVar(s, '--color-ink-900', FALLBACK.bg),
    // Surface: paper register has no ink-850; fall back to surface var or paper-50.
    surface: readVar(s, key === 'dark' ? '--color-ink-850' : '--surface', FALLBACK.surface),
    border: readVar(s, key === 'dark' ? '--color-ink-700' : '--border', FALLBACK.border),
    ring: readVar(s, key === 'dark' ? '--color-ink-600' : '--border', FALLBACK.ring),
    fg: readVar(s, '--color-fg', FALLBACK.fg),
    fgMuted: readVar(s, key === 'dark' ? '--color-fg-muted' : '--text-muted', FALLBACK.fgMuted),
    lime: readVar(s, '--color-lime', FALLBACK.lime),
    onLime: readVar(s, '--color-on-lime', FALLBACK.onLime),
    positive: readVar(s, '--color-positive', FALLBACK.positive),
    negative: readVar(s, '--color-negative', FALLBACK.negative),
    foul: readVar(s, '--color-foul', FALLBACK.foul),
    event: {
      'shot-put': readVar(s, '--color-evt-shot', FALLBACK.event['shot-put']),
      'discus': readVar(s, '--color-evt-discus', FALLBACK.event['discus']),
      'hammer': readVar(s, '--color-evt-hammer', FALLBACK.event['hammer']),
      'weight-throw': readVar(s, '--color-evt-weight', FALLBACK.event['weight-throw']),
      'javelin': readVar(s, '--color-evt-javelin', FALLBACK.event['javelin']),
    },
  };

  cache = { key, theme };
  return theme;
}

/** Resolve a per-event hue, falling back to lime if the event is unknown. */
export function eventColor(theme: ChartTheme, eventId: string): string {
  return theme.event[eventId] || theme.lime;
}

/**
 * Heatmap ramp stop: lime (cold/edge) -> ember/event-orange (hot/center).
 * t in [0,1], 0 = hot center, 1 = cold edge. Returns an rgba() string.
 */
export function heatStop(theme: ChartTheme, t: number, alpha: number): string {
  const hot = hexToRgb(theme.event['shot-put']); // ember orange
  const cold = hexToRgb(theme.lime);
  const c = Math.max(0, Math.min(1, t));
  const r = Math.round(hot.r + (cold.r - hot.r) * c);
  const g = Math.round(hot.g + (cold.g - hot.g) * c);
  const b = Math.round(hot.b + (cold.b - hot.b) * c);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let h = hex.trim().replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  if (!isFinite(n)) return { r: 200, g: 255, b: 0 };
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
