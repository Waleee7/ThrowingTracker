'use client';

import DashboardTab from '@/components/DashboardTab';
import { useApp } from '@/context/AppContext';

export default function DashboardPage() {
  const app = useApp();
  return (
    <DashboardTab
      sessions={app.sessions}
      profile={app.profile}
      onNavigate={app.navigateTab}
      onStartMeetDay={app.startMeetDay}
      onStartWrapped={app.startWrapped}
      onLoadSample={app.loadSample}
    />
  );
}
