'use client';

// The stakes card — next meet countdown + goal-mark progress, right under the
// Today card. Renders nothing until the athlete has set a meet or a goal
// (editor lives in Profile → Goals & Meets).

import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { EVENTS } from '@/lib/constants';
import { formatDistance } from '@/lib/units';
import { calculatePersonalBests } from '@/lib/personal-bests';
import { nextMeet, goalProgress } from '@/lib/goals';

export default function GoalCountdownCard() {
  const app = useApp();
  const meet = nextMeet(app.meets);
  const progress = goalProgress(app.goalMarks, calculatePersonalBests(app.sessions))
    .filter((g) => app.profile.events.length === 0 || app.profile.events.includes(g.event));

  if (!meet && progress.length === 0) return null;

  const countdownText =
    meet === null ? '' :
    meet.daysUntil === 0 ? 'TODAY' :
    meet.daysUntil === 1 ? 'tomorrow' :
    `in ${meet.daysUntil} days`;

  return (
    <div className="goal-card">
      {meet && (
        <div className={`goal-meet${meet.daysUntil <= 3 ? ' goal-meet-hot' : ''}`}>
          <div className="goal-meet-info">
            <div className="eyebrow">Next meet</div>
            <div className="goal-meet-name">{meet.name}</div>
          </div>
          <div className="goal-meet-count tnum">{countdownText}</div>
        </div>
      )}

      {progress.length > 0 && (
        <div className="goal-rows">
          {progress.map((g) => {
            const ev = EVENTS.find((e) => e.id === g.event);
            return (
              <Link key={g.event} href="/progress" className="goal-row">
                <div className="goal-row-top">
                  <span className="goal-row-event">{ev?.name || g.event}</span>
                  <span className={`goal-row-delta tnum${g.achieved ? ' achieved' : ''}`}>
                    {g.achieved
                      ? '✓ GOAL HIT'
                      : `${formatDistance(g.remaining, app.distanceUnit)} to go`}
                  </span>
                </div>
                <div className="goal-bar" role="progressbar" aria-valuenow={Math.round(g.pct * 100)} aria-valuemin={0} aria-valuemax={100}>
                  <div
                    className={`goal-bar-fill${g.achieved ? ' achieved' : ''}`}
                    style={{ width: `${Math.round(g.pct * 100)}%` }}
                  />
                </div>
                <div className="goal-row-marks t-meta tnum">
                  {g.currentBest > 0 ? formatDistance(g.currentBest, app.distanceUnit) : '—'}
                  {' / '}
                  {formatDistance(g.targetMark, app.distanceUnit)}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
