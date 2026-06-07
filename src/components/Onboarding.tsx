'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Profile } from '@/lib/types';
import { EVENTS } from '@/lib/constants';
import { AppLogo } from '@/components/Icons';
import splashOnboarding from '@/assets/media/splash-onboarding.webp';

/** Per-event accent token (mirrors EVENT_COLORS keys → --color-evt-* vars). */
const EVENT_HUE_VAR: Record<string, string> = {
  'shot-put': 'var(--color-evt-shot)',
  discus: 'var(--color-evt-discus)',
  hammer: 'var(--color-evt-hammer)',
  'weight-throw': 'var(--color-evt-weight)',
  javelin: 'var(--color-evt-javelin)',
};
import {
  AthleteGoal,
  EventId,
  EventPR,
  ExtendedProfile,
  GradeLevel,
  deriveAthleteLevel,
  getRecommendedImplementKg,
  isEventAgeAppropriate,
} from '@/lib/athlete-level';

interface OnboardingProps {
  onComplete: (profile: Partial<ExtendedProfile>) => void;
}

const GRADE_OPTIONS: { value: GradeLevel; label: string }[] = [
  { value: 'youth', label: '5th grade or younger' },
  { value: 'middle_school', label: 'Middle school (6–8)' },
  { value: 'hs_freshman', label: 'HS Freshman' },
  { value: 'hs_sophomore', label: 'HS Sophomore' },
  { value: 'hs_junior', label: 'HS Junior' },
  { value: 'hs_senior', label: 'HS Senior' },
  { value: 'college', label: 'College' },
  { value: 'post_collegiate', label: 'Post-collegiate / Pro' },
];

const GOAL_OPTIONS: { value: AthleteGoal; label: string; emoji: string }[] = [
  { value: 'fun', label: 'Just for fun', emoji: '🎯' },
  { value: 'school_team', label: 'Make the team', emoji: '🏫' },
  { value: 'state_meet', label: 'State meet', emoji: '🏆' },
  { value: 'college_scholarship', label: 'College scholarship', emoji: '🎓' },
  { value: 'national_team', label: 'National team', emoji: '🇺🇸' },
  { value: 'olympics', label: 'Olympics', emoji: '🥇' },
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [grade, setGrade] = useState<GradeLevel | ''>('');
  const [sex, setSex] = useState<'M' | 'F' | ''>('');
  const [heightValue, setHeightValue] = useState('');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft/in'>('ft/in');
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const [weightValue, setWeightValue] = useState('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('lbs');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [prs, setPRs] = useState<Record<string, string>>({});
  const [goals, setGoals] = useState<AthleteGoal[]>([]);

  const toggleEvent = (id: string) => {
    setSelectedEvents(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id],
    );
  };

  const toggleGoal = (g: AthleteGoal) => {
    setGoals(prev => (prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]));
  };

  const buildPRs = (): EventPR[] => {
    if (!grade || !sex) return [];
    const out: EventPR[] = [];
    for (const evId of selectedEvents) {
      const raw = prs[evId];
      if (!raw) continue;
      const mark = parseFloat(raw);
      if (!isFinite(mark) || mark <= 0) continue;
      const implementKg = getRecommendedImplementKg(evId as EventId, grade, sex);
      if (implementKg == null) continue;
      out.push({
        event: evId as EventId,
        mark,
        unit: 'm',
        implementWeightKg: implementKg,
      });
    }
    return out;
  };

  const derived =
    grade && sex
      ? deriveAthleteLevel({ grade, sex, goals, prs: buildPRs() })
      : null;

  const handleFinish = () => {
    const heightPayload =
      heightUnit === 'ft/in'
        ? { value: '', unit: 'ft/in' as const, feet: heightFeet, inches: heightInches }
        : { value: heightValue, unit: 'cm' as const, feet: '', inches: '' };

    const payload: Partial<ExtendedProfile> = {
      name,
      events: selectedEvents,
      sex: sex || '',
      height: heightPayload,
      weight: { value: weightValue, unit: weightUnit },
      notes: '',
      grade: (grade || undefined) as GradeLevel | undefined,
      goals,
      prs: buildPRs(),
      athleteLevel: derived?.level,
    };
    onComplete(payload);
  };

  const visibleEvents = grade
    ? EVENTS.filter(e => isEventAgeAppropriate(e.id as EventId, grade as GradeLevel))
    : EVENTS;

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card">
        <div className="onboarding-progress">
          {[0, 1, 2, 3, 4, 5].map(i => (
            <div key={i} className={`onboarding-dot${step >= i ? ' active' : ''}`} />
          ))}
        </div>

        {step === 0 && (
          <div className="onboarding-step">
            <div
              style={{
                position: 'relative',
                margin: '-4px -4px 16px',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                minHeight: 240,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-end',
                textAlign: 'center',
                padding: '24px 20px 22px',
              }}
            >
              <Image
                src={splashOnboarding}
                alt=""
                fill
                placeholder="blur"
                priority
                sizes="(max-width: 480px) 100vw, 440px"
                style={{ objectFit: 'cover', zIndex: 0 }}
              />
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 1,
                  background:
                    'linear-gradient(0deg, rgba(10,10,11,0.92) 0%, rgba(10,10,11,0.6) 50%, rgba(10,10,11,0.4) 100%)',
                }}
              />
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div className="onboarding-logo">
                  <AppLogo size={56} />
                </div>
                <h1
                  className="onboarding-title"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--color-fg)' }}
                >
                  ThrowingTracker
                </h1>
              </div>
            </div>
            <p className="onboarding-subtitle">
              Built for throwers — from your first meet to the Olympic stadium.
            </p>
            <div className="onboarding-features">
              <div className="onboarding-feature">
                <span className="feature-bullet" />
                <span>Tailored to your level — youth to pro</span>
              </div>
              <div className="onboarding-feature">
                <span className="feature-bullet" />
                <span>Auto-picks the right implement weight for you</span>
              </div>
              <div className="onboarding-feature">
                <span className="feature-bullet" />
                <span>Tracks PRs, sessions, and meet performances</span>
              </div>
              <div className="onboarding-feature">
                <span className="feature-bullet" />
                <span>Grows with you as your goals get bigger</span>
              </div>
            </div>
            <button className="onboarding-btn primary" onClick={() => setStep(1)}>
              Get Started
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="onboarding-step">
            <h2 className="onboarding-step-title">Who are you?</h2>
            <p className="onboarding-step-desc">
              We use this to tailor the app to your level.
            </p>
            <input
              className="onboarding-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              autoFocus
            />
            <div className="onboarding-row" style={{ marginTop: 12 }}>
              <button
                className={`onboarding-pill${sex === 'M' ? ' selected' : ''}`}
                onClick={() => setSex('M')}
              >
                Male
              </button>
              <button
                className={`onboarding-pill${sex === 'F' ? ' selected' : ''}`}
                onClick={() => setSex('F')}
              >
                Female
              </button>
            </div>
            <div className="onboarding-grade-list" style={{ marginTop: 12 }}>
              {GRADE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  className={`onboarding-pill${grade === opt.value ? ' selected' : ''}`}
                  onClick={() => setGrade(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button
              className="onboarding-btn primary"
              disabled={!name.trim() || !grade || !sex}
              onClick={() => setStep(2)}
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="onboarding-step">
            <h2 className="onboarding-step-title">Your body</h2>
            <p className="onboarding-step-desc">
              Height and weight help personalize training norms. Skip if you&apos;d rather not say.
            </p>
            <div className="onboarding-row">
              <button
                className={`onboarding-pill${heightUnit === 'ft/in' ? ' selected' : ''}`}
                onClick={() => setHeightUnit('ft/in')}
              >
                ft/in
              </button>
              <button
                className={`onboarding-pill${heightUnit === 'cm' ? ' selected' : ''}`}
                onClick={() => setHeightUnit('cm')}
              >
                cm
              </button>
            </div>
            {heightUnit === 'ft/in' ? (
              <div className="onboarding-row" style={{ marginTop: 8 }}>
                <input
                  className="onboarding-input"
                  type="number"
                  value={heightFeet}
                  onChange={e => setHeightFeet(e.target.value)}
                  placeholder="ft"
                />
                <input
                  className="onboarding-input"
                  type="number"
                  value={heightInches}
                  onChange={e => setHeightInches(e.target.value)}
                  placeholder="in"
                />
              </div>
            ) : (
              <input
                className="onboarding-input"
                type="number"
                value={heightValue}
                onChange={e => setHeightValue(e.target.value)}
                placeholder="cm"
                style={{ marginTop: 8 }}
              />
            )}
            <div className="onboarding-row" style={{ marginTop: 16 }}>
              <button
                className={`onboarding-pill${weightUnit === 'lbs' ? ' selected' : ''}`}
                onClick={() => setWeightUnit('lbs')}
              >
                lbs
              </button>
              <button
                className={`onboarding-pill${weightUnit === 'kg' ? ' selected' : ''}`}
                onClick={() => setWeightUnit('kg')}
              >
                kg
              </button>
            </div>
            <input
              className="onboarding-input"
              type="number"
              value={weightValue}
              onChange={e => setWeightValue(e.target.value)}
              placeholder={`Weight (${weightUnit})`}
              style={{ marginTop: 8 }}
            />
            <button className="onboarding-btn primary" onClick={() => setStep(3)}>
              Continue
            </button>
            <button className="onboarding-btn text" onClick={() => setStep(3)}>
              Skip
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="onboarding-step">
            <h2 className="onboarding-step-title">Pick your events</h2>
            <p className="onboarding-step-desc">
              We&apos;ll auto-suggest the right implement weight for your level.
            </p>
            <div className="onboarding-events">
              {visibleEvents.map(ev => {
                const implementKg = grade && sex
                  ? getRecommendedImplementKg(ev.id as EventId, grade, sex)
                  : null;
                const isSelected = selectedEvents.includes(ev.id);
                const hue = EVENT_HUE_VAR[ev.id];
                return (
                  <button
                    key={ev.id}
                    className={`onboarding-event-btn${isSelected ? ' selected' : ''}`}
                    onClick={() => toggleEvent(ev.id)}
                    style={
                      isSelected && hue
                        ? {
                            borderColor: hue,
                            boxShadow: `inset 0 0 0 1px ${hue}`,
                          }
                        : undefined
                    }
                  >
                    <div
                      className="event-icon"
                      style={hue ? { color: hue } : undefined}
                      dangerouslySetInnerHTML={{ __html: ev.svg }}
                    />
                    <span className="onboarding-event-name">{ev.name}</span>
                    {implementKg != null && (
                      <span className="onboarding-event-implement">{implementKg}kg</span>
                    )}
                    {isSelected && (
                      <span className="onboarding-check" style={hue ? { color: hue } : undefined}>&#10003;</span>
                    )}
                  </button>
                );
              })}
            </div>
            <button
              className="onboarding-btn primary"
              disabled={selectedEvents.length === 0}
              onClick={() => setStep(4)}
            >
              Continue
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="onboarding-step">
            <h2 className="onboarding-step-title">Where you&apos;re at + going</h2>
            <p className="onboarding-step-desc">
              Drop your current PR per event (meters), and what you&apos;re training for.
            </p>
            <div className="onboarding-pr-list">
              {selectedEvents.map(evId => {
                const ev = EVENTS.find(e => e.id === evId);
                return (
                  <div key={evId} className="onboarding-pr-row">
                    <span style={{ minWidth: 90 }}>{ev?.name}</span>
                    <input
                      className="onboarding-input"
                      type="number"
                      step="0.01"
                      value={prs[evId] || ''}
                      onChange={e => setPRs(p => ({ ...p, [evId]: e.target.value }))}
                      placeholder="PR (m) — leave blank if new"
                    />
                  </div>
                );
              })}
            </div>
            <p
              className="onboarding-step-desc"
              style={{ marginTop: 16, marginBottom: 8 }}
            >
              What are you training for? (pick any)
            </p>
            <div className="onboarding-grade-list">
              {GOAL_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  className={`onboarding-pill${goals.includes(opt.value) ? ' selected' : ''}`}
                  onClick={() => toggleGoal(opt.value)}
                >
                  <span style={{ marginRight: 6 }}>{opt.emoji}</span>
                  {opt.label}
                </button>
              ))}
            </div>
            <button className="onboarding-btn primary" onClick={() => setStep(5)}>
              See my setup
            </button>
          </div>
        )}

        {step === 5 && derived && (
          <div className="onboarding-step">
            <h2 className="onboarding-step-title">You&apos;re set up as</h2>
            <div className="onboarding-level-badge">
              <span className={`level-badge level-${derived.level}`}>
                {derived.level.toUpperCase()}
              </span>
            </div>
            <p className="onboarding-step-desc">Here&apos;s why:</p>
            <ul className="onboarding-reasons">
              {derived.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
            <p className="onboarding-step-desc" style={{ marginTop: 12 }}>
              You can change this anytime in your profile.
            </p>
            <button className="onboarding-btn primary" onClick={handleFinish}>
              Start Tracking
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
