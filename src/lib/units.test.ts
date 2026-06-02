import { describe, it, expect } from 'vitest';
import {
  metersToFeet,
  feetToMeters,
  formatDistance,
  parseDistanceToMeters,
  kgToLbs,
  lbsToKg,
} from './units';

describe('units: distance conversion + formatting', () => {
  it('round-trips meters <-> feet', () => {
    expect(feetToMeters(metersToFeet(15.5))).toBeCloseTo(15.5, 6);
  });

  it('formats meters with/without unit', () => {
    expect(formatDistance(15.5, 'm')).toBe('15.50 m');
    expect(formatDistance(15.5, 'm', { withUnit: false })).toBe('15.50');
  });

  it('formats feet+inches like a throws tape', () => {
    // 15.5 m ≈ 50' 10.24"
    expect(formatDistance(15.5, 'ft')).toMatch(/^50' 10\.\d{2}"$/);
  });

  it('carries the inch rounding (11.999" -> +1 ft, 0.00")', () => {
    expect(formatDistance(feetToMeters(50 + 11.999 / 12), 'ft')).toBe(`51' 0.00"`);
  });

  it('returns an em dash for non-finite input', () => {
    expect(formatDistance(Infinity, 'm')).toBe('—');
  });
});

describe('units: distance parsing', () => {
  it('parses plain meters', () => {
    expect(parseDistanceToMeters('15.5', 'm')).toBeCloseTo(15.5);
  });

  it('parses feet+inches variants', () => {
    const expected = feetToMeters(199 + 6 / 12);
    expect(parseDistanceToMeters(`199' 6"`, 'ft')).toBeCloseTo(expected, 6);
    expect(parseDistanceToMeters('199-6', 'ft')).toBeCloseTo(expected, 6);
    expect(parseDistanceToMeters('199 6', 'ft')).toBeCloseTo(expected, 6);
  });

  it('parses decimal feet', () => {
    expect(parseDistanceToMeters('199.5', 'ft')).toBeCloseTo(feetToMeters(199.5), 6);
  });

  it('returns NaN for unparseable input', () => {
    expect(parseDistanceToMeters('abc', 'm')).toBeNaN();
    expect(parseDistanceToMeters('', 'ft')).toBeNaN();
  });
});

describe('units: weight conversion', () => {
  it('round-trips kg <-> lbs', () => {
    expect(lbsToKg(kgToLbs(7.26))).toBeCloseTo(7.26, 6);
  });

  it('16 lb ≈ 7.26 kg (shot put)', () => {
    expect(lbsToKg(16)).toBeCloseTo(7.26, 2);
  });
});
