'use client';

import {
  getRegistry,
  registryEvents,
  bandKeyForGrade,
  eventName,
  formatImplement,
} from '@/lib/implements';
import type { EventId, GradeLevel } from '@/lib/athlete-level';

interface ImplementRegistryProps {
  event?: string; // limit to one event; otherwise show all
  highlightGrade?: GradeLevel;
  highlightSex?: 'M' | 'F' | '';
}

export default function ImplementRegistry({
  event,
  highlightGrade,
  highlightSex,
}: ImplementRegistryProps) {
  const events: EventId[] = event ? [event as EventId] : registryEvents();
  const activeBand = bandKeyForGrade(highlightGrade);

  return (
    <div className="impl-registry">
      {events.map((ev) => {
        const rows = getRegistry(ev);
        if (rows.length === 0) return null;
        return (
          <div key={ev} className="impl-event">
            <div className="impl-event-name">{eventName(ev)}</div>
            <table className="impl-table">
              <thead>
                <tr>
                  <th>Level</th>
                  <th>Men</th>
                  <th>Women</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const isYou = activeBand === r.bandKey;
                  return (
                    <tr key={r.bandKey} className={isYou ? 'impl-you' : ''}>
                      <td>
                        {r.band}
                        {isYou && <span className="impl-you-tag">you</span>}
                      </td>
                      <td className={isYou && highlightSex === 'M' ? 'impl-mark' : ''}>
                        {formatImplement(r.maleKg)}
                      </td>
                      <td className={isYou && highlightSex === 'F' ? 'impl-mark' : ''}>
                        {formatImplement(r.femaleKg)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}
      <p className="impl-source">
        Standard weights: NFHS (HS) · NCAA (college) · World Athletics (open) · USATF Youth.
      </p>
    </div>
  );
}
