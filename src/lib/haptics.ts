// Tiny safe haptics wrapper — no-ops on unsupported browsers (iOS Safari) and
// during SSR, so callers can fire-and-forget.

export function vibrate(pattern: number | number[]): void {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    // never let a celebration crash anything
  }
}
