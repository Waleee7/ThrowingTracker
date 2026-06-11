'use client';

// Count-up animation for stat numbers (broadcast scoreboard feel). Animates
// toward `target` with an ease-out curve; jumps instantly under
// prefers-reduced-motion. Returns the in-flight numeric value — the caller
// formats it (so ft+in strings, decimals, etc. stay correct mid-flight).

import { useEffect, useRef, useState } from 'react';

export function useCountUp(target: number, durationMs = 800): number {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!isFinite(target)) { setValue(target); return; }

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { fromRef.current = target; setValue(target); return; }

    const from = fromRef.current;
    if (from === target) { setValue(target); return; }

    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3); // cubic ease-out
      setValue(from + (target - from) * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else fromRef.current = target;
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, durationMs]);

  return value;
}
