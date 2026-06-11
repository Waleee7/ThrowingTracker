'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { formatDistance, type DistanceUnit } from '@/lib/units';
import { shareCard } from '@/lib/share-card';
import { vibrate } from '@/lib/haptics';

interface PRAlertProps {
  eventName: string;
  newMark: number;
  previousBest: number | null;
  distanceUnit: DistanceUnit;
  confetti?: boolean; // rookie-tier celebration (W7)
  athleteName?: string;
  onClose: () => void;
}

// House palette: orange brand, PB lime, white, per-event sky + ember.
const CONFETTI_COLORS = ['#FF5A1F', '#C8FF00', '#FFFFFF', '#38BDF8', '#FF8A3D'];

export default function PRAlert({ eventName, newMark, previousBest, distanceUnit, confetti = false, athleteName, onClose }: PRAlertProps) {
  const [visible, setVisible] = useState(false);
  const [shareMsg, setShareMsg] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pre-rolled confetti pieces (positions/colors/timing fixed once per mount).
  const confettiPieces = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 1.8 + Math.random() * 1.4,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        rotate: Math.random() * 360,
      })),
    [],
  );

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    timerRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 400);
    }, 5000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [onClose]);

  const close = () => {
    setVisible(false);
    setTimeout(onClose, 400);
  };

  const handleShare = async () => {
    // Sharing means the athlete is engaged — stop the auto-dismiss clock.
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    vibrate(30);
    const outcome = await shareCard(
      {
        title: 'New PR',
        headline: formatDistance(newMark, distanceUnit),
        sub: `${eventName} · ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
        lines: previousBest !== null ? [`+${formatDistance(newMark - previousBest, distanceUnit)} on my best`] : [],
        athlete: athleteName,
        accent: 'pb',
      },
      'new-pr.png',
    );
    setShareMsg(outcome === 'downloaded' ? 'Saved ↓' : outcome === 'failed' ? 'Failed' : 'Shared!');
  };

  return (
    <div className={`pr-alert-overlay${visible ? ' visible' : ''}`}>
      {confetti && visible && (
        <div className="confetti-layer" aria-hidden="true">
          {confettiPieces.map((p, i) => (
            <span
              key={i}
              className="confetti-piece"
              style={{
                left: `${p.left}%`,
                background: p.color,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
                transform: `rotate(${p.rotate}deg)`,
              }}
            />
          ))}
        </div>
      )}
      <div className={`pr-alert-card${visible ? ' visible' : ''}`}>
        <div className="pr-alert-emoji">&#127881;</div>
        <h2 className="pr-alert-title">NEW PR!</h2>
        <p className="pr-alert-event">{eventName}</p>
        <p className="pr-alert-mark">{formatDistance(newMark, distanceUnit)}</p>
        {previousBest !== null && (
          <p className="pr-alert-improvement">
            +{formatDistance(newMark - previousBest, distanceUnit)} improvement
          </p>
        )}
        <div className="pr-alert-actions">
          <button className="pr-alert-share" onClick={handleShare}>
            {shareMsg || 'Share it'}
          </button>
          <button className="pr-alert-dismiss" onClick={close}>
            Let&apos;s Go!
          </button>
        </div>
      </div>
    </div>
  );
}
