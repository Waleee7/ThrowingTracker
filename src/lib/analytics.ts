import { Session, WeeklyMonthlyStats, EventStats } from './types';
import { toLocalDateKey } from './dates';

export function calculateStreak(sessions: Session[]): number {
  if (!sessions || sessions.length === 0) return 0;

  const sortedSessions = sessions.slice().sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  const checkDate = new Date(today);

  for (let i = 0; i < 365; i++) {
    const dateStr = toLocalDateKey(checkDate);
    const hasSession = sortedSessions.some((s) => s.date === dateStr);

    if (hasSession) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      // Allow 1-day gap if today has no session
      if (i === 0) {
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      }
      break;
    }
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
