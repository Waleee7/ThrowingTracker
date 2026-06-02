'use client';

import HistoryTab from '@/components/HistoryTab';
import { useApp } from '@/context/AppContext';

export default function HistoryPage() {
  const app = useApp();
  return (
    <HistoryTab
      sessions={app.sessions}
      distanceUnit={app.distanceUnit}
      onEditSession={app.startEditSession}
      onDeleteSession={app.removeSession}
    />
  );
}
