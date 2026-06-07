import { describe, it, expect } from 'vitest';
import { fromDateKey, toLocalDateKey, weekStartKey } from './dates';

describe('dates', () => {
  it('parses a valid key as a local date', () => {
    const d = fromDateKey('2026-08-31');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(7); // August (0-indexed)
    expect(d.getDate()).toBe(31);
    expect(Number.isNaN(d.getTime())).toBe(false);
  });

  it('round-trips through toLocalDateKey without drift', () => {
    expect(toLocalDateKey(fromDateKey('2026-01-15'))).toBe('2026-01-15');
  });

  it('falls back to a valid Date for an empty key (no NaN)', () => {
    const d = fromDateKey('');
    expect(Number.isNaN(d.getTime())).toBe(false);
  });

  it('falls back for malformed keys (no NaN propagation)', () => {
    for (const bad of ['garbage', '2026/08/31', '2026-8-3', '26-08-31', 'NaN-NaN-NaN']) {
      const d = fromDateKey(bad);
      expect(Number.isNaN(d.getTime()), `key=${bad}`).toBe(false);
    }
  });

  it('falls back for impossible dates that roll over', () => {
    // 2026-02-31 would roll to March; reject and fall back to a valid date.
    const d = fromDateKey('2026-02-31');
    expect(Number.isNaN(d.getTime())).toBe(false);
    // Must not silently become March 3.
    expect(toLocalDateKey(d)).not.toBe('2026-03-03');
  });

  it('weekStartKey handles a malformed key without producing Invalid Date', () => {
    const k = weekStartKey('');
    expect(k).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
