import { Session, Profile } from './types';
import { storage } from './storage';

interface ExportData {
  version: 1;
  exportDate: string;
  profile: Profile | null;
  sessions: Session[];
}

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

export function exportToCSV(): void {
  const sessions = storage.getSessions();
  if (sessions.length === 0) return;

  const headers = [
    'Date', 'Event', 'Type', 'RPE', 'Throws',
    'Implement Weight', 'Weight Unit', 'Best Mark (m)',
    'Avg Mark (m)', 'Meet Name', 'Placement', 'Notes',
  ];

  const rows = sessions.map((s) => [
    s.date,
    s.event,
    s.sessionType,
    s.rpe.toString(),
    s.throws.toString(),
    s.implementWeight.toString(),
    s.weightUnit,
    s.bestMark.toString(),
    s.avgMark.toString(),
    s.meetName || '',
    s.placement || '',
    `"${(s.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
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

  // Validate each session has required fields
  for (const session of d.sessions) {
    if (!session.id || !session.date || !session.event) {
      return { valid: false, error: 'Invalid session data found' };
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
