// Local-timezone-safe date helpers.
// Session dates are stored as 'YYYY-MM-DD' in the user's LOCAL timezone, so all
// key derivation must use local components. toISOString() is UTC and shifts the
// date by a day for non-UTC offsets — never use it to derive a session date key.

export function toLocalDateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function weekStartKey(date: string | Date): string {
  const d = typeof date === 'string' ? fromDateKey(date) : new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return toLocalDateKey(d);
}
