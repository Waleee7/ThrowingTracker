// Goals & meets — the "stakes" layer. An athlete drops in upcoming meets and a
// target mark per event; the dashboard turns those into a countdown + progress.
// Pure derivations over storage-backed lists; all marks canonical meters.

import { Meet, GoalMark, PersonalBest } from './types';
import { fromDateKey, toLocalDateKey } from './dates';

export interface UpcomingMeet extends Meet {
  daysUntil: number; // 0 = today
}

export interface GoalProgress {
  event: string;
  targetMark: number;      // meters
  currentBest: number;     // meters, 0 when no PB yet
  remaining: number;       // meters still to gain (0 when achieved)
  pct: number;             // 0..1 of target reached
  achieved: boolean;
}

/** Soonest meet today-or-later, with a day countdown. Past meets are ignored. */
export function nextMeet(meets: Meet[], now: Date = new Date()): UpcomingMeet | null {
  const todayKey = toLocalDateKey(now);
  const today = fromDateKey(todayKey).getTime();

  let best: UpcomingMeet | null = null;
  for (const m of meets) {
    if (m.date < todayKey) continue;
    const days = Math.round((fromDateKey(m.date).getTime() - today) / 86_400_000);
    if (!best || days < best.daysUntil) best = { ...m, daysUntil: days };
  }
  return best;
}

/** Meets sorted soonest-first, upcoming only. */
export function upcomingMeets(meets: Meet[], now: Date = new Date()): UpcomingMeet[] {
  const todayKey = toLocalDateKey(now);
  const today = fromDateKey(todayKey).getTime();
  return meets
    .filter((m) => m.date >= todayKey)
    .map((m) => ({ ...m, daysUntil: Math.round((fromDateKey(m.date).getTime() - today) / 86_400_000) }))
    .sort((a, b) => a.daysUntil - b.daysUntil);
}

/** Goal progress per event, joined against current personal bests. */
export function goalProgress(goals: GoalMark[], pbs: PersonalBest[]): GoalProgress[] {
  return goals
    .filter((g) => isFinite(g.targetMark) && g.targetMark > 0)
    .map((g) => {
      const pb = pbs.find((p) => p.event === g.event);
      const currentBest = pb ? pb.mark : 0;
      const remaining = Math.max(0, g.targetMark - currentBest);
      return {
        event: g.event,
        targetMark: g.targetMark,
        currentBest,
        remaining,
        pct: Math.max(0, Math.min(1, g.targetMark > 0 ? currentBest / g.targetMark : 0)),
        achieved: currentBest >= g.targetMark,
      };
    });
}

/** Upsert (or clear with null) the goal for one event. Returns the new list. */
export function setGoal(goals: GoalMark[], event: string, targetMark: number | null): GoalMark[] {
  const rest = goals.filter((g) => g.event !== event);
  if (targetMark === null || !isFinite(targetMark) || targetMark <= 0) return rest;
  return [...rest, { event, targetMark }];
}
