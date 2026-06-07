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

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

// Parses a 'YYYY-MM-DD' key into a LOCAL Date. Malformed/empty keys (which would
// otherwise yield an Invalid Date whose NaN propagates into charts) fall back to
// today so downstream math stays finite.
export function fromDateKey(key: string): Date {
  if (typeof key !== 'string' || !DATE_KEY_RE.test(key)) {
    return new Date();
  }
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  // Reject impossible dates (e.g. 2026-02-31, 2026-13-01) that pass the regex
  // but roll over when constructed.
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
    return new Date();
  }
  return date;
}

export function weekStartKey(date: string | Date): string {
  const d = typeof date === 'string' ? fromDateKey(date) : new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return toLocalDateKey(d);
}
