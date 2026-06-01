/**
 * Implement registry (W6).
 *
 * A browsable catalog of the *standard* implement weight for every
 * event x competition level x sex, plus a profile-aware "what should I be
 * throwing?" suggestion. The raw governing-body data lives in athlete-level.ts
 * (NFHS / NCAA / World Athletics / USATF Youth); this module is the
 * presentation layer over it — friendly labels, lbs equivalents, and the
 * collapsed level bands a human actually scans.
 */
import {
  IMPLEMENT_TABLE,
  getRecommendedImplementKg,
  type EventId,
  type GradeLevel,
} from './athlete-level';
import type { Profile } from './types';
import { kgToLbs } from './units';
import { EVENTS } from './constants';

export type Sex = 'M' | 'F';

/** Display name for an event id (falls back to the id itself). */
export function eventName(event: string): string {
  return EVENTS.find((e) => e.id === event)?.name ?? event;
}

/**
 * Competition bands shown in the catalog. Each band maps to a representative
 * grade — HS years all share one weight, so we collapse them into "High School".
 */
interface Band {
  key: string;
  label: string;
  grade: GradeLevel;
}

const BANDS: Band[] = [
  { key: 'youth', label: 'Youth (U12)', grade: 'youth' },
  { key: 'middle_school', label: 'Middle School', grade: 'middle_school' },
  { key: 'high_school', label: 'High School', grade: 'hs_senior' },
  { key: 'college', label: 'College', grade: 'college' },
  { key: 'post_collegiate', label: 'Open / Pro', grade: 'post_collegiate' },
];

export interface RegistryRow {
  bandKey: string;
  band: string;
  maleKg: number | null;
  femaleKg: number | null;
}

/** Which band a grade belongs to (HS years collapse to "high_school"). */
export function bandKeyForGrade(grade: GradeLevel | undefined): string | null {
  if (!grade) return null;
  if (grade.startsWith('hs_')) return 'high_school';
  return BANDS.find((b) => b.key === grade)?.key ?? null;
}

/** Full catalog for one event: one row per band, M + F standard weights (kg). */
export function getRegistry(event: EventId): RegistryRow[] {
  return BANDS.map((b) => ({
    bandKey: b.key,
    band: b.label,
    maleKg: getRecommendedImplementKg(event, b.grade, 'M'),
    femaleKg: getRecommendedImplementKg(event, b.grade, 'F'),
  })).filter((r) => r.maleKg !== null || r.femaleKg !== null);
}

/** Every event that has at least one entry in the table. */
export function registryEvents(): EventId[] {
  return (Object.keys(IMPLEMENT_TABLE) as EventId[]).filter(
    (e) => IMPLEMENT_TABLE[e].length > 0,
  );
}

export interface ImplementSuggestion {
  kg: number;
  label: string; // e.g. "High School Boys standard"
}

/**
 * Standard implement weight for this athlete in this event, derived from their
 * profile (grade + sex). Returns null when the profile is incomplete or the
 * event isn't contested at that level (e.g. youth hammer).
 */
export function suggestImplementKg(
  profile: Profile,
  event: string,
): ImplementSuggestion | null {
  if (!profile.grade || (profile.sex !== 'M' && profile.sex !== 'F')) return null;
  const kg = getRecommendedImplementKg(event as EventId, profile.grade, profile.sex);
  if (kg === null) return null;
  const band = BANDS.find((b) => bandKeyForGrade(profile.grade) === b.key);
  const who = profile.sex === 'M' ? 'Boys' : 'Girls';
  return { kg, label: `${band?.label ?? 'Standard'} ${who}` };
}

/** "1.6 kg (3.53 lb)" — both units for a catalog cell. */
export function formatImplement(kg: number | null): string {
  if (kg === null) return '—';
  const lb = Math.round(kgToLbs(kg) * 100) / 100;
  return `${kg} kg · ${lb} lb`;
}
