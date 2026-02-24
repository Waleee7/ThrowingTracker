'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { TabId, Session, Profile } from '@/lib/types';
import { useProfile } from '@/hooks/useProfile';
import { useSessions } from '@/hooks/useSessions';
import { checkForNewPR } from '@/lib/personal-bests';
import { getNewlyUnlocked, getUnlockedAchievements, Achievement } from '@/lib/achievements';
import FloatingElements from '@/components/FloatingElements';
import TabButton from '@/components/TabButton';
import DashboardTab from '@/components/DashboardTab';
import ProfileTab from '@/components/ProfileTab';
import LogTab from '@/components/LogTab';
import HistoryTab from '@/components/HistoryTab';
import ProgressChart from '@/components/ProgressChart';
import ThrowScatter from '@/components/ThrowScatter';
import PRAlert from '@/components/PRAlert';
import MeetDayMode from '@/components/MeetDayMode';
import AchievementBadges from '@/components/AchievementBadges';
import AchievementToast from '@/components/AchievementToast';
import Onboarding from '@/components/Onboarding';
import { AppLogo, DashboardIcon, ProfileIcon, LogIcon, HistoryIcon, ProgressIcon, SunIcon, MoonIcon } from '@/components/Icons';
import { calculateStreak } from '@/lib/analytics';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const { profile, setProfile, loaded: profileLoaded } = useProfile();
  const { sessions, addSession, updateSession, deleteSession, reloadSessions, loaded: sessionsLoaded } = useSessions();
  const [editSession, setEditSession] = useState<Session | null>(null);
  const [prAlert, setPrAlert] = useState<{ eventName: string; newMark: number; previousBest: number | null } | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [showMeetDay, setShowMeetDay] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [achievementToasts, setAchievementToasts] = useState<Achievement[]>([]);
  const unlockedIdsRef = useRef<string[]>([]);

  // Track which achievements are already unlocked
  useEffect(() => {
    if (sessionsLoaded && sessions.length > 0) {
      const all = getUnlockedAchievements(sessions);
      unlockedIdsRef.current = all.filter((a) => a.unlocked).map((a) => a.id);
    }
  }, [sessionsLoaded, sessions]);

  // Check if first-time user
  useEffect(() => {
    if (profileLoaded && sessionsLoaded) {
      if (!profile.name && sessions.length === 0) {
        setShowOnboarding(true);
      }
    }
  }, [profileLoaded, sessionsLoaded, profile.name, sessions.length]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('throwingDarkMode');
      if (saved === 'true') {
        setDarkMode(true);
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('throwingDarkMode', String(next));
      return next;
    });
  }, []);

  const handleSaveSession = useCallback((session: Session) => {
    const isEdit = editSession?.id === session.id;

    if (isEdit) {
      updateSession(session.id, session);
      setEditSession(null);
      setActiveTab('history');
    } else {
      // Check for PR before adding
      const prResult = checkForNewPR(sessions, session);
      addSession(session);

      if (prResult.isPR) {
        setPrAlert({
          eventName: prResult.eventName,
          newMark: session.bestMark,
          previousBest: prResult.previousBest,
        });
        if ('vibrate' in navigator) navigator.vibrate(50);
      }

      // Check for new achievements
      const updatedSessions = [...sessions, session];
      const newBadges = getNewlyUnlocked(updatedSessions, unlockedIdsRef.current);
      if (newBadges.length > 0) {
        setAchievementToasts(newBadges);
        unlockedIdsRef.current = [
          ...unlockedIdsRef.current,
          ...newBadges.map((b) => b.id),
        ];
        if ('vibrate' in navigator) navigator.vibrate([30, 20, 30]);
      }

      setActiveTab('dashboard');
    }
  }, [editSession, sessions, addSession, updateSession]);

  const handleMeetSave = useCallback((session: Session) => {
    addSession(session);

    // Check for new achievements
    const updatedSessions = [...sessions, session];
    const newBadges = getNewlyUnlocked(updatedSessions, unlockedIdsRef.current);
    if (newBadges.length > 0) {
      setAchievementToasts(newBadges);
      unlockedIdsRef.current = [
        ...unlockedIdsRef.current,
        ...newBadges.map((b) => b.id),
      ];
    }

    setShowMeetDay(false);
    setActiveTab('dashboard');
  }, [sessions, addSession]);

  const handleEditSession = useCallback((session: Session) => {
    setEditSession(session);
    setActiveTab('log');
  }, []);

  const handleDeleteSession = useCallback((id: string) => {
    deleteSession(id);
  }, [deleteSession]);

  const handleCancelEdit = useCallback(() => {
    setEditSession(null);
    setActiveTab('history');
  }, []);

  const handleDataImported = useCallback(() => {
    reloadSessions();
  }, [reloadSessions]);

  const handleNavigate = useCallback((tab: TabId) => {
    setActiveTab(tab);
  }, []);

  const handleOnboardingComplete = useCallback((partial: Partial<Profile>) => {
    setProfile({
      ...profile,
      name: partial.name || '',
      events: partial.events || [],
    });
    setShowOnboarding(false);
  }, [profile, setProfile]);

  const dismissToast = useCallback(() => {
    setAchievementToasts((prev) => prev.slice(1));
  }, []);

  if (!profileLoaded || !sessionsLoaded) {
    return (
      <div className="loading">
        <div className="loading-spinner" />
      </div>
    );
  }

  // Onboarding for first-time users
  if (showOnboarding) {
    return (
      <div className="app">
        <FloatingElements />
        <Onboarding onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  // Meet Day Mode (full screen takeover)
  if (showMeetDay) {
    return (
      <div className={`app${darkMode ? ' dark-mode' : ''}`}>
        <FloatingElements />
        <MeetDayMode
          onSave={handleMeetSave}
          onExit={() => setShowMeetDay(false)}
        />
      </div>
    );
  }

  const streak = calculateStreak(sessions);

  return (
    <div className={`app${darkMode ? ' dark-mode' : ''}`}>
      <FloatingElements />

      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo-group">
            <AppLogo size={28} />
            <h1 className="logo">ThrowingTracker</h1>
          </div>
          <div className="header-right">
            <button className="dark-mode-toggle" onClick={toggleDarkMode} title="Toggle dark mode">
              {darkMode ? <SunIcon size={18} /> : <MoonIcon size={18} />}
            </button>
            {streak > 0 && (
              <div className="streak-badge">
                <span className="streak-number">{streak}</span>
                <span className="streak-label">&#128293;</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="tab-nav">
        <TabButton id="dashboard" icon={<DashboardIcon size={22} />} label="Dashboard" isActive={activeTab === 'dashboard'} onClick={setActiveTab} />
        <TabButton id="profile" icon={<ProfileIcon size={22} />} label="Profile" isActive={activeTab === 'profile'} onClick={setActiveTab} />
        <TabButton id="log" icon={<LogIcon size={22} />} label="Log" isActive={activeTab === 'log'} onClick={setActiveTab} />
        <TabButton id="history" icon={<HistoryIcon size={22} />} label="History" isActive={activeTab === 'history'} onClick={setActiveTab} />
        <TabButton id="progress" icon={<ProgressIcon size={22} />} label="Progress" isActive={activeTab === 'progress'} onClick={setActiveTab} />
      </nav>

      {/* Main Content */}
      <main className="main" id="main-content">
        {activeTab === 'dashboard' && (
          <DashboardTab
            sessions={sessions}
            profile={profile}
            onNavigate={handleNavigate}
            onStartMeetDay={() => setShowMeetDay(true)}
          />
        )}
        {activeTab === 'profile' && (
          <div>
            <ProfileTab profile={profile} onSave={setProfile} onDataImported={handleDataImported} />
            <div className="tab-content" style={{ paddingTop: 0 }}>
              <AchievementBadges sessions={sessions} />
            </div>
          </div>
        )}
        {activeTab === 'log' && (
          <LogTab
            profile={profile}
            onSave={handleSaveSession}
            editSession={editSession}
            onCancelEdit={handleCancelEdit}
          />
        )}
        {activeTab === 'history' && (
          <HistoryTab
            sessions={sessions}
            onEditSession={handleEditSession}
            onDeleteSession={handleDeleteSession}
          />
        )}
        {activeTab === 'progress' && (
          <div className="tab-content">
            <h2 className="tab-title">Progress</h2>
            <ProgressChart sessions={sessions} />
            <div style={{ marginTop: 32 }}>
              <h3 className="section-title">Landing Zone Analysis</h3>
              <ThrowScatter sessions={sessions} />
            </div>
          </div>
        )}
      </main>

      {/* PR Alert */}
      {prAlert && (
        <PRAlert
          eventName={prAlert.eventName}
          newMark={prAlert.newMark}
          previousBest={prAlert.previousBest}
          onClose={() => setPrAlert(null)}
        />
      )}

      {/* Achievement Toasts */}
      {achievementToasts.length > 0 && (
        <AchievementToast
          achievement={achievementToasts[0]}
          onDone={dismissToast}
        />
      )}
    </div>
  );
}
