import { describe, it, expect } from 'vitest';
import { deriveSessionMetrics, countFouls } from './throws';

describe('throws: deriveSessionMetrics', () => {
  it('best/avg exclude fouls; throws counts every attempt', () => {
    const m = deriveSessionMetrics([
      { mark: 50, foul: false },
      { mark: 0, foul: true },
      { mark: 54, foul: false },
      { mark: 52, foul: false },
    ]);
    expect(m.throws).toBe(4);
    expect(m.bestMark).toBe(54);
    expect(m.avgMark).toBeCloseTo((50 + 54 + 52) / 3);
  });

  it('all fouls -> zero best/avg, but throws still counts them', () => {
    const m = deriveSessionMetrics([
      { mark: 0, foul: true },
      { mark: 0, foul: true },
    ]);
    expect(m.bestMark).toBe(0);
    expect(m.avgMark).toBe(0);
    expect(m.throws).toBe(2);
  });

  it('countFouls counts only fouled attempts', () => {
    expect(
      countFouls([
        { mark: 1, foul: false },
        { mark: 0, foul: true },
        { mark: 0, foul: true },
      ]),
    ).toBe(2);
  });
});
