'use client';

// The persistent app chrome: loading/onboarding/meet-day gates, header,
// route-aware tab nav (Links), and the global overlays. Rendered once in the
// root layout; the active route's page is its {children}.
import { type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  AppLogo, DashboardIcon, ProfileIcon, LogIcon, HistoryIcon, ProgressIcon, SunIcon, MoonIcon,
} from '@/components/Icons';
import Onboarding from '@/components/Onboarding';
import MeetDayMode from '@/components/MeetDayMode';
import PRAlert from '@/components/PRAlert';
import AchievementToast from '@/components/AchievementToast';
import SeasonWrapped from '@/components/SeasonWrapped';
import { getEffectiveLevel } from '@/lib/athlete-level';

const NAV = [
  { href: '/', label: 'Dashboard', Icon: DashboardIcon },
  { href: '/profile', label: 'Profile', Icon: ProfileIcon },
  { href: '/log', label: 'Log', Icon: LogIcon },
  { href: '/history', label: 'History', Icon: HistoryIcon },
  { href: '/progress', label: 'Progress', Icon: ProgressIcon },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const app = useApp();
  const pathname = usePathname();

  if (!app.loaded) {
    return (
      <div className="loading">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (app.showOnboarding) {
    return (
      <div className="app">
        <Onboarding onComplete={app.completeOnboarding} />
      </div>
    );
  }

  if (app.showMeetDay) {
    return (
      <div className={`app${app.darkMode ? ' dark-mode' : ''}`}>
        <MeetDayMode
          distanceUnit={app.distanceUnit}
          profile={app.profile}
          priorBestByEvent={app.priorBestByEvent}
          onSave={app.saveMeet}
          onExit={app.exitMeetDay}
        />
      </div>
    );
  }

  return (
    <div className={`app${app.darkMode ? ' dark-mode' : ''}`}>
      <header className="header">
        <div className="header-content">
          <div className="logo-group">
            <AppLogo size={28} />
            <h1 className="logo">ThrowingTracker</h1>
          </div>
          <div className="header-right">
            <button className="dark-mode-toggle" onClick={app.toggleDarkMode} title="Toggle dark mode">
              {app.darkMode ? <SunIcon size={18} /> : <MoonIcon size={18} />}
            </button>
            {app.streak > 0 && (
              <div className="streak-badge">
                <span className="streak-number">{app.streak}</span>
                <span className="streak-label">&#128293;</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <nav className="tab-nav">
        {NAV.map(({ href, label, Icon }) => (
          <Link key={href} href={href} className={`tab-button${pathname === href ? ' active' : ''}`}>
            <span className="tab-icon"><Icon size={22} /></span>
            <span className="tab-label">{label}</span>
          </Link>
        ))}
      </nav>

      <main className="main" id="main-content">{children}</main>

      {app.prAlert && (
        <PRAlert
          eventName={app.prAlert.eventName}
          newMark={app.prAlert.newMark}
          previousBest={app.prAlert.previousBest}
          distanceUnit={app.distanceUnit}
          confetti={getEffectiveLevel(app.profile) === 'rookie'}
          onClose={app.dismissPrAlert}
        />
      )}

      {app.achievementToasts.length > 0 && (
        <AchievementToast achievement={app.achievementToasts[0]} onDone={app.dismissToast} />
      )}

      {app.showWrapped && (
        <SeasonWrapped sessions={app.sessions} profile={app.profile} onClose={app.closeWrapped} />
      )}
    </div>
  );
}
