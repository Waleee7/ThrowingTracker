'use client';

import ProgressChart from '@/components/ProgressChart';
import ThrowScatter from '@/components/ThrowScatter';
import PRTimeline from '@/components/PRTimeline';
import ChartErrorBoundary from '@/components/ChartErrorBoundary';
import { useApp } from '@/context/AppContext';

export default function ProgressPage() {
  const app = useApp();
  return (
    <div className="tab-content">
      <h2 className="tab-title">Progress</h2>
      <ChartErrorBoundary label="progress chart">
        <ProgressChart sessions={app.sessions} distanceUnit={app.distanceUnit} />
      </ChartErrorBoundary>
      <div style={{ marginTop: 32 }}>
        <h3 className="section-title">Landing Zone Analysis</h3>
        <ChartErrorBoundary label="landing zone map">
          <ThrowScatter sessions={app.sessions} distanceUnit={app.distanceUnit} />
        </ChartErrorBoundary>
      </div>
      <ChartErrorBoundary label="PR timeline">
        <PRTimeline sessions={app.sessions} distanceUnit={app.distanceUnit} />
      </ChartErrorBoundary>
    </div>
  );
}
