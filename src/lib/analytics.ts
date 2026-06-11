import { Session, WeeklyMonthlyStats, EventStats } from './types';
import { toLocalDateKey } from './dates';

/**
 * Smart streak: counts TRAINING DAYS, and a single rest day never breaks the
 * chain — throwers don't (and shouldn't) throw 7 days a week, and the app's own
 * readiness score actively tells them to rest. Only going dark for 2+
 * consecutive days ends the streak. The number returned is days trained, not
 * calendar days, so rest days don't inflate it.
 */
export function calculateStreak(sessions: Session[]): number {
  if (!sessions || sessions.length === 0) return 0;

  const trainedDays = new Set(sessions.map((s) => s.date));
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  let streak = 0;
  let gap = 0;

  for (let i = 0; i < 730; i++) {
    if (trainedDays.has(toLocalDateKey(cursor))) {
      streak++;
      gap = 0;
    } else {
      gap++;
      if (gap >= 2) break; // two straight idle days = chain broken
    }
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function getStatsForPeriod(sessions: Session[], cutoffDate: Date): WeeklyMonthlyStats {
  const filtered = sessions.filter((s) => new Date(s.date) >= cutoffDate);

  return {
    count: filtered.length,
    totalThrows: filtered.reduce((sum, s) => sum + s.throws, 0),
    avgRPE:
      filtered.length > 0
        ? (filtered.reduce((sum, s) => sum + s.rpe, 0) / filtered.length).toFixed(1)
        : 0,
    byEvent: filtered.reduce<Record<string, EventStats>>((acc, s) => {
      if (!acc[s.event]) acc[s.event] = { count: 0, bestMark: 0, avgMark: 0, totalMark: 0, totalThrows: 0 };
      const e = acc[s.event];
      e.count++;
      e.bestMark = Math.max(e.bestMark, s.bestMark);
      e.totalMark += s.avgMark * s.throws;
      e.totalThrows += s.throws;
      e.avgMark = e.totalThrows > 0 ? e.totalMark / e.totalThrows : 0;
      return acc;
    }, {}),
  };
}

export function getWeeklyStats(sessions: Session[]): WeeklyMonthlyStats {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  return getStatsForPeriod(sessions, oneWeekAgo);
}

export function getMonthlyStats(sessions: Session[]): WeeklyMonthlyStats {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  return getStatsForPeriod(sessions, oneMonthAgo);
}
