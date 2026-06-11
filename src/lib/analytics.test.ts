import { describe, expect, it } from 'vitest';
import { calculateStreak } from './analytics';
import { makeSession } from './test-helpers';
import { toLocalDateKey } from './dates';

/** Local date key for N days ago (matches how sessions store dates). */
function daysAgo(n: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return toLocalDateKey(d);
}

describe('calculateStreak (smart streak: one rest day never breaks it)', () => {
  it('returns 0 with no sessions', () => {
    expect(calculateStreak([])).toBe(0);
  });

  it('counts consecutive training days', () => {
    const sessions = [0, 1, 2].map((n) => makeSession({ date: daysAgo(n) }));
    expect(calculateStreak(sessions)).toBe(3);
  });

  it('survives single rest days (every-other-day training)', () => {
    const sessions = [0, 2, 4].map((n) => makeSession({ date: daysAgo(n) }));
    expect(calculateStreak(sessions)).toBe(3);
  });

  it('counts training days, not calendar days', () => {
    // 5 sessions across 9 calendar days with rest days between
    const sessions = [0, 2, 4, 6, 8].map((n) => makeSession({ date: daysAgo(n) }));
    expect(calculateStreak(sessions)).toBe(5);
  });

  it('breaks on two consecutive idle days', () => {
    const sessions = [0, 3, 4].map((n) => makeSession({ date: daysAgo(n) }));
    expect(calculateStreak(sessions)).toBe(1); // days 1+2 idle kill the chain
  });

  it('survives when today is the rest day', () => {
    const sessions = [1, 2].map((n) => makeSession({ date: daysAgo(n) }));
    expect(calculateStreak(sessions)).toBe(2);
  });

  it('is dead after going dark for 2+ days', () => {
    const sessions = [3, 4].map((n) => makeSession({ date: daysAgo(n) }));
    expect(calculateStreak(sessions)).toBe(0);
  });

  it('ignores duplicate sessions on the same day', () => {
    const sessions = [
      makeSession({ date: daysAgo(0) }),
      makeSession({ date: daysAgo(0) }),
      makeSession({ date: daysAgo(1) }),
    ];
    expect(calculateStreak(sessions)).toBe(2);
  });
});
