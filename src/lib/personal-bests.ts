import { Session, PersonalBest } from './types';
import { EVENTS } from './constants';
import { fromDateKey } from './dates';

export function calculatePersonalBests(sessions: Session[]): PersonalBest[] {
  const bestByEvent: Record<string, PersonalBest> = {};

  for (const session of sessions) {
    const current = bestByEvent[session.event];
    if (!current || session.bestMark > current.mark) {
      bestByEvent[session.event] = {
        event: session.event,
        mark: session.bestMark,
        date: session.date,
        sessionId: session.id,
        sessionType: session.sessionType,
      };
    }
  }

  return Object.values(bestByEvent);
}

export function getSeasonBests(
  sessions: Session[],
  seasonStart: Date,
  seasonEnd: Date
): PersonalBest[] {
  const seasonSessions = sessions.filter((s) => {
    // Parse the session date as a LOCAL date so the comparison is consistent with
    // seasonStart/seasonEnd (also local). Using new Date(s.date) parses the key as
    // UTC midnight, which shifts a day in non-UTC zones and misclassifies marks
    // right at the Aug 31 / Sept 1 season boundary.
    const d = fromDateKey(s.date);
    return d >= seasonStart && d <= seasonEnd;
  });
  return calculatePersonalBests(seasonSessions);
}

export function getCurrentSeasonBests(sessions: Session[]): PersonalBest[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // Throwing year: Sept 1 -> Aug 31 (no gap, includes summer club/USATF season)
  const seasonStart = month >= 8
    ? new Date(year, 8, 1)       // Sept of this year
    : new Date(year - 1, 8, 1);  // Sept of last year
  const seasonEnd = month >= 8
    ? new Date(year + 1, 7, 31)  // Aug of next year
    : new Date(year, 7, 31);     // Aug of this year

  return getSeasonBests(sessions, seasonStart, seasonEnd);
}

export function checkForNewPR(
  sessions: Session[],
  newSession: Session
): { isPR: boolean; previousBest: number | null; eventName: string } {
  const event = EVENTS.find((e) => e.id === newSession.event);
  const eventName = event?.name || newSession.event;

  const previousSessions = sessions.filter(
    (s) => s.event === newSession.event && s.id !== newSession.id
  );

  if (previousSessions.length === 0) {
    return { isPR: true, previousBest: null, eventName };
  }

  const previousBest = Math.max(...previousSessions.map((s) => s.bestMark));
  return {
    isPR: newSession.bestMark > previousBest,
    previousBest,
    eventName,
  };
}
