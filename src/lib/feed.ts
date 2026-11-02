// Home-feed helpers (pure → unit-testable).
import type { Session, PersonalBest } from './types';
import { latestSession } from './quick-log';

export interface SparkSeries {
  kind: 'attempts' | 'trend';
  /** Canonical metres; foul attempts are null so the chart can show the gap. */
  values: (number | null)[];
}

/**
 * The session card's sparkline. With a throw-by-throw log it plots that
 * session's attempts; otherwise it plots the last few sessions' best marks in
 * the same event (a trend). Null when there are fewer than 2 points.
 */
export function sparkSeries(last: Session | null, sessions: Session[], trendLen = 8): SparkSeries | null {
  if (!last) return null;
  if (last.throwLog && last.throwLog.length >= 2) {
    return { kind: 'attempts', values: last.throwLog.map((t) => (t.foul || t.mark <= 0 ? null : t.mark)) };
  }
  const trend = sessions
    .filter((s) => s.event === last.event && s.bestMark > 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-trendLen)
    .map((s) => s.bestMark);
  return trend.length >= 2 ? { kind: 'trend', values: trend } : null;
}

/** The PR to headline: the one in the event of the most recent session, else the longest-ago-best overall. */
export function headlinePR(sessions: Session[], pbs: PersonalBest[]): PersonalBest | null {
  if (pbs.length === 0) return null;
  const last = latestSession(sessions);
  return pbs.find((p) => p.event === last?.event) ?? pbs[0];
}
