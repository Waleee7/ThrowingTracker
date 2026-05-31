const ONES: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
  seventeen: 17, eighteen: 18, nineteen: 19,
};
const TENS: Record<string, number> = {
  twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
};

/**
 * Parse a spoken throw. Returns a foul flag and (when a number is heard) a
 * numeric string in the user's current display unit — e.g. "58.5", "199".
 * Handles digits ("58.5"), number words ("fifty eight"), and "... point five".
 */
export function parseSpokenThrow(transcript: string): { foul: boolean; value?: string } {
  const t = transcript.toLowerCase().trim();
  if (/\b(foul|scratch|red flag|no mark)\b/.test(t)) return { foul: true };

  const digit = t.match(/(\d+(?:\.\d+)?)/);
  if (digit) return { foul: false, value: digit[1] };

  const n = wordsToNumber(t);
  return n !== null ? { foul: false, value: String(n) } : { foul: false };
}

function wordsToNumber(text: string): number | null {
  const [intPart, decPart] = text.split(/\bpoint\b/);
  const intVal = parseIntegerWords(intPart ?? '');
  if (intVal === null) return null;
  if (decPart !== undefined) {
    const decDigits = decPart
      .trim()
      .split(/\s+/)
      .map((w) => ONES[w])
      .filter((d) => d !== undefined && d <= 9);
    if (decDigits.length) return parseFloat(`${intVal}.${decDigits.join('')}`);
  }
  return intVal;
}

function parseIntegerWords(text: string): number | null {
  const words = text.split(/[\s-]+/).filter(Boolean);
  let total = 0;
  let current = 0;
  let found = false;
  for (const w of words) {
    if (w in ONES) {
      current += ONES[w];
      found = true;
    } else if (w in TENS) {
      current += TENS[w];
      found = true;
    } else if (w === 'hundred') {
      current = (current || 1) * 100;
      found = true;
    } else if (w === 'thousand') {
      total += (current || 1) * 1000;
      current = 0;
      found = true;
    }
    // other words (meters, feet, and, etc.) are ignored
  }
  return found ? total + current : null;
}
