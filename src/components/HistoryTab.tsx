'use client';

import { useState } from 'react';
import { Session, HistoryView, WeeklyMonthlyStats } from '@/lib/types';
import { EVENTS } from '@/lib/constants';
import { getWeeklyStats, getMonthlyStats } from '@/lib/analytics';
import { formatDistance, formatWeight, type DistanceUnit } from '@/lib/units';
import { countFouls } from '@/lib/throws';
import SessionMedia from './SessionMedia';
import EmptyState from './EmptyState';

interface HistoryTabProps {
  sessions: Session[];
  distanceUnit: DistanceUnit;
  onEditSession: (session: Session) => void;
  onDeleteSession: (id: string) => void;
}

export default function HistoryTab({ sessions, distanceUnit, onEditSession, onDeleteSession }: HistoryTabProps) {
  const [view, setView] = useState<HistoryView>('recent');
  const weeklyStats = getWeeklyStats(sessions);
  const monthlyStats = getMonthlyStats(sessions);

  return (
    <div className="tab-content" id="tab-history">
      <h2 className="tab-title">History</h2>

      <div className="toggle-group">
        {(['recent', 'weekly', 'monthly'] as const).map((v) => (
          <button
            key={v}
            className={`toggle-button${view === v ? ' active' : ''}`}
            onClick={() => setView(v)}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      {view === 'recent' && (
        <RecentView sessions={sessions} distanceUnit={distanceUnit} onEdit={onEditSession} onDelete={onDeleteSession} />
      )}
      {view === 'weekly' && <SummaryView stats={weeklyStats} distanceUnit={distanceUnit} />}
      {view === 'monthly' && <SummaryView stats={monthlyStats} distanceUnit={distanceUnit} />}
    </div>
  );
}

function RecentView({
  sessions,
  distanceUnit,
  onEdit,
  onDelete,
}: {
  sessions: Session[];
  distanceUnit: DistanceUnit;
  onEdit: (s: Session) => void;
  onDelete: (id: string) => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(20);

  const sorted = sessions.slice().sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (sorted.length === 0) {
    return (
      <div className="history-list">
        <EmptyState
          icon={'\u{1F4DD}'}
          title="No sessions yet"
          text="Your logged throws and meets will show up here."
        />
      </div>
    );
  }

  const visible = sorted.slice(0, visibleCount);

  return (
    <div className="history-list">
      {visible.map((session) => {
        const event = EVENTS.find((e) => e.id === session.event);
        const dateObj = new Date(session.date);
        const dateOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
        if (dateObj.getFullYear() !== new Date().getFullYear()) {
          dateOptions.year = 'numeric';
        }
        const dateStr = dateObj.toLocaleDateString('en-US', dateOptions);
        const isExpanded = expandedId === session.id;
        const isConfirmingDelete = confirmDeleteId === session.id;

        return (
          <div
            key={session.id}
            className={`history-item${isExpanded ? ' expanded' : ''}`}
            onClick={() => setExpandedId(isExpanded ? null : session.id)}
          >
            <div className="history-header">
              <span className="history-date">{dateStr}</span>
              <span className="history-event">{event?.name || session.event}</span>
              {session.sessionType === 'competition' && (
                <span className="competition-badge">&#11088;</span>
              )}
            </div>
            <div className="history-stats">
              <span>Best: {formatDistance(session.bestMark, distanceUnit)}</span>
              <span>&bull;</span>
              <span>RPE: {session.rpe}/10</span>
              <span>&bull;</span>
              <span>{session.throws} throws</span>
              {session.throwLog && countFouls(session.throwLog) > 0 && (
                <>
                  <span>&bull;</span>
                  <span>{countFouls(session.throwLog)} foul{countFouls(session.throwLog) > 1 ? 's' : ''}</span>
                </>
              )}
              <span>&bull;</span>
              <span>{formatWeight(session.implementWeight, session.weightUnit)}</span>
            </div>
            {session.meetName && (
              <div className="history-meet">{session.meetName}{session.placement ? ` — ${session.placement}` : ''}</div>
            )}
            {session.notes && <div className="history-notes">{session.notes}</div>}

            {isExpanded && session.throwLog && session.throwLog.length > 0 && (
              <div className="history-throws" onClick={(e) => e.stopPropagation()}>
                {session.throwLog.map((t, i) => (
                  <span key={i} className={`throw-chip${t.foul ? ' foul' : ''}`}>
                    {t.foul ? 'F' : formatDistance(t.mark, distanceUnit, { withUnit: false })}
                  </span>
                ))}
              </div>
            )}

            {isExpanded && session.media && session.media.length > 0 && (
              <div className="history-media" onClick={(e) => e.stopPropagation()}>
                <SessionMedia media={session.media} />
              </div>
            )}

            {isExpanded && (
              <div className="history-actions" onClick={(e) => e.stopPropagation()}>
                <button className="action-button edit-button" onClick={() => onEdit(session)}>
                  Edit
                </button>
                {isConfirmingDelete ? (
                  <div className="delete-confirm">
                    <span>Delete this session?</span>
                    <button className="action-button delete-button" onClick={() => { onDelete(session.id); setConfirmDeleteId(null); }}>
                      Yes, Delete
                    </button>
                    <button className="action-button" onClick={() => setConfirmDeleteId(null)}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button className="action-button delete-button" onClick={() => setConfirmDeleteId(session.id)}>
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {sorted.length > visibleCount && (
        <button
          className="secondary-button load-more"
          onClick={() => setVisibleCount((prev) => prev + 20)}
        >
          Load More ({sorted.length - visibleCount} remaining)
        </button>
      )}
    </div>
  );
}

function SummaryView({ stats, distanceUnit }: { stats: WeeklyMonthlyStats; distanceUnit: DistanceUnit }) {
  const eventKeys = Object.keys(stats.byEvent);

  return (
    <div className="summary-view">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.count}</div>
          <div className="stat-label">Sessions</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalThrows}</div>
          <div className="stat-label">Throws</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.avgRPE || '\u2014'}</div>
          <div className="stat-label">Avg RPE</div>
        </div>
      </div>

      {eventKeys.length > 0 && (
        <div className="event-breakdown">
          <h3 className="section-title">By Event</h3>
          {eventKeys.map((eventId) => {
            const eventData = stats.byEvent[eventId];
            const event = EVENTS.find((e) => e.id === eventId);

            return (
              <div key={eventId} className="event-stats-card">
                <div className="event-stats-header">
                  {event && (
                    <div
                      className="event-icon-small"
                      dangerouslySetInnerHTML={{ __html: event.svg }}
                    />
                  )}
                  <span>{event?.name || eventId}</span>
                </div>
                <div className="event-stats-grid">
                  <div>
                    <div className="mini-stat-label">Best</div>
                    <div className="mini-stat-value">{formatDistance(eventData.bestMark, distanceUnit)}</div>
                  </div>
                  <div>
                    <div className="mini-stat-label">Avg</div>
                    <div className="mini-stat-value">{formatDistance(eventData.avgMark, distanceUnit)}</div>
                  </div>
                  <div>
                    <div className="mini-stat-label">Sessions</div>
                    <div className="mini-stat-value">{eventData.count}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
