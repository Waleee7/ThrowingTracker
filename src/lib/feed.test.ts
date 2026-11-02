import { describe, it, expect } from 'vitest';
import { sparkSeries, headlinePR } from './feed';
import { makeSession } from './test-helpers';

describe('sparkSeries', () => {
  it('null without a session', () => expect(sparkSeries(null, [])).toBeNull());

  it('plots attempts from a throw log, fouls as gaps', () => {
    const s = makeSession({ throwLog: [{ mark: 50, foul: false }, { mark: 0, foul: true }, { mark: 52, foul: false }] });
    expect(sparkSeries(s, [s])).toEqual({ kind: 'attempts', values: [50, null, 52] });
  });

  it('falls back to a same-event trend, oldest first, capped', () => {
    const all = Array.from({ length: 10 }, (_, i) =>
      makeSession({ date: `2026-10-${String(i + 1).padStart(2, '0')}`, bestMark: 50 + i }));
    all.push(makeSession({ date: '2026-10-05', event: 'hammer', bestMark: 99 }));
    const r = sparkSeries(all[9], all)!;
    expect(r.kind).toBe('trend');
    expect(r.values).toEqual([52, 53, 54, 55, 56, 57, 58, 59]);
  });

  it('null when there is only one data point', () => {
    const s = makeSession();
    expect(sparkSeries(s, [s])).toBeNull();
  });
});

describe('headlinePR', () => {
  const pb = (event: string, mark: number) => ({ event, mark, date: '2026-10-01', sessionId: 'x', sessionType: 'training' as const });
  it('picks the PR for the latest session event', () => {
    const sessions = [makeSession({ date: '2026-10-01', event: 'shot-put' }), makeSession({ date: '2026-10-09', event: 'hammer' })];
    expect(headlinePR(sessions, [pb('shot-put', 16), pb('hammer', 60)])?.event).toBe('hammer');
  });
  it('null with no PRs', () => expect(headlinePR([], [])).toBeNull());
});
