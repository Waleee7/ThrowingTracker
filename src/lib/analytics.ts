import { Session, WeeklyMonthlyStats, EventStats } from './types';

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
    const dateStr = checkDate.toISOString().split('T')[0];
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
      if (!acc[s.event]) acc[s.event] = { count: 0, bestMark: 0, avgMark: 0, totalMark: 0 };
      acc[s.event].count++;
      acc[s.event].bestMark = Math.max(acc[s.event].bestMark, s.bestMark);
      acc[s.event].totalMark += s.avgMark;
      acc[s.event].avgMark = acc[s.event].totalMark / acc[s.event].count;
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
