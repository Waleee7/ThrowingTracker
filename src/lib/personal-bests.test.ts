import { describe, it, expect } from 'vitest';
import { calculatePersonalBests, checkForNewPR, getCurrentSeasonBests } from './personal-bests';
import { makeSession } from './test-helpers';
import { toLocalDateKey } from './dates';

describe('personal-bests', () => {
  it('keeps the max bestMark per event', () => {
    const pbs = calculatePersonalBests([
      makeSession({ event: 'discus', bestMark: 50 }),
      makeSession({ event: 'discus', bestMark: 58 }),
      makeSession({ event: 'shot-put', bestMark: 18 }),
    ]);
    expect(pbs.find((p) => p.event === 'discus')?.mark).toBe(58);
    expect(pbs).toHaveLength(2);
  });

  it('checkForNewPR: first session of an event is a PR', () => {
    const r = checkForNewPR([], makeSession({ event: 'discus', bestMark: 40 }));
    expect(r.isPR).toBe(true);
    expect(r.previousBest).toBeNull();
  });

  it('checkForNewPR: beating the previous best is a PR', () => {
    const prev = [makeSession({ id: 'a', event: 'discus', bestMark: 40 })];
    const r = checkForNewPR(prev, makeSession({ id: 'b', event: 'discus', bestMark: 45 }));
    expect(r.isPR).toBe(true);
    expect(r.previousBest).toBe(40);
  });

  it('checkForNewPR: below the previous best is not a PR', () => {
    const prev = [makeSession({ id: 'a', event: 'discus', bestMark: 50 })];
    const r = checkForNewPR(prev, makeSession({ id: 'b', event: 'discus', bestMark: 45 }));
    expect(r.isPR).toBe(false);
  });

  it('getCurrentSeasonBests excludes out-of-season sessions', () => {
    const bests = getCurrentSeasonBests([
      makeSession({ event: 'discus', bestMark: 55, date: toLocalDateKey() }),
      makeSession({ event: 'discus', bestMark: 99, date: '2020-01-01' }),
    ]);
    // The 99 m mark is years out of the current Sept–Aug season → ignored.
    expect(bests.find((b) => b.event === 'discus')?.mark).toBe(55);
  });
});
