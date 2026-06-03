import { describe, it, expect } from 'vitest';
import {
  buildAthleteContext,
  formatAthleteContext,
  suggestedQuestions,
  coachGreeting,
  localFallbackReply,
} from './coach';
import { makeSession, makeProfile } from './test-helpers';
import { toLocalDateKey } from './dates';

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toLocalDateKey(d);
};

describe('coach: buildAthleteContext', () => {
  it('summarizes profile, events, PBs, recents, and last-14-day totals', () => {
    const profile = makeProfile({
      name: 'Josh',
      sex: 'M',
      events: ['discus', 'shot-put'],
      distanceUnit: 'm',
      athleteLevel: 'elite',
    });
    const sessions = [
      makeSession({ event: 'discus', bestMark: 60, avgMark: 55, date: daysAgo(1), throws: 12, rpe: 7 }),
      makeSession({ event: 'discus', bestMark: 58, avgMark: 54, date: daysAgo(3), throws: 10, rpe: 6 }),
      makeSession({ event: 'shot-put', bestMark: 18, avgMark: 17, date: daysAgo(2), throws: 8, rpe: 8 }),
    ];

    const ctx = buildAthleteContext(profile, sessions);

    expect(ctx.name).toBe('Josh');
    expect(ctx.level).toBe('elite');
    expect(ctx.events).toEqual(['Discus', 'Shot Put']);
    expect(ctx.totalSessions).toBe(3);

    // PBs: best per event, sorted by mark desc.
    expect(ctx.pbs[0].eventName).toBe('Discus');
    expect(ctx.pbs[0].mark).toBe(60);
    expect(ctx.pbs.find((p) => p.event === 'shot-put')?.mark).toBe(18);

    // Recent sessions newest-first.
    expect(ctx.recent[0].date).toBe(daysAgo(1));
    expect(ctx.last14.sessions).toBe(3);
    expect(ctx.last14.throws).toBe(30);
  });

  it('handles an empty/new athlete gracefully', () => {
    const ctx = buildAthleteContext(makeProfile({}), []);
    expect(ctx.name).toBe('Athlete');
    expect(ctx.level).toBe('competitor'); // default when no tier set
    expect(ctx.pbs).toEqual([]);
    expect(ctx.recent).toEqual([]);
    expect(ctx.totalSessions).toBe(0);
  });

  it('caps recent sessions at 10', () => {
    const sessions = Array.from({ length: 15 }, (_, i) =>
      makeSession({ date: daysAgo(i), bestMark: 40 + i }),
    );
    expect(buildAthleteContext(makeProfile({}), sessions).recent).toHaveLength(10);
  });
});

describe('coach: suggestedQuestions', () => {
  it('returns four tier-appropriate prompts', () => {
    const elite = buildAthleteContext(makeProfile({ events: ['discus'], athleteLevel: 'elite' }), [
      makeSession({}),
    ]);
    const rookie = buildAthleteContext(makeProfile({ events: ['discus'], athleteLevel: 'rookie' }), [
      makeSession({}),
    ]);
    const competitor = buildAthleteContext(
      makeProfile({ events: ['discus'], athleteLevel: 'competitor' }),
      [makeSession({})],
    );

    expect(suggestedQuestions(elite)).toHaveLength(4);
    expect(suggestedQuestions(rookie)).toHaveLength(4);
    expect(suggestedQuestions(competitor)).toHaveLength(4);
    expect(suggestedQuestions(elite).join(' ')).toMatch(/periodize/i);
    expect(suggestedQuestions(competitor).join(' ')).toMatch(/plateau/i);
  });

  it('shows getting-started prompts for a brand-new athlete', () => {
    expect(suggestedQuestions(buildAthleteContext(makeProfile({}), []))).toHaveLength(4);
  });
});

describe('coach: greeting + fallback', () => {
  const ctx = buildAthleteContext(
    makeProfile({ name: 'Josh', events: ['discus'], athleteLevel: 'elite' }),
    [makeSession({ event: 'discus', date: daysAgo(1), bestMark: 60 })],
  );

  it('greets by name and nudges new athletes to log', () => {
    expect(coachGreeting(ctx)).toContain('Josh');
    const fresh = coachGreeting(buildAthleteContext(makeProfile({ name: 'Sam' }), []));
    expect(fresh).toContain('Sam');
    expect(fresh.toLowerCase()).toContain('log');
  });

  it('routes fallback replies by keyword and stays grounded', () => {
    expect(localFallbackReply(ctx, 'how should I taper for my meet?').toLowerCase()).toContain('taper');
    expect(localFallbackReply(ctx, 'why am I plateauing?').toLowerCase()).toContain('velocity');
    expect(localFallbackReply(ctx, 'does wind matter?').toLowerCase()).toContain('headwind');
    expect(localFallbackReply(null, 'anything at all').length).toBeGreaterThan(0);
  });
});

describe('coach: formatAthleteContext', () => {
  it('renders a readable text block for the prompt', () => {
    const ctx = buildAthleteContext(
      makeProfile({ name: 'Josh', events: ['discus'] }),
      [makeSession({ event: 'discus', bestMark: 60, date: daysAgo(1) })],
    );
    const text = formatAthleteContext(ctx);
    expect(text).toContain('ATHLETE PROFILE');
    expect(text).toContain('Josh');
    expect(text).toContain('PERSONAL BESTS');
    expect(text).toContain('RECENT SESSIONS');
  });
});
