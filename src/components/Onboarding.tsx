'use client';

import { useState } from 'react';
import { Profile } from '@/lib/types';
import { EVENTS } from '@/lib/constants';
import { AppLogo } from '@/components/Icons';

interface OnboardingProps {
  onComplete: (profile: Partial<Profile>) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  const toggleEvent = (id: string) => {
    setSelectedEvents((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const handleFinish = () => {
    onComplete({
      name,
      events: selectedEvents,
    });
  };

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card">
        {/* Progress dots */}
        <div className="onboarding-progress">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`onboarding-dot${step >= i ? ' active' : ''}`} />
          ))}
        </div>

        {step === 0 && (
          <div className="onboarding-step">
            <div className="onboarding-logo">
              <AppLogo size={64} />
            </div>
            <h1 className="onboarding-title">ThrowingTracker</h1>
            <p className="onboarding-subtitle">
              Your personal training log for Shot Put, Discus, Hammer, Javelin & Weight Throw
            </p>
            <div className="onboarding-features">
              <div className="onboarding-feature">
                <span className="feature-bullet" />
                <span>Track every session & competition</span>
              </div>
              <div className="onboarding-feature">
                <span className="feature-bullet" />
                <span>Visualize progress with charts</span>
              </div>
              <div className="onboarding-feature">
                <span className="feature-bullet" />
                <span>Earn achievement badges</span>
              </div>
              <div className="onboarding-feature">
                <span className="feature-bullet" />
                <span>Analyze throw landing zones</span>
              </div>
            </div>
            <button className="onboarding-btn primary" onClick={() => setStep(1)}>
              Get Started
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="onboarding-step">
            <h2 className="onboarding-step-title">What&apos;s your name?</h2>
            <p className="onboarding-step-desc">
              This personalizes your dashboard
            </p>
            <input
              className="onboarding-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && name.trim()) setStep(2);
              }}
            />
            <button
              className="onboarding-btn primary"
              disabled={!name.trim()}
              onClick={() => setStep(2)}
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="onboarding-step">
            <h2 className="onboarding-step-title">Pick your events</h2>
            <p className="onboarding-step-desc">
              Select the events you train (you can change these later)
            </p>
            <div className="onboarding-events">
              {EVENTS.map((ev) => (
                <button
                  key={ev.id}
                  className={`onboarding-event-btn${selectedEvents.includes(ev.id) ? ' selected' : ''}`}
                  onClick={() => toggleEvent(ev.id)}
                >
                  <div className="event-icon" dangerouslySetInnerHTML={{ __html: ev.svg }} />
                  <span className="onboarding-event-name">{ev.name}</span>
                  {selectedEvents.includes(ev.id) && (
                    <span className="onboarding-check">&#10003;</span>
                  )}
                </button>
              ))}
            </div>
            <button
              className="onboarding-btn primary"
              disabled={selectedEvents.length === 0}
              onClick={handleFinish}
            >
              Start Tracking
            </button>
            <button className="onboarding-btn text" onClick={handleFinish}>
              Skip for now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
