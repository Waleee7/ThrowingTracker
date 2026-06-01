/**
 * Season Wrapped (W6) — a Spotify-Wrapped-style year-in-review.
 *
 * Pure aggregation over the current throwing season (Sept 1 -> Aug 31, matching
 * personal-bests.ts). Reuses the denormalized session fields, so it stays
 * consistent with analytics/PBs and never needs the throw log to be present.
 */
import type { Session } from './types';
import { countFouls } from './throws';
import { fromDateKey } from './dates';
import { eventName } from './implements';

export interface WrappedData {
  seasonLabel: string;
  totalSessions: number;
  totalThrows: number;
  totalFouls: number;
  competitions: number;
  activeDays: number;
  totalDistanceM: number; // combined distance of every legal throw
  avgRPE: number;
  favoriteEvent: { id: string; name: string; count: number } | null;
  topMark: { id: string; name: string; mark: number } | null;
  improvement: { name: string; firstM: number; bestM: number; deltaM: number; pct: number } | null;
  busiestMonth: { label: string; count: number } | null;
}

/** Sept-1 -> Aug-31 season window containing `now`. */
function seasonWindow(now: Date): { start: Date; end: Date; label: string } {
  const year = now.getFullYear();
  const month = now.getMonth();
  const startYear = month >= 8 ? year : year - 1;
  return {
    start: new Date(startYear, 8, 1),
    end: new Date(startYear + 1, 7, 31, 23, 59, 59),
    label: `${startYear}–${(startYear + 1) % 100} Season`,
  };
}

export function buildWrapped(sessions: Session[], now: Date = new Date()): WrappedData | null {
  const { start, end, label } = seasonWindow(now);
  const inSeason = sessions.filter((s) => {
    const d = fromDateKey(s.date);
    return d >= start && d <= end;
  });
  if (inSeason.length === 0) return null;

  const totalThrows = inSeason.reduce((n, s) => n + (s.throws || 0), 0);
  const totalFouls = inSeason.reduce((n, s) => n + (s.throwLog ? countFouls(s.throwLog) : 0), 0);
  const competitions = inSeason.filter((s) => s.sessionType === 'competition').length;
  const activeDays = new Set(inSeason.map((s) => s.date)).size;
  const totalDistanceM = inSeason.reduce((sum, s) => sum + (s.avgMark || 0) * (s.throws || 0), 0);
  const avgRPE =
    inSeason.reduce((sum, s) => sum + (s.rpe || 0), 0) / inSeason.length;

  // Favorite event = most sessions
  const byEvent = new Map<string, number>();
  for (const s of inSeason) byEvent.set(s.event, (byEvent.get(s.event) ?? 0) + 1);
  let favoriteEvent: WrappedData['favoriteEvent'] = null;
  for (const [id, count] of byEvent) {
    if (!favoriteEvent || count > favoriteEvent.count) {
      favoriteEvent = { id, name: eventName(id), count };
    }
  }

  // Top single mark of the season
  let topMark: WrappedData['topMark'] = null;
  for (const s of inSeason) {
    if (s.bestMark > 0 && (!topMark || s.bestMark > topMark.mark)) {
      topMark = { id: s.event, name: eventName(s.event), mark: s.bestMark };
    }
  }

  // Improvement in the favorite event: earliest legal mark -> best mark
  let improvement: WrappedData['improvement'] = null;
  if (favoriteEvent) {
    const ev = inSeason
      .filter((s) => s.event === favoriteEvent!.id && s.bestMark > 0)
      .sort((a, b) => fromDateKey(a.date).getTime() - fromDateKey(b.date).getTime());
    if (ev.length >= 2) {
      const firstM = ev[0].bestMark;
      const bestM = Math.max(...ev.map((s) => s.bestMark));
      const deltaM = bestM - firstM;
      if (deltaM > 0) {
        improvement = {
          name: favoriteEvent.name,
          firstM,
          bestM,
          deltaM,
          pct: (deltaM / firstM) * 100,
        };
      }
    }
  }

  // Busiest month
  const byMonth = new Map<string, number>();
  for (const s of inSeason) {
    const d = fromDateKey(s.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    byMonth.set(key, (byMonth.get(key) ?? 0) + 1);
  }
  let busiestMonth: WrappedData['busiestMonth'] = null;
  for (const [key, count] of byMonth) {
    if (!busiestMonth || count > busiestMonth.count) {
      const [y, m] = key.split('-').map(Number);
      const labelM = new Date(y, m, 1).toLocaleDateString('en-US', { month: 'long' });
      busiestMonth = { label: labelM, count };
    }
  }

  return {
    seasonLabel: label,
    totalSessions: inSeason.length,
    totalThrows,
    totalFouls,
    competitions,
    activeDays,
    totalDistanceM,
    avgRPE: Math.round(avgRPE * 10) / 10,
    favoriteEvent,
    topMark,
    improvement,
    busiestMonth,
  };
}
