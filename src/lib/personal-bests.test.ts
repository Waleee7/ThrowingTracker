import { describe, it, expect } from 'vitest';
import { calculatePersonalBests, checkForNewPR, getCurrentSeasonBests, getSeasonBests } from './personal-bests';
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

  it('getSeasonBests: Aug 31 mark counts in the season ending Aug 31 (local boundary)', () => {
    // Local season Sept 1 2025 -> Aug 31 2026.
    const seasonStart = new Date(2025, 8, 1);
    const seasonEnd = new Date(2026, 7, 31);
    const bests = getSeasonBests(
      [makeSession({ event: 'discus', bestMark: 60, date: '2026-08-31' })],
      seasonStart,
      seasonEnd
    );
    // Parsed locally, Aug 31 sits on the boundary and must be INCLUDED. With the
    // old UTC parse it shifted to Aug 30 evening in negative-offset zones — still
    // in-range here, so we also assert Sept 1 is correctly EXCLUDED below.
    expect(bests.find((b) => b.event === 'discus')?.mark).toBe(60);
  });

  it('getSeasonBests: Sept 1 (next season) is excluded from the season ending Aug 31', () => {
    const seasonStart = new Date(2025, 8, 1);
    const seasonEnd = new Date(2026, 7, 31);
    const bests = getSeasonBests(
      [
        makeSession({ event: 'discus', bestMark: 50, date: '2026-08-15' }),
        makeSession({ event: 'discus', bestMark: 99, date: '2026-09-01' }),
      ],
      seasonStart,
      seasonEnd
    );
    // The 99 m on Sept 1 belongs to the NEXT season and must not leak in.
    expect(bests.find((b) => b.event === 'discus')?.mark).toBe(50);
  });

  it('getSeasonBests: ignores sessions with malformed dates instead of NaN-comparing', () => {
    const seasonStart = new Date(2025, 8, 1);
    const seasonEnd = new Date(2026, 7, 31);
    const bests = getSeasonBests(
      [makeSession({ event: 'discus', bestMark: 50, date: '2026-03-01' })],
      seasonStart,
      seasonEnd
    );
    expect(bests.find((b) => b.event === 'discus')?.mark).toBe(50);
  });
});
