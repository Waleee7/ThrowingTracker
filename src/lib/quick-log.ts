// Quick-log: the 3-tap core loop (open → Log a throw → type mark → Save).
// Pure helpers so the flow is unit-testable without a DOM.
import type { Profile, Session, ThrowEntry } from './types';
import { deriveSessionMetrics } from './throws';
import { toLocalDateKey } from './dates';
import { parseDistanceToMeters, type DistanceUnit } from './units';
import { suggestImplementKg } from './implements';

export interface QuickLogDefaults {
  event: string;
  weight: number;
  weightUnit: 'kg' | 'lbs';
}

/** Senior-men / senior-women standard implement (kg) when we know nothing else. */
const STANDARD_KG: Record<string, [number, number]> = {
  'shot-put': [7.26, 4],
  discus: [2, 1],
  hammer: [7.26, 4],
  'weight-throw': [15.88, 9.08],
  javelin: [0.8, 0.6],
};

/** Longest throw in any event is < 100 m; anything past this is a typo. */
export const MAX_PLAUSIBLE_METERS = 120;

export function latestSession(sessions: Session[]): Session | null {
  if (sessions.length === 0) return null;
  return sessions.reduce((a, b) => (new Date(b.date).getTime() >= new Date(a.date).getTime() ? b : a));
}

export function standardImplementKg(event: string, sex: Profile['sex']): number {
  const row = STANDARD_KG[event] ?? STANDARD_KG.discus;
  return sex === 'F' ? row[1] : row[0];
}

/** Implement for `event`: the last one used in that event, else profile-derived, else standard. */
export function implementFor(
  event: string,
  sessions: Session[],
  profile: Profile,
): { weight: number; weightUnit: 'kg' | 'lbs' } {
  const prior = latestSession(sessions.filter((s) => s.event === event && s.implementWeight > 0));
  if (prior) return { weight: prior.implementWeight, weightUnit: prior.weightUnit };
  const suggested = suggestImplementKg(profile, event);
  if (suggested) return { weight: suggested.kg, weightUnit: 'kg' };
  return { weight: standardImplementKg(event, profile.sex), weightUnit: 'kg' };
}

/** Preselect from the last session; fall back to the athlete's first event. */
export function quickLogDefaults(sessions: Session[], profile: Profile): QuickLogDefaults {
  const last = latestSession(sessions);
  const event = last?.event ?? profile.events[0] ?? 'discus';
  return { event, ...implementFor(event, sessions, profile) };
}

export type MarkCheck = { ok: true; meters: number } | { ok: false; reason: string };

/** Validate a typed mark (in the athlete's display unit) → canonical meters. */
export function checkMark(input: string, unit: DistanceUnit): MarkCheck {
  if (!input.trim()) return { ok: false, reason: 'Enter a distance' };
  const meters = parseDistanceToMeters(input, unit);
  if (!isFinite(meters) || meters <= 0) return { ok: false, reason: 'Enter a valid distance' };
  if (meters > MAX_PLAUSIBLE_METERS) return { ok: false, reason: 'That looks too far — check the number' };
  return { ok: true, meters };
}

export interface QuickSessionInput {
  event: string;
  weight: number;
  weightUnit: 'kg' | 'lbs';
  throwLog: ThrowEntry[];
  rpe?: number;
  notes?: string;
  date?: Date;
  id?: string;
}

/** Null when there is nothing to save (no throws at all). */
export function buildQuickSession(input: QuickSessionInput): Session | null {
  if (input.throwLog.length === 0) return null;
  const d = deriveSessionMetrics(input.throwLog);
  return {
    id: input.id ?? Date.now().toString(),
    date: toLocalDateKey(input.date ?? new Date()),
    event: input.event,
    sessionType: 'training',
    rpe: input.rpe ?? 5,
    throws: d.throws,
    throwLog: input.throwLog,
    implementWeight: input.weight,
    weightUnit: input.weightUnit,
    bestMark: d.bestMark,
    avgMark: d.avgMark,
    notes: input.notes ?? '',
  };
}
