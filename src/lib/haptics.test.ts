import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  haptic, vibrate, HAPTIC_PATTERNS, isHapticsEnabled, setHapticsEnabled, resetHapticsState, hapticsSupported,
} from './haptics';

function installBrowser(opts: { vibrate?: boolean; reduced?: boolean; stored?: string | null } = {}) {
  const vib = vi.fn(() => true);
  const store: Record<string, string> = {};
  if (opts.stored != null) store.throwingHaptics = opts.stored;
  vi.stubGlobal('navigator', opts.vibrate === false ? {} : { vibrate: vib });
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => { store[k] = v; },
  });
  vi.stubGlobal('window', {
    matchMedia: (q: string) => ({ matches: !!opts.reduced && q.includes('reduce') }),
  });
  return { vib, store };
}

describe('haptics', () => {
  beforeEach(() => resetHapticsState());
  afterEach(() => vi.unstubAllGlobals());

  it('defines every named pattern, and the PR pattern is the longest', () => {
    const total = (p: number | number[]) => (Array.isArray(p) ? p.reduce((a, b) => a + b, 0) : p);
    for (const k of ['tap', 'select', 'success', 'warning', 'pr'] as const) {
      expect(HAPTIC_PATTERNS[k]).toBeDefined();
    }
    expect(total(HAPTIC_PATTERNS.pr)).toBeGreaterThan(total(HAPTIC_PATTERNS.success));
    expect(total(HAPTIC_PATTERNS.success)).toBeGreaterThan(total(HAPTIC_PATTERNS.tap));
  });

  it('vibrates with the named pattern by default (setting defaults ON)', () => {
    const { vib } = installBrowser();
    expect(isHapticsEnabled()).toBe(true);
    haptic('success');
    expect(vib).toHaveBeenCalledWith(HAPTIC_PATTERNS.success);
    haptic('warning');
    expect(vib).toHaveBeenLastCalledWith(HAPTIC_PATTERNS.warning);
  });

  it('is a silent no-op when the Vibration API is missing (iOS Safari)', () => {
    installBrowser({ vibrate: false });
    expect(hapticsSupported()).toBe(false);
    expect(() => haptic('pr')).not.toThrow();
  });

  it('is a no-op during SSR (no navigator/window)', () => {
    vi.stubGlobal('navigator', undefined);
    vi.stubGlobal('window', undefined);
    expect(() => vibrate(10)).not.toThrow();
  });

  it('respects the user setting and persists it', () => {
    const { vib, store } = installBrowser();
    setHapticsEnabled(false);
    expect(store.throwingHaptics).toBe('false');
    haptic('tap');
    expect(vib).not.toHaveBeenCalled();
    setHapticsEnabled(true);
    haptic('tap');
    expect(vib).toHaveBeenCalledTimes(1);
  });

  it('reads a stored "false" preference', () => {
    const { vib } = installBrowser({ stored: 'false' });
    haptic('success');
    expect(vib).not.toHaveBeenCalled();
  });

  it('stays silent under prefers-reduced-motion', () => {
    const { vib } = installBrowser({ reduced: true });
    haptic('pr');
    expect(vib).not.toHaveBeenCalled();
  });

  it('never throws if vibrate itself throws', () => {
    installBrowser();
    vi.stubGlobal('navigator', { vibrate: () => { throw new Error('blocked'); } });
    expect(() => haptic('tap')).not.toThrow();
  });
});
