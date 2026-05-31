import { Session } from './types';

export interface Readiness {
  available: boolean;
  score: number; // 0-100 (0 when not yet available)
  label: string;
  factors: string[];
}

/** Session training load proxy (sRPE-style): volume x intensity. */
function loadOf(s: Session): number {
  return Math.max(0, s.throws) * Math.max(1, s.rpe);
}

function daysBetween(a: Date, b: Date): number {
  return Math.floor((a.getTime() - b.getTime()) / 86_400_000);
}

/**
 * Daily readiness from recent training load. Grounded in the acute:chronic
 * workload ratio (Gabbett) — load this week vs the rolling 4-week average —
 * plus freshness (days since last throw) and recent intensity. Pure function
 * over existing session data; no new tracking required.
 */
export function computeReadiness(sessions: Session[]): Readiness {
  if (!sessions || sessions.length < 3) {
    return {
      available: false,
      score: 0,
      label: 'Building baseline',
      factors: ['Log a few more sessions to unlock your readiness score.'],
    };
  }

  const now = new Date();
  const d7 = new Date(now);
  d7.setDate(now.getDate() - 7);
  const d28 = new Date(now);
  d28.setDate(now.getDate() - 28);

  const last7 = sessions.filter((s) => new Date(s.date) >= d7);
  const last28 = sessions.filter((s) => new Date(s.date) >= d28);

  const acute = last7.reduce((sum, s) => sum + loadOf(s), 0);
  const chronicWeekly = last28.reduce((sum, s) => sum + loadOf(s), 0) / 4;

  const lastTs = sessions.reduce((max, s) => Math.max(max, new Date(s.date).getTime()), 0);
  const daysSinceLast = Math.max(0, daysBetween(now, new Date(lastTs)));

  const avgRpe7 = last7.length ? last7.reduce((sum, s) => sum + s.rpe, 0) / last7.length : 0;

  let score = 100;
  const factors: string[] = [];

  if (chronicWeekly > 0) {
    const acwr = acute / chronicWeekly;
    if (acwr > 1.5) {
      score -= 30;
      factors.push('Sharp load spike this week — watch fatigue and injury risk.');
    } else if (acwr > 1.3) {
      score -= 15;
      factors.push('Training load is trending high.');
    } else if (acwr < 0.5) {
      score -= 20;
      factors.push('Load has dropped off — risk of detraining.');
    } else if (acwr < 0.8) {
      score -= 8;
      factors.push('A touch below your usual load.');
    } else {
      factors.push('Workload is in the optimal range.');
    }
  }

  if (daysSinceLast >= 5) {
    score -= 15;
    factors.push(`${daysSinceLast} days since your last throw.`);
  } else if (daysSinceLast <= 1) {
    factors.push('Well-rested and recently active.');
  }

  if (avgRpe7 >= 8.5) {
    score -= 12;
    factors.push('High RPE lately — prioritize recovery.');
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  let label: string;
  if (score >= 80) label = 'Primed';
  else if (score >= 65) label = 'Ready';
  else if (score >= 50) label = 'Monitor load';
  else label = 'Recover';

  return { available: true, score, label, factors: factors.slice(0, 2) };
}
