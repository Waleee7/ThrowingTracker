'use client';

// PR Timeline — the athlete's story as milestones: every time the all-time
// best moved, a node on the rail ("road to 199"). Derived from sessions, no
// new tracking.

import { useMemo, useState } from 'react';
import { Session } from '@/lib/types';
import { EVENTS, EVENT_COLORS } from '@/lib/constants';
import { formatDistance, type DistanceUnit } from '@/lib/units';

interface Milestone {
  event: string;
  date: string;
  mark: number;     // meters
  delta: number;    // meters gained vs previous best (0 for the first)
  first: boolean;
}

function buildMilestones(sessions: Session[]): Milestone[] {
  const sorted = sessions
    .filter((s) => s.bestMark > 0)
    .slice()
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  const best: Record<string, number> = {};
  const out: Milestone[] = [];
  for (const s of sorted) {
    const prev = best[s.event] ?? 0;
    if (s.bestMark > prev) {
      out.push({
        event: s.event,
        date: s.date,
        mark: s.bestMark,
        delta: prev > 0 ? s.bestMark - prev : 0,
        first: prev === 0,
      });
      best[s.event] = s.bestMark;
    }
  }
  return out.reverse(); // newest first
}

export default function PRTimeline({ sessions, distanceUnit }: { sessions: Session[]; distanceUnit: DistanceUnit }) {
  const milestones = useMemo(() => buildMilestones(sessions), [sessions]);
  const eventsPresent = useMemo(
    () => EVENTS.filter((e) => milestones.some((m) => m.event === e.id)),
    [milestones],
  );
  const [filter, setFilter] = useState<string>('all');

  if (milestones.length === 0) return null;

  const shown = (filter === 'all' ? milestones : milestones.filter((m) => m.event === filter)).slice(0, 30);

  return (
    <div className="prtl" style={{ marginTop: 32 }}>
      <h3 className="section-title">PR Timeline</h3>
      {eventsPresent.length > 1 && (
        <div className="prtl-filters" role="tablist" aria-label="Event filter">
          <button
            role="tab"
            aria-selected={filter === 'all'}
            className={`prtl-chip${filter === 'all' ? ' active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          {eventsPresent.map((e) => (
            <button
              key={e.id}
              role="tab"
              aria-selected={filter === e.id}
              className={`prtl-chip${filter === e.id ? ' active' : ''}`}
              onClick={() => setFilter(e.id)}
            >
              {e.name}
            </button>
          ))}
        </div>
      )}

      <ol className="prtl-rail">
        {shown.map((m, i) => {
          const ev = EVENTS.find((e) => e.id === m.event);
          const hue = EVENT_COLORS[m.event];
          return (
            <li key={`${m.event}-${m.date}-${i}`} className="prtl-node">
              <span className={`prtl-dot${m.first ? ' first' : ''}`} aria-hidden="true" />
              <div className="prtl-body">
                <div className="prtl-top">
                  <span className="prtl-mark tnum">{formatDistance(m.mark, distanceUnit)}</span>
                  {m.delta > 0 && (
                    <span className="prtl-delta tnum">+{formatDistance(m.delta, distanceUnit)}</span>
                  )}
                  {m.first && <span className="prtl-first-tag">FIRST MARK</span>}
                </div>
                <div className="prtl-meta t-meta">
                  <span className="prtl-event" style={hue ? { color: hue } : undefined}>{ev?.name || m.event}</span>
                  {' · '}
                  {new Date(m.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
