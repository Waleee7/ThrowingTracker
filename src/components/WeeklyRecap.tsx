'use client';

// "Your Week" — the Monday recap moment. One card, one big number, the story
// of last week, a coach line, and a share button. Auto-shown once per week by
// AppContext (toggle lives in Profile → Preferences).

import { useState } from 'react';
import { WeeklyRecapData } from '@/lib/recap';
import { EVENTS } from '@/lib/constants';
import { formatDistance, type DistanceUnit } from '@/lib/units';
import { shareCard } from '@/lib/share-card';
import { vibrate } from '@/lib/haptics';

interface WeeklyRecapProps {
  data: WeeklyRecapData;
  distanceUnit: DistanceUnit;
  athleteName?: string;
  onClose: () => void;
}

export default function WeeklyRecap({ data, distanceUnit, athleteName, onClose }: WeeklyRecapProps) {
  const [shareMsg, setShareMsg] = useState('');
  const bestEventName = EVENTS.find((e) => e.id === data.bestEvent)?.name || '';

  const handleShare = async () => {
    vibrate(30);
    const outcome = await shareCard(
      {
        title: 'My week in the ring',
        headline: data.bestMark > 0 ? formatDistance(data.bestMark, distanceUnit) : `${data.totalThrows} throws`,
        sub:
          data.bestMark > 0
            ? `Best mark · ${bestEventName}`
            : 'Total volume this week',
        lines: [
          `${data.sessions} session${data.sessions === 1 ? '' : 's'} · ${data.totalThrows} throws · ${data.avgRPE} avg RPE`,
          ...(data.setPR ? ['NEW PR SET ⚡'] : []),
        ],
        athlete: athleteName,
        accent: data.setPR ? 'pb' : 'orange',
      },
      'my-week.png',
    );
    setShareMsg(outcome === 'downloaded' ? 'Saved image ↓' : outcome === 'failed' ? 'Share failed' : '');
  };

  return (
    <div className="recap-overlay" role="dialog" aria-label="Weekly recap">
      <div className="recap-card">
        <div className="eyebrow">Your week</div>

        <div className="recap-hero tnum">
          {data.bestMark > 0 ? formatDistance(data.bestMark, distanceUnit) : data.totalThrows}
          {data.bestMark <= 0 && <span className="recap-hero-unit"> throws</span>}
        </div>
        <div className="recap-hero-sub">
          {data.bestMark > 0 ? `Best mark · ${bestEventName}` : 'Total volume'}
          {data.setPR && <span className="recap-pr-badge">PR WEEK</span>}
        </div>

        <div className="recap-stats">
          <div className="recap-stat">
            <span className="recap-stat-val tnum">{data.sessions}</span>
            <span className="recap-stat-label">Sessions</span>
          </div>
          <div className="recap-stat">
            <span className="recap-stat-val tnum">{data.totalThrows}</span>
            <span className="recap-stat-label">Throws</span>
          </div>
          <div className="recap-stat">
            <span className="recap-stat-val tnum">{data.avgRPE || '—'}</span>
            <span className="recap-stat-label">Avg RPE</span>
          </div>
        </div>

        {(data.deltaSessions !== 0 || data.deltaThrows !== 0) && (
          <div className="recap-delta t-meta tnum">
            vs prior week: {data.deltaSessions >= 0 ? '+' : ''}{data.deltaSessions} sessions ·{' '}
            {data.deltaThrows >= 0 ? '+' : ''}{data.deltaThrows} throws
          </div>
        )}

        <p className="recap-coach-line">{data.coachLine}</p>

        <div className="recap-actions">
          <button className="secondary-button" onClick={handleShare}>
            {shareMsg || 'Share'}
          </button>
          <button className="primary-button" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
