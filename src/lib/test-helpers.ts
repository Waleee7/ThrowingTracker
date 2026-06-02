// Shared factories for unit tests (not a test file itself — excluded by the
// `*.test.ts` include pattern, so Vitest won't try to collect it).
import type { Session, Profile } from './types';

export const makeSession = (over: Partial<Session> = {}): Session => ({
  id: Math.random().toString(36).slice(2),
  date: '2026-01-01',
  event: 'discus',
  sessionType: 'training',
  rpe: 5,
  throws: 10,
  implementWeight: 1.6,
  weightUnit: 'kg',
  bestMark: 50,
  avgMark: 45,
  notes: '',
  ...over,
});

export const makeProfile = (over: Partial<Profile> = {}): Profile => ({
  name: '',
  height: { value: '', unit: 'cm' },
  weight: { value: '', unit: 'kg' },
  sex: '',
  events: [],
  notes: '',
  ...over,
});
