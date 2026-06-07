import { Session, Profile } from './types';
import { storage } from './storage';

interface ExportData {
  version: 1;
  exportDate: string;
  profile: Profile | null;
  sessions: Session[];
}

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

export function exportToJSON(): void {
  const data: ExportData = {
    version: 1,
    exportDate: new Date().toISOString(),
    profile: storage.getProfile(),
    sessions: storage.getSessions(),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const date = new Date().toISOString().split('T')[0];

  const a = document.createElement('a');
  a.href = url;
  a.download = `throwing-tracker-backup-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);

  storage.setLastExport(new Date().toISOString());
}

function csvCell(value: string | number): string {
  const s = String(value ?? '');
  // OWASP: neutralize CSV formula injection in spreadsheet apps
  const guarded = typeof value === 'string' && /^[=+\-@]/.test(s) ? `'${s}` : s;
  return /[",\n]/.test(guarded) ? `"${guarded.replace(/"/g, '""')}"` : guarded;
}

export function exportToCSV(): void {
  const sessions = storage.getSessions();
  if (sessions.length === 0) return;

  const headers = [
    'Date', 'Event', 'Type', 'RPE', 'Throws',
    'Implement Weight', 'Weight Unit', 'Best Mark (m)',
    'Avg Mark (m)', 'Meet Name', 'Placement', 'Notes',
  ];

  const rows: (string | number)[][] = sessions.map((s) => [
    s.date,
    s.event,
    s.sessionType,
    s.rpe,
    s.throws,
    s.implementWeight,
    s.weightUnit,
    s.bestMark,
    s.avgMark,
    s.meetName || '',
    s.placement || '',
    s.notes || '',
  ]);

  const csv = [
    headers.map(csvCell).join(','),
    ...rows.map((r) => r.map(csvCell).join(',')),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const date = new Date().toISOString().split('T')[0];

  const a = document.createElement('a');
  a.href = url;
  a.download = `throwing-tracker-sessions-${date}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function validateImportData(data: unknown): { valid: boolean; error?: string; data?: ExportData } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid file format' };
  }

  const d = data as Record<string, unknown>;

  if (d.version !== 1) {
    return { valid: false, error: 'Unsupported backup version' };
  }

  if (!Array.isArray(d.sessions)) {
    return { valid: false, error: 'Missing sessions data' };
  }

  const isFiniteNumber = (v: unknown): v is number =>
    typeof v === 'number' && Number.isFinite(v);

  // Validate each session. id/date/event identity checks plus per-field numeric
  // sanity so a malformed backup can't write NaN/garbage into storage and blank
  // out the charts.
  for (const session of d.sessions) {
    if (!session || typeof session !== 'object') {
      return { valid: false, error: 'Invalid session data found' };
    }
    if (!session.id || !session.date || !session.event) {
      return { valid: false, error: 'Invalid session data found' };
    }
    if (!DATE_KEY_RE.test(String(session.date))) {
      return { valid: false, error: 'Invalid session date found' };
    }
    // Marks must be finite, non-negative numbers (distances in meters).
    if (
      !isFiniteNumber(session.bestMark) ||
      session.bestMark < 0 ||
      !isFiniteNumber(session.avgMark) ||
      session.avgMark < 0
    ) {
      return { valid: false, error: 'Invalid mark value found' };
    }
    // Throw count must be a non-negative integer.
    if (
      !isFiniteNumber(session.throws) ||
      session.throws < 0 ||
      !Number.isInteger(session.throws)
    ) {
      return { valid: false, error: 'Invalid throw count found' };
    }
    // RPE is a 1-10 scale.
    if (!isFiniteNumber(session.rpe) || session.rpe < 1 || session.rpe > 10) {
      return { valid: false, error: 'Invalid RPE value found' };
    }
  }

  return { valid: true, data: d as unknown as ExportData };
}

export function importFromJSON(
  fileContent: string,
  mode: 'replace' | 'merge' = 'merge'
): { success: boolean; error?: string; sessionsImported: number } {
  try {
    const parsed = JSON.parse(fileContent);
    const validation = validateImportData(parsed);

    if (!validation.valid || !validation.data) {
      return { success: false, error: validation.error, sessionsImported: 0 };
    }

    const importData = validation.data;

    if (importData.profile) {
      storage.setProfile(importData.profile);
    }

    if (mode === 'replace') {
      storage.setSessions(importData.sessions);
      return { success: true, sessionsImported: importData.sessions.length };
    }

    // Merge: add sessions that don't already exist (by id)
    const existing = storage.getSessions();
    const existingIds = new Set(existing.map((s) => s.id));
    const newSessions = importData.sessions.filter((s) => !existingIds.has(s.id));
    storage.setSessions([...existing, ...newSessions]);

    return { success: true, sessionsImported: newSessions.length };
  } catch {
    return { success: false, error: 'Failed to parse backup file', sessionsImported: 0 };
  }
}

export function shouldShowBackupReminder(): boolean {
  const lastExport = storage.getLastExport();
  if (!lastExport) return true;

  const daysSinceExport = (Date.now() - new Date(lastExport).getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceExport > 30;
}
