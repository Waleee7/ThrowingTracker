'use client';

import { useState } from 'react';
import { Session, Profile, PersonalBest, TabId } from '@/lib/types';
import { EVENTS } from '@/lib/constants';
import { formatDistance, type DistanceUnit } from '@/lib/units';
import { calculateStreak, getWeeklyStats } from '@/lib/analytics';
import { calculatePersonalBests, getCurrentSeasonBests } from '@/lib/personal-bests';
import { shouldShowBackupReminder } from '@/lib/export';
import Link from 'next/link';
import AchievementBadges from '@/components/AchievementBadges';
import EmptyState from '@/components/EmptyState';
import ReadinessCard from '@/components/ReadinessCard';
import HeroMedia from '@/components/HeroMedia';
import TodayCard from '@/components/TodayCard';
import GoalCountdownCard from '@/components/GoalCountdownCard';
import { ShareIcon } from '@/components/Icons';
import { shareCard } from '@/lib/share-card';
import { vibrate } from '@/lib/haptics';

interface DashboardTabProps {
  sessions: Session[];
  profile: Profile;
  onNavigate: (tab: TabId) => void;
  onStartMeetDay?: () => void;
  onStartWrapped?: () => void;
  onLoadSample?: () => void;
}

export default function DashboardTab({ sessions, profile, onNavigate, onStartMeetDay, onStartWrapped, onLoadSample }: DashboardTabProps) {
  const [view, setView] = useState<'today' | 'records'>('today');
  const distanceUnit = profile.distanceUnit ?? 'm';
  const streak = calculateStreak(sessions);
  const weeklyStats = getWeeklyStats(sessions);
  const hasProfile = profile.name && profile.sex;
  const showBackupReminder = shouldShowBackupReminder();
  const firstName = (profile.name || '').split(' ')[0];

  const lastSession = sessions.length > 0
    ? sessions.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    : null;
  const lastEvent = lastSession ? EVENTS.find((e) => e.id === lastSession.event) : null;
  const lastDateStr = lastSession
    ? new Date(lastSession.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '';

  // Days since last throw → human-friendly hero subline.
  const daysSince = lastSession
    ? Math.floor((Date.now() - new Date(lastSession.date).getTime()) / 86400000)
    : null;
  const lastThrewText =
    daysSince === null ? '' :
    daysSince <= 0 ? 'You threw today \u{1F525}' :
    daysSince === 1 ? 'Last threw yesterday' :
    `Last threw ${daysSince} days ago`;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const allTimePBs = calculatePersonalBests(sessions);
  const seasonPBs = getCurrentSeasonBests(sessions);

  if (sessions.length === 0) {
    return (
      <div className="tab-content" id="tab-dashboard">
        <h2 className="tab-title">Dashboard</h2>
        {!hasProfile && (
          <div className="reminder">
            <span>&#128161;</span>
            <span>Complete your profile to get the most out of the app</span>
          </div>
        )}
        <EmptyState
          title="Let's log your first throw"
          text="Track every mark, foul, RPE and video — your PRs, streak and progress build automatically."
          actionLabel="+ Log a session"
          onAction={() => onNavigate('log')}
          secondaryLabel={onLoadSample ? 'Load sample data' : undefined}
          onSecondary={onLoadSample}
        />
      </div>
    );
  }

  return (
    <div className="tab-content" id="tab-dashboard">
      {/* Segmented control (Today / Records) */}
      <div className="dash-segment">
        <button className={view === 'today' ? 'active' : ''} onClick={() => setView('today')}>Today</button>
        <button className={view === 'records' ? 'active' : ''} onClick={() => setView('records')}>Records</button>
      </div>

      {!hasProfile && (
        <div className="reminder">
          <span>&#128161;</span>
          <span>Complete your profile to get the most out of the app</span>
        </div>
      )}
      {showBackupReminder && (
        <div className="reminder reminder-info">
          <span>&#128190;</span>
          <span>Back up your data! Go to Profile to export.</span>
        </div>
      )}

      {view === 'today' ? (
        <>
          {/* Glanceable status — answers "what's my status today?" in <10s */}
          <TodayCard sessions={sessions} profile={profile} />

          {/* Stakes: next meet countdown + goal progress (set in Profile) */}
          <GoalCountdownCard />

          {/* Hero — broadcast stat-channel over event-specific cinematic still */}
          <HeroMedia className="dash-hero" event={lastSession?.event} priority>
            <div className="dash-hero-top">
              <div>
                {lastEvent && <div className="eyebrow dash-hero-eyebrow">Last session &middot; {lastEvent.name}</div>}
                <div className="dash-hero-greeting">{greeting}{firstName ? `, ${firstName}` : ''}</div>
                {lastThrewText && <div className="dash-hero-sub">{lastThrewText}</div>}
              </div>
              {streak > 0 && <div className="dash-hero-streak">{streak}&#128293;</div>}
            </div>
            <button className="primary-button" onClick={() => onNavigate('log')}>+ Log Session</button>
          </HeroMedia>

          {/* Compact KPI pills */}
          <div className="dash-pills">
            <div className="dash-pill">
              <span className="dp-val">{weeklyStats.count}</span>
              <span className="dp-label">This week</span>
            </div>
            <div className="dash-pill">
              <span className="dp-val">{weeklyStats.totalThrows}</span>
              <span className="dp-label">Throws</span>
            </div>
            <div className="dash-pill">
              <span className="dp-val">{weeklyStats.avgRPE || '—'}</span>
              <span className="dp-label">Avg RPE</span>
            </div>
          </div>

          {/* Readiness */}
          <div className="readiness-section">
            <h3 className="section-title">Readiness</h3>
            <ReadinessCard sessions={sessions} />
          </div>

          {/* Last session */}
          {lastSession && (
            <div className="last-session">
              <h3 className="section-title">Last Session</h3>
              <div className="session-card">
                <div className="session-header">
                  <span className="session-event">{lastEvent?.name || lastSession.event}</span>
                  <span className="session-date">{lastDateStr}</span>
                </div>
                <div className="session-stats">
                  <div className="session-stat">
                    <span className="session-stat-label">Best</span>
                    <span className="session-stat-value">{formatDistance(lastSession.bestMark, distanceUnit)}</span>
                  </div>
                  <div className="session-stat">
                    <span className="session-stat-label">RPE</span>
                    <span className="session-stat-value">{lastSession.rpe}/10</span>
                  </div>
                  <div className="session-stat">
                    <span className="session-stat-label">Throws</span>
                    <span className="session-stat-value">{lastSession.throws}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Secondary actions */}
          <div className="dash-actions-row">
            {onStartMeetDay && (
              <button className="secondary-button meet-day-launch" onClick={onStartMeetDay}>Meet Day</button>
            )}
            <Link href={`/technique${lastSession ? `?event=${lastSession.event}` : ''}`} className="secondary-button">Technique</Link>
            {onStartWrapped && sessions.length >= 3 && (
              <button className="secondary-button wrapped-launch" onClick={onStartWrapped}>&#x1F94F; Wrapped</button>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Records: PBs + badges */}
          {allTimePBs.length > 0 ? (
            <div className="pb-section">
              <h3 className="section-title">Personal Bests</h3>
              <div className="pb-grid">
                {allTimePBs.map((pb) => {
                  const event = EVENTS.find((e) => e.id === pb.event);
                  const seasonPB = seasonPBs.find((s) => s.event === pb.event);
                  return (
                    <PBCard key={pb.event} pb={pb} seasonPB={seasonPB} eventName={event?.name || pb.event} distanceUnit={distanceUnit} athleteName={profile.name} />
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="dash-empty-note">Log a few sessions and your personal bests will show up here.</p>
          )}

          <div style={{ marginTop: 24 }}>
            <h3 className="section-title">Badges</h3>
            <AchievementBadges sessions={sessions} />
          </div>
        </>
      )}
    </div>
  );
}

function PBCard({ pb, seasonPB, eventName, distanceUnit, athleteName }: { pb: PersonalBest; seasonPB?: PersonalBest; eventName: string; distanceUnit: DistanceUnit; athleteName?: string }) {
  const [shareMsg, setShareMsg] = useState('');

  const handleShare = async () => {
    vibrate(20);
    const outcome = await shareCard(
      {
        title: 'Personal best',
        headline: formatDistance(pb.mark, distanceUnit),
        sub: `${eventName} · ${new Date(pb.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
        athlete: athleteName,
        accent: 'pb',
      },
      'personal-best.png',
    );
    setShareMsg(outcome === 'downloaded' ? '↓' : outcome === 'failed' ? '!' : '✓');
    setTimeout(() => setShareMsg(''), 2000);
  };

  return (
    <div className="pb-card">
      <button className="pb-share" onClick={handleShare} aria-label={`Share ${eventName} personal best`}>
        {shareMsg || <ShareIcon size={15} />}
      </button>
      <div className="pb-event">{eventName}</div>
      <div className="pb-mark">{formatDistance(pb.mark, distanceUnit)}</div>
      <div className="pb-date">
        {new Date(pb.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </div>
      {seasonPB && seasonPB.sessionId !== pb.sessionId && (
        <div className="pb-season">Season: {formatDistance(seasonPB.mark, distanceUnit)}</div>
      )}
    </div>
  );
}
