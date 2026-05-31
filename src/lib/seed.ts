import { Session, ThrowEntry } from './types';
import { toLocalDateKey } from './dates';
import { deriveSessionMetrics } from './throws';
import { storage } from './storage';

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toLocalDateKey(d);
}

let counter = 0;
function sampleId(): string {
  counter += 1;
  return `sample-${Date.now()}-${counter}`;
}

/** A throw log written as [meters, isFoul] pairs (foul marks ignored in best/avg). */
function log(pairs: Array<[number, boolean]>): ThrowEntry[] {
  return pairs.map(([mark, foul]) => ({ mark: foul ? 0 : mark, foul }));
}

/**
 * A realistic ~6-week training block for a HS/college discus + shot thrower.
 * All distances are canonical meters; implements in kg. Two competition days
 * carry a throw-by-throw log (with fouls) to exercise the W5 schema, and the
 * regional meet is a PR. Used for demos, empty-state testing, and onboarding.
 */
export function generateSampleSessions(): Session[] {
  const sessions: Session[] = [];

  const train = (
    day: number,
    event: string,
    weight: number,
    best: number,
    avg: number,
    throws: number,
    rpe: number,
    notes: string,
  ) => {
    sessions.push({
      id: sampleId(),
      date: daysAgo(day),
      event,
      sessionType: 'training',
      rpe,
      throws,
      implementWeight: weight,
      weightUnit: 'kg',
      bestMark: best,
      avgMark: avg,
      notes,
    });
  };

  const meet = (
    day: number,
    event: string,
    weight: number,
    throwLog: ThrowEntry[],
    rpe: number,
    meetName: string,
    placement: string,
    notes: string,
  ) => {
    const m = deriveSessionMetrics(throwLog);
    sessions.push({
      id: sampleId(),
      date: daysAgo(day),
      event,
      sessionType: 'competition',
      rpe,
      throws: m.throws,
      throwLog,
      implementWeight: weight,
      weightUnit: 'kg',
      bestMark: m.bestMark,
      avgMark: m.avgMark,
      notes,
      meetName,
      placement,
    });
  };

  // Discus is the primary event (1.6 kg); shot put (5.44 kg) as a secondary.
  train(42, 'discus', 1.6, 51.2, 48.1, 20, 6, 'Season opener — rusty out of the back, working the wide right side.');
  train(40, 'shot-put', 5.44, 15.1, 14.2, 18, 5, 'Standing throws, focus on the punch and a tall finish.');
  train(37, 'discus', 1.6, 52.0, 49.0, 24, 6, 'Rhythm coming back. Big toe block on the best ones.');
  train(35, 'discus', 1.6, 52.8, 49.6, 22, 7, 'Stayed back longer, patient sweep.');
  train(33, 'shot-put', 5.44, 15.4, 14.5, 16, 6, 'Full glide starting to click, hips leading.');
  train(30, 'discus', 1.6, 53.5, 50.3, 24, 7, 'Windy — quartering tailwind helped a couple sail.');
  meet(28, 'discus', 1.6, log([[52.1, false], [0, true], [53.8, false], [54.2, false], [0, true], [53.0, false]]), 8,
    'County Championships', '2nd', 'Two fouls reaching for it early; settled in and the 4th was clean and big.');
  train(25, 'shot-put', 5.44, 15.8, 14.9, 18, 6, 'PRd the standing throw in warmups, good day.');
  train(23, 'discus', 1.6, 54.0, 50.8, 22, 7, 'Technical day, filming from the side.');
  train(20, 'discus', 1.6, 54.6, 51.2, 26, 8, 'Big volume block. Legs cooked by the end.');
  train(18, 'shot-put', 5.44, 16.0, 15.1, 16, 6, 'Broke 16 on a full throw, finally.');
  train(16, 'discus', 1.6, 55.1, 51.9, 20, 7, 'Fast and loose, cut volume to keep it crisp.');
  train(13, 'discus', 1.6, 55.4, 52.3, 22, 7, 'Felt the PR coming — everything firing in sequence.');
  meet(10, 'discus', 1.6, log([[55.0, false], [56.3, false], [0, true], [57.2, false], [56.1, false], [0, true]]), 9,
    'Regional Qualifier', '1st', 'PR! 57.2 on the 4th. Punched my ticket. Last two I went for too much.');
  train(7, 'shot-put', 5.44, 16.2, 15.3, 14, 5, 'Deload — light and easy after the meet.');
  train(4, 'discus', 1.6, 55.8, 52.6, 18, 6, 'Light tech day, locking in the PR feel.');
  train(2, 'discus', 1.6, 56.0, 53.0, 20, 7, 'Sharp. Ready for the next one.');

  return sessions;
}

/**
 * Merge sample sessions into storage (existing data is kept — sample ids are
 * unique). Caller is responsible for reloading the UI afterward.
 * Returns the number of sample sessions added.
 */
export function loadSampleData(): number {
  const existing = storage.getSessions();
  const sample = generateSampleSessions();
  storage.setSessions([...existing, ...sample]);
  return sample.length;
}
