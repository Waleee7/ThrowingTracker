'use client';

import { useState } from 'react';
import LogTab from '@/components/LogTab';
import QuickLog from '@/components/QuickLog';
import { useApp } from '@/context/AppContext';

// /log opens the 3-tap quick log. Editing a session, or choosing "Full session
// form", swaps in the complete form (RPE, media, landing map, competition…).
export default function LogPage() {
  const app = useApp();
  const [full, setFull] = useState(false);

  if (!app.editSession && !full) {
    return (
      <QuickLog
        profile={app.profile}
        sessions={app.sessions}
        onSave={app.saveSession}
        onFullForm={() => setFull(true)}
      />
    );
  }

  return (
    <>
      {!app.editSession && (
        <button type="button" className="ql-back" onClick={() => setFull(false)}>&larr; Quick log</button>
      )}
      <LogTab
        profile={app.profile}
        onSave={app.saveSession}
        editSession={app.editSession}
        onCancelEdit={app.cancelEdit}
        sessions={app.sessions}
      />
    </>
  );
}
