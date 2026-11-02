import { describe, it, expect } from 'vitest';
import {
  quickLogDefaults, checkMark, buildQuickSession, latestSession, implementFor, standardImplementKg, MAX_PLAUSIBLE_METERS,
} from './quick-log';
import { makeSession, makeProfile } from './test-helpers';
import { checkForNewPR } from './personal-bests';

describe('quick-log defaults (preselected from last session)', () => {
  it('uses the most recent session event and its implement', () => {
    const sessions = [
      makeSession({ date: '2026-10-01', event: 'shot-put', implementWeight: 7.26 }),
      makeSession({ date: '2026-10-20', event: 'hammer', implementWeight: 6, weightUnit: 'kg' }),
      makeSession({ date: '2026-10-10', event: 'discus', implementWeight: 2 }),
    ];
    expect(latestSession(sessions)?.event).toBe('hammer');
    expect(quickLogDefaults(sessions, makeProfile())).toEqual({ event: 'hammer', weight: 6, weightUnit: 'kg' });
  });

  it('keeps the unit the athlete last used (lbs stays lbs)', () => {
    const s = [makeSession({ event: 'weight-throw', implementWeight: 35, weightUnit: 'lbs' })];
    expect(quickLogDefaults(s, makeProfile())).toMatchObject({ weight: 35, weightUnit: 'lbs' });
  });

  it('falls back to the first profile event, then the standard implement', () => {
    const d = quickLogDefaults([], makeProfile({ events: ['javelin'], sex: 'F' }));
    expect(d).toEqual({ event: 'javelin', weight: 0.6, weightUnit: 'kg' });
    expect(quickLogDefaults([], makeProfile()).event).toBe('discus');
  });

  it('uses the last implement for THAT event when the event is switched', () => {
    const s = [
      makeSession({ date: '2026-10-01', event: 'discus', implementWeight: 1.75 }),
      makeSession({ date: '2026-10-05', event: 'hammer', implementWeight: 6 }),
    ];
    expect(implementFor('discus', s, makeProfile()).weight).toBe(1.75);
    expect(implementFor('shot-put', s, makeProfile({ sex: 'M' })).weight).toBe(standardImplementKg('shot-put', 'M'));
  });
});

describe('checkMark', () => {
  it('accepts metres and converts feet to canonical metres', () => {
    expect(checkMark('56.4', 'm')).toEqual({ ok: true, meters: 56.4 });
    const ft = checkMark('185', 'ft');
    expect(ft.ok && Math.abs(ft.meters - 56.388) < 0.001).toBe(true);
  });
  it('rejects empty, junk, zero, negative and absurd values', () => {
    for (const bad of ['', '  ', 'abc', '0', '-5']) expect(checkMark(bad, 'm').ok).toBe(false);
    expect(checkMark(String(MAX_PLAUSIBLE_METERS + 1), 'm').ok).toBe(false);
  });
});

describe('buildQuickSession (save step)', () => {
  it('returns null with no throws', () => {
    expect(buildQuickSession({ event: 'discus', weight: 2, weightUnit: 'kg', throwLog: [] })).toBeNull();
  });

  it('a single mark becomes a valid one-throw session', () => {
    const s = buildQuickSession({
      event: 'discus', weight: 2, weightUnit: 'kg', throwLog: [{ mark: 55.5, foul: false }],
      date: new Date(2026, 9, 30), id: 'q1',
    })!;
    expect(s).toMatchObject({
      id: 'q1', date: '2026-10-30', event: 'discus', sessionType: 'training', throws: 1, bestMark: 55.5, avgMark: 55.5, rpe: 5,
    });
  });

  it('fouls count as attempts but never as best/avg', () => {
    const s = buildQuickSession({
      event: 'discus', weight: 2, weightUnit: 'kg',
      throwLog: [{ mark: 50, foul: false }, { mark: 0, foul: true }, { mark: 54, foul: false }],
    })!;
    expect(s.throws).toBe(3);
    expect(s.bestMark).toBe(54);
    expect(s.avgMark).toBe(52);
  });

  it('a fouls-only session is saveable with bestMark 0', () => {
    const s = buildQuickSession({ event: 'discus', weight: 2, weightUnit: 'kg', throwLog: [{ mark: 0, foul: true }] })!;
    expect(s.bestMark).toBe(0);
    expect(s.throws).toBe(1);
  });

  it('feeds the existing PR detector (a longer mark is a PR)', () => {
    const prior = [makeSession({ event: 'discus', bestMark: 56 })];
    const s = buildQuickSession({ event: 'discus', weight: 2, weightUnit: 'kg', throwLog: [{ mark: 57, foul: false }] })!;
    expect(checkForNewPR(prior, s).isPR).toBe(true);
    const lower = buildQuickSession({ event: 'discus', weight: 2, weightUnit: 'kg', throwLog: [{ mark: 50, foul: false }] })!;
    expect(checkForNewPR(prior, lower).isPR).toBe(false);
  });
});
