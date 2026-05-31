/**
 * Wind effect on aerodynamic throws. ThrowEntry.wind is +tailwind / -headwind (m/s).
 *
 * For discus & javelin a tailwind tends to REDUCE distance (less lift / angle of
 * attack) while a headwind tends to INCREASE it — so the still-air estimate is
 * mark + k*wind*mark. Shot/hammer/weight are essentially wind-neutral. The
 * coefficients are rough, tunable estimates, not a precise aerodynamic model.
 */
const WIND_COEFF: Record<string, number> = {
  discus: 0.006,
  javelin: 0.004,
};

export function windSensitive(eventId: string): boolean {
  return (WIND_COEFF[eventId] ?? 0) > 0;
}

/** Still-air estimate in meters for a wind-aided/hindered mark. */
export function windAdjustedMeters(mark: number, wind: number, eventId: string): number {
  const k = WIND_COEFF[eventId] ?? 0;
  if (!k || !isFinite(wind) || wind === 0 || !isFinite(mark)) return mark;
  return mark * (1 + k * wind);
}

/** Human label for a wind value, e.g. "3.0 m/s tail" / "2.0 m/s head". */
export function windLabel(wind: number): string {
  if (!isFinite(wind) || wind === 0) return 'still';
  const dir = wind > 0 ? 'tail' : 'head';
  return `${Math.abs(wind).toFixed(1)} m/s ${dir}`;
}
