import { Profile, Session } from './types';

const PROFILE_KEY = 'throwingProfile';
const SESSIONS_KEY = 'throwingSessions';
const LAST_EXPORT_KEY = 'throwingLastExport';
const DARK_MODE_KEY = 'throwingDarkMode';

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

function set(key: string, value: unknown): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Storage write error:', error);
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
