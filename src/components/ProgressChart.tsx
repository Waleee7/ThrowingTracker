'use client';

import { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, ComposedChart, Area,
} from 'recharts';
import { Session } from '@/lib/types';
import { EVENTS } from '@/lib/constants';
import { weekStartKey, fromDateKey } from '@/lib/dates';
import { distanceToDisplayNumber, distanceUnitLabel, type DistanceUnit } from '@/lib/units';
import { getChartTheme, eventColor, type ChartTheme } from '@/lib/theme';

const FONT_MONO = 'var(--font-mono)';

/** Shared themed tooltip styling for the broadcast register. */
function tooltipStyle(theme: ChartTheme) {
  return {
    contentStyle: {
      background: theme.surface,
      border: `1px solid ${theme.border}`,
      borderRadius: 8,
      fontFamily: FONT_MONO,
      fontSize: 12,
      color: theme.fg,
    } as React.CSSProperties,
    labelStyle: { color: theme.fgMuted, fontFamily: FONT_MONO } as React.CSSProperties,
    itemStyle: { color: theme.fg, fontFamily: FONT_MONO } as React.CSSProperties,
  };
}

interface ProgressChartProps {
  sessions: Session[];
  distanceUnit: DistanceUnit;
}

type DateRange = '1mo' | '3mo' | '6mo' | '1yr' | 'all';

export default function ProgressChart({ sessions, distanceUnit }: ProgressChartProps) {
  const [dateRange, setDateRange] = useState<DateRange>('3mo');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [chartType, setChartType] = useState<'progress' | 'volume' | 'rpe'>('progress');

  const filteredSessions = useMemo(() => {
    let cutoff: Date | null = null;
    const now = new Date();

    switch (dateRange) {
      case '1mo': cutoff = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()); break;
      case '3mo': cutoff = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()); break;
      case '6mo': cutoff = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()); break;
      case '1yr': cutoff = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()); break;
    }

    let filtered = sessions;
    if (cutoff) {
      filtered = sessions.filter((s) => new Date(s.date) >= cutoff);
    }
    if (selectedEvents.length > 0) {
      filtered = filtered.filter((s) => selectedEvents.includes(s.event));
    }

    return filtered.slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [sessions, dateRange, selectedEvents]);

  const activeEvents = useMemo(() => {
    const eventIds = new Set(filteredSessions.map((s) => s.event));
    return EVENTS.filter((e) => eventIds.has(e.id));
  }, [filteredSessions]);

  const toggleEvent = (eventId: string) => {
    setSelectedEvents((prev) =>
      prev.includes(eventId) ? prev.filter((e) => e !== eventId) : [...prev, eventId]
    );
  };

  if (sessions.length < 2) {
    return (
      <div className="chart-empty">
        <p>Log at least 2 sessions to see progress charts</p>
      </div>
    );
  }

  return (
    <div className="chart-container">
      {/* Chart type toggle */}
      <div className="toggle-group" style={{ marginBottom: 12 }}>
        {([['progress', 'Progress'], ['volume', 'Volume'], ['rpe', 'RPE']] as const).map(([type, label]) => (
          <button
            key={type}
            className={`toggle-button${chartType === type ? ' active' : ''}`}
            onClick={() => setChartType(type)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Date range */}
      <div className="chart-filters">
        {(['1mo', '3mo', '6mo', '1yr', 'all'] as const).map((range) => (
          <button
            key={range}
            className={`filter-chip${dateRange === range ? ' active' : ''}`}
            onClick={() => setDateRange(range)}
          >
            {range === 'all' ? 'All' : range}
          </button>
        ))}
      </div>

      {/* Event filter */}
      <div className="chart-event-filters">
        {EVENTS.map((ev) => (
          <button
            key={ev.id}
            className={`filter-chip${selectedEvents.includes(ev.id) ? ' active' : ''} ${selectedEvents.length === 0 ? 'all-active' : ''}`}
            onClick={() => toggleEvent(ev.id)}
          >
            {ev.name}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="chart-wrapper">
        {chartType === 'progress' && <ProgressLine sessions={filteredSessions} events={activeEvents} distanceUnit={distanceUnit} />}
        {chartType === 'volume' && <VolumeBar sessions={filteredSessions} events={activeEvents} />}
        {chartType === 'rpe' && <RPETrend sessions={filteredSessions} events={activeEvents} distanceUnit={distanceUnit} />}
      </div>
    </div>
  );
}

function ProgressLine({ sessions, events, distanceUnit }: { sessions: Session[]; events: typeof EVENTS; distanceUnit: DistanceUnit }) {
  const theme = getChartTheme();

  const data = useMemo(() => {
    const dateMap: Record<string, Record<string, number>> = {};
    for (const s of sessions) {
      if (!dateMap[s.date]) dateMap[s.date] = {};
      const current = dateMap[s.date][s.event];
      if (!current || s.bestMark > current) {
        // Store canonical meters here; convert for display when building rows.
        dateMap[s.date][s.event] = s.bestMark;
      }
    }
    return Object.entries(dateMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, marks]) => {
        const displayMarks: Record<string, number> = {};
        for (const [event, meters] of Object.entries(marks)) {
          displayMarks[event] = Math.round(distanceToDisplayNumber(meters, distanceUnit) * 100) / 100;
        }
        return { date: formatDate(date), ...displayMarks };
      });
  }, [sessions, distanceUnit]);

  // Per-event index of the max (PB) point and the most-recent point, so we can
  // mark the PB with a LIME dot and the latest with a WHITE dot.
  const markers = useMemo(() => {
    const out: Record<string, { pbIdx: number; lastIdx: number }> = {};
    for (const ev of events) {
      let pbIdx = -1, pbVal = -Infinity, lastIdx = -1;
      data.forEach((row, i) => {
        const v = (row as Record<string, unknown>)[ev.id];
        if (typeof v === 'number') {
          lastIdx = i;
          if (v > pbVal) { pbVal = v; pbIdx = i; }
        }
      });
      out[ev.id] = { pbIdx, lastIdx };
    }
    return out;
  }, [data, events]);

  const tip = tooltipStyle(theme);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data}>
        <defs>
          {events.map((ev) => {
            const c = eventColor(theme, ev.id);
            return (
              <linearGradient key={ev.id} id={`area-${ev.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={c} stopOpacity={0.06} />
                <stop offset="100%" stopColor={c} stopOpacity={0} />
              </linearGradient>
            );
          })}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
        <XAxis dataKey="date" fontSize={11} tick={{ fill: theme.fgMuted, fontFamily: FONT_MONO }} stroke={theme.border} />
        <YAxis fontSize={11} unit={distanceUnitLabel(distanceUnit)} tick={{ fill: theme.fgMuted, fontFamily: FONT_MONO }} stroke={theme.border} />
        <Tooltip {...tip} />
        <Legend wrapperStyle={{ fontFamily: FONT_MONO, fontSize: 12, color: theme.fgMuted }} />
        {events.map((ev) => {
          return (
            <Area
              key={`area-${ev.id}`}
              type="monotone"
              dataKey={ev.id}
              name={ev.name}
              legendType="none"
              stroke="none"
              fill={`url(#area-${ev.id})`}
              connectNulls
              isAnimationActive={false}
              activeDot={false}
            />
          );
        })}
        {events.map((ev) => {
          const c = eventColor(theme, ev.id);
          const m = markers[ev.id];
          return (
            <Line
              key={ev.id}
              type="monotone"
              dataKey={ev.id}
              name={ev.name}
              stroke={c}
              strokeWidth={2}
              dot={(props) => (
                <ProgressDot key={`${ev.id}-${props.index}`} {...props} baseColor={c} theme={theme}
                  isPB={props.index === m.pbIdx} isLast={props.index === m.lastIdx} />
              )}
              connectNulls
            />
          );
        })}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

/** Dot renderer: lime ring on PB/max, white on most-recent, event hue otherwise. */
function ProgressDot(props: {
  cx?: number; cy?: number; index?: number; value?: number;
  baseColor: string; theme: ChartTheme; isPB: boolean; isLast: boolean;
}) {
  const { cx, cy, baseColor, theme, isPB, isLast, value } = props;
  if (cx == null || cy == null || value == null) return <g />;
  if (isPB) {
    return <circle cx={cx} cy={cy} r={5} fill={theme.lime} stroke={theme.bg} strokeWidth={1.5} />;
  }
  if (isLast) {
    return <circle cx={cx} cy={cy} r={4.5} fill={theme.fg} stroke={baseColor} strokeWidth={1.5} />;
  }
  return <circle cx={cx} cy={cy} r={3} fill={baseColor} />;
}

function VolumeBar({ sessions, events }: { sessions: Session[]; events: typeof EVENTS }) {
  const theme = getChartTheme();

  const data = useMemo(() => {
    const weekMap: Record<string, Record<string, number>> = {};
    for (const s of sessions) {
      const weekStart = getWeekStart(s.date);
      if (!weekMap[weekStart]) weekMap[weekStart] = {};
      weekMap[weekStart][s.event] = (weekMap[weekStart][s.event] || 0) + s.throws;
    }
    return Object.entries(weekMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, throws]) => ({
        week: formatDate(week),
        ...throws,
      }));
  }, [sessions]);

  const tip = tooltipStyle(theme);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
        <XAxis dataKey="week" fontSize={11} tick={{ fill: theme.fgMuted, fontFamily: FONT_MONO }} stroke={theme.border} />
        <YAxis fontSize={11} tick={{ fill: theme.fgMuted, fontFamily: FONT_MONO }} stroke={theme.border} />
        <Tooltip {...tip} cursor={{ fill: theme.border, opacity: 0.3 }} />
        <Legend wrapperStyle={{ fontFamily: FONT_MONO, fontSize: 12, color: theme.fgMuted }} />
        {events.map((ev) => (
          <Bar key={ev.id} dataKey={ev.id} name={ev.name} fill={eventColor(theme, ev.id)} stackId="throws" />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

function RPETrend({ sessions, events, distanceUnit }: { sessions: Session[]; events: typeof EVENTS; distanceUnit: DistanceUnit }) {
  void events;
  const theme = getChartTheme();
  const data = useMemo(() => {
    const dateMap: Record<string, { rpeTotal: number; rpeCount: number; bestMark: number; event: string }> = {};
    for (const s of sessions) {
      if (!dateMap[s.date] || s.bestMark > dateMap[s.date].bestMark) {
        dateMap[s.date] = { rpeTotal: s.rpe, rpeCount: 1, bestMark: s.bestMark, event: s.event };
      }
    }
    return Object.entries(dateMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, d]) => ({
        date: formatDate(date),
        rpe: d.rpeTotal / d.rpeCount,
        bestMark: Math.round(distanceToDisplayNumber(d.bestMark, distanceUnit) * 100) / 100,
      }));
  }, [sessions, distanceUnit]);

  const tip = tooltipStyle(theme);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
        <XAxis dataKey="date" fontSize={11} tick={{ fill: theme.fgMuted, fontFamily: FONT_MONO }} stroke={theme.border} />
        <YAxis yAxisId="left" fontSize={11} unit={distanceUnitLabel(distanceUnit)} tick={{ fill: theme.fgMuted, fontFamily: FONT_MONO }} stroke={theme.border} />
        <YAxis yAxisId="right" orientation="right" fontSize={11} domain={[0, 10]} tick={{ fill: theme.fgMuted, fontFamily: FONT_MONO }} stroke={theme.border} />
        <Tooltip {...tip} />
        <Legend wrapperStyle={{ fontFamily: FONT_MONO, fontSize: 12, color: theme.fgMuted }} />
        <Line yAxisId="left" type="monotone" dataKey="bestMark" name="Best Mark" stroke={theme.lime} strokeWidth={2} dot={{ r: 3, fill: theme.lime }} />
        <Line yAxisId="right" type="monotone" dataKey="rpe" name="RPE" stroke={theme.fgMuted} strokeWidth={2} dot={{ r: 3, fill: theme.fgMuted }} strokeDasharray="5 5" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function formatDate(dateStr: string): string {
  const d = fromDateKey(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getWeekStart(dateStr: string): string {
  return weekStartKey(dateStr);
}
