'use client';

import { Session } from '@/lib/types';
import { computeReadiness } from '@/lib/readiness';
import { useCountUp } from '@/hooks/useCountUp';

export default function ReadinessCard({ sessions }: { sessions: Session[] }) {
  const r = computeReadiness(sessions);
  const animatedScore = useCountUp(r.available ? r.score : 0);
  const tone = !r.available
    ? 'muted'
    : r.score >= 80
      ? 'good'
      : r.score >= 65
        ? 'ok'
        : r.score >= 50
          ? 'warn'
          : 'bad';

  return (
    <div className={`readiness-card readiness-${tone}`}>
      <div className="readiness-score-wrap">
        <span className="readiness-score">{r.available ? Math.round(animatedScore) : '—'}</span>
        {r.available && <span className="readiness-max">/100</span>}
      </div>
      <div className="readiness-info">
        <div className="readiness-label">{r.label}</div>
        {r.factors[0] && <div className="readiness-factor">{r.factors[0]}</div>}
      </div>
    </div>
  );
}
