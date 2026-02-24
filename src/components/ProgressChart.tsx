'use client';

import { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, ComposedChart,
} from 'recharts';
import { Session } from '@/lib/types';
import { EVENTS, EVENT_COLORS } from '@/lib/constants';

interface ProgressChartProps {
  sessions: Session[];
}

type DateRange = '1mo' | '3mo' | '6mo' | '1yr' | 'all';

export default function ProgressChart({ sessions }: ProgressChartProps) {
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
        {chartType === 'progress' && <ProgressLine sessions={filteredSessions} events={activeEvents} />}
        {chartType === 'volume' && <VolumeBar sessions={filteredSessions} events={activeEvents} />}
        {chartType === 'rpe' && <RPETrend sessions={filteredSessions} events={activeEvents} />}
      </div>
    </div>
  );
}

function ProgressLine({ sessions, events }: { sessions: Session[]; events: typeof EVENTS }) {
  const data = useMemo(() => {
    const dateMap: Record<string, Record<string, number>> = {};
    for (const s of sessions) {
      if (!dateMap[s.date]) dateMap[s.date] = {};
      const current = dateMap[s.date][s.event];
      if (!current || s.bestMark > current) {
        dateMap[s.date][s.event] = s.bestMark;
      }
    }
    return Object.entries(dateMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, marks]) => ({
        date: formatDate(date),
        ...marks,
      }));
  }, [sessions]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
        <XAxis dataKey="date" fontSize={11} />
        <YAxis fontSize={11} unit="m" />
        <Tooltip />
        <Legend />
        {events.map((ev) => (
          <Line
            key={ev.id}
            type="monotone"
            dataKey={ev.id}
            name={ev.name}
            stroke={EVENT_COLORS[ev.id] || '#667eea'}
            strokeWidth={2}
            dot={{ r: 4 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

function VolumeBar({ sessions, events }: { sessions: Session[]; events: typeof EVENTS }) {
  const data = useMemo(() => {
    const weekMap: Record<string, Record<string, number>> = {};
    for (const s of sessions) {
      const weekStart = getWeekStart(new Date(s.date));
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

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
        <XAxis dataKey="week" fontSize={11} />
        <YAxis fontSize={11} />
        <Tooltip />
        <Legend />
        {events.map((ev) => (
          <Bar key={ev.id} dataKey={ev.id} name={ev.name} fill={EVENT_COLORS[ev.id] || '#667eea'} stackId="throws" />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

function RPETrend({ sessions, events }: { sessions: Session[]; events: typeof EVENTS }) {
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
        bestMark: d.bestMark,
      }));
  }, [sessions]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
        <XAxis dataKey="date" fontSize={11} />
        <YAxis yAxisId="left" fontSize={11} unit="m" />
        <YAxis yAxisId="right" orientation="right" fontSize={11} domain={[0, 10]} />
        <Tooltip />
        <Legend />
        <Line yAxisId="left" type="monotone" dataKey="bestMark" name="Best Mark" stroke="#667eea" strokeWidth={2} dot={{ r: 3 }} />
        <Line yAxisId="right" type="monotone" dataKey="rpe" name="RPE" stroke="#f093fb" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 5" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getWeekStart(date: Date): string {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().split('T')[0];
}
