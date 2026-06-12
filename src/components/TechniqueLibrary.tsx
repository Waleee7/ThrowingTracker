'use client';

// Technique / Form Library — Phase 1. Per-event coaching: key focus, phase-by-
// phase cues, and common faults, anchored by the event's cinematic still.
// Linked from Log (current event), Dashboard, and Coach. Static content from
// lib/technique.ts; media (video) attaches in a later phase.

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TECHNIQUE, getTechnique } from '@/lib/technique';
import { eventHero } from '@/components/HeroMedia';

export default function TechniqueLibrary({ initialEvent }: { initialEvent?: string | null }) {
  const [event, setEvent] = useState<string>(
    () => (initialEvent && getTechnique(initialEvent) ? initialEvent : TECHNIQUE[0].event),
  );
  const [variationIdx, setVariationIdx] = useState(0);

  const tech = getTechnique(event) ?? TECHNIQUE[0];
  const variation = tech.variations[Math.min(variationIdx, tech.variations.length - 1)];

  const selectEvent = (id: string) => { setEvent(id); setVariationIdx(0); };

  return (
    // Plain wrapper — the /technique hub page owns the .tab-content frame.
    <div id="tab-technique">
      <div className="tech-head">
        <div>
          <div className="eyebrow">Technique Library</div>
          <h2 className="tab-title" style={{ marginBottom: 4 }}>Form &amp; Cues</h2>
        </div>
        <Link href="/coach" className="secondary-button tech-coach-link">Ask the coach</Link>
      </div>

      {/* Event selector */}
      <div className="tech-event-rail" role="tablist" aria-label="Event">
        {TECHNIQUE.map((t) => (
          <button
            key={t.event}
            role="tab"
            aria-selected={t.event === event}
            className={`tech-event-chip${t.event === event ? ' active' : ''}`}
            onClick={() => selectEvent(t.event)}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Hero + focus */}
      <div className="tech-hero">
        <div className="tech-hero-bg" aria-hidden="true">
          <Image src={eventHero(event)} alt="" fill sizes="(max-width:800px) 100vw, 800px" placeholder="blur" style={{ objectFit: 'cover' }} />
          <div className="tech-hero-scrim" />
        </div>
        <div className="tech-hero-body">
          <div className="eyebrow">{tech.name}{variation.label ? ` · ${variation.label}` : ''}</div>
          <p className="tech-focus">{variation.focus}</p>
        </div>
      </div>

      {/* Variation tabs (shot put) */}
      {tech.variations.length > 1 && (
        <div className="tech-variation-tabs">
          {tech.variations.map((v, i) => (
            <button
              key={v.label}
              className={`tech-variation-tab${i === variationIdx ? ' active' : ''}`}
              onClick={() => setVariationIdx(i)}
            >
              {v.label}
            </button>
          ))}
        </div>
      )}

      {/* Phases */}
      <ol className="tech-phases">
        {variation.phases.map((p, i) => (
          <li key={p.name} className="tech-phase">
            <div className="tech-phase-head">
              <span className="tech-phase-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="tech-phase-name">{p.name}</span>
            </div>
            {p.video && (
              <video
                className="tech-phase-video"
                src={p.video}
                muted
                loop
                playsInline
                autoPlay
                preload="metadata"
                aria-label={`${p.name} form demo`}
              />
            )}
            <ul className="tech-cues">
              {p.cues.map((c, j) => <li key={j} className="tech-cue">{c}</li>)}
            </ul>
          </li>
        ))}
      </ol>

      {/* Faults */}
      <h3 className="section-title tech-faults-title">Common faults</h3>
      <div className="tech-faults">
        {variation.faults.map((f, i) => (
          <div key={i} className="tech-fault">
            <div className="tech-fault-bad">{f.fault}</div>
            <div className="tech-fault-fix">{f.fix}</div>
          </div>
        ))}
      </div>

      <p className="tech-disclaimer">
        Phase 1 — coaching cues. Video form demos are coming. Always work with your coach for live feedback.
      </p>
    </div>
  );
}
