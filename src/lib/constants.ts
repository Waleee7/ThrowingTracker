import { ThrowingEvent } from './types';

export const EVENTS: ThrowingEvent[] = [
  {
    id: 'shot-put',
    name: 'Shot Put',
    svg: '<svg viewBox="0 0 100 100" style="width:100%;height:100%"><defs><radialGradient id="shotGrad" cx="35%" cy="35%"><stop offset="0%" stop-color="currentColor" stop-opacity="0.3"/><stop offset="100%" stop-color="currentColor"/></radialGradient></defs><circle cx="50" cy="50" r="35" fill="url(#shotGrad)" stroke="currentColor" stroke-width="2"/><circle cx="35" cy="35" r="8" fill="currentColor" opacity="0.4"/></svg>',
  },
  {
    id: 'discus',
    name: 'Discus',
    svg: '<svg viewBox="0 0 100 100" style="width:100%;height:100%"><ellipse cx="50" cy="50" rx="40" ry="15" fill="currentColor" opacity="0.2"/><ellipse cx="50" cy="50" rx="40" ry="15" fill="none" stroke="currentColor" stroke-width="3"/><ellipse cx="50" cy="50" rx="30" ry="11" fill="none" stroke="currentColor" stroke-width="2"/><ellipse cx="50" cy="50" rx="20" ry="7" fill="currentColor" opacity="0.3"/></svg>',
  },
  {
    id: 'hammer',
    name: 'Hammer',
    svg: '<svg viewBox="0 0 100 100" style="width:100%;height:100%"><defs><radialGradient id="hammerBallGrad" cx="30%" cy="30%"><stop offset="0%" stop-color="currentColor" stop-opacity="0.3"/><stop offset="100%" stop-color="currentColor"/></radialGradient></defs><path d="M 25 30 Q 35 40, 45 50 Q 55 60, 65 70" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="70" cy="75" r="15" fill="url(#hammerBallGrad)" stroke="currentColor" stroke-width="2"/><rect x="20" y="25" width="8" height="12" rx="2" fill="currentColor"/></svg>',
  },
  {
    id: 'weight-throw',
    name: 'Weight Throw',
    svg: '<svg viewBox="0 0 100 100" style="width:100%;height:100%"><defs><radialGradient id="weightGrad" cx="30%" cy="30%"><stop offset="0%" stop-color="currentColor" stop-opacity="0.2"/><stop offset="100%" stop-color="currentColor"/></radialGradient></defs><circle cx="50" cy="60" r="25" fill="url(#weightGrad)" stroke="currentColor" stroke-width="3"/><rect x="45" y="25" width="10" height="25" rx="3" fill="currentColor"/><rect x="42" y="22" width="16" height="6" rx="2" fill="currentColor"/></svg>',
  },
  {
    id: 'javelin',
    name: 'Javelin',
    svg: '<svg viewBox="0 0 100 100" style="width:100%;height:100%"><line x1="15" y1="70" x2="85" y2="30" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><polygon points="85,30 90,32 88,28" fill="currentColor"/><rect x="35" y="47" width="20" height="6" rx="1" fill="currentColor" transform="rotate(-35 45 50)"/></svg>',
  },
];

export const RPE_SCALE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Rookie-tier RPE (W7): friendly emoji buckets that still store a numeric RPE,
// so analytics / readiness keep reading the same 1-10 field unchanged.
export const RPE_EMOJI = [
  { value: 2, emoji: '\u{1F60C}', label: 'Easy' },
  { value: 4, emoji: '\u{1F642}', label: 'Light' },
  { value: 6, emoji: '\u{1F610}', label: 'Moderate' },
  { value: 8, emoji: '\u{1F624}', label: 'Hard' },
  { value: 10, emoji: '\u{1F975}', label: 'All out' },
];
export const HEIGHT_UNITS = ['cm', 'ft/in'] as const;
export const WEIGHT_UNITS = ['kg', 'lbs'] as const;
export const DISTANCE_UNITS = ['m', 'ft'] as const;

export const DEFAULT_PROFILE = {
  name: '',
  height: { value: '', unit: 'cm' as const, feet: '', inches: '' },
  weight: { value: '', unit: 'kg' as const },
  sex: '' as const,
  events: [] as string[],
  notes: '',
  distanceUnit: 'm' as const,
};

export const SECTOR_ANGLE_DEG = 34.92;

// Per-event broadcast hues. KEEP these keys (JS contract: EVENT_COLORS keys).
export const EVENT_COLORS: Record<string, string> = {
  'shot-put': '#FF8A3D',
  'discus': '#38BDF8',
  'hammer': '#A78BFA',
  'weight-throw': '#F472B6',
  'javelin': '#2DD4BF',
};
