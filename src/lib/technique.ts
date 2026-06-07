// Technique / Form Library — Phase 1 (diagrams + cues, no video yet).
// Static, coach-credible content per event. Surfaced in the Technique route,
// linked from Log (per selected event) and the Coach tab. Phase 2/3 (vetted
// clips, AI video) attach media to PhaseMedia later — see ROADMAP-FITNESS Bet D.

export interface TechniquePhase {
  /** Short phase name, broadcast eyebrow style. */
  name: string;
  /** 2–4 concrete coaching cues. Imperative, specific, no fluff. */
  cues: string[];
}

export interface TechniqueVariation {
  /** e.g. "Glide" / "Rotational". Omit label when an event has one style. */
  label?: string;
  /** One-line focus — the single thing that matters most. */
  focus: string;
  phases: TechniquePhase[];
  /** Common faults → the fix. */
  faults: { fault: string; fix: string }[];
}

export interface EventTechnique {
  /** EVENT id, matches constants EVENTS / EVENT_COLORS keys. */
  event: string;
  name: string;
  /** Most events have one variation; shot put has two. */
  variations: TechniqueVariation[];
}

export const TECHNIQUE: EventTechnique[] = [
  {
    event: 'shot-put',
    name: 'Shot Put',
    variations: [
      {
        label: 'Glide',
        focus: 'Stay low and patient across the ring — beat the shot to the power position.',
        phases: [
          { name: 'Setup', cues: ['Shot pinned to the neck, under the jaw', 'Weight back over the right (T-position), chin-knee-toe stacked', 'Eyes down the back of the ring, relaxed'] },
          { name: 'Glide / Drive', cues: ['Unseat with the left leg; drive the right heel low and flat across', 'Keep the shoulders square and closed — back to the throw', 'Land in a grounded, double-support power position'] },
          { name: 'Power Position', cues: ['Right knee bent and loaded, shoulders behind the right knee', 'Left side firm, long axis from left foot to head', 'Shot still over the back of the circle'] },
          { name: 'Delivery', cues: ['Lift and turn the right hip into a braced left leg', 'Chest opens late; punch the shot up at ~38–42°', 'Full-body block — left side stops, shot launches'] },
          { name: 'Reverse', cues: ['Switch feet to stay in the ring', 'Lower the center of mass to kill momentum behind the toe-board'] },
        ],
        faults: [
          { fault: 'Popping up early out of the back', fix: 'Push the hips toward the front, not the shoulders up — stay seated longer.' },
          { fault: 'Shoulders open too soon', fix: 'Keep the bracing arm long and the chest closed until the hips fire.' },
        ],
      },
      {
        label: 'Rotational',
        focus: 'Sprint the right foot to the middle — finish a long, fast left side.',
        phases: [
          { name: 'Wind-up', cues: ['Wide, balanced base at the back; weight settled', 'Wind the shoulders back over the right; left arm long', 'Stay tall and patient — no rush'] },
          { name: 'Entry / Pivot', cues: ['Turn on the ball of the left foot, knee leading', 'Sweep the right leg wide and low around', 'Keep the shot back and the right side passive'] },
          { name: 'Drive Across', cues: ['Run the right foot down to the middle of the ring fast', 'Left foot follows quickly — minimize single-support time', 'Stay over a bent right leg, shoulders closed'] },
          { name: 'Power Position', cues: ['Grounded double-support, hips ahead of shoulders', 'Right heel turns, knee drives to the toe-board', 'Long left side ready to brace'] },
          { name: 'Delivery', cues: ['Lift-turn the right hip, block hard off the left', 'Late chest, late arm — shot is the last thing to move', 'Punch up and out across the toe-board'] },
        ],
        faults: [
          { fault: 'Falling off to the left at finish', fix: 'Brace the left leg straighter and keep the head stacked over the foot.' },
          { fault: 'Spinning flat / losing the shot', fix: 'Keep weight over the right longer through the middle; don’t lead with the shoulders.' },
        ],
      },
    ],
  },
  {
    event: 'discus',
    name: 'Discus',
    variations: [
      {
        focus: 'Wide on the right, run the middle, hit a grounded power position before you unwind.',
        phases: [
          { name: 'Wind-up', cues: ['Wide base, weight settled over a bent right leg', 'Wind back to the right with a long throwing arm', 'Discus trails — slow and rhythmic'] },
          { name: 'Entry', cues: ['Turn on the left, knee and chest leading to the front', 'Sweep the right leg wide — the longer the radius, the better', 'Keep the discus way back and relaxed'] },
          { name: 'Drive Across', cues: ['Right foot runs to the center actively turning', 'Stay grounded and over the right; left lands quickly', 'Shoulders stay closed — separation builds torque'] },
          { name: 'Power Position', cues: ['Hips well ahead of shoulders (the "X")', 'Right heel turns, knee drives toward the front rim', 'Discus still behind — wrapped, on a flat plane'] },
          { name: 'Delivery', cues: ['Lift-turn the right side into a firm left block', 'Discus comes off the index finger, flat with rip', 'Release ~35° — long out the front, not up'] },
        ],
        faults: [
          { fault: 'Discus flies low/nose-down (stalls)', fix: 'Release flatter off the index finger with a longer outswing; lead with the rim down slightly.' },
          { fault: 'Reaching the left foot to the front', fix: 'Run the right to the middle faster so the left can land actively, not reach.' },
        ],
      },
    ],
  },
  {
    event: 'hammer',
    name: 'Hammer',
    variations: [
      {
        focus: 'Long radius, heels lead the turns, accelerate the ball at the low point.',
        phases: [
          { name: 'Winds', cues: ['Two big winds — ball travels a wide circle around a stable body', 'High point over the left shoulder, low point at the right foot', 'Counter against the ball; long arms, soft hands'] },
          { name: 'Entry', cues: ['Sit and turn on the left heel into the first turn', 'Keep the ball trailing and the radius long', 'Catch the ball on a flat, sweeping path'] },
          { name: 'Turns', cues: ['Heel-toe footwork — lead with the heel, run the right around fast', 'Stay seated; keep the ball ahead of the shoulders', 'Accelerate from the low point; let it float to the high point'] },
          { name: 'Release', cues: ['Block the legs and lift the chest at the last low point', 'Long, full-body finish up and back over the left shoulder', 'Release ~42–44°'] },
        ],
        faults: [
          { fault: 'Ball drops behind / loses radius', fix: 'Counter harder and keep the arms long; don’t pull the ball with the hands.' },
          { fault: 'Getting "out-run" by the ball', fix: 'Faster heel-toe pivots — the feet must lead the ball, not chase it.' },
        ],
      },
    ],
  },
  {
    event: 'weight-throw',
    name: 'Weight Throw',
    variations: [
      {
        focus: 'Shorter implement, heavier load — stay grounded and let the legs finish.',
        phases: [
          { name: 'Winds', cues: ['One or two compact winds; the weight orbits close and controlled', 'Counter the heavy implement with a settled, seated posture', 'Soft hands, long arm'] },
          { name: 'Turns', cues: ['Heel-toe pivots, usually 1–2 turns for the indoor weight', 'Stay low — the load wants to pull you up and out', 'Keep the implement ahead and sweeping'] },
          { name: 'Release', cues: ['Plant, block the left side, and lift with the legs and back', 'Finish up and over the shoulder, full extension', 'Let the big muscles do it — don’t arm it'] },
        ],
        faults: [
          { fault: 'Standing up / pulled off balance', fix: 'Lower the center of mass and counter earlier; sit into the turns.' },
          { fault: 'Short finish', fix: 'Be patient to the last low point, then drive the legs through the block.' },
        ],
      },
    ],
  },
  {
    event: 'javelin',
    name: 'Javelin',
    variations: [
      {
        focus: 'Run tall, get the javelin back early, and throw through a braced front leg.',
        phases: [
          { name: 'Approach', cues: ['Relaxed, accelerating run-up holding the javelin high', 'Point stays level, in line with the run', 'Build controlled speed — rhythm over max effort'] },
          { name: 'Withdrawal / Crossovers', cues: ['Take the javelin back smoothly over the transition steps', 'Crossover (impulse) steps — hips ahead, shoulders turned', 'Keep the throwing arm long and the tip close to the head'] },
          { name: 'Plant / Block', cues: ['Big, fast penultimate step; drop and lower the hips', 'Plant a straight, braced left leg hard', 'Chest stays back — long bow position through the trunk'] },
          { name: 'Delivery', cues: ['Drive the right hip through; elbow leads, high and long', 'Throw over the braced front side — "through the tip"', 'Release ~33–36° with the point ahead of the tail'] },
          { name: 'Recovery', cues: ['Switch feet and decelerate behind the foul line'] },
        ],
        faults: [
          { fault: 'Elbow drops (low / round-arm)', fix: 'Keep the elbow high and the hand above the shoulder; lead with the elbow.' },
          { fault: 'Throwing around a soft front leg', fix: 'Plant a firmer, straighter left leg to block and convert speed upward.' },
        ],
      },
    ],
  },
];

export function getTechnique(event?: string | null): EventTechnique | undefined {
  if (!event) return undefined;
  return TECHNIQUE.find((t) => t.event === event);
}
