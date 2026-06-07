'use client';

import LogTab from '@/components/LogTab';
import { useApp } from '@/context/AppContext';

export default function LogPage() {
  const app = useApp();
  return (
    <LogTab
      profile={app.profile}
      onSave={app.saveSession}
      editSession={app.editSession}
      onCancelEdit={app.cancelEdit}
      sessions={app.sessions}
    />
  );
}
