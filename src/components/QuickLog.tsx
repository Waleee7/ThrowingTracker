'use client';

// Quick-log — the 3-tap core loop: Log a throw → type the mark → Save.
// Event + implement are preselected from the last session; everything else
// (RPE, notes, media, landing map…) lives behind "Details" / the full form.
import { useMemo, useRef, useState } from 'react';
import { Session, Profile, ThrowEntry } from '@/lib/types';
import { EVENTS, RPE_SCALE } from '@/lib/constants';
import { formatDistance, distanceUnitLabel } from '@/lib/units';
import { calculatePersonalBests } from '@/lib/personal-bests';
import { quickLogDefaults, implementFor, checkMark, buildQuickSession } from '@/lib/quick-log';
import { haptic } from '@/lib/haptics';

interface QuickLogProps {
  profile: Profile;
  sessions: Session[];
  onSave: (session: Session) => void;
  onFullForm: () => void;
}

export default function QuickLog({ profile, sessions, onSave, onFullForm }: QuickLogProps) {
  const unit = profile.distanceUnit ?? 'm';
  const defaults = useMemo(() => quickLogDefaults(sessions, profile), [sessions, profile]);
  const [event, setEvent] = useState(defaults.event);
  const [weight, setWeight] = useState(String(defaults.weight));
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>(defaults.weightUnit);
  const [input, setInput] = useState('');
  const [log, setLog] = useState<ThrowEntry[]>([]);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [rpe, setRpe] = useState(5);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Offer the athlete's own events first; if they have none set, offer all five.
  const eventChoices = useMemo(() => {
    const mine = EVENTS.filter((e) => profile.events.includes(e.id));
    const withCurrent = mine.some((e) => e.id === event) ? mine : [...mine, ...EVENTS.filter((e) => e.id === event)];
    return withCurrent.length > 0 ? withCurrent : EVENTS;
  }, [profile.events, event]);

  const eventBest = useMemo(
    () => calculatePersonalBests(sessions).find((p) => p.event === event)?.mark ?? 0,
    [sessions, event],
  );

  const typed = input.trim() ? checkMark(input, unit) : null;
  const typedMeters = typed && typed.ok ? typed.meters : 0;
  const sessionBest = log.reduce((m, t) => (t.foul ? m : Math.max(m, t.mark)), 0);
  const isPRPace = eventBest > 0 && Math.max(typedMeters, sessionBest) > eventBest;

  const chooseEvent = (id: string) => {
    if (id === event) return;
    haptic('select');
    setEvent(id);
    const impl = implementFor(id, sessions, profile);
    setWeight(String(impl.weight));
    setWeightUnit(impl.weightUnit);
    setLog([]);
    setError('');
    inputRef.current?.focus();
  };

  /** Validate the typed mark and append it; returns the new log or null on error. */
  const commitTyped = (): ThrowEntry[] | null => {
    if (!input.trim()) return log;
    const res = checkMark(input, unit);
    if (!res.ok) {
      haptic('warning');
      setError(res.reason);
      inputRef.current?.focus();
      return null;
    }
    return [...log, { mark: res.meters, foul: false }];
  };

  const addAnother = () => {
    const next = commitTyped();
    if (!next || next === log) {
      if (next === log) { haptic('warning'); setError('Enter a distance first'); inputRef.current?.focus(); }
      return;
    }
    haptic('tap');
    setLog(next);
    setInput('');
    setError('');
    inputRef.current?.focus();
  };

  const addFoul = () => {
    haptic('warning');
    const next = commitTyped();
    if (!next) return;
    setLog([...next, { mark: 0, foul: true }]);
    setInput('');
    setError('');
    inputRef.current?.focus();
  };

  const removeAt = (i: number) => {
    haptic('tap');
    setLog((l) => l.filter((_, idx) => idx !== i));
  };

  const save = () => {
    if (saving) return;
    const final = commitTyped();
    if (!final) return;
    const w = parseFloat(weight);
    const session = buildQuickSession({
      event,
      weight: isFinite(w) && w > 0 ? w : defaults.weight,
      weightUnit,
      throwLog: final,
      rpe,
      notes: notes.trim(),
    });
    if (!session) {
      haptic('warning');
      setError('Enter a distance first');
      inputRef.current?.focus();
      return;
    }
    setSaving(true);
    onSave(session); // AppContext fires the success / PR haptic and routes home
  };

  const eventName = EVENTS.find((e) => e.id === event)?.name ?? event;
  const canSave = !!input.trim() || log.length > 0;
  const unitLabel = distanceUnitLabel(unit);

  return (
    <div className="tab-content quick-log" id="tab-log">
      <div className="ql-head">
        <h2 className="tab-title">Log a throw</h2>
        <button type="button" className="ql-link" onClick={onFullForm}>Full session form</button>
      </div>

      <div className="ql-events" role="radiogroup" aria-label="Event">
        {eventChoices.map((e) => (
          <button
            key={e.id}
            type="button"
            role="radio"
            aria-checked={e.id === event}
            className={`ql-chip${e.id === event ? ' active' : ''}`}
            onClick={() => chooseEvent(e.id)}
          >
            {e.name}
          </button>
        ))}
      </div>

      <form
        className="ql-card"
        onSubmit={(ev) => { ev.preventDefault(); save(); }}
        noValidate
      >
        <label className="ql-label" htmlFor="ql-mark">
          Mark
          {eventBest > 0 && <span className="ql-hint">PR {formatDistance(eventBest, unit)}</span>}
        </label>
        <div className={`ql-mark-wrap${error ? ' has-error' : ''}${isPRPace ? ' pr-pace' : ''}`}>
          <input
            id="ql-mark"
            ref={inputRef}
            className="ql-mark"
            type="text"
            inputMode="decimal"
            enterKeyHint="done"
            autoComplete="off"
            autoFocus
            placeholder={eventBest > 0 ? formatDistance(eventBest, unit, { withUnit: false }) : '0.00'}
            value={input}
            onChange={(e) => { setInput(e.target.value); if (error) setError(''); }}
            aria-invalid={!!error}
            aria-describedby="ql-msg"
          />
          <span className="ql-unit" aria-hidden="true">{unitLabel}</span>
        </div>
        <p id="ql-msg" className={`ql-msg${error ? ' error' : isPRPace ? ' pr' : ''}`} role="status">
          {error || (isPRPace ? 'That is a new PR' : `${eventName} · ${weight} ${weightUnit}`)}
        </p>

        {log.length > 0 && (
          <ul className="ql-throws" aria-label="Throws this session">
            {log.map((t, i) => (
              <li key={i}>
                <button type="button" className={`ql-throw${t.foul ? ' foul' : ''}`} onClick={() => removeAt(i)} aria-label={`Remove throw ${i + 1}`}>
                  <span className="ql-throw-n">{i + 1}</span>
                  {t.foul ? 'Foul' : formatDistance(t.mark, unit, { withUnit: false })}
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="ql-secondary">
          <button type="button" className="secondary-button" onClick={addAnother}>+ Add another</button>
          <button type="button" className="secondary-button ql-foul" onClick={addFoul}>Foul</button>
        </div>

        <button type="button" className="ql-details-toggle" aria-expanded={showDetails} onClick={() => { haptic('tap'); setShowDetails((v) => !v); }}>
          {showDetails ? 'Hide details' : 'Details · implement, RPE, notes'}
        </button>

        {showDetails && (
          <div className="ql-details">
            <div className="ql-field">
              <label className="ql-label" htmlFor="ql-weight">Implement</label>
              <div className="ql-weight">
                <input id="ql-weight" type="text" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} />
                <select aria-label="Weight unit" value={weightUnit} onChange={(e) => setWeightUnit(e.target.value as 'kg' | 'lbs')}>
                  <option value="kg">kg</option>
                  <option value="lbs">lbs</option>
                </select>
              </div>
            </div>
            <div className="ql-field">
              <span className="ql-label" id="ql-rpe-l">RPE</span>
              <div className="ql-rpe" role="radiogroup" aria-labelledby="ql-rpe-l">
                {RPE_SCALE.map((n) => (
                  <button key={n} type="button" role="radio" aria-checked={n === rpe} className={`ql-rpe-btn${n === rpe ? ' active' : ''}`} onClick={() => { haptic('select'); setRpe(n); }}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div className="ql-field">
              <label className="ql-label" htmlFor="ql-notes">Notes</label>
              <textarea id="ql-notes" rows={2} placeholder="How did it feel?" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>
        )}

        <button type="submit" className="primary-button ql-save" disabled={!canSave || saving}>
          {saving ? 'Saving…' : log.length + (input.trim() ? 1 : 0) > 1 ? `Save ${log.length + (input.trim() ? 1 : 0)} throws` : 'Save'}
        </button>
      </form>
    </div>
  );
}
