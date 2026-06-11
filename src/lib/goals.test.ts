import { describe, expect, it } from 'vitest';
import { nextMeet, upcomingMeets, goalProgress, setGoal } from './goals';
import type { Meet, GoalMark, PersonalBest } from './types';

const NOW = new Date(2026, 5, 10); // Wed Jun 10, 2026 (local)

const meet = (id: string, date: string, name = id): Meet => ({ id, name, date });

const pb = (event: string, mark: number): PersonalBest => ({
  event,
  mark,
  date: '2026-05-01',
  sessionId: 's1',
  sessionType: 'training',
});

describe('nextMeet', () => {
  it('returns null when there are no upcoming meets', () => {
    expect(nextMeet([], NOW)).toBeNull();
    expect(nextMeet([meet('a', '2026-06-09')], NOW)).toBeNull(); // yesterday
  });

  it('picks the soonest upcoming meet and counts days', () => {
    const m = nextMeet([meet('far', '2026-07-01'), meet('near', '2026-06-13')], NOW);
    expect(m?.id).toBe('near');
    expect(m?.daysUntil).toBe(3);
  });

  it('treats a meet today as daysUntil 0', () => {
    const m = nextMeet([meet('today', '2026-06-10')], NOW);
    expect(m?.daysUntil).toBe(0);
  });
});

describe('upcomingMeets', () => {
  it('sorts soonest-first and drops past meets', () => {
    const list = upcomingMeets(
      [meet('b', '2026-06-20'), meet('past', '2026-06-01'), meet('a', '2026-06-12')],
      NOW,
    );
    expect(list.map((m) => m.id)).toEqual(['a', 'b']);
  });
});

describe('goalProgress', () => {
  const goals: GoalMark[] = [{ event: 'discus', targetMark: 60 }];

  it('computes remaining and pct against the PB', () => {
    const [g] = goalProgress(goals, [pb('discus', 45)]);
    expect(g.currentBest).toBe(45);
    expect(g.remaining).toBe(15);
    expect(g.pct).toBeCloseTo(0.75);
    expect(g.achieved).toBe(false);
  });

  it('handles no PB yet', () => {
    const [g] = goalProgress(goals, []);
    expect(g.currentBest).toBe(0);
    expect(g.remaining).toBe(60);
    expect(g.pct).toBe(0);
  });

  it('marks achieved (and clamps pct) when the PB passes the target', () => {
    const [g] = goalProgress(goals, [pb('discus', 61.5)]);
    expect(g.achieved).toBe(true);
    expect(g.remaining).toBe(0);
    expect(g.pct).toBe(1);
  });

  it('drops invalid targets', () => {
    expect(goalProgress([{ event: 'discus', targetMark: 0 }], [])).toHaveLength(0);
  });
});

describe('setGoal', () => {
  it('upserts a goal per event', () => {
    let goals = setGoal([], 'discus', 55);
    goals = setGoal(goals, 'discus', 60);
    expect(goals).toEqual([{ event: 'discus', targetMark: 60 }]);
  });

  it('clears with null or invalid marks', () => {
    const start: GoalMark[] = [{ event: 'discus', targetMark: 60 }];
    expect(setGoal(start, 'discus', null)).toEqual([]);
    expect(setGoal(start, 'discus', NaN)).toEqual([]);
    expect(setGoal(start, 'discus', -5)).toEqual([]);
  });
});
