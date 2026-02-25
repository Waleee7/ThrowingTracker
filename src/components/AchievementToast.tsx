'use client';

import { useEffect, useState } from 'react';
import { Achievement } from '@/lib/achievements';

interface AchievementToastProps {
  achievement: Achievement;
  onDone: () => void;
}

export default function AchievementToast({ achievement, onDone }: AchievementToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 400);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className={`achievement-toast${visible ? ' visible' : ''}`}>
      <div className="achievement-toast-icon">{achievement.icon}</div>
      <div className="achievement-toast-info">
        <div className="achievement-toast-label">Badge Unlocked!</div>
        <div className="achievement-toast-name">{achievement.name}</div>
      </div>
    </div>
  );
}
