/**
 * Canonical units layer.
 *
 * Internally, ThrowingTracker stores ALL distances in meters and ALL implement
 * weights in kilograms. The user's chosen display unit only affects rendering and
 * data entry — never what is persisted. This keeps analytics, PBs, and historical
 * data consistent regardless of how any individual session was entered.
 */

export type DistanceUnit = 'm' | 'ft';
export type WeightUnit = 'kg' | 'lbs';

export const M_PER_FT = 0.3048; // exact
export const KG_PER_LB = 0.45359237; // exact

// --- Distance ---------------------------------------------------------------

export function metersToFeet(meters: number): number {
  return meters / M_PER_FT;
}

export function feetToMeters(feet: number): number {
  return feet * M_PER_FT;
}

/**
 * Format a canonical meters value for display in the chosen unit.
 *  - 'm'  -> "15.50 m"
 *  - 'ft' -> "50' 10.25\""  (feet + inches, the way a throws tape reads)
 */
export function formatDistance(
  meters: number,
  unit: DistanceUnit,
  opts: { withUnit?: boolean } = {}
): string {
  const { withUnit = true } = opts;
  if (!isFinite(meters)) return '—';

  if (unit === 'ft') {
    const totalFeet = metersToFeet(meters);
    let wholeFeet = Math.floor(totalFeet);
    let inches = (totalFeet - wholeFeet) * 12;
    // Guard rounding carry (e.g. 11.999" -> 12.00" -> +1 ft)
    inches = Math.round(inches * 100) / 100;
    if (inches >= 12) {
      wholeFeet += 1;
      inches -= 12;
    }
    return withUnit ? `${wholeFeet}' ${inches.toFixed(2)}"` : `${wholeFeet}' ${inches.toFixed(2)}`;
  }

  const m = meters.toFixed(2);
  return withUnit ? `${m} m` : m;
}

/**
 * Numeric value in the display unit (decimal), for charts/axes that need a number.
 *  - 'm'  -> meters
 *  - 'ft' -> decimal feet
 */
export function distanceToDisplayNumber(meters: number, unit: DistanceUnit): number {
  return unit === 'ft' ? metersToFeet(meters) : meters;
}

/**
 * Parse free-text distance entry (in the chosen unit) back to canonical meters.
 * Returns NaN when the input cannot be understood.
 *
 * 'm'  accepts: "15.5", "15"
 * 'ft' accepts: decimal feet ("199.5"), feet+inches ("199' 6\"", "199'6", "199-6", "199 6")
 */
export function parseDistanceToMeters(input: string, unit: DistanceUnit): number {
  const raw = input.trim();
  if (!raw) return NaN;

  if (unit === 'm') {
    const v = parseFloat(raw);
    return isFinite(v) ? v : NaN;
  }

  // feet + inches: "199' 6\"", "199'6", "199-6", "199 6"
  const ftIn = raw.match(/^(\d+(?:\.\d+)?)\s*(?:'|ft|-|\s)\s*(\d+(?:\.\d+)?)\s*(?:"|in)?$/i);
  if (ftIn) {
    const feet = parseFloat(ftIn[1]);
    const inches = parseFloat(ftIn[2]);
    if (isFinite(feet) && isFinite(inches)) {
      return feetToMeters(feet + inches / 12);
    }
  }

  // decimal feet only: "199.5", "199'", "199ft"
  const ftOnly = raw.match(/^(\d+(?:\.\d+)?)\s*(?:'|ft)?$/i);
  if (ftOnly) {
    const feet = parseFloat(ftOnly[1]);
    return isFinite(feet) ? feetToMeters(feet) : NaN;
  }

  return NaN;
}

/** Axis/short unit token for the chosen distance unit. */
export function distanceUnitLabel(unit: DistanceUnit): string {
  return unit === 'ft' ? 'ft' : 'm';
}

// --- Weight -----------------------------------------------------------------

export function kgToLbs(kg: number): number {
  return kg / KG_PER_LB;
}

export function lbsToKg(lbs: number): number {
  return lbs * KG_PER_LB;
}

/** Format an implement weight already stored in its own unit. */
export function formatWeight(value: number, unit: WeightUnit): string {
  if (!isFinite(value)) return '—';
  // Implements are whole/standard values (e.g. 7.26 kg, 16 lb); trim trailing zeros.
  const v = Math.round(value * 100) / 100;
  return `${v}${unit}`;
}
