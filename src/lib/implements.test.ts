import { describe, it, expect } from 'vitest';
import {
  getRegistry,
  suggestImplementKg,
  bandKeyForGrade,
  formatImplement,
  eventName,
} from './implements';
import { makeProfile } from './test-helpers';

describe('implements: registry', () => {
  it('discus registry has HS row with M/F kg', () => {
    const hs = getRegistry('discus').find((r) => r.bandKey === 'high_school');
    expect(hs?.maleKg).toBe(1.6);
    expect(hs?.femaleKg).toBe(1);
  });

  it('hammer registry omits youth (not contested), keeps college', () => {
    const rows = getRegistry('hammer');
    expect(rows.some((r) => r.bandKey === 'youth')).toBe(false);
    expect(rows.some((r) => r.bandKey === 'college')).toBe(true);
  });
});

describe('implements: helpers', () => {
  it('bandKeyForGrade collapses HS years into one band', () => {
    expect(bandKeyForGrade('hs_freshman')).toBe('high_school');
    expect(bandKeyForGrade('hs_senior')).toBe('high_school');
    expect(bandKeyForGrade('college')).toBe('college');
    expect(bandKeyForGrade(undefined)).toBeNull();
  });

  it('suggestImplementKg derives from grade + sex', () => {
    expect(suggestImplementKg(makeProfile({ grade: 'hs_junior', sex: 'M' }), 'discus')?.kg).toBe(1.6);
  });

  it('suggestImplementKg is null when the profile is incomplete', () => {
    expect(suggestImplementKg(makeProfile({ sex: 'M' }), 'discus')).toBeNull();
  });

  it('formatImplement shows kg, em dash for null', () => {
    expect(formatImplement(1.6)).toContain('1.6 kg');
    expect(formatImplement(null)).toBe('—');
  });

  it('eventName maps an id to its label', () => {
    expect(eventName('shot-put')).toBe('Shot Put');
  });
});
