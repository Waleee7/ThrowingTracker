'use client';

// Glanceable "Today" decision card (roadmap P1-4). Answers "what's my status
// today?" in <10s: one Fraunces hero stat + one supporting line. No graph.

import { Session, Profile } from '@/lib/types';
import { formatDistance } from '@/lib/units';
import { calculateStreak } from '@/lib/analytics';
import { computeReadiness } from '@/lib/readiness';
import { useCountUp } from '@/hooks/useCountUp';

export default function TodayCard({ sessions, profile }: { sessions: Session[]; profile: Profile }) {
  const unit = profile.distanceUnit ?? 'm';
  const streak = calculateStreak(sessions);
  const readiness = computeReadiness(sessions);

  const last = sessions.length
    ? sessions.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    : null;

  // Hero stat counts up scoreboard-style (animates the canonical meters, then
  // formats each frame so ft+in strings stay correct mid-flight).
  const animatedMark = useCountUp(last ? last.bestMark : 0);
  const heroMark = last ? formatDistance(animatedMark, unit, { withUnit: false }) : '—';
  const heroUnit = unit === 'ft' ? '' : 'm';

  // Readiness → a one-word call to action.
  let tag = 'Log a session';
  let tagClass = '';
  if (readiness.available) {
    if (readiness.score >= 70) { tag = 'Primed to train'; tagClass = ''; }
    else if (readiness.score >= 45) { tag = 'Train smart'; tagClass = 'rest'; }
    else { tag = 'Rest suggested'; tagClass = 'warn'; }
  }

  const parts: React.ReactNode[] = [];
  if (last) parts.push(<span key="avg">Last session avg {formatDistance(last.avgMark, unit)}</span>);
  if (streak > 0) { parts.push(<span key="d1" className="dot">·</span>, <span key="streak">{streak}-day streak</span>); }
  parts.push(<span key="d2" className="dot">·</span>, <span key="tag" className={`today-tag ${tagClass}`}>{tag}</span>);

  return (
    <div className="today-card">
      <div className="eyebrow">Today</div>
      <div className="today-stat tnum">
        {heroMark}{heroUnit && <span className="unit">{heroUnit}</span>}
      </div>
      <div className="today-line">{parts}</div>
    </div>
  );
}
