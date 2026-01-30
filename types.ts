
export type UnitSystem = 'metric' | 'imperial';
export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'heavy' | 'extra_active';
export type Goal = 'cut' | 'recomp' | 'bulk';
export type DietaryPreference = 'veg' | 'non-veg';

export interface Milestone {
  label: string;
  weeks: number;
  description: string;
  icon: string;
}

export interface UserInputs {
  name: string;
  unitSystem: UnitSystem;
  gender: Gender;
  weight: number;
  bodyFat: number;
  activityLevel: ActivityLevel;
  goal: Goal;
  age?: number;
  height?: number;
  // Weight Change Specifics
  targetWeight?: number;
  weeklyRate?: number; // kg or lbs per week
}

export interface UserFeedback {
  rating: number; // 1-5 stars
  recommendation: string;
  timestamp: number;
}

export interface CalculationResults {
  calories: number;
  proteinG: number;
  proteinPct: number;
  carbsG: number;
  carbsPct: number;
  fatG: number;
  fatPct: number;
  fiberG: number;
  lbm: number;
  bmr: number;
  tdee: number;
  waterLiters: number;
  formulaUsed: 'Katch-McArdle' | 'Mifflin-St Jeor';
  expectedWeightChange: string;
  warnings: string[];
  monthsToTarget?: string;
  safetyLevel: 'OPTIMAL' | 'CAUTION' | 'CRITICAL';
  milestones: Milestone[];
}
