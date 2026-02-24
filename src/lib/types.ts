export interface ThrowingEvent {
  id: string;
  name: string;
  svg: string;
}

export interface Session {
  id: string;
  date: string;
  event: string;
  sessionType: 'training' | 'competition';
  rpe: number;
  throws: number;
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
}

export type TabId = 'dashboard' | 'profile' | 'log' | 'history' | 'progress';
export type HistoryView = 'recent' | 'weekly' | 'monthly';
export type SessionType = 'training' | 'competition';
