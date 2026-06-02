'use client';

// App-wide state, lifted out of the old single-page page.tsx so it can be
// shared across real routes (W9 App Router migration). The provider lives in
// the root layout, so it persists across client-side navigations — saving in
// /log updates the same store the dashboard reads.
import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { TabId, Session, Profile } from '@/lib/types';
import { type DistanceUnit } from '@/lib/units';
import { useProfile } from '@/hooks/useProfile';
import { useSessions } from '@/hooks/useSessions';
import { checkForNewPR, calculatePersonalBests } from '@/lib/personal-bests';
import { getNewlyUnlocked, getUnlockedAchievements, Achievement } from '@/lib/achievements';
import { calculateStreak } from '@/lib/analytics';
import { storage } from '@/lib/storage';
import { deleteMedia } from '@/lib/media-storage';
import { loadSampleData } from '@/lib/seed';

const TAB_PATHS: Record<TabId, string> = {
  dashboard: '/',
  profile: '/profile',
  log: '/log',
  history: '/history',
  progress: '/progress',
};

interface PrAlertState {
  eventName: string;
  newMark: number;
  previousBest: number | null;
}

interface AppContextValue {
  loaded: boolean;
  profile: Profile;
  setProfile: (p: Profile) => void;
  sessions: Session[];
  distanceUnit: DistanceUnit;
  streak: number;
  editSession: Session | null;
  saveSession: (s: Session) => void;
  startEditSession: (s: Session) => void;
  cancelEdit: () => void;
  removeSession: (id: string) => void;
  navigateTab: (tab: TabId) => void;
  loadSample: () => void;
  onDataImported: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  showOnboarding: boolean;
  completeOnboarding: (partial: Partial<Profile>) => void;
  showMeetDay: boolean;
  startMeetDay: () => void;
  exitMeetDay: () => void;
  saveMeet: (s: Session) => void;
  priorBestByEvent: Record<string, number>;
  prAlert: PrAlertState | null;
  dismissPrAlert: () => void;
  achievementToasts: Achievement[];
  dismissToast: () => void;
  showWrapped: boolean;
  startWrapped: () => void;
  closeWrapped: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { profile, setProfile, loaded: profileLoaded } = useProfile();
  const { sessions, addSession, updateSession, deleteSession, reloadSessions, loaded: sessionsLoaded } = useSessions();
  const [editSession, setEditSession] = useState<Session | null>(null);
  const [prAlert, setPrAlert] = useState<PrAlertState | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [showMeetDay, setShowMeetDay] = useState(false);
  const [showWrapped, setShowWrapped] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [achievementToasts, setAchievementToasts] = useState<Achievement[]>([]);
  const unlockedIdsRef = useRef<string[]>([]);

  const loaded = profileLoaded && sessionsLoaded;

  // Track which achievements are already unlocked (so new ones can toast).
  useEffect(() => {
    if (sessionsLoaded && sessions.length > 0) {
      unlockedIdsRef.current = getUnlockedAchievements(sessions)
        .filter((a) => a.unlocked)
        .map((a) => a.id);
    }
  }, [sessionsLoaded, sessions]);

  // First-time user → onboarding.
  useEffect(() => {
    if (profileLoaded && sessionsLoaded && !profile.name && sessions.length === 0) {
      setShowOnboarding(true);
    }
  }, [profileLoaded, sessionsLoaded, profile.name, sessions.length]);

  useEffect(() => {
    if (storage.getDarkMode()) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      storage.setDarkMode(next);
      return next;
    });
  }, []);

  const navigateTab = useCallback((tab: TabId) => { router.push(TAB_PATHS[tab]); }, [router]);

  const fireAchievements = useCallback((updatedSessions: Session[], vibrate = false) => {
    const newBadges = getNewlyUnlocked(updatedSessions, unlockedIdsRef.current);
    if (newBadges.length > 0) {
      setAchievementToasts(newBadges);
      unlockedIdsRef.current = [...unlockedIdsRef.current, ...newBadges.map((b) => b.id)];
      if (vibrate && 'vibrate' in navigator) navigator.vibrate([30, 20, 30]);
    }
  }, []);

  const saveSession = useCallback((session: Session) => {
    if (editSession?.id === session.id) {
      updateSession(session.id, session);
      setEditSession(null);
      router.push('/history');
      return;
    }
    const prResult = checkForNewPR(sessions, session);
    addSession(session);
    if (prResult.isPR) {
      setPrAlert({ eventName: prResult.eventName, newMark: session.bestMark, previousBest: prResult.previousBest });
      if ('vibrate' in navigator) navigator.vibrate(50);
    }
    fireAchievements([...sessions, session], true);
    router.push('/');
  }, [editSession, sessions, addSession, updateSession, fireAchievements, router]);

  const saveMeet = useCallback((session: Session) => {
    addSession(session);
    fireAchievements([...sessions, session]);
    setShowMeetDay(false);
    router.push('/');
  }, [sessions, addSession, fireAchievements, router]);

  const startEditSession = useCallback((session: Session) => {
    setEditSession(session);
    router.push('/log');
  }, [router]);

  const removeSession = useCallback((id: string) => {
    // Free any IndexedDB-stored media so deleted sessions don't orphan blobs.
    const session = sessions.find((s) => s.id === id);
    session?.media?.forEach((m) => { if (m.indexedDbKey) deleteMedia(m.indexedDbKey).catch(() => {}); });
    deleteSession(id);
  }, [sessions, deleteSession]);

  const cancelEdit = useCallback(() => { setEditSession(null); router.push('/history'); }, [router]);
  const onDataImported = useCallback(() => { reloadSessions(); }, [reloadSessions]);
  const loadSample = useCallback(() => { loadSampleData(); reloadSessions(); router.push('/'); }, [reloadSessions, router]);
  const completeOnboarding = useCallback((partial: Partial<Profile>) => {
    setProfile({ ...profile, ...partial });
    setShowOnboarding(false);
  }, [profile, setProfile]);
  const dismissToast = useCallback(() => setAchievementToasts((prev) => prev.slice(1)), []);
  const startMeetDay = useCallback(() => setShowMeetDay(true), []);
  const exitMeetDay = useCallback(() => setShowMeetDay(false), []);
  const startWrapped = useCallback(() => setShowWrapped(true), []);
  const closeWrapped = useCallback(() => setShowWrapped(false), []);
  const dismissPrAlert = useCallback(() => setPrAlert(null), []);

  const distanceUnit = (profile.distanceUnit ?? 'm') as DistanceUnit;
  const streak = calculateStreak(sessions);
  const priorBestByEvent: Record<string, number> = {};
  for (const pb of calculatePersonalBests(sessions)) priorBestByEvent[pb.event] = pb.mark;

  const value: AppContextValue = {
    loaded, profile, setProfile, sessions, distanceUnit, streak,
    editSession, saveSession, startEditSession, cancelEdit, removeSession,
    navigateTab, loadSample, onDataImported,
    darkMode, toggleDarkMode,
    showOnboarding, completeOnboarding,
    showMeetDay, startMeetDay, exitMeetDay, saveMeet, priorBestByEvent,
    prAlert, dismissPrAlert,
    achievementToasts, dismissToast,
    showWrapped, startWrapped, closeWrapped,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
