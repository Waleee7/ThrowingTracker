import { describe, it, expect } from 'vitest';
import {
  getRecommendedImplementKg,
  getSkillTierForPR,
  deriveAthleteLevel,
  getEffectiveLevel,
} from './athlete-level';
import { makeProfile } from './test-helpers';

describe('athlete-level: standard implement weights', () => {
  it('HS boys discus = 1.6 kg, college men = 2 kg', () => {
    expect(getRecommendedImplementKg('discus', 'hs_senior', 'M')).toBe(1.6);
    expect(getRecommendedImplementKg('discus', 'college', 'M')).toBe(2);
  });

  it('college men shot = 7.26 kg, HS girls = 4 kg', () => {
    expect(getRecommendedImplementKg('shot-put', 'college', 'M')).toBe(7.26);
    expect(getRecommendedImplementKg('shot-put', 'hs_senior', 'F')).toBe(4);
  });

  it('returns null for events not contested at a level (youth hammer)', () => {
    expect(getRecommendedImplementKg('hammer', 'youth', 'M')).toBeNull();
  });
});

describe('athlete-level: skill tier from a PR', () => {
  it('elite-class discus mark -> elite', () => {
    expect(getSkillTierForPR({ event: 'discus', mark: 60, unit: 'm', implementWeightKg: 1.6 }, 'M')).toBe('elite');
  });

  it('solid varsity mark -> competitor', () => {
    expect(getSkillTierForPR({ event: 'discus', mark: 46, unit: 'm', implementWeightKg: 1.6 }, 'M')).toBe('competitor');
  });

  it('beginner mark -> rookie', () => {
    expect(getSkillTierForPR({ event: 'discus', mark: 20, unit: 'm', implementWeightKg: 1.6 }, 'M')).toBe('rookie');
  });
});

describe('athlete-level: derive + effective level', () => {
  it('college grade base = elite', () => {
    expect(deriveAthleteLevel({ grade: 'college', sex: 'M', goals: [], prs: [] }).level).toBe('elite');
  });

  it('olympic goal surfaces elite even for a youth athlete', () => {
    expect(deriveAthleteLevel({ grade: 'youth', sex: 'M', goals: ['olympics'], prs: [] }).level).toBe('elite');
  });

  it('a strong PR promotes above the grade base', () => {
    const r = deriveAthleteLevel({
      grade: 'youth',
      sex: 'M',
      goals: [],
      prs: [{ event: 'discus', mark: 60, unit: 'm', implementWeightKg: 1.6 }],
    });
    expect(r.level).toBe('elite');
  });

  it('getEffectiveLevel: override > athleteLevel > competitor default', () => {
    expect(getEffectiveLevel(makeProfile({ athleteLevelOverride: 'rookie', athleteLevel: 'elite' }))).toBe('rookie');
    expect(getEffectiveLevel(makeProfile({ athleteLevel: 'elite' }))).toBe('elite');
    expect(getEffectiveLevel(makeProfile())).toBe('competitor');
  });
});
