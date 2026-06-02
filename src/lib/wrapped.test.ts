import { describe, it, expect } from 'vitest';
import { buildWrapped } from './wrapped';
import { makeSession } from './test-helpers';
import { toLocalDateKey } from './dates';

describe('wrapped', () => {
  it('returns null with no in-season sessions', () => {
    expect(buildWrapped([])).toBeNull();
    expect(buildWrapped([makeSession({ date: '2020-01-01' })])).toBeNull();
  });

  it('aggregates the current season', () => {
    const today = toLocalDateKey();
    const w = buildWrapped([
      makeSession({ event: 'discus', date: today, throws: 10, bestMark: 50, avgMark: 45, rpe: 6 }),
      makeSession({ event: 'discus', date: today, throws: 12, bestMark: 55, avgMark: 48, rpe: 8 }),
      makeSession({ event: 'shot-put', date: today, throws: 5, bestMark: 14, avgMark: 13, rpe: 7, sessionType: 'competition' }),
    ]);
    expect(w).not.toBeNull();
    expect(w!.totalSessions).toBe(3);
    expect(w!.totalThrows).toBe(27);
    expect(w!.competitions).toBe(1);
    expect(w!.favoriteEvent?.id).toBe('discus');
    expect(w!.topMark?.mark).toBe(55);
  });
});
