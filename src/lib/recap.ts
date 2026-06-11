// Weekly Recap — the Monday "Your Week" moment. Summarizes the LAST COMPLETED
// week (Sun–Sat, matching weekStartKey) the first time the app opens in a new
// week. Pure function over sessions; the show-once trigger + on/off preference
// live in storage (AppContext drives it).

import { Session } from './types';
import { fromDateKey, toLocalDateKey, weekStartKey } from './dates';
import { calculatePersonalBests } from './personal-bests';

export interface WeeklyRecapData {
  weekKey: string;          // week-start key of the recapped (previous) week
  sessions: number;
  totalThrows: number;
  bestMark: number;         // meters, 0 when none
  bestEvent: string;        // event id of the best mark
  avgRPE: number;
  setPR: boolean;           // an all-time PB landed inside the week
  deltaThrows: number;      // vs the week before (positive = more volume)
  deltaSessions: number;
  coachLine: string;
}

function inWeek(s: Session, weekKey: string): boolean {
  return weekStartKey(s.date) === weekKey;
}

/** Week-start key of the week BEFORE the one containing `now`. */
export function previousWeekKey(now: Date = new Date()): string {
  const start = fromDateKey(weekStartKey(now));
  start.setDate(start.getDate() - 7);
  return toLocalDateKey(start);
}

export function buildWeeklyRecap(sessions: Session[], now: Date = new Date()): WeeklyRecapData | null {
  const weekKey = previousWeekKey(now);
  const week = sessions.filter((s) => inWeek(s, weekKey));
  if (week.length === 0) return null;

  const prevStart = fromDateKey(weekKey);
  prevStart.setDate(prevStart.getDate() - 7);
  const prevKey = toLocalDateKey(prevStart);
  const prev = sessions.filter((s) => inWeek(s, prevKey));

  const totalThrows = week.reduce((sum, s) => sum + s.throws, 0);
  const avgRPE = week.length ? week.reduce((sum, s) => sum + s.rpe, 0) / week.length : 0;

  let bestMark = 0;
  let bestEvent = '';
  for (const s of week) {
    if (s.bestMark > bestMark) { bestMark = s.bestMark; bestEvent = s.event; }
  }

  // Did an all-time PB land inside this week? (PB session date falls in-week.)
  const setPR = calculatePersonalBests(sessions).some((pb) => weekStartKey(pb.date) === weekKey);

  const deltaThrows = totalThrows - prev.reduce((sum, s) => sum + s.throws, 0);
  const deltaSessions = week.length - prev.length;

  let coachLine: string;
  if (setPR) coachLine = 'You set a PR this week — that’s how seasons turn.';
  else if (prev.length > 0 && deltaThrows > 0.2 * Math.max(1, prev.reduce((x, s) => x + s.throws, 0)))
    coachLine = 'Volume’s climbing — keep the recovery as honest as the work.';
  else if (avgRPE >= 8) coachLine = 'Heavy week. Earn the easy days.';
  else if (week.length >= 4) coachLine = 'That’s a pro-level week of consistency.';
  else coachLine = 'Stack another one — consistency is the multiplier.';

  return {
    weekKey,
    sessions: week.length,
    totalThrows,
    bestMark,
    bestEvent,
    avgRPE: Math.round(avgRPE * 10) / 10,
    setPR,
    deltaThrows,
    deltaSessions,
    coachLine,
  };
}
