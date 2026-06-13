import { Profile, Session, Meet, GoalMark } from './types';
import type { FilmSessionRecord } from './film';

const PROFILE_KEY = 'throwingProfile';
const SESSIONS_KEY = 'throwingSessions';
const LAST_EXPORT_KEY = 'throwingLastExport';
const DARK_MODE_KEY = 'throwingDarkMode';
const SCHEMA_VERSION_KEY = 'throwingSchemaVersion';
const MEETS_KEY = 'throwingMeets';
const GOALS_KEY = 'throwingGoalMarks';
const RECAP_ENABLED_KEY = 'throwingRecapEnabled';
const RECAP_LAST_SHOWN_KEY = 'throwingRecapLastShown';
const FILM_SESSIONS_KEY = 'throwingFilmSessions';
const SCHEMA_VERSION = 3;

function get<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Storage read error:', error);
    return null;
  }
}

/** Fired on window when a localStorage write fails (quota / private mode). */
export const STORAGE_ERROR_EVENT = 'tt:storage-error';

function set(key: string, value: unknown): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Storage write error:', error);
    // Surface the failure — a silently dropped write means the athlete's
    // session looks logged until the next reload, then vanishes.
    try {
      window.dispatchEvent(new CustomEvent(STORAGE_ERROR_EVENT, { detail: { key } }));
    } catch { /* CustomEvent unavailable — nothing else we can do */ }
    return false;
  }
}

export const storage = {
  getProfile: (): Profile | null => get<Profile>(PROFILE_KEY),
  setProfile: (profile: Profile) => set(PROFILE_KEY, profile),

  getSessions: (): Session[] => get<Session[]>(SESSIONS_KEY) || [],
  setSessions: (sessions: Session[]) => set(SESSIONS_KEY, sessions),

  getLastExport: (): string | null => get<string>(LAST_EXPORT_KEY),
  setLastExport: (date: string) => set(LAST_EXPORT_KEY, date),

  getDarkMode: (): boolean => get<boolean>(DARK_MODE_KEY) ?? false,
  setDarkMode: (enabled: boolean) => set(DARK_MODE_KEY, enabled),

  getMeets: (): Meet[] => get<Meet[]>(MEETS_KEY) || [],
  setMeets: (meets: Meet[]) => set(MEETS_KEY, meets),

  getGoalMarks: (): GoalMark[] => get<GoalMark[]>(GOALS_KEY) || [],
  setGoalMarks: (goals: GoalMark[]) => set(GOALS_KEY, goals),

  // Weekly recap preferences (defaults ON; athlete can disable in Profile).
  getRecapEnabled: (): boolean => get<boolean>(RECAP_ENABLED_KEY) ?? true,
  setRecapEnabled: (enabled: boolean) => set(RECAP_ENABLED_KEY, enabled),
  getRecapLastShown: (): string | null => get<string>(RECAP_LAST_SHOWN_KEY),
  setRecapLastShown: (weekKey: string) => set(RECAP_LAST_SHOWN_KEY, weekKey),

  // Film Room session records (video/audio blobs live in IndexedDB).
  getFilmSessions: (): FilmSessionRecord[] => get<FilmSessionRecord[]>(FILM_SESSIONS_KEY) || [],
  setFilmSessions: (records: FilmSessionRecord[]) => set(FILM_SESSIONS_KEY, records),

  getSchemaVersion: (): number => get<number>(SCHEMA_VERSION_KEY) ?? 0,
  migrate: () => {
    if (typeof window === 'undefined') return;
    const from = get<number>(SCHEMA_VERSION_KEY) ?? 0;
    if (from >= SCHEMA_VERSION) return;
    // v0 -> v1: Profile gained optional tier fields (additive, no transform needed).
    // v1 -> v2: Canonical units. Distances were always stored in meters, so existing
    //   session marks are already canonical. Profile gains distanceUnit; default to 'm'
    //   for existing users so their experience is unchanged.
    if (from < 2) {
      const profile = get<Profile>(PROFILE_KEY);
      if (profile && profile.distanceUnit === undefined) {
        set(PROFILE_KEY, { ...profile, distanceUnit: 'm' });
      }
    }
    // v2 -> v3: Session gained optional throwLog (additive, no transform needed;
    //   existing sessions keep numeric `throws` as the source of truth).
    // Future schema migrations chain below this line.
    set(SCHEMA_VERSION_KEY, SCHEMA_VERSION);
  },

  clearAll: () => {
    if (typeof window === 'undefined') return;
    [
      PROFILE_KEY, SESSIONS_KEY, LAST_EXPORT_KEY, DARK_MODE_KEY, SCHEMA_VERSION_KEY,
      MEETS_KEY, GOALS_KEY, RECAP_ENABLED_KEY, RECAP_LAST_SHOWN_KEY, FILM_SESSIONS_KEY,
    ].forEach((k) =>
      localStorage.removeItem(k),
    );
  },

  getStorageUsage: (): { used: number; available: number } => {
    if (typeof window === 'undefined') return { used: 0, available: 0 };
    let used = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        used += localStorage.getItem(key)?.length || 0;
      }
    }
    return { used: used * 2, available: 5 * 1024 * 1024 }; // ~5MB typical limit
  },
};

if (typeof window !== 'undefined') {
  storage.migrate();
}
