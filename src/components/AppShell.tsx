'use client';

// The persistent app chrome: loading/onboarding/meet-day gates, header,
// route-aware tab nav (Links), and the global overlays. Rendered once in the
// root layout; the active route's page is its {children}.
import { type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  AppLogo, DashboardIcon, ProfileIcon, LogIcon, HistoryIcon, ProgressIcon, CoachIcon, TechniqueIcon, SunIcon, MoonIcon,
} from '@/components/Icons';
import Onboarding from '@/components/Onboarding';
import MeetDayMode from '@/components/MeetDayMode';
import PRAlert from '@/components/PRAlert';
import AchievementToast from '@/components/AchievementToast';
import SeasonWrapped from '@/components/SeasonWrapped';
import WeeklyRecap from '@/components/WeeklyRecap';
import { getEffectiveLevel } from '@/lib/athlete-level';
import { haptic } from '@/lib/haptics';

// Most-used first so they stay visible if a narrow screen scrolls the row;
// Profile holds the conventional last slot.
// On phones the bar is a 5-slot bottom dock (Home · History · LOG · Progress ·
// Coach); `secondary` tabs hide there and stay reachable (Technique from Home,
// Profile from the header avatar). Desktop shows all seven in a top rail.
const NAV = [
  { href: '/', label: 'Home', slug: 'home', Icon: DashboardIcon, secondary: false },
  { href: '/log', label: 'Log', slug: 'log', Icon: LogIcon, secondary: false },
  { href: '/coach', label: 'Coach', slug: 'coach', Icon: CoachIcon, secondary: false },
  { href: '/technique', label: 'Technique', slug: 'technique', Icon: TechniqueIcon, secondary: true },
  { href: '/progress', label: 'Progress', slug: 'progress', Icon: ProgressIcon, secondary: false },
  { href: '/history', label: 'History', slug: 'history', Icon: HistoryIcon, secondary: false },
  { href: '/profile', label: 'Profile', slug: 'profile', Icon: ProfileIcon, secondary: true },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const app = useApp();
  const pathname = usePathname();
  const initials = (app.profile.name || '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || 'ME';

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
    <div className="app">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <header className="header">
        <div className="header-content">
          <div className="logo-group">
            <AppLogo size={28} />
            <h1 className="logo">ThrowingTracker</h1>
          </div>
          <div className="header-right">
            <button
              className="dark-mode-toggle"
              onClick={() => { haptic('tap'); app.toggleDarkMode(); }}
              aria-label={app.darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-pressed={app.darkMode}
            >
              {app.darkMode ? <SunIcon size={18} /> : <MoonIcon size={18} />}
            </button>
            <Link
              href="/profile"
              className={`header-avatar${pathname === '/profile' ? ' active' : ''}`}
              aria-label="Profile and settings"
              aria-current={pathname === '/profile' ? 'page' : undefined}
              onClick={() => haptic('tap')}
            >
              {initials}
            </Link>
          </div>
        </div>
      </header>

      <nav className="tab-nav" aria-label="Primary">
        {NAV.map(({ href, label, slug, Icon, secondary }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => { if (!isActive) haptic('tap'); }}
              className={`tab-button tab-${slug}${secondary ? ' tab-secondary' : ''}${isActive ? ' active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="tab-icon" aria-hidden="true"><Icon size={href === '/log' ? 26 : 22} /></span>
              <span className="tab-label">{label}</span>
            </Link>
          );
        })}
      </nav>

      <main className="main" id="main-content">{children}</main>

      {app.prAlert && (
        <PRAlert
          eventName={app.prAlert.eventName}
          newMark={app.prAlert.newMark}
          previousBest={app.prAlert.previousBest}
          distanceUnit={app.distanceUnit}
          confetti={getEffectiveLevel(app.profile) === 'rookie'}
          athleteName={app.profile.name}
          onClose={app.dismissPrAlert}
        />
      )}

      {app.showRecap && app.recapData && (
        <WeeklyRecap
          data={app.recapData}
          distanceUnit={app.distanceUnit}
          athleteName={app.profile.name}
          onClose={app.closeRecap}
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
