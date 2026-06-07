'use client';

import { useState, useMemo } from 'react';
import { Session, LandingPoint } from '@/lib/types';
import { EVENTS } from '@/lib/constants';
import { formatDistance, type DistanceUnit } from '@/lib/units';
import { getChartTheme, eventColor } from '@/lib/theme';
import SectorMap from './SectorMap';

interface ThrowScatterProps {
  sessions: Session[];
  distanceUnit: DistanceUnit;
}

export default function ThrowScatter({ sessions, distanceUnit }: ThrowScatterProps) {
  const [colorBy, setColorBy] = useState<'session' | 'event' | 'rpe'>('session');
  const [viewMode, setViewMode] = useState<'scatter' | 'heatmap'>('scatter');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  const sessionsWithLanding = useMemo(
    () => sessions.filter((s) => s.landingZone && s.landingZone.length > 0),
    [sessions]
  );

  const filteredSessions = useMemo(
    () =>
      selectedEvents.length === 0
        ? sessionsWithLanding
        : sessionsWithLanding.filter((s) => selectedEvents.includes(s.event)),
    [sessionsWithLanding, selectedEvents]
  );

  if (sessionsWithLanding.length === 0) {
    return (
      <div className="chart-empty">
        <p>No sessions with landing zone data yet. Use &quot;Mark Landing&quot; when logging to add throw locations.</p>
      </div>
    );
  }

  const theme = getChartTheme();

  // Broadcast session palette: cycle the per-event hues (consistent, themed)
  // instead of the old rainbow. Best throw is always overridden to lime below.
  const sessionPalette = [
    theme.event['discus'],
    theme.event['shot-put'],
    theme.event['hammer'],
    theme.event['weight-throw'],
    theme.event['javelin'],
  ];

  // Build overlay data based on color mode
  let overlayPoints: LandingPoint[][] = [];
  let overlayColors: string[] = [];

  if (colorBy === 'session') {
    overlayPoints = filteredSessions.map((s) => s.landingZone!);
    overlayColors = filteredSessions.map((_, i) => sessionPalette[i % sessionPalette.length]);
  } else if (colorBy === 'event') {
    const byEvent: Record<string, LandingPoint[]> = {};
    for (const s of filteredSessions) {
      if (!byEvent[s.event]) byEvent[s.event] = [];
      byEvent[s.event].push(...s.landingZone!);
    }
    for (const [eventId, pts] of Object.entries(byEvent)) {
      overlayPoints.push(pts);
      overlayColors.push(eventColor(theme, eventId));
    }
  }

  const allPoints = filteredSessions.flatMap((s) => s.landingZone!);
  const maxDistance = allPoints.length > 0 ? Math.max(...allPoints.map((p) => p.distance)) : 20;
  const sectorDepth = Math.ceil(maxDistance / 5) * 5 + 5;

  // Best throw overall -> highlight lime. Find it across all overlay sets and
  // splice it into its own single-point set drawn in lime on top.
  const bestPoint = allPoints.length > 0
    ? allPoints.reduce((a, b) => (b.distance > a.distance ? b : a))
    : null;
  if (viewMode === 'scatter' && bestPoint && overlayPoints.length > 0) {
    overlayPoints = [...overlayPoints, [bestPoint]];
    overlayColors = [...overlayColors, theme.lime];
  }

  // Analysis insights (canonical meters -> display unit)
  const avgDistanceMeters = allPoints.length > 0
    ? allPoints.reduce((sum, p) => sum + p.distance, 0) / allPoints.length
    : 0;

  return (
    <div className="scatter-container">
      <div className="scatter-controls">
        <div className="toggle-group" style={{ marginBottom: 8 }}>
          <button
            className={`toggle-button${viewMode === 'scatter' ? ' active' : ''}`}
            onClick={() => setViewMode('scatter')}
          >
            Scatter
          </button>
          <button
            className={`toggle-button${viewMode === 'heatmap' ? ' active' : ''}`}
            onClick={() => setViewMode('heatmap')}
          >
            Heatmap
          </button>
        </div>

        {viewMode === 'scatter' && (
          <div className="chart-filters">
            {(['session', 'event', 'rpe'] as const).map((mode) => (
              <button
                key={mode}
                className={`filter-chip${colorBy === mode ? ' active' : ''}`}
                onClick={() => setColorBy(mode)}
              >
                By {mode}
              </button>
            ))}
          </div>
        )}

        <div className="chart-event-filters">
          {EVENTS.map((ev) => (
            <button
              key={ev.id}
              className={`filter-chip${selectedEvents.includes(ev.id) ? ' active' : ''}`}
              onClick={() =>
                setSelectedEvents((prev) =>
                  prev.includes(ev.id) ? prev.filter((e) => e !== ev.id) : [...prev, ev.id]
                )
              }
            >
              {ev.name}
            </button>
          ))}
        </div>
      </div>

      <SectorMap
        sectorDepth={sectorDepth}
        distanceUnit={distanceUnit}
        points={viewMode === 'heatmap' ? allPoints : []}
        readOnly
        colorMode={viewMode === 'heatmap' ? 'heatmap' : 'default'}
        overlayPoints={viewMode === 'scatter' ? overlayPoints : undefined}
        overlayColors={viewMode === 'scatter' ? overlayColors : undefined}
      />

      <div className="scatter-insights">
        <div className="stat-card">
          <div className="stat-value" style={{ fontFamily: 'var(--font-mono)' }}>{allPoints.length}</div>
          <div className="stat-label" style={{ fontFamily: 'var(--font-mono)' }}>Total Throws</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ fontFamily: 'var(--font-mono)' }}>{formatDistance(avgDistanceMeters, distanceUnit)}</div>
          <div className="stat-label" style={{ fontFamily: 'var(--font-mono)' }}>Avg Distance</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-lime)' }}>{formatDistance(maxDistance, distanceUnit)}</div>
          <div className="stat-label" style={{ fontFamily: 'var(--font-mono)' }}>Best</div>
        </div>
      </div>
    </div>
  );
}
