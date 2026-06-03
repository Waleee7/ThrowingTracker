// AI Coach Brain (W10) — client-safe context engine.
//
// Athlete data lives in localStorage on the CLIENT, so the browser builds a
// compact, structured context here and ships it to the server route
// (app/api/coach), which is the only place the Claude API key lives. These
// functions are pure + serializable so they can run on either side and be
// unit-tested. Nothing here imports the Anthropic SDK or touches secrets.

import type { Profile, Session } from './types';
import { EVENTS } from './constants';
import { getEffectiveLevel, type AthleteLevel } from './athlete-level';
import { calculatePersonalBests } from './personal-bests';
import { computeReadiness } from './readiness';
import { calculateStreak } from './analytics';
import { countFouls } from './throws';
import { formatDistance, type DistanceUnit } from './units';

export interface CoachMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface PBLine {
  event: string;
  eventName: string;
  mark: number; // canonical meters
  date: string;
}

interface RecentSessionLine {
  date: string;
  event: string;
  eventName: string;
  bestMark: number; // meters
  avgMark: number; // meters
  throws: number;
  fouls: number;
  rpe: number;
  type: 'training' | 'competition';
  notes: string;
}

export interface AthleteContext {
  name: string;
  sex: 'M' | 'F' | '';
  grade?: string;
  level: AthleteLevel;
  distanceUnit: DistanceUnit;
  events: string[]; // display names
  goals: string[];
  streak: number;
  totalSessions: number;
  readiness: { available: boolean; score: number; label: string; factors: string[] };
  last14: { sessions: number; throws: number; avgRpe: number };
  pbs: PBLine[];
  recent: RecentSessionLine[]; // newest first, capped
}

export const COACH_DISCLAIMER =
  'Coach Brain draws on published throws-science — it’s a training partner, not a replacement for your coach or medical advice.';

const DAY_MS = 86_400_000;

export function eventName(id: string): string {
  return EVENTS.find((e) => e.id === id)?.name ?? id;
}

function clampNotes(notes: string | undefined, max = 90): string {
  const n = (notes ?? '').replace(/\s+/g, ' ').trim();
  return n.length > max ? `${n.slice(0, max - 1)}…` : n;
}

/** Build the compact, JSON-serializable athlete context sent to the coach route. */
export function buildAthleteContext(profile: Profile, sessions: Session[]): AthleteContext {
  const unit = (profile.distanceUnit ?? 'm') as DistanceUnit;
  const sorted = sessions
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const cutoff = Date.now() - 14 * DAY_MS;
  const last14 = sorted.filter((s) => new Date(s.date).getTime() >= cutoff);
  const last14Throws = last14.reduce((sum, s) => sum + Math.max(0, s.throws), 0);
  const last14AvgRpe =
    last14.length > 0 ? last14.reduce((sum, s) => sum + s.rpe, 0) / last14.length : 0;

  const readiness = computeReadiness(sessions);

  const pbs: PBLine[] = calculatePersonalBests(sessions)
    .sort((a, b) => b.mark - a.mark)
    .map((pb) => ({ event: pb.event, eventName: eventName(pb.event), mark: pb.mark, date: pb.date }));

  const recent: RecentSessionLine[] = sorted.slice(0, 10).map((s) => ({
    date: s.date,
    event: s.event,
    eventName: eventName(s.event),
    bestMark: s.bestMark,
    avgMark: s.avgMark,
    throws: s.throws,
    fouls: s.throwLog ? countFouls(s.throwLog) : 0,
    rpe: s.rpe,
    type: s.sessionType,
    notes: clampNotes(s.notes),
  }));

  return {
    name: profile.name?.trim() || 'Athlete',
    sex: profile.sex,
    grade: profile.grade,
    level: getEffectiveLevel(profile),
    distanceUnit: unit,
    events: (profile.events ?? []).map(eventName),
    goals: profile.goals ?? [],
    streak: calculateStreak(sessions),
    totalSessions: sessions.length,
    readiness: {
      available: readiness.available,
      score: readiness.score,
      label: readiness.label,
      factors: readiness.factors,
    },
    last14: { sessions: last14.length, throws: last14Throws, avgRpe: Math.round(last14AvgRpe * 10) / 10 },
    pbs,
    recent,
  };
}

/** Render the context as a plain-text block for the model's system prompt. */
export function formatAthleteContext(ctx: AthleteContext): string {
  const u = ctx.distanceUnit;
  const lines: string[] = [];

  lines.push('ATHLETE PROFILE');
  lines.push(`- Name: ${ctx.name}`);
  lines.push(
    `- Sex: ${ctx.sex || 'unspecified'} | Grade/stage: ${ctx.grade ?? 'unspecified'} | Tier: ${ctx.level}`,
  );
  lines.push(`- Events: ${ctx.events.length ? ctx.events.join(', ') : 'none set'}`);
  if (ctx.goals.length) lines.push(`- Goals: ${ctx.goals.join(', ')}`);
  lines.push(`- Preferred units: ${u === 'ft' ? 'feet/inches' : 'meters'} (always speak in these)`);
  lines.push(`- Training streak: ${ctx.streak} day(s) | Total sessions logged: ${ctx.totalSessions}`);

  lines.push('');
  if (ctx.readiness.available) {
    lines.push(`READINESS: ${ctx.readiness.score}/100 (${ctx.readiness.label})`);
    for (const f of ctx.readiness.factors) lines.push(`- ${f}`);
  } else {
    lines.push('READINESS: not enough data yet (needs 3+ sessions).');
  }

  lines.push('');
  if (ctx.pbs.length) {
    lines.push('PERSONAL BESTS');
    for (const pb of ctx.pbs) lines.push(`- ${pb.eventName}: ${formatDistance(pb.mark, u)} (${pb.date})`);
  } else {
    lines.push('PERSONAL BESTS: none logged yet.');
  }

  lines.push('');
  lines.push(
    `LAST 14 DAYS: ${ctx.last14.sessions} session(s), ${ctx.last14.throws} throws, avg RPE ${ctx.last14.avgRpe || '—'}`,
  );

  lines.push('');
  if (ctx.recent.length) {
    lines.push('RECENT SESSIONS (newest first)');
    for (const s of ctx.recent) {
      const foul = s.fouls ? `, ${s.fouls} foul${s.fouls > 1 ? 's' : ''}` : '';
      const note = s.notes ? ` — "${s.notes}"` : '';
      lines.push(
        `- ${s.date} ${s.eventName}: best ${formatDistance(s.bestMark, u)}, avg ${formatDistance(
          s.avgMark,
          u,
        )}, ${s.throws} throws${foul}, RPE ${s.rpe}, ${s.type}${note}`,
      );
    }
  } else {
    lines.push('RECENT SESSIONS: none logged yet.');
  }

  return lines.join('\n');
}

/** Tier- and data-aware starter questions shown as one-tap chips. */
export function suggestedQuestions(ctx: AthleteContext): string[] {
  const ev = ctx.events[0]; // undefined if no event set yet
  if (ctx.totalSessions === 0) {
    return [
      'How do I get started as a thrower?',
      'What makes a good throw?',
      'How often should I train?',
      'What should I track to improve?',
    ];
  }
  if (ctx.level === 'rookie') {
    return [
      ev ? `How do I throw the ${ev} farther?` : 'How do I throw farther?',
      'Am I training too much or too little?',
      'What should I eat before practice?',
      'Explain RPE and why it matters',
    ];
  }
  if (ctx.level === 'elite') {
    return [
      ev ? `Analyze my recent ${ev} consistency` : 'Analyze my recent consistency',
      'Periodize my next training block',
      ev ? `Optimal release parameters for the ${ev}` : 'Optimal release parameters for my throw',
      'Is my training load (ACWR) in range?',
    ];
  }
  // competitor
  return [
    ev ? `Why might I be plateauing in the ${ev}?` : 'Why might I be plateauing?',
    'Build me a peak-week taper',
    'How does my training load look right now?',
    ev ? `Give me technique cues for the ${ev}` : 'Give me technique cues for my event',
  ];
}

/** Instant, personalized opening message — rendered locally, no API call. */
export function coachGreeting(ctx: AthleteContext): string {
  if (ctx.totalSessions === 0) {
    return `Hey **${ctx.name}** 👋 I'm your **Coach Brain**.\n\nI've read the published throws-science playbook — Bondarchuk, Babbitt, Wilkins and the biomechanics literature — and I'm here to turn it into *your* training. Log a session or two and I'll start spotting patterns. In the meantime, ask me anything about technique, training, or competing.`;
  }

  const topEvent = ctx.events[0]; // may be undefined
  const topPb = ctx.pbs[0];
  const pbBit = topPb
    ? ` Your ${topPb.eventName} PB of **${formatDistance(topPb.mark, ctx.distanceUnit)}** is the number we're chasing.`
    : '';
  const readyBit = ctx.readiness.available
    ? ` Right now you're reading **${ctx.readiness.score}/100 — ${ctx.readiness.label}**.`
    : '';

  return `Hey **${ctx.name}** 👋 I'm your **Coach Brain**, and I've gone through your last ${ctx.recent.length} session${ctx.recent.length === 1 ? '' : 's'}.${readyBit}${pbBit}\n\nAsk me about your ${topEvent ? `${topEvent} ` : ''}technique, why a mark stalled, how to taper for a meet — I'll always work from your real numbers, not generic advice.`;
}

/**
 * Smart offline fallback — used when no API key is configured or the live call
 * fails, so a demo never dies on stage. Keyword-routed and grounded in the
 * athlete's real context so it still looks intelligent.
 */
export function localFallbackReply(ctx: AthleteContext | null, userMessage: string): string {
  const q = userMessage.toLowerCase();
  const name = ctx?.name ?? 'there';
  const unit: DistanceUnit = ctx?.distanceUnit ?? 'm';
  const topEvent = ctx?.events[0]; // may be undefined
  const topPb = ctx?.pbs[0];
  const ready = ctx?.readiness;

  const has = (...keys: string[]) => keys.some((k) => q.includes(k));

  if (has('plateau', 'stuck', 'stall', 'not improving', "can't pr", 'stopped improving')) {
    return `Plateaus in the throws are almost always **velocity** or **position**, not effort, ${name}.\n\n- **Release velocity drives distance** (range scales with the square of speed) — if marks have stalled, your speed at release has likely stalled. Train it directly with **overweight/underweight implements** (Bondarchuk's overload–underload principle).\n- **Audit positions on video**, not feel — most stalls trace to an early upper body or a soft block side.\n- **Check your load:** ${ready?.available ? `you're at ${ready.score}/100 (${ready.label})` : 'log a few more sessions for a readiness read'} — a plateau under high fatigue is often a recovery problem, not a technique one.\n\nWant me to break down a specific ${topEvent ? `${topEvent} ` : ''}position?`;
  }

  if (has('taper', 'peak', 'meet', 'competition', 'comp day')) {
    return `Here's a clean **peak-week taper**, ${name}:\n\n- **Cut volume ~40–60%, keep intensity high.** Fewer throws, but full-speed and competition-weight.\n- **Last hard day 4–5 days out**, then short, sharp, low-volume tune-ups.\n- **Day before:** 6–10 easy full-effort throws to stay sharp, then rest.\n- **Trust the work** — you can't gain fitness in meet week, only freshness.\n\n${ready?.available ? `You're reading ${ready.score}/100 (${ready.label}) today — ` : ''}peaking is just managing fatigue so your speed shows up on the day.`;
  }

  if (has('wind', 'aero', 'headwind', 'tailwind')) {
    return `Wind matters most for the **aerodynamic implements**, ${name}:\n\n- **Discus flies *better* into a moderate quartering headwind** — the relative airflow generates lift. Counterintuitive but real. A right-handed thrower wants wind coming from the right-front.\n- **Javelin** similarly likes a slight headwind.\n- **Shot, hammer, weight throw** are basically wind-immune — they're dense and non-aerodynamic.\n\nSo on a windy meet day, a discus thrower can actually *want* what feels like a bad-weather day.`;
  }

  if (has('strength', 'lift', 'gym', 'weight room', 'squat', 'power')) {
    return `Throws strength is about **explosive power**, not just max load, ${name}:\n\n- **Olympic lifts** (cleans, snatches) and their variations train rate-of-force-development — turning strength into speed.\n- **Squats & pulls** build the base, but pair them with **jumps and med-ball throws** to keep things fast.\n- **Specificity wins** (Bondarchuk): the closer a lift's force-velocity profile is to throwing, the better it transfers.\n\nKeep heavy lifting away from your most technical throw days so quality stays high.`;
  }

  if (has('recover', 'rest', 'tired', 'sore', 'fatigue', 'overtrain', 'readiness', 'load')) {
    const r = ready?.available
      ? `Your readiness is **${ready.score}/100 (${ready.label})**.${ready.factors[0] ? ` ${ready.factors[0]}` : ''}`
      : `Log 3+ sessions and I'll give you a live readiness score.`;
    return `${r}\n\n- The app tracks your **acute:chronic workload ratio** (Gabbett) — the sweet spot is roughly **0.8–1.3**. Spikes above ~1.5 are where injury risk climbs.\n- If you're sore and stale, a **deload** (cut volume, keep a little intensity) usually beats pushing through.\n- Sleep and protein do more for recovery than any supplement.\n\nReal pain — not normal soreness — is a stop-and-see-a-pro signal, ${name}.`;
  }

  if (has('technique', 'form', 'cue', 'fix', 'drill')) {
    return `Happy to get technical, ${name}. A few universal throws cues:\n\n- **Be patient with the upper body** — let the lower half lead; throwing "with the arm" early kills distance.\n- **Long path on the implement** — the more distance you accelerate it over, the faster it leaves.\n- **Block the non-throwing side** — a firm left side (for a righty) converts rotation into release speed.\n\nTell me your event and the part of the throw that feels off, and I'll narrow it ${topEvent ? `to ${topEvent}-specific cues` : 'down for you'}.`;
  }

  // Default: summarize their data + one actionable nudge.
  const pbBit = topPb ? ` Your top mark on record is **${formatDistance(topPb.mark, unit)}** in the ${topPb.eventName}.` : '';
  const readyBit = ready?.available ? ` You're reading ${ready.score}/100 (${ready.label}).` : '';
  return `Good question, ${name}.${pbBit}${readyBit}\n\nFrom what I can see in your log, the highest-leverage move for most throwers is to **train release velocity directly** and **video your positions** rather than chasing distance by feel. Tell me what you want to dig into — technique, a plateau, a taper, or your training load — and I'll get specific with your numbers.`;
}
