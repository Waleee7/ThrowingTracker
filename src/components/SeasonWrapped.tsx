'use client';

import { useMemo, useState, type CSSProperties } from 'react';
import Image, { type StaticImageData } from 'next/image';
import type { Session, Profile } from '@/lib/types';
import { buildWrapped } from '@/lib/wrapped';
import { formatDistance } from '@/lib/units';
import { eventHero } from '@/components/HeroMedia';
import wrappedBg from '@/assets/media/wrapped-bg.webp';

interface SeasonWrappedProps {
  sessions: Session[];
  profile: Profile;
  onClose: () => void;
}

interface Slide {
  kicker: string;
  big: string;
  label: string;
  sub?: string;
  /** Event id → drives event hero backdrop + accent hue. Null = generic wrapped-bg. */
  event?: string | null;
  /** Accent hue token (one event hue per slide). */
  hue: string;
}

/** Per-event accent token (mirrors EVENT_COLORS keys → --color-evt-* vars). */
const EVENT_HUE_VAR: Record<string, string> = {
  'shot-put': 'var(--color-evt-shot)',
  discus: 'var(--color-evt-discus)',
  hammer: 'var(--color-evt-hammer)',
  'weight-throw': 'var(--color-evt-weight)',
  javelin: 'var(--color-evt-javelin)',
};

const HUE_CYCLE = [
  'var(--color-lime)',
  'var(--color-evt-discus)',
  'var(--color-evt-shot)',
  'var(--color-evt-javelin)',
  'var(--color-evt-hammer)',
  'var(--color-evt-weight)',
];

function hueFor(event: string | null | undefined, idx: number): string {
  if (event && EVENT_HUE_VAR[event]) return EVENT_HUE_VAR[event];
  return HUE_CYCLE[idx % HUE_CYCLE.length];
}

export default function SeasonWrapped({ sessions, profile, onClose }: SeasonWrappedProps) {
  const unit = profile.distanceUnit ?? 'm';
  const data = useMemo(() => buildWrapped(sessions), [sessions]);
  const [i, setI] = useState(0);

  const slides = useMemo<Slide[]>(() => {
    if (!data) return [];
    const firstName = (profile.name || 'Thrower').split(' ')[0];
    const favId = data.favoriteEvent?.id ?? null;
    const raw: Array<Omit<Slide, 'hue'>> = [];
    raw.push({ kicker: data.seasonLabel, big: firstName, label: "Here's your season, wrapped." });
    raw.push({
      kicker: 'You showed up',
      big: `${data.totalSessions}`, label: data.totalSessions === 1 ? 'session logged' : 'sessions logged',
      sub: `across ${data.activeDays} active ${data.activeDays === 1 ? 'day' : 'days'}`,
    });
    raw.push({
      kicker: 'Total reps',
      big: `${data.totalThrows}`, label: 'throws',
      sub: data.totalFouls > 0 ? `${data.totalFouls} fouls — nobody's perfect` : 'zero fouls logged',
    });
    if (data.totalDistanceM > 0) {
      raw.push({
        kicker: 'Combined distance',
        big: formatDistance(data.totalDistanceM, unit), label: 'thrown this season',
        sub: 'every legal throw, stacked end to end',
      });
    }
    if (data.favoriteEvent) {
      raw.push({
        kicker: 'Your main event',
        big: data.favoriteEvent.name, label: `${data.favoriteEvent.count} sessions`,
        sub: 'this is your event', event: data.favoriteEvent.id,
      });
    }
    if (data.topMark) {
      raw.push({
        kicker: 'Season best',
        big: formatDistance(data.topMark.mark, unit), label: data.topMark.name,
        sub: 'your biggest bomb of the year', event: data.topMark.id,
      });
    }
    if (data.improvement) {
      raw.push({
        kicker: 'You got better',
        big: `+${formatDistance(data.improvement.deltaM, unit)}`, label: `in the ${data.improvement.name}`,
        sub: `+${data.improvement.pct.toFixed(0)}% from your first mark`, event: favId,
      });
    }
    if (data.busiestMonth) {
      raw.push({
        kicker: 'Grindiest month',
        big: data.busiestMonth.label, label: `${data.busiestMonth.count} sessions`,
        sub: 'you were locked in',
      });
    }
    raw.push({
      kicker: 'The grind',
      big: `${data.competitions}`, label: data.competitions === 1 ? 'competition' : 'competitions',
      sub: `avg RPE ${data.avgRPE} — you left it all out there`,
    });
    raw.push({ kicker: data.seasonLabel, big: 'Keep throwing', label: `See you next season, ${firstName}.` });
    return raw.map((s, idx) => ({ ...s, hue: hueFor(s.event, idx) }));
  }, [data, profile.name, unit]);

  if (!data || slides.length === 0) {
    return (
      <div style={overlay} onClick={onClose}>
        <div style={slideBox}>
          <BackdropLayer image={wrappedBg} hue="var(--color-lime)" />
          <div style={contentStyle}>
            <div style={kickerStyle('var(--color-lime)')}>Season Wrapped</div>
            <div style={{ ...bigStyle, fontSize: 30 }}>Not enough data yet</div>
            <div style={labelStyle}>Log a few sessions this season and your Wrapped will be waiting.</div>
          </div>
          <button style={doneBtn} onClick={onClose}>Got it</button>
        </div>
      </div>
    );
  }

  const last = i >= slides.length - 1;
  const advance = () => (last ? onClose() : setI((n) => n + 1));
  const back = () => setI((n) => Math.max(0, n - 1));
  const slide = slides[i];
  const backdrop = slide.event ? eventHero(slide.event) : wrappedBg;

  return (
    <div style={overlay}>
      <div style={slideBox}>
        <BackdropLayer image={backdrop} hue={slide.hue} />

        {/* progress bars */}
        <div style={progressRow}>
          {slides.map((_, idx) => (
            <div key={idx} style={progressTrack}>
              <div style={{ ...progressFill, width: idx <= i ? '100%' : '0%' }} />
            </div>
          ))}
        </div>

        <button style={closeBtn} onClick={onClose} aria-label="Close">×</button>

        {/* tap zones */}
        <div style={tapLeft} onClick={back} />
        <div style={tapRight} onClick={advance} />

        <div style={contentStyle}>
          <div style={kickerStyle(slide.hue)}>{slide.kicker}</div>
          <div style={{ ...bigStyle, color: slide.hue }}>{slide.big}</div>
          <div style={labelStyle}>{slide.label}</div>
          {slide.sub && <div style={subStyle}>{slide.sub}</div>}
        </div>

        {last ? (
          <button style={doneBtn} onClick={onClose}>Done</button>
        ) : (
          <div style={hintStyle}>tap to continue →</div>
        )}
      </div>
    </div>
  );
}

/** Full-bleed image backdrop + dark ink scrim with a subtle hue-tinted base. */
function BackdropLayer({ image, hue }: { image: StaticImageData; hue: string }) {
  return (
    <div style={backdropWrap} aria-hidden="true">
      <Image
        src={image}
        alt=""
        fill
        placeholder="blur"
        sizes="(max-width: 480px) 100vw, 420px"
        style={{ objectFit: 'cover' }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(0deg, rgba(10,10,11,0.94) 0%, rgba(10,10,11,0.72) 45%, rgba(10,10,11,0.55) 100%)',
        }}
      />
      {/* hue wash anchored to the accent for cohesion */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(120% 80% at 50% 100%, ${hue} 0%, transparent 55%)`,
          opacity: 0.18,
          mixBlendMode: 'screen',
        }}
      />
    </div>
  );
}

const overlay: CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 1000,
  background: 'rgba(10,10,11,0.92)', display: 'flex',
  alignItems: 'center', justifyContent: 'center', padding: 16,
};
const slideBox: CSSProperties = {
  position: 'relative', width: '100%', maxWidth: 420, height: '80vh', maxHeight: 720,
  borderRadius: 'var(--radius-xl)', color: 'var(--color-fg)', overflow: 'hidden',
  display: 'flex', flexDirection: 'column', justifyContent: 'center',
  border: '1px solid var(--color-ink-700)',
  boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
  background: 'var(--color-ink-900)',
};
const backdropWrap: CSSProperties = { position: 'absolute', inset: 0, zIndex: 0 };
const progressRow: CSSProperties = {
  position: 'absolute', top: 14, left: 14, right: 14, display: 'flex', gap: 4, zIndex: 3,
};
const progressTrack: CSSProperties = {
  flex: 1, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.25)', overflow: 'hidden',
};
const progressFill: CSSProperties = {
  height: '100%', background: 'var(--color-fg)', transition: 'width 0.3s ease',
};
const closeBtn: CSSProperties = {
  position: 'absolute', top: 28, right: 16, zIndex: 4,
  background: 'transparent', border: 'none', color: 'var(--color-fg)', fontSize: 28,
  lineHeight: 1, cursor: 'pointer', opacity: 0.85,
};
const tapLeft: CSSProperties = { position: 'absolute', inset: 0, right: '60%', zIndex: 2, cursor: 'pointer' };
const tapRight: CSSProperties = { position: 'absolute', inset: 0, left: '40%', zIndex: 2, cursor: 'pointer' };
const contentStyle: CSSProperties = { position: 'relative', zIndex: 1, padding: '0 28px', textAlign: 'center' };
const kickerStyle = (hue: string): CSSProperties => ({
  textTransform: 'uppercase', letterSpacing: 2, fontSize: 13, fontWeight: 700, color: hue,
  fontFamily: 'var(--font-mono)',
});
const bigStyle: CSSProperties = {
  fontSize: 'clamp(40px, 12vw, 64px)', fontWeight: 800, margin: '14px 0 6px', lineHeight: 1.02,
  fontFamily: 'var(--font-display)',
};
const labelStyle: CSSProperties = {
  fontSize: 20, fontWeight: 700, color: 'var(--color-fg)', fontFamily: 'var(--font-display)',
};
const subStyle: CSSProperties = {
  fontSize: 15, marginTop: 10, color: 'var(--color-fg-muted)', fontFamily: 'var(--font-sans)',
};
const hintStyle: CSSProperties = {
  position: 'absolute', bottom: 22, left: 0, right: 0, textAlign: 'center', fontSize: 13,
  color: 'var(--color-fg-muted)', zIndex: 1, fontFamily: 'var(--font-mono)',
};
const doneBtn: CSSProperties = {
  position: 'absolute', bottom: 22, left: '50%', transform: 'translateX(-50%)', zIndex: 4,
  background: 'var(--color-lime)', color: 'var(--color-on-lime)', border: 'none', borderRadius: 'var(--radius-pill)',
  padding: '12px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-mono)',
};
