'use client';

import { useState } from 'react';
import { Session, Profile, PersonalBest, TabId } from '@/lib/types';
import { EVENTS } from '@/lib/constants';
import { formatDistance, type DistanceUnit } from '@/lib/units';
import { calculateStreak, getWeeklyStats } from '@/lib/analytics';
import { calculatePersonalBests } from '@/lib/personal-bests';
import { shouldShowBackupReminder } from '@/lib/export';
import { computeReadiness } from '@/lib/readiness';
import { sparkSeries, headlinePR } from '@/lib/feed';
import { latestSession } from '@/lib/quick-log';
import Link from 'next/link';
import EmptyState from '@/components/EmptyState';
import ReadinessCard from '@/components/ReadinessCard';
import GoalCountdownCard from '@/components/GoalCountdownCard';
import Sparkline from '@/components/Sparkline';
import { ShareIcon, DiscIcon, PlusIcon } from '@/components/Icons';
import { shareCard } from '@/lib/share-card';
import { haptic } from '@/lib/haptics';

interface DashboardTabProps {
  sessions: Session[];
  profile: Profile;
  onNavigate: (tab: TabId) => void;
  onStartMeetDay?: () => void;
  onStartWrapped?: () => void;
  onLoadSample?: () => void;
}

export default function DashboardTab({ sessions, profile, onNavigate, onStartMeetDay, onStartWrapped, onLoadSample }: DashboardTabProps) {
  const distanceUnit = profile.distanceUnit ?? 'm';
  const streak = calculateStreak(sessions);
  const weeklyStats = getWeeklyStats(sessions);
  const showBackupReminder = shouldShowBackupReminder();
  const firstName = (profile.name || '').split(' ')[0];

  const lastSession = latestSession(sessions);
  const lastEvent = lastSession ? EVENTS.find((e) => e.id === lastSession.event) : null;
  const lastDateStr = lastSession
    ? new Date(lastSession.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const pbs = calculatePersonalBests(sessions);
  const heroPR = headlinePR(sessions, pbs);
  const otherPRs = pbs.filter((p) => p !== heroPR);
  const spark = sparkSeries(lastSession, sessions);
  const readiness = computeReadiness(sessions);

  const goLog = () => { haptic('tap'); onNavigate('log'); };

  if (sessions.length === 0) {
    return (
      <div className="tab-content feed" id="tab-dashboard">
        <EmptyState
          title="Log your first throw"
          text="Type a mark, tap save. Your PRs, streak and readiness build themselves."
          actionLabel="Log a throw"
          onAction={goLog}
          secondaryLabel={onLoadSample ? 'Try with sample data' : undefined}
          onSecondary={onLoadSample}
        />
      </div>
    );
  }

  return (
    <div className="tab-content feed" id="tab-dashboard">
      <div className="feed-greeting">
        <div>
          <div className="eyebrow">{lastEvent ? lastEvent.name : 'Today'}</div>
          <h2 className="feed-hello">{greeting}{firstName ? `, ${firstName}` : ''}</h2>
        </div>
        {streak > 0 && <div className="feed-streak" aria-label={`${streak} day streak`}><span className="tnum">{streak}</span> day streak</div>}
      </div>

      {showBackupReminder && (
        <Link href="/profile" className="feed-note">Back up your data in Profile &rarr;</Link>
      )}

      {/* 1. Readiness ring */}
      <ReadinessCard sessions={sessions} />

      {/* 2. Quick stats */}
      <div className="dash-pills">
        <div className="dash-pill"><span className="dp-val tnum">{weeklyStats.count}</span><span className="dp-label">Sessions this week</span></div>
        <div className="dash-pill"><span className="dp-val tnum">{weeklyStats.totalThrows}</span><span className="dp-label">Throws</span></div>
        <div className="dash-pill"><span className="dp-val tnum">{weeklyStats.avgRPE || '—'}</span><span className="dp-label">Avg RPE</span></div>
      </div>

      <GoalCountdownCard />

      {/* 3. PR card */}
      {heroPR && (
        <PRCard
          pb={heroPR}
          others={otherPRs}
          eventName={EVENTS.find((e) => e.id === heroPR.event)?.name || heroPR.event}
          distanceUnit={distanceUnit}
          athleteName={profile.name}
        />
      )}

      {/* 4. Session card + attempt sparkline */}
      {lastSession && (
        <section className="feed-card session-feed" aria-labelledby="last-session-h">
          <div className="feed-card-head">
            <h3 id="last-session-h" className="eyebrow">Last session</h3>
            <span className="t-meta">{lastEvent?.name || lastSession.event} · {lastDateStr}</span>
          </div>
          <div className="session-feed-stats">
            <div><span className="sf-val tnum">{lastSession.bestMark > 0 ? formatDistance(lastSession.bestMark, distanceUnit) : '—'}</span><span className="sf-label">Best</span></div>
            <div><span className="sf-val tnum">{lastSession.throws}</span><span className="sf-label">Throws</span></div>
            <div><span className="sf-val tnum">{lastSession.rpe}/10</span><span className="sf-label">RPE</span></div>
          </div>
          {spark && (
            <div className="spark-wrap">
              <Sparkline
                values={spark.values}
                label={spark.kind === 'attempts' ? 'Attempt-by-attempt distances for the last session' : `Best marks over your last ${spark.values.length} sessions`}
              />
              <span className="t-meta">{spark.kind === 'attempts' ? `${spark.values.length} attempts` : `Last ${spark.values.length} sessions`}</span>
            </div>
          )}
        </section>
      )}

      {/* 5. Coach nudge */}
      <Link href="/coach" className="feed-card coach-nudge" onClick={() => haptic('tap')}>
        <div>
          <div className="eyebrow">Coach</div>
          <p className="coach-nudge-text">
            {nudgeText(readiness.available, readiness.score)}
          </p>
        </div>
        <span className="coach-nudge-go" aria-hidden="true">&rarr;</span>
      </Link>

      {/* quiet tools */}
      <div className="feed-tools">
        {onStartMeetDay && <button type="button" onClick={() => { haptic('tap'); onStartMeetDay(); }}>Meet Day</button>}
        <Link href={`/technique${lastSession ? `?event=${lastSession.event}` : ''}`}>Technique</Link>
        {onStartWrapped && sessions.length >= 3 && (
          <button type="button" className="wrapped-launch" onClick={() => { haptic('tap'); onStartWrapped(); }}><DiscIcon size={16} /> Season Wrapped</button>
        )}
      </div>

      {/* 6. The one primary action */}
      <div className="feed-cta">
        <button type="button" className="primary-button feed-cta-btn" onClick={goLog}>
          <PlusIcon size={20} /> Log a throw
        </button>
      </div>
    </div>
  );
}

function nudgeText(available: boolean, score: number): string {
  if (!available) return 'Ask anything about technique, training load or your next meet.';
  if (score >= 70) return "You're primed. Ask Coach to plan today's session.";
  if (score >= 45) return 'Train smart today. Ask Coach how to adjust the load.';
  return 'Load is high. Ask Coach whether to rest or go light.';
}

function PRCard({ pb, others, eventName, distanceUnit, athleteName }: { pb: PersonalBest; others: PersonalBest[]; eventName: string; distanceUnit: DistanceUnit; athleteName?: string }) {
  const [shareMsg, setShareMsg] = useState('');
  const dateStr = new Date(pb.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const handleShare = async () => {
    haptic('tap');
    const outcome = await shareCard(
      {
        title: 'Personal best',
        headline: formatDistance(pb.mark, distanceUnit),
        sub: `${eventName} · ${dateStr}`,
        athlete: athleteName,
        accent: 'pb',
      },
      'personal-best.png',
    );
    setShareMsg(outcome === 'downloaded' ? 'Saved' : outcome === 'failed' ? 'Failed' : 'Shared');
    setTimeout(() => setShareMsg(''), 2000);
  };

  return (
    <section className="feed-card pr-feed" aria-labelledby="pr-h">
      <div className="feed-card-head">
        <h3 id="pr-h" className="eyebrow">Personal best · {eventName}</h3>
        <button type="button" className="pb-share" onClick={handleShare} aria-label={`Share ${eventName} personal best`}>
          {shareMsg || <ShareIcon size={16} />}
        </button>
      </div>
      <div className="pr-feed-mark tnum">{formatDistance(pb.mark, distanceUnit, { withUnit: false })}<span className="hero-unit">{distanceUnit === 'ft' ? '' : 'm'}</span></div>
      <div className="t-meta">{dateStr}</div>
      {others.length > 0 && (
        <ul className="pr-others" aria-label="Other personal bests">
          {others.map((o) => (
            <li key={o.event}><span>{EVENTS.find((e) => e.id === o.event)?.name || o.event}</span> <b className="tnum">{formatDistance(o.mark, distanceUnit)}</b></li>
          ))}
        </ul>
      )}
    </section>
  );
}
