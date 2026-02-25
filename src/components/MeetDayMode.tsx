'use client';

import { useState, useCallback } from 'react';
import { Session } from '@/lib/types';
import { EVENTS } from '@/lib/constants';

interface MeetDayModeProps {
  onSave: (session: Session) => void;
  onExit: () => void;
}

interface Attempt {
  number: number;
  distance: number | null;
  foul: boolean;
}

const MAX_ATTEMPTS = 6;

export default function MeetDayMode({ onSave, onExit }: MeetDayModeProps) {
  const [step, setStep] = useState<'setup' | 'compete' | 'summary'>('setup');
  const [event, setEvent] = useState('');
  const [meetName, setMeetName] = useState('');
  const [implementWeight, setImplementWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [attempts, setAttempts] = useState<Attempt[]>(
    Array.from({ length: MAX_ATTEMPTS }, (_, i) => ({ number: i + 1, distance: null, foul: false }))
  );
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [distanceInput, setDistanceInput] = useState('');
  const [placement, setPlacement] = useState('');
  const [rpe, setRpe] = useState(7);

  const selectedEvent = EVENTS.find((e) => e.id === event);

  const recordAttempt = useCallback((foul: boolean) => {
    if (currentAttempt >= MAX_ATTEMPTS) return;

    const distance = foul ? null : parseFloat(distanceInput);
    if (!foul && (isNaN(distance!) || distance! <= 0)) return;

    setAttempts((prev) => {
      const updated = [...prev];
      updated[currentAttempt] = {
        number: currentAttempt + 1,
        distance: foul ? null : distance!,
        foul,
      };
      return updated;
    });

    setDistanceInput('');

    if (currentAttempt + 1 >= MAX_ATTEMPTS) {
      // Auto-advance to summary after last attempt
      setTimeout(() => setStep('summary'), 300);
    } else {
      setCurrentAttempt((prev) => prev + 1);
    }

    // Haptic
    if ('vibrate' in navigator) navigator.vibrate(foul ? [30, 20, 30] : 30);
  }, [currentAttempt, distanceInput]);

  const validAttempts = attempts.filter((a) => a.distance !== null && !a.foul);
  const bestMark = validAttempts.length > 0 ? Math.max(...validAttempts.map((a) => a.distance!)) : 0;
  const avgMark = validAttempts.length > 0
    ? validAttempts.reduce((sum, a) => sum + a.distance!, 0) / validAttempts.length
    : 0;

  const handleFinish = () => {
    const session: Session = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      event,
      sessionType: 'competition',
      rpe,
      throws: validAttempts.length,
      implementWeight: parseFloat(implementWeight) || 0,
      weightUnit,
      bestMark: Math.round(bestMark * 100) / 100,
      avgMark: Math.round(avgMark * 100) / 100,
      notes: `Meet: ${meetName}. Attempts: ${attempts.map((a, i) => a.foul ? `${i + 1}:FOUL` : a.distance !== null ? `${i + 1}:${a.distance}m` : '').filter(Boolean).join(', ')}`,
      meetName,
      placement,
    };
    onSave(session);
  };

  if (step === 'setup') {
    return (
      <div className="meet-day">
        <div className="meet-day-header">
          <button className="meet-back-btn" onClick={onExit}>&larr;</button>
          <h2 className="meet-day-title">Meet Day</h2>
        </div>

        <div className="meet-setup">
          <div className="meet-field">
            <label className="meet-label">Meet Name</label>
            <input
              className="meet-input"
              value={meetName}
              onChange={(e) => setMeetName(e.target.value)}
              placeholder="Conference Championships"
            />
          </div>

          <div className="meet-field">
            <label className="meet-label">Event</label>
            <div className="meet-event-grid">
              {EVENTS.map((ev) => (
                <button
                  key={ev.id}
                  className={`meet-event-btn${event === ev.id ? ' active' : ''}`}
                  onClick={() => setEvent(ev.id)}
                >
                  <div className="event-icon" dangerouslySetInnerHTML={{ __html: ev.svg }} />
                  <span>{ev.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="meet-row">
            <div className="meet-field">
              <label className="meet-label">Implement</label>
              <div className="input-group">
                <input
                  type="number"
                  step="0.01"
                  className="meet-input"
                  value={implementWeight}
                  onChange={(e) => setImplementWeight(e.target.value)}
                  placeholder="7.26"
                  style={{ flex: 1 }}
                />
                <select
                  className="select"
                  value={weightUnit}
                  onChange={(e) => setWeightUnit(e.target.value as 'kg' | 'lbs')}
                >
                  <option value="kg">kg</option>
                  <option value="lbs">lbs</option>
                </select>
              </div>
            </div>
          </div>

          <button
            className="meet-start-btn"
            disabled={!event || !meetName}
            onClick={() => setStep('compete')}
          >
            Start Competition
          </button>
        </div>
      </div>
    );
  }

  if (step === 'compete') {
    return (
      <div className="meet-day compete-mode">
        <div className="meet-day-header">
          <button className="meet-back-btn" onClick={() => setStep('setup')}>&larr;</button>
          <div className="meet-header-info">
            <span className="meet-event-name">{selectedEvent?.name}</span>
            <span className="meet-meet-name">{meetName}</span>
          </div>
        </div>

        {/* Attempt indicator */}
        <div className="attempt-indicators">
          {attempts.map((a, i) => (
            <div
              key={i}
              className={`attempt-dot${i === currentAttempt ? ' current' : ''}${a.foul ? ' foul' : a.distance !== null ? ' recorded' : ''}`}
            >
              {a.foul ? 'X' : a.distance !== null ? a.distance.toFixed(1) : i + 1}
            </div>
          ))}
        </div>

        {/* Current attempt */}
        {currentAttempt < MAX_ATTEMPTS ? (
          <div className="current-attempt">
            <div className="attempt-number">Attempt {currentAttempt + 1}</div>
            <div className="attempt-of">of {MAX_ATTEMPTS}</div>

            <div className="distance-entry">
              <input
                type="number"
                step="0.01"
                className="distance-input"
                value={distanceInput}
                onChange={(e) => setDistanceInput(e.target.value)}
                placeholder="0.00"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') recordAttempt(false);
                }}
              />
              <span className="distance-unit">m</span>
            </div>

            <div className="attempt-actions">
              <button
                className="mark-btn"
                onClick={() => recordAttempt(false)}
                disabled={!distanceInput}
              >
                Mark
              </button>
              <button
                className="foul-btn"
                onClick={() => recordAttempt(true)}
              >
                Foul
              </button>
            </div>

            {bestMark > 0 && (
              <div className="live-best">
                Current Best: <strong>{bestMark.toFixed(2)}m</strong>
              </div>
            )}
          </div>
        ) : (
          <div className="current-attempt">
            <p>All attempts complete!</p>
            <button className="meet-start-btn" onClick={() => setStep('summary')}>
              View Summary
            </button>
          </div>
        )}

        {/* Skip to summary */}
        {currentAttempt > 0 && currentAttempt < MAX_ATTEMPTS && (
          <button className="meet-skip-btn" onClick={() => setStep('summary')}>
            End Early &rarr; Summary
          </button>
        )}
      </div>
    );
  }

  // Summary
  return (
    <div className="meet-day">
      <div className="meet-day-header">
        <h2 className="meet-day-title">Meet Summary</h2>
      </div>

      <div className="meet-summary">
        <div className="summary-hero">
          <div className="summary-event">{selectedEvent?.name}</div>
          <div className="summary-best">{bestMark.toFixed(2)}m</div>
          <div className="summary-meet">{meetName}</div>
        </div>

        <div className="summary-attempts">
          {attempts.map((a, i) => (
            <div key={i} className={`summary-attempt${a.distance === bestMark && a.distance !== null ? ' best' : ''}${a.foul ? ' foul' : ''}`}>
              <span className="sa-num">{i + 1}</span>
              <span className="sa-dist">
                {a.foul ? 'FOUL' : a.distance !== null ? `${a.distance.toFixed(2)}m` : '-'}
              </span>
              {a.distance === bestMark && a.distance !== null && <span className="sa-best-badge">BEST</span>}
            </div>
          ))}
        </div>

        <div className="summary-fields">
          <div className="meet-field">
            <label className="meet-label">Placement</label>
            <input
              className="meet-input"
              value={placement}
              onChange={(e) => setPlacement(e.target.value)}
              placeholder="1st, 2nd, 3rd..."
            />
          </div>

          <div className="meet-field">
            <label className="meet-label">RPE</label>
            <div className="rpe-grid">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((v) => (
                <button
                  key={v}
                  className={`rpe-button${rpe === v ? ' active' : ''}`}
                  onClick={() => setRpe(v)}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button className="meet-start-btn" onClick={handleFinish}>
          Save Competition
        </button>
      </div>
    </div>
  );
}
