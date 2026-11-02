// Haptics — a tiny, safe wrapper over navigator.vibrate.
//
// - Feature-detected: no-ops on iOS Safari (no Vibration API) and during SSR.
// - Named patterns so call sites read as intent (`haptic('success')`).
// - Respects the athlete's Profile → Haptics setting (default ON).
// - Stays silent for prefers-reduced-motion users (vibration is motion).

export type HapticName = 'tap' | 'select' | 'success' | 'warning' | 'pr';

/** Vibration patterns in ms: [vibrate, pause, vibrate, ...]. */
export const HAPTIC_PATTERNS: Record<HapticName, number | number[]> = {
  tap: 10,
  select: 15,
  success: [18, 40, 28],
  warning: [45, 50, 45],
  // celebratory: rising triple-pulse ending in a long swell
  pr: [20, 40, 20, 40, 30, 60, 90],
};

const STORAGE_KEY = 'throwingHaptics';

let enabledOverride: boolean | null = null;

/** Persisted preference; defaults to ON when unset or unreadable. */
export function isHapticsEnabled(): boolean {
  if (enabledOverride !== null) return enabledOverride;
  try {
    if (typeof localStorage === 'undefined') return true;
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === null ? true : JSON.parse(raw) !== false;
  } catch {
    return true;
  }
}

export function setHapticsEnabled(enabled: boolean): void {
  enabledOverride = enabled;
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(enabled));
  } catch {
    // storage unavailable — the in-memory override still applies this session
  }
}

/** Test seam: forget the in-memory override and re-read storage. */
export function resetHapticsState(): void {
  enabledOverride = null;
}

export function prefersReducedMotion(): boolean {
  try {
    return typeof window !== 'undefined'
      && typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

/** True when this device can vibrate at all (false on iOS Safari / SSR). */
export function hapticsSupported(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
}

/** Fire a raw pattern. Honors the setting + reduced-motion. Never throws. */
export function vibrate(pattern: number | number[]): void {
  try {
    if (!hapticsSupported()) return;
    if (!isHapticsEnabled() || prefersReducedMotion()) return;
    navigator.vibrate(pattern);
  } catch {
    // never let a haptic crash anything
  }
}

/** Fire a named pattern: tap, select, success, warning, pr. */
export function haptic(name: HapticName): void {
  vibrate(HAPTIC_PATTERNS[name]);
}
