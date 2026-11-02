'use client';

import { Session } from '@/lib/types';
import { computeReadiness } from '@/lib/readiness';
import { useCountUp } from '@/hooks/useCountUp';

const R = 46;
const C = 2 * Math.PI * R;

/** Readiness as a ring in the house accent (tone only dims it when the score is poor). */
export default function ReadinessCard({ sessions }: { sessions: Session[] }) {
  const r = computeReadiness(sessions);
  const animatedScore = useCountUp(r.available ? r.score : 0);
  const low = r.available && r.score < 50;
  const pct = r.available ? Math.max(0, Math.min(100, animatedScore)) / 100 : 0;

  return (
    <div className={`readiness-ring-card${low ? ' low' : ''}${r.available ? '' : ' idle'}`}>
      <div
        className="rr-ring"
        role="img"
        aria-label={r.available ? `Readiness ${r.score} out of 100, ${r.label}` : 'Readiness not available yet'}
      >
        <svg viewBox="0 0 108 108" width="108" height="108" aria-hidden="true">
          <circle cx="54" cy="54" r={R} className="rr-track" />
          <circle
            cx="54" cy="54" r={R}
            className="rr-arc"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - pct)}
            transform="rotate(-90 54 54)"
          />
        </svg>
        <span className="rr-score tnum">{r.available ? Math.round(animatedScore) : '—'}</span>
      </div>
      <div className="rr-info">
        <div className="eyebrow">Readiness</div>
        <div className="rr-label">{r.label}</div>
        {r.factors[0] && <div className="rr-factor">{r.factors[0]}</div>}
      </div>
    </div>
  );
}
