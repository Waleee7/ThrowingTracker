import { describe, it, expect } from 'vitest';
import type { Session } from './types';
import { getUnlockedAchievements, getNewlyUnlocked } from './achievements';
import { makeSession } from './test-helpers';

const unlockedIds = (sessions: Session[]) =>
  getUnlockedAchievements(sessions).filter((a) => a.unlocked).map((a) => a.id);

describe('achievements', () => {
  it('first-session unlocks at one session', () => {
    expect(unlockedIds([makeSession()])).toContain('first-session');
  });

  it('first-pr unlocks when an event improves over time', () => {
    const ids = unlockedIds([
      makeSession({ event: 'discus', bestMark: 40, date: '2026-01-01' }),
      makeSession({ event: 'discus', bestMark: 45, date: '2026-01-02' }),
    ]);
    expect(ids).toContain('first-pr');
  });

  it('podium unlocks on a top-3 placement', () => {
    expect(unlockedIds([makeSession({ sessionType: 'competition', placement: '2nd' })])).toContain('podium');
  });

  it('pentathlete unlocks with all 5 events', () => {
    const five = ['shot-put', 'discus', 'hammer', 'weight-throw', 'javelin'].map((e) => makeSession({ event: e }));
    expect(unlockedIds(five)).toContain('all-events');
  });

  it('getNewlyUnlocked excludes already-unlocked ids', () => {
    const newly = getNewlyUnlocked([makeSession()], ['first-session']).map((a) => a.id);
    expect(newly).not.toContain('first-session');
  });
});
