import type { GradeLevel, AthleteGoal, EventPR, AthleteLevel } from './athlete-level';
import type { DistanceUnit } from './units';

export interface ThrowingEvent {
  id: string;
  name: string;
  svg: string;
}

export interface ThrowEntry {
  mark: number;        // canonical meters; ignored when foul
  sector?: number;     // landing sector angle (deg), optional
  feel?: number;       // per-throw RPE 1-10, optional
  foul: boolean;
  wind?: number;       // m/s, +tailwind / -headwind, optional
}

export interface Session {
  id: string;
  date: string;
  event: string;
  sessionType: 'training' | 'competition';
  rpe: number;
  throws: number;            // count (auto-derived from throwLog when present)
  throwLog?: ThrowEntry[];   // optional throw-by-throw detail (W5+)
  implementWeight: number;
  weightUnit: 'kg' | 'lbs';
  bestMark: number;
  avgMark: number;
  notes: string;
  meetName?: string;
  placement?: string;
  media?: MediaAttachment[];
  landingZone?: LandingPoint[];
}

export interface MediaAttachment {
  id: string;
  name: string;
  type: string;
  dataUrl?: string; // base64 for images
  indexedDbKey?: string; // key for IndexedDB stored videos
}

export interface Profile {
  name: string;
  height: { value: string; unit: 'cm' | 'ft/in'; feet?: string; inches?: string };
  weight: { value: string; unit: 'kg' | 'lbs' };
  sex: 'M' | 'F' | '';
  events: string[];
  notes: string;
  // Display preference: how distances are entered/shown. Storage is always meters.
  distanceUnit?: DistanceUnit;
  // Tier / onboarding (additive, all optional)
  grade?: GradeLevel;
  birthYear?: number;
  country?: string;
  goals?: AthleteGoal[];
  prs?: EventPR[];
  athleteLevel?: AthleteLevel;
  athleteLevelOverride?: AthleteLevel | null;
}

export interface PersonalBest {
  event: string;
  mark: number;
  date: string;
  sessionId: string;
  sessionType: 'training' | 'competition';
}

export interface LandingPoint {
  x: number;
  y: number;
  distance: number;
  throwIndex?: number;
}

export interface WeeklyMonthlyStats {
  count: number;
  totalThrows: number;
  avgRPE: number | string;
  byEvent: Record<string, EventStats>;
}

export interface EventStats {
  count: number;
  bestMark: number;
  avgMark: number;
  totalMark: number;
  totalThrows: number;
}

// An upcoming competition the athlete is pointing at (drives the dashboard countdown).
export interface Meet {
  id: string;
  name: string;
  date: string; // local 'YYYY-MM-DD' date key
}

// A target mark the athlete wants to hit. Stored canonical meters, like all marks.
export interface GoalMark {
  event: string;
  targetMark: number; // meters
}

export type TabId = 'dashboard' | 'profile' | 'log' | 'history' | 'progress';
export type HistoryView = 'recent' | 'weekly' | 'monthly';
export type SessionType = 'training' | 'competition';
