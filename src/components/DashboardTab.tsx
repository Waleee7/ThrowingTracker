'use client';

import { Session, Profile, PersonalBest, TabId } from '@/lib/types';
import { EVENTS } from '@/lib/constants';
import { formatDistance, type DistanceUnit } from '@/lib/units';
import { calculateStreak, getWeeklyStats } from '@/lib/analytics';
import { calculatePersonalBests, getCurrentSeasonBests } from '@/lib/personal-bests';
import { shouldShowBackupReminder } from '@/lib/export';
import AchievementBadges from '@/components/AchievementBadges';
import EmptyState from '@/components/EmptyState';

interface DashboardTabProps {
  sessions: Session[];
  profile: Profile;
  onNavigate: (tab: TabId) => void;
  onStartMeetDay?: () => void;
  onLoadSample?: () => void;
}

export default function DashboardTab({ sessions, profile, onNavigate, onStartMeetDay, onLoadSample }: DashboardTabProps) {
  const distanceUnit = profile.distanceUnit ?? 'm';
  const streak = calculateStreak(sessions);
  const weeklyStats = getWeeklyStats(sessions);
  const hasProfile = profile.name && profile.sex;
  const showBackupReminder = shouldShowBackupReminder();

  const lastSession = sessions.length > 0
    ? sessions.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    : null;

  const lastEvent = lastSession ? EVENTS.find((e) => e.id === lastSession.event) : null;
  const lastDateStr = lastSession
    ? new Date(lastSession.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '';

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
      <h2 className="tab-title">Dashboard</h2>

      {!hasProfile && (
        <div className="reminder">
          <span>&#128161;</span>
          <span>Complete your profile to get the most out of the app</span>
        </div>
      )}

      {showBackupReminder && sessions.length > 0 && (
        <div className="reminder" style={{ backgroundColor: '#e8f4fd', borderColor: '#4facfe' }}>
          <span>&#128190;</span>
          <span>Back up your data! Go to Profile to export.</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{streak}</div>
          <div className="stat-label">Day Streak</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{weeklyStats.count}</div>
          <div className="stat-label">Week</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{weeklyStats.totalThrows}</div>
          <div className="stat-label">Throws</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{weeklyStats.avgRPE || '\u2014'}</div>
          <div className="stat-label">Avg RPE</div>
        </div>
      </div>

      {/* Personal Bests */}
      {allTimePBs.length > 0 && (
        <div className="pb-section">
          <h3 className="section-title">Personal Bests</h3>
          <div className="pb-grid">
            {allTimePBs.map((pb) => {
              const event = EVENTS.find((e) => e.id === pb.event);
              const seasonPB = seasonPBs.find((s) => s.event === pb.event);
              return (
                <PBCard key={pb.event} pb={pb} seasonPB={seasonPB} eventName={event?.name || pb.event} distanceUnit={distanceUnit} />
              );
            })}
          </div>
        </div>
      )}

      {/* Last Session */}
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

      {/* Achievement Badges - Compact */}
      {sessions.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 className="section-title">Badges</h3>
          <AchievementBadges sessions={sessions} compact />
        </div>
      )}

      {/* Action buttons */}
      <div className="dashboard-actions">
        <button className="primary-button" onClick={() => onNavigate('log')}>
          + Log Session
        </button>
        {onStartMeetDay && (
          <button className="secondary-button meet-day-launch" onClick={onStartMeetDay}>
            Meet Day Mode
          </button>
        )}
      </div>
    </div>
  );
}

function PBCard({ pb, seasonPB, eventName, distanceUnit }: { pb: PersonalBest; seasonPB?: PersonalBest; eventName: string; distanceUnit: DistanceUnit }) {
  return (
    <div className="pb-card">
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
