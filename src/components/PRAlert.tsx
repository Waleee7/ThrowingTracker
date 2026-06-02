'use client';

import { useEffect, useMemo, useState } from 'react';
import { formatDistance, type DistanceUnit } from '@/lib/units';

interface PRAlertProps {
  eventName: string;
  newMark: number;
  previousBest: number | null;
  distanceUnit: DistanceUnit;
  confetti?: boolean; // rookie-tier celebration (W7)
  onClose: () => void;
}

const CONFETTI_COLORS = ['#667eea', '#FF6B35', '#f093fb', '#43e97b', '#FFD93D'];

export default function PRAlert({ eventName, newMark, previousBest, distanceUnit, confetti = false, onClose }: PRAlertProps) {
  const [visible, setVisible] = useState(false);

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
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 400);
    }, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

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
        <button className="pr-alert-dismiss" onClick={() => { setVisible(false); setTimeout(onClose, 400); }}>
          Let&apos;s Go!
        </button>
      </div>
    </div>
  );
}
