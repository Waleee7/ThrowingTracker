import { describe, it, expect } from 'vitest';
import {
  sectorAngleForEvent,
  SECTOR_ANGLE_DEG,
  JAVELIN_SECTOR_ANGLE_DEG,
} from './constants';

describe('sectorAngleForEvent: regulation landing-sector angles', () => {
  it('uses 34.92° for the circle events (shot, discus, hammer, weight throw)', () => {
    for (const ev of ['shot-put', 'discus', 'hammer', 'weight-throw']) {
      expect(sectorAngleForEvent(ev)).toBe(SECTOR_ANGLE_DEG);
    }
    expect(SECTOR_ANGLE_DEG).toBe(34.92);
  });

  it('uses the narrower 28.96° sector for javelin', () => {
    expect(sectorAngleForEvent('javelin')).toBe(JAVELIN_SECTOR_ANGLE_DEG);
    expect(JAVELIN_SECTOR_ANGLE_DEG).toBe(28.96);
  });

  it('falls back to the circle-event angle for unknown/empty events', () => {
    expect(sectorAngleForEvent(undefined)).toBe(SECTOR_ANGLE_DEG);
    expect(sectorAngleForEvent(null)).toBe(SECTOR_ANGLE_DEG);
    expect(sectorAngleForEvent('')).toBe(SECTOR_ANGLE_DEG);
  });
});
