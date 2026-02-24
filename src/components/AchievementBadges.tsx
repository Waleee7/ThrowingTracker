'use client';

import { useMemo } from 'react';
import { Session } from '@/lib/types';
import { getUnlockedAchievements, Achievement } from '@/lib/achievements';

interface AchievementBadgesProps {
  sessions: Session[];
  compact?: boolean;
}

export default function AchievementBadges({ sessions, compact = false }: AchievementBadgesProps) {
  const achievements = useMemo(() => getUnlockedAchievements(sessions), [sessions]);
  const unlocked = achievements.filter((a) => a.unlocked);
  const locked = achievements.filter((a) => !a.unlocked);

  if (compact) {
    // Compact view for dashboard — just show unlocked count + latest
    return (
      <div className="badges-compact">
        <div className="badges-summary">
          <span className="badges-count">{unlocked.length}</span>
          <span className="badges-total">/ {achievements.length} badges</span>
        </div>
        {unlocked.length > 0 && (
          <div className="badges-row">
            {unlocked.slice(0, 6).map((a) => (
              <span key={a.id} className="badge-icon-mini" title={a.name}>
                {a.icon}
              </span>
            ))}
            {unlocked.length > 6 && (
              <span className="badge-more">+{unlocked.length - 6}</span>
            )}
          </div>
        )}
      </div>
    );
  }

  // Full view for profile
  return (
    <div className="badges-full">
      <h3 className="section-title">Achievements</h3>
      <div className="badges-progress-bar">
        <div
          className="badges-progress-fill"
          style={{ width: `${(unlocked.length / achievements.length) * 100}%` }}
        />
        <span className="badges-progress-text">
          {unlocked.length} / {achievements.length}
        </span>
      </div>

      {/* Unlocked */}
      {unlocked.length > 0 && (
        <div className="badges-section">
          <div className="badges-grid">
            {unlocked.map((a) => (
              <BadgeCard key={a.id} achievement={a} unlocked />
            ))}
          </div>
        </div>
      )}

      {/* Locked — show with progress */}
      {locked.length > 0 && (
        <div className="badges-section">
          <h4 className="badges-section-label">In Progress</h4>
          <div className="badges-grid">
            {locked.map((a) => (
              <BadgeCard key={a.id} achievement={a} unlocked={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BadgeCard({
  achievement,
  unlocked,
}: {
  achievement: Achievement & { progress: number; target: number };
  unlocked: boolean;
}) {
  const percent = Math.round((achievement.progress / achievement.target) * 100);

  return (
    <div className={`badge-card${unlocked ? ' unlocked' : ' locked'}`}>
      <div className={`badge-icon${unlocked ? '' : ' grayscale'}`}>
        {achievement.icon}
      </div>
      <div className="badge-info">
        <div className="badge-name">{achievement.name}</div>
        <div className="badge-desc">{achievement.description}</div>
        {!unlocked && (
          <div className="badge-progress">
            <div className="badge-progress-bar">
              <div className="badge-progress-fill" style={{ width: `${percent}%` }} />
            </div>
            <span className="badge-progress-text">{achievement.progress}/{achievement.target}</span>
          </div>
        )}
      </div>
    </div>
  );
}
