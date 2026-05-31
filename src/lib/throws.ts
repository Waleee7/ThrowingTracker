import { ThrowEntry } from './types';

export interface DerivedSessionMetrics {
  throws: number; // total attempts, fouls included
  bestMark: number; // best legal (non-foul) mark in meters, 0 if none
  avgMark: number; // mean of legal marks in meters, 0 if none
}

/**
 * Derive the denormalized session metrics from a throw-by-throw log.
 * Fouls count as attempts but are excluded from best/avg, so all existing
 * consumers (analytics, PBs, charts) keep reading session.bestMark/avgMark/throws
 * unchanged — the log is just a richer source for those same numbers.
 */
export function deriveSessionMetrics(throwLog: ThrowEntry[]): DerivedSessionMetrics {
  const legal = throwLog.filter((t) => !t.foul && isFinite(t.mark) && t.mark > 0);
  const bestMark = legal.reduce((max, t) => Math.max(max, t.mark), 0);
  const avgMark =
    legal.length > 0 ? legal.reduce((sum, t) => sum + t.mark, 0) / legal.length : 0;
  return { throws: throwLog.length, bestMark, avgMark };
}

/** Number of fouled attempts in a throw log. */
export function countFouls(throwLog: ThrowEntry[]): number {
  return throwLog.reduce((n, t) => n + (t.foul ? 1 : 0), 0);
}
