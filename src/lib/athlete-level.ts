import type { Profile } from './types';

export type AthleteLevel = 'rookie' | 'competitor' | 'elite';

export type GradeLevel =
  | 'youth'
  | 'middle_school'
  | 'hs_freshman'
  | 'hs_sophomore'
  | 'hs_junior'
  | 'hs_senior'
  | 'college'
  | 'post_collegiate';

export type AthleteGoal =
  | 'fun'
  | 'school_team'
  | 'state_meet'
  | 'college_scholarship'
  | 'national_team'
  | 'olympics';

export type EventId = 'shot-put' | 'discus' | 'hammer' | 'weight-throw' | 'javelin';

export interface EventPR {
  event: EventId;
  mark: number;
  unit: 'm' | 'ft';
  implementWeightKg: number;
}

export interface AthleteLevelInputs {
  grade: GradeLevel;
  sex: 'M' | 'F';
  goals: AthleteGoal[];
  prs: EventPR[];
}

export interface AthleteLevelResult {
  level: AthleteLevel;
  reasons: string[];
}

const GRADE_TO_BASE_LEVEL: Record<GradeLevel, AthleteLevel> = {
  youth: 'rookie',
  middle_school: 'rookie',
  hs_freshman: 'competitor',
  hs_sophomore: 'competitor',
  hs_junior: 'competitor',
  hs_senior: 'competitor',
  college: 'elite',
  post_collegiate: 'elite',
};

export interface ImplementRule {
  grade: GradeLevel;
  sex: 'M' | 'F';
  weightKg: number;
}

// Sources: NFHS rules (HS), NCAA rules (college), World Athletics (post-collegiate),
// USATF Youth (youth/middle school).
const SHOT_PUT_IMPLEMENTS: ImplementRule[] = [
  { grade: 'youth', sex: 'M', weightKg: 2.72 },
  { grade: 'youth', sex: 'F', weightKg: 2.72 },
  { grade: 'middle_school', sex: 'M', weightKg: 3.63 },
  { grade: 'middle_school', sex: 'F', weightKg: 2.72 },
  { grade: 'hs_freshman', sex: 'M', weightKg: 5.44 },
  { grade: 'hs_sophomore', sex: 'M', weightKg: 5.44 },
  { grade: 'hs_junior', sex: 'M', weightKg: 5.44 },
  { grade: 'hs_senior', sex: 'M', weightKg: 5.44 },
  { grade: 'hs_freshman', sex: 'F', weightKg: 4 },
  { grade: 'hs_sophomore', sex: 'F', weightKg: 4 },
  { grade: 'hs_junior', sex: 'F', weightKg: 4 },
  { grade: 'hs_senior', sex: 'F', weightKg: 4 },
  { grade: 'college', sex: 'M', weightKg: 7.26 },
  { grade: 'college', sex: 'F', weightKg: 4 },
  { grade: 'post_collegiate', sex: 'M', weightKg: 7.26 },
  { grade: 'post_collegiate', sex: 'F', weightKg: 4 },
];

const DISCUS_IMPLEMENTS: ImplementRule[] = [
  { grade: 'youth', sex: 'M', weightKg: 0.6 },
  { grade: 'youth', sex: 'F', weightKg: 0.6 },
  { grade: 'middle_school', sex: 'M', weightKg: 1 },
  { grade: 'middle_school', sex: 'F', weightKg: 1 },
  { grade: 'hs_freshman', sex: 'M', weightKg: 1.6 },
  { grade: 'hs_sophomore', sex: 'M', weightKg: 1.6 },
  { grade: 'hs_junior', sex: 'M', weightKg: 1.6 },
  { grade: 'hs_senior', sex: 'M', weightKg: 1.6 },
  { grade: 'hs_freshman', sex: 'F', weightKg: 1 },
  { grade: 'hs_sophomore', sex: 'F', weightKg: 1 },
  { grade: 'hs_junior', sex: 'F', weightKg: 1 },
  { grade: 'hs_senior', sex: 'F', weightKg: 1 },
  { grade: 'college', sex: 'M', weightKg: 2 },
  { grade: 'college', sex: 'F', weightKg: 1 },
  { grade: 'post_collegiate', sex: 'M', weightKg: 2 },
  { grade: 'post_collegiate', sex: 'F', weightKg: 1 },
];

const HAMMER_IMPLEMENTS: ImplementRule[] = [
  { grade: 'hs_freshman', sex: 'F', weightKg: 4 },
  { grade: 'hs_sophomore', sex: 'F', weightKg: 4 },
  { grade: 'hs_junior', sex: 'F', weightKg: 4 },
  { grade: 'hs_senior', sex: 'F', weightKg: 4 },
  { grade: 'college', sex: 'M', weightKg: 7.26 },
  { grade: 'college', sex: 'F', weightKg: 4 },
  { grade: 'post_collegiate', sex: 'M', weightKg: 7.26 },
  { grade: 'post_collegiate', sex: 'F', weightKg: 4 },
];

const WEIGHT_THROW_IMPLEMENTS: ImplementRule[] = [
  { grade: 'college', sex: 'M', weightKg: 15.88 },
  { grade: 'college', sex: 'F', weightKg: 9.08 },
  { grade: 'post_collegiate', sex: 'M', weightKg: 15.88 },
  { grade: 'post_collegiate', sex: 'F', weightKg: 9.08 },
];

const JAVELIN_IMPLEMENTS: ImplementRule[] = [
  { grade: 'youth', sex: 'M', weightKg: 0.4 },
  { grade: 'youth', sex: 'F', weightKg: 0.4 },
  { grade: 'middle_school', sex: 'M', weightKg: 0.6 },
  { grade: 'middle_school', sex: 'F', weightKg: 0.5 },
  { grade: 'hs_freshman', sex: 'M', weightKg: 0.8 },
  { grade: 'hs_sophomore', sex: 'M', weightKg: 0.8 },
  { grade: 'hs_junior', sex: 'M', weightKg: 0.8 },
  { grade: 'hs_senior', sex: 'M', weightKg: 0.8 },
  { grade: 'hs_freshman', sex: 'F', weightKg: 0.6 },
  { grade: 'hs_sophomore', sex: 'F', weightKg: 0.6 },
  { grade: 'hs_junior', sex: 'F', weightKg: 0.6 },
  { grade: 'hs_senior', sex: 'F', weightKg: 0.6 },
  { grade: 'college', sex: 'M', weightKg: 0.8 },
  { grade: 'college', sex: 'F', weightKg: 0.6 },
  { grade: 'post_collegiate', sex: 'M', weightKg: 0.8 },
  { grade: 'post_collegiate', sex: 'F', weightKg: 0.6 },
];

export const IMPLEMENT_TABLE: Record<EventId, ImplementRule[]> = {
  'shot-put': SHOT_PUT_IMPLEMENTS,
  discus: DISCUS_IMPLEMENTS,
  hammer: HAMMER_IMPLEMENTS,
  'weight-throw': WEIGHT_THROW_IMPLEMENTS,
  javelin: JAVELIN_IMPLEMENTS,
};

export function getRecommendedImplementKg(
  event: EventId,
  grade: GradeLevel,
  sex: 'M' | 'F',
): number | null {
  const rule = IMPLEMENT_TABLE[event].find(r => r.grade === grade && r.sex === sex);
  return rule?.weightKg ?? null;
}

export function isEventAgeAppropriate(event: EventId, grade: GradeLevel): boolean {
  return IMPLEMENT_TABLE[event].some(r => r.grade === grade);
}

interface TierThreshold {
  event: EventId;
  sex: 'M' | 'F';
  implementWeightKg: number;
  competitorMin: number;
  eliteMin: number;
}

// Marks in meters at the standard implement weight for that level.
// Competitor min ~= solid HS varsity, Elite min ~= NCAA D1 scoring / national-class.
const TIER_THRESHOLDS: TierThreshold[] = [
  { event: 'shot-put', sex: 'M', implementWeightKg: 5.44, competitorMin: 14, eliteMin: 18 },
  { event: 'shot-put', sex: 'M', implementWeightKg: 7.26, competitorMin: 15, eliteMin: 18.5 },
  { event: 'shot-put', sex: 'F', implementWeightKg: 4, competitorMin: 11, eliteMin: 15 },
  { event: 'discus', sex: 'M', implementWeightKg: 1.6, competitorMin: 45, eliteMin: 60 },
  { event: 'discus', sex: 'M', implementWeightKg: 2, competitorMin: 45, eliteMin: 58 },
  { event: 'discus', sex: 'F', implementWeightKg: 1, competitorMin: 36, eliteMin: 52 },
  { event: 'hammer', sex: 'M', implementWeightKg: 7.26, competitorMin: 50, eliteMin: 65 },
  { event: 'hammer', sex: 'F', implementWeightKg: 4, competitorMin: 45, eliteMin: 60 },
  { event: 'weight-throw', sex: 'M', implementWeightKg: 15.88, competitorMin: 17, eliteMin: 22 },
  { event: 'weight-throw', sex: 'F', implementWeightKg: 9.08, competitorMin: 15, eliteMin: 20 },
  { event: 'javelin', sex: 'M', implementWeightKg: 0.8, competitorMin: 50, eliteMin: 70 },
  { event: 'javelin', sex: 'F', implementWeightKg: 0.6, competitorMin: 38, eliteMin: 55 },
];

export function getSkillTierForPR(pr: EventPR, sex: 'M' | 'F'): AthleteLevel {
  const threshold = TIER_THRESHOLDS.find(
    t =>
      t.event === pr.event &&
      t.sex === sex &&
      Math.abs(t.implementWeightKg - pr.implementWeightKg) < 0.05,
  );
  if (!threshold) return 'rookie';
  const markMeters = pr.unit === 'ft' ? pr.mark * 0.3048 : pr.mark;
  if (markMeters >= threshold.eliteMin) return 'elite';
  if (markMeters >= threshold.competitorMin) return 'competitor';
  return 'rookie';
}

const LEVEL_RANK: Record<AthleteLevel, number> = { rookie: 0, competitor: 1, elite: 2 };

function maxLevel(a: AthleteLevel, b: AthleteLevel): AthleteLevel {
  return LEVEL_RANK[a] >= LEVEL_RANK[b] ? a : b;
}

export function deriveAthleteLevel(inputs: AthleteLevelInputs): AthleteLevelResult {
  const reasons: string[] = [];
  let level: AthleteLevel = GRADE_TO_BASE_LEVEL[inputs.grade];
  reasons.push(`Grade ${inputs.grade} → base level ${level}`);

  for (const pr of inputs.prs) {
    const prTier = getSkillTierForPR(pr, inputs.sex);
    if (LEVEL_RANK[prTier] > LEVEL_RANK[level]) {
      reasons.push(`${pr.event} PR of ${pr.mark}${pr.unit} promotes to ${prTier}`);
      level = maxLevel(level, prTier);
    }
  }

  // Goal-based promotion: stated ambition unlocks the matching feature surface
  // even if marks haven't caught up yet. A 13-year-old aiming for the Olympics
  // gets to see periodization tools — the alternative (gatekeep by mark) would
  // be the opposite of what a kid with that goal needs.
  const hasEliteGoal =
    inputs.goals.includes('national_team') || inputs.goals.includes('olympics');
  const hasCompetitorGoal =
    inputs.goals.includes('state_meet') || inputs.goals.includes('college_scholarship');

  if (hasEliteGoal && LEVEL_RANK[level] < LEVEL_RANK['elite']) {
    reasons.push('Goal includes national/olympic → elite features surfaced');
    level = 'elite';
  } else if (hasCompetitorGoal && LEVEL_RANK[level] < LEVEL_RANK['competitor']) {
    reasons.push('Goal includes state meet/college → competitor features surfaced');
    level = 'competitor';
  }

  return { level, reasons };
}

// Profile now carries all tier fields directly (see types.ts). Kept as an alias
// so existing imports of ExtendedProfile keep working.
export type ExtendedProfile = Profile;

export function getEffectiveLevel(profile: ExtendedProfile): AthleteLevel {
  if (profile.athleteLevelOverride) return profile.athleteLevelOverride;
  if (profile.athleteLevel) return profile.athleteLevel;
  return 'competitor';
}
