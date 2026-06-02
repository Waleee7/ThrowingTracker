'use client';

import ProfileTab from '@/components/ProfileTab';
import AchievementBadges from '@/components/AchievementBadges';
import { useApp } from '@/context/AppContext';

export default function ProfilePage() {
  const app = useApp();
  return (
    <div>
      <ProfileTab profile={app.profile} onSave={app.setProfile} onDataImported={app.onDataImported} />
      <div className="tab-content" style={{ paddingTop: 0 }}>
        <AchievementBadges sessions={app.sessions} />
      </div>
    </div>
  );
}
