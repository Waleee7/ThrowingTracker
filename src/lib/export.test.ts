import { describe, it, expect } from 'vitest';
import { validateImportData } from './export';
import { makeSession } from './test-helpers';

const wrap = (sessions: unknown[]) => ({
  version: 1,
  exportDate: '2026-01-01T00:00:00.000Z',
  profile: null,
  sessions,
});

describe('validateImportData', () => {
  it('accepts a well-formed backup', () => {
    const r = validateImportData(wrap([makeSession()]));
    expect(r.valid).toBe(true);
    expect(r.data?.sessions).toHaveLength(1);
  });

  it('rejects non-object input', () => {
    expect(validateImportData(null).valid).toBe(false);
    expect(validateImportData('nope').valid).toBe(false);
  });

  it('rejects wrong version', () => {
    expect(validateImportData({ ...wrap([]), version: 2 }).valid).toBe(false);
  });

  it('rejects missing sessions array', () => {
    expect(validateImportData({ version: 1, exportDate: '', profile: null }).valid).toBe(false);
  });

  it('still rejects sessions missing id/date/event', () => {
    expect(validateImportData(wrap([{ ...makeSession(), id: '' }])).valid).toBe(false);
    expect(validateImportData(wrap([{ ...makeSession(), event: '' }])).valid).toBe(false);
  });

  it('rejects a malformed date key', () => {
    const r = validateImportData(wrap([makeSession({ date: '2026/01/01' })]));
    expect(r.valid).toBe(false);
  });

  it('rejects a non-numeric bestMark', () => {
    const r = validateImportData(wrap([{ ...makeSession(), bestMark: 'far' }]));
    expect(r.valid).toBe(false);
  });

  it('rejects NaN / Infinity marks', () => {
    expect(validateImportData(wrap([{ ...makeSession(), bestMark: NaN }])).valid).toBe(false);
    expect(validateImportData(wrap([{ ...makeSession(), avgMark: Infinity }])).valid).toBe(false);
  });

  it('rejects negative marks', () => {
    expect(validateImportData(wrap([makeSession({ bestMark: -5 })])).valid).toBe(false);
  });

  it('rejects bad throw counts (non-integer / negative)', () => {
    expect(validateImportData(wrap([makeSession({ throws: -1 })])).valid).toBe(false);
    expect(validateImportData(wrap([makeSession({ throws: 3.5 })])).valid).toBe(false);
  });

  it('rejects out-of-range RPE', () => {
    expect(validateImportData(wrap([makeSession({ rpe: 0 })])).valid).toBe(false);
    expect(validateImportData(wrap([makeSession({ rpe: 11 })])).valid).toBe(false);
  });

  it('rejects a non-object session entry', () => {
    expect(validateImportData(wrap([null])).valid).toBe(false);
    expect(validateImportData(wrap(['just-a-string'])).valid).toBe(false);
  });
});
