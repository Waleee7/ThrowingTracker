import { describe, expect, it } from 'vitest';
import { buildWeeklyRecap, previousWeekKey } from './recap';
import { makeSession } from './test-helpers';

// Wed Jun 10, 2026 → current week starts Sun Jun 7 → recapped week = May 31–Jun 6.
const NOW = new Date(2026, 5, 10);

describe('previousWeekKey', () => {
  it('returns the Sunday of the prior week', () => {
    expect(previousWeekKey(NOW)).toBe('2026-05-31');
  });
});

describe('buildWeeklyRecap', () => {
  it('returns null when last week was empty', () => {
    const sessions = [makeSession({ date: '2026-06-08' })]; // this week only
    expect(buildWeeklyRecap(sessions, NOW)).toBeNull();
  });

  it('aggregates only the recapped week', () => {
    const sessions = [
      makeSession({ date: '2026-06-01', throws: 10, rpe: 6, bestMark: 50, event: 'discus' }),
      makeSession({ date: '2026-06-04', throws: 14, rpe: 8, bestMark: 52, event: 'discus' }),
      makeSession({ date: '2026-06-08', throws: 99, bestMark: 70 }), // current week — excluded
      makeSession({ date: '2026-05-20', throws: 99, bestMark: 70 }), // two weeks back — excluded
    ];
    const r = buildWeeklyRecap(sessions, NOW);
    expect(r).not.toBeNull();
    expect(r!.weekKey).toBe('2026-05-31');
    expect(r!.sessions).toBe(2);
    expect(r!.totalThrows).toBe(24);
    expect(r!.bestMark).toBe(52);
    expect(r!.bestEvent).toBe('discus');
    expect(r!.avgRPE).toBe(7);
  });

  it('computes deltas vs the week before', () => {
    const sessions = [
      makeSession({ date: '2026-05-26', throws: 10 }), // prior week (May 24–30)
      makeSession({ date: '2026-06-01', throws: 16 }), // recapped week
      makeSession({ date: '2026-06-02', throws: 8 }),
    ];
    const r = buildWeeklyRecap(sessions, NOW)!;
    expect(r.deltaSessions).toBe(1);
    expect(r.deltaThrows).toBe(14);
  });

  it('flags a PR week when the all-time best landed in the window', () => {
    const prWeek = buildWeeklyRecap(
      [
        makeSession({ date: '2026-04-01', bestMark: 50, event: 'discus' }),
        makeSession({ date: '2026-06-02', bestMark: 55, event: 'discus' }),
      ],
      NOW,
    )!;
    expect(prWeek.setPR).toBe(true);

    const notPrWeek = buildWeeklyRecap(
      [
        makeSession({ date: '2026-04-01', bestMark: 60, event: 'discus' }),
        makeSession({ date: '2026-06-02', bestMark: 55, event: 'discus' }),
      ],
      NOW,
    )!;
    expect(notPrWeek.setPR).toBe(false);
  });

  it('always produces a coach line', () => {
    const r = buildWeeklyRecap([makeSession({ date: '2026-06-03' })], NOW)!;
    expect(r.coachLine.length).toBeGreaterThan(0);
  });
});
