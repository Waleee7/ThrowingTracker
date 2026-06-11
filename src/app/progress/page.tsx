'use client';

import ProgressChart from '@/components/ProgressChart';
import ThrowScatter from '@/components/ThrowScatter';
import PRTimeline from '@/components/PRTimeline';
import { useApp } from '@/context/AppContext';

export default function ProgressPage() {
  const app = useApp();
  return (
    <div className="tab-content">
      <h2 className="tab-title">Progress</h2>
      <ProgressChart sessions={app.sessions} distanceUnit={app.distanceUnit} />
      <div style={{ marginTop: 32 }}>
        <h3 className="section-title">Landing Zone Analysis</h3>
        <ThrowScatter sessions={app.sessions} distanceUnit={app.distanceUnit} />
      </div>
      <PRTimeline sessions={app.sessions} distanceUnit={app.distanceUnit} />
    </div>
  );
}
