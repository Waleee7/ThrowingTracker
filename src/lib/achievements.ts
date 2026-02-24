import { Session } from './types';
import { calculateStreak } from './analytics';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'milestone' | 'streak' | 'competition' | 'volume' | 'special';
  check: (sessions: Session[]) => { unlocked: boolean; progress: number; target: number };
}

export interface UnlockedAchievement {
  id: string;
  unlockedAt: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Milestones
  {
    id: 'first-session',
    name: 'First Throw',
    description: 'Log your first training session',
    icon: '🎯',
    category: 'milestone',
    check: (s) => ({ unlocked: s.length >= 1, progress: Math.min(s.length, 1), target: 1 }),
  },
  {
    id: 'first-pr',
    name: 'PR Crusher',
    description: 'Set a new personal record',
    icon: '💥',
    category: 'milestone',
    check: (sessions) => {
      let hasPR = false;
      const bestByEvent: Record<string, number> = {};
      const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date));
      for (const s of sorted) {
        if (bestByEvent[s.event] !== undefined && s.bestMark > bestByEvent[s.event]) {
          hasPR = true;
        }
        bestByEvent[s.event] = Math.max(bestByEvent[s.event] || 0, s.bestMark);
      }
      return { unlocked: hasPR, progress: hasPR ? 1 : 0, target: 1 };
    },
  },
  {
    id: 'ten-sessions',
    name: 'Dedicated',
    description: 'Complete 10 training sessions',
    icon: '🏅',
    category: 'milestone',
    check: (s) => ({ unlocked: s.length >= 10, progress: Math.min(s.length, 10), target: 10 }),
  },
  {
    id: 'fifty-sessions',
    name: 'Committed',
    description: 'Complete 50 training sessions',
    icon: '🏆',
    category: 'milestone',
    check: (s) => ({ unlocked: s.length >= 50, progress: Math.min(s.length, 50), target: 50 }),
  },
  {
    id: 'century-club',
    name: 'Century Club',
    description: 'Complete 100 training sessions',
    icon: '💯',
    category: 'milestone',
    check: (s) => ({ unlocked: s.length >= 100, progress: Math.min(s.length, 100), target: 100 }),
  },

  // Streaks
  {
    id: 'three-day-streak',
    name: 'Hat Trick',
    description: '3-day training streak',
    icon: '🔥',
    category: 'streak',
    check: (s) => {
      const streak = calculateStreak(s);
      return { unlocked: streak >= 3, progress: Math.min(streak, 3), target: 3 };
    },
  },
  {
    id: 'seven-day-streak',
    name: 'Iron Week',
    description: '7-day training streak',
    icon: '⚡',
    category: 'streak',
    check: (s) => {
      const streak = calculateStreak(s);
      return { unlocked: streak >= 7, progress: Math.min(streak, 7), target: 7 };
    },
  },
  {
    id: 'thirty-day-streak',
    name: 'Unstoppable',
    description: '30-day training streak',
    icon: '👑',
    category: 'streak',
    check: (s) => {
      const streak = calculateStreak(s);
      return { unlocked: streak >= 30, progress: Math.min(streak, 30), target: 30 };
    },
  },

  // Competition
  {
    id: 'first-meet',
    name: 'Meet Ready',
    description: 'Log your first competition',
    icon: '🏟️',
    category: 'competition',
    check: (s) => {
      const meets = s.filter((x) => x.sessionType === 'competition').length;
      return { unlocked: meets >= 1, progress: Math.min(meets, 1), target: 1 };
    },
  },
  {
    id: 'five-meets',
    name: 'Competition Warrior',
    description: 'Compete in 5 meets',
    icon: '⚔️',
    category: 'competition',
    check: (s) => {
      const meets = s.filter((x) => x.sessionType === 'competition').length;
      return { unlocked: meets >= 5, progress: Math.min(meets, 5), target: 5 };
    },
  },
  {
    id: 'podium',
    name: 'Podium Finish',
    description: 'Place top 3 in a competition',
    icon: '🥇',
    category: 'competition',
    check: (s) => {
      const podium = s.some((x) => {
        const p = x.placement?.replace(/\D/g, '');
        return p && parseInt(p) <= 3;
      });
      return { unlocked: podium, progress: podium ? 1 : 0, target: 1 };
    },
  },

  // Volume
  {
    id: 'hundred-throws-week',
    name: 'Volume King',
    description: '100+ throws in a single week',
    icon: '💪',
    category: 'volume',
    check: (sessions) => {
      const weekMap: Record<string, number> = {};
      for (const s of sessions) {
        const d = new Date(s.date);
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        const key = weekStart.toISOString().split('T')[0];
        weekMap[key] = (weekMap[key] || 0) + s.throws;
      }
      const maxWeek = Math.max(0, ...Object.values(weekMap));
      return { unlocked: maxWeek >= 100, progress: Math.min(maxWeek, 100), target: 100 };
    },
  },
  {
    id: 'iron-arm',
    name: 'Iron Arm',
    description: '50+ throws in a single session',
    icon: '🦾',
    category: 'volume',
    check: (s) => {
      const max = Math.max(0, ...s.map((x) => x.throws));
      return { unlocked: max >= 50, progress: Math.min(max, 50), target: 50 };
    },
  },

  // Special
  {
    id: 'multi-event',
    name: 'Multi-Threat',
    description: 'Train 3 or more different events',
    icon: '🌟',
    category: 'special',
    check: (s) => {
      const events = new Set(s.map((x) => x.event));
      return { unlocked: events.size >= 3, progress: Math.min(events.size, 3), target: 3 };
    },
  },
  {
    id: 'all-events',
    name: 'Pentathlete',
    description: 'Train all 5 throwing events',
    icon: '🎪',
    category: 'special',
    check: (s) => {
      const events = new Set(s.map((x) => x.event));
      return { unlocked: events.size >= 5, progress: Math.min(events.size, 5), target: 5 };
    },
  },
  {
    id: 'max-effort',
    name: 'All Out',
    description: 'Log a session with RPE 10',
    icon: '😤',
    category: 'special',
    check: (s) => {
      const has10 = s.some((x) => x.rpe === 10);
      return { unlocked: has10, progress: has10 ? 1 : 0, target: 1 };
    },
  },
];

export function getUnlockedAchievements(sessions: Session[]): Array<Achievement & { unlocked: boolean; progress: number; target: number }> {
  return ACHIEVEMENTS.map((a) => {
    const result = a.check(sessions);
    return { ...a, ...result };
  });
}

export function getNewlyUnlocked(
  sessions: Session[],
  previouslyUnlocked: string[]
): Achievement[] {
  const prevSet = new Set(previouslyUnlocked);
  return ACHIEVEMENTS.filter((a) => {
    const result = a.check(sessions);
    return result.unlocked && !prevSet.has(a.id);
  });
}
