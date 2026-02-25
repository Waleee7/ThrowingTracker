'use client';

import { useEffect, useState } from 'react';

interface PRAlertProps {
  eventName: string;
  newMark: number;
  previousBest: number | null;
  onClose: () => void;
}

export default function PRAlert({ eventName, newMark, previousBest, onClose }: PRAlertProps) {
  const [visible, setVisible] = useState(false);

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
      <div className={`pr-alert-card${visible ? ' visible' : ''}`}>
        <div className="pr-alert-emoji">&#127881;</div>
        <h2 className="pr-alert-title">NEW PR!</h2>
        <p className="pr-alert-event">{eventName}</p>
        <p className="pr-alert-mark">{newMark}m</p>
        {previousBest !== null && (
          <p className="pr-alert-improvement">
            +{(newMark - previousBest).toFixed(2)}m improvement
          </p>
        )}
        <button className="pr-alert-dismiss" onClick={() => { setVisible(false); setTimeout(onClose, 400); }}>
          Let&apos;s Go!
        </button>
      </div>
    </div>
  );
}
