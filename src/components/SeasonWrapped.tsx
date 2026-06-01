'use client';

import { useMemo, useState, type CSSProperties } from 'react';
import type { Session, Profile } from '@/lib/types';
import { buildWrapped } from '@/lib/wrapped';
import { formatDistance } from '@/lib/units';

interface SeasonWrappedProps {
  sessions: Session[];
  profile: Profile;
  onClose: () => void;
}

interface Slide {
  bg: string;
  kicker: string;
  big: string;
  label: string;
  sub?: string;
}

const GRADIENTS = [
  'linear-gradient(160deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(160deg, #764ba2 0%, #f093fb 100%)',
  'linear-gradient(160deg, #4facfe 0%, #667eea 100%)',
  'linear-gradient(160deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(160deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(160deg, #5b6cf0 0%, #1e1b4b 100%)',
];

export default function SeasonWrapped({ sessions, profile, onClose }: SeasonWrappedProps) {
  const unit = profile.distanceUnit ?? 'm';
  const data = useMemo(() => buildWrapped(sessions), [sessions]);
  const [i, setI] = useState(0);

  const slides = useMemo<Slide[]>(() => {
    if (!data) return [];
    const firstName = (profile.name || 'Thrower').split(' ')[0];
    const s: Slide[] = [];
    s.push({ bg: GRADIENTS[0], kicker: data.seasonLabel, big: firstName, label: "Here's your season, wrapped." });
    s.push({
      bg: GRADIENTS[1], kicker: 'You showed up',
      big: `${data.totalSessions}`, label: data.totalSessions === 1 ? 'session logged' : 'sessions logged',
      sub: `across ${data.activeDays} active ${data.activeDays === 1 ? 'day' : 'days'}`,
    });
    s.push({
      bg: GRADIENTS[2], kicker: 'Total reps',
      big: `${data.totalThrows}`, label: 'throws',
      sub: data.totalFouls > 0 ? `${data.totalFouls} fouls — nobody's perfect` : 'zero fouls logged 🎯',
    });
    if (data.totalDistanceM > 0) {
      s.push({
        bg: GRADIENTS[3], kicker: 'Combined distance',
        big: formatDistance(data.totalDistanceM, unit), label: 'thrown this season',
        sub: 'every legal throw, stacked end to end',
      });
    }
    if (data.favoriteEvent) {
      s.push({
        bg: GRADIENTS[4], kicker: 'Your main event',
        big: data.favoriteEvent.name, label: `${data.favoriteEvent.count} sessions`,
        sub: 'this is your event',
      });
    }
    if (data.topMark) {
      s.push({
        bg: GRADIENTS[5], kicker: 'Season best',
        big: formatDistance(data.topMark.mark, unit), label: data.topMark.name,
        sub: 'your biggest bomb of the year',
      });
    }
    if (data.improvement) {
      s.push({
        bg: GRADIENTS[0], kicker: 'You got better',
        big: `+${formatDistance(data.improvement.deltaM, unit)}`, label: `in the ${data.improvement.name}`,
        sub: `+${data.improvement.pct.toFixed(0)}% from your first mark`,
      });
    }
    if (data.busiestMonth) {
      s.push({
        bg: GRADIENTS[1], kicker: 'Grindiest month',
        big: data.busiestMonth.label, label: `${data.busiestMonth.count} sessions`,
        sub: 'you were locked in',
      });
    }
    s.push({
      bg: GRADIENTS[2], kicker: 'The grind',
      big: `${data.competitions}`, label: data.competitions === 1 ? 'competition' : 'competitions',
      sub: `avg RPE ${data.avgRPE} — you left it all out there`,
    });
    s.push({ bg: GRADIENTS[5], kicker: data.seasonLabel, big: 'Keep throwing 🥏', label: `See you next season, ${firstName}.` });
    return s;
  }, [data, profile.name, unit]);

  if (!data || slides.length === 0) {
    return (
      <div style={overlay} onClick={onClose}>
        <div style={{ ...slideBox, background: GRADIENTS[0] }}>
          <div style={kickerStyle}>Season Wrapped</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 12 }}>Not enough data yet</div>
          <div style={labelStyle}>Log a few sessions this season and your Wrapped will be waiting. 🥏</div>
          <button style={doneBtn} onClick={onClose}>Got it</button>
        </div>
      </div>
    );
  }

  const last = i >= slides.length - 1;
  const advance = () => (last ? onClose() : setI((n) => n + 1));
  const back = () => setI((n) => Math.max(0, n - 1));
  const slide = slides[i];

  return (
    <div style={overlay}>
      <div style={{ ...slideBox, background: slide.bg }}>
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
          <div style={kickerStyle}>{slide.kicker}</div>
          <div style={bigStyle}>{slide.big}</div>
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

const overlay: CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 1000,
  background: 'rgba(0,0,0,0.85)', display: 'flex',
  alignItems: 'center', justifyContent: 'center', padding: 16,
};
const slideBox: CSSProperties = {
  position: 'relative', width: '100%', maxWidth: 420, height: '80vh', maxHeight: 720,
  borderRadius: 24, color: '#fff', overflow: 'hidden',
  display: 'flex', flexDirection: 'column', justifyContent: 'center',
  boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
};
const progressRow: CSSProperties = {
  position: 'absolute', top: 14, left: 14, right: 14, display: 'flex', gap: 4, zIndex: 3,
};
const progressTrack: CSSProperties = {
  flex: 1, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.3)', overflow: 'hidden',
};
const progressFill: CSSProperties = {
  height: '100%', background: '#fff', transition: 'width 0.3s ease',
};
const closeBtn: CSSProperties = {
  position: 'absolute', top: 28, right: 16, zIndex: 4,
  background: 'transparent', border: 'none', color: '#fff', fontSize: 28,
  lineHeight: 1, cursor: 'pointer', opacity: 0.85,
};
const tapLeft: CSSProperties = { position: 'absolute', inset: 0, right: '60%', zIndex: 2, cursor: 'pointer' };
const tapRight: CSSProperties = { position: 'absolute', inset: 0, left: '40%', zIndex: 2, cursor: 'pointer' };
const contentStyle: CSSProperties = { position: 'relative', zIndex: 1, padding: '0 28px', textAlign: 'center' };
const kickerStyle: CSSProperties = {
  textTransform: 'uppercase', letterSpacing: 1.5, fontSize: 13, fontWeight: 700, opacity: 0.85,
};
const bigStyle: CSSProperties = { fontSize: 'clamp(40px, 12vw, 64px)', fontWeight: 900, margin: '14px 0 6px', lineHeight: 1.05 };
const labelStyle: CSSProperties = { fontSize: 20, fontWeight: 700, opacity: 0.95 };
const subStyle: CSSProperties = { fontSize: 15, marginTop: 10, opacity: 0.8 };
const hintStyle: CSSProperties = {
  position: 'absolute', bottom: 22, left: 0, right: 0, textAlign: 'center', fontSize: 13, opacity: 0.7, zIndex: 1,
};
const doneBtn: CSSProperties = {
  position: 'absolute', bottom: 22, left: '50%', transform: 'translateX(-50%)', zIndex: 4,
  background: '#fff', color: '#222', border: 'none', borderRadius: 999,
  padding: '12px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
};
