import { UserProfile } from '../models/UserProfile';
import { NutritionPlan } from '../models/NutritionPlan';
import { Macro } from '../models/Macro';
import { toKg, toCm } from '../utils/unitConversion';
import {
  ACTIVITY_MULTIPLIERS,
  GOAL_MULTIPLIERS,
  PROTEIN_MULTIPLIERS,
} from '../../constants';
import type { Milestone } from '../../types';

/**
 * NutritionController — Business Logic Layer
 *
 * Owns ALL nutrition calculation logic. Previously this lived in
 * calculationService.ts as a single 130-line function. Now it is
 * decomposed into focused private methods, each with a single job.
 *
 * SRP:  Each method does one thing (BMR, TDEE, macros, milestones…).
 * OCP:  New formulas (e.g. Harris-Benedict) can be added without
 *       touching existing methods.
 * DIP:  Depends on UserProfile and NutritionPlan abstractions,
 *       not on raw UserInputs objects.
 *
 * This class is a pure calculation engine — no I/O, no React, no fetch.
 */
export class NutritionController {

  // ── Public API ─────────────────────────────────────────────────────────────

  calculate(profile: UserProfile): NutritionPlan {
    const weightKg = toKg(profile.weight, profile.unitSystem);
    const heightCm = profile.height ? toCm(profile.height, profile.unitSystem) : undefined;
    const lbm      = weightKg * (1 - profile.bodyFat / 100);

    const { bmr, formulaUsed } = this.calcBMR(profile, weightKg, heightCm, lbm);
    const tdee                 = this.calcTDEE(bmr, profile.activityLevel);
    const { calories, safetyLevel, warnings } = this.calcTargetCalories(profile, tdee);
    const macro                = this.calcMacros(profile, weightKg, calories);
    const waterLiters          = weightKg * 0.035;
    const milestones           = this.buildMilestones(profile, weightKg, lbm);
    const { expectedWeightChange, monthsToTarget } = this.buildTimeline(profile);

    return new NutritionPlan(
      calories, macro, Math.round(bmr), Math.round(tdee),
      waterLiters, formulaUsed, safetyLevel,
      expectedWeightChange, milestones, warnings, monthsToTarget
    );
  }

  // ── Private calculation steps ──────────────────────────────────────────────

  private calcBMR(
    profile: UserProfile,
    weightKg: number,
    heightCm: number | undefined,
    lbm: number
  ): { bmr: number; formulaUsed: 'Katch-McArdle' | 'Mifflin-St Jeor' } {
    if (profile.age && heightCm) {
      const bmr = profile.gender === 'male'
        ? (10 * weightKg) + (6.25 * heightCm) - (5 * profile.age) + 5
        : (10 * weightKg) + (6.25 * heightCm) - (5 * profile.age) - 161;
      return { bmr, formulaUsed: 'Mifflin-St Jeor' };
    }
    return { bmr: 370 + (21.6 * lbm), formulaUsed: 'Katch-McArdle' };
  }

  private calcTDEE(bmr: number, activityLevel: UserProfile['activityLevel']): number {
    return bmr * ACTIVITY_MULTIPLIERS[activityLevel];
  }

  private calcTargetCalories(
    profile: UserProfile,
    tdee: number
  ): { calories: number; safetyLevel: 'OPTIMAL' | 'CAUTION' | 'CRITICAL'; warnings: string[] } {
    const warnings: string[] = [];
    let safetyLevel: 'OPTIMAL' | 'CAUTION' | 'CRITICAL' = 'OPTIMAL';

    let calories: number;
    if ((profile.goal === 'cut' || profile.goal === 'bulk') && profile.weeklyRate) {
      const adj = profile.unitSystem === 'metric'
        ? profile.weeklyRate * 1100
        : profile.weeklyRate * 500;
      calories = profile.goal === 'cut' ? tdee - adj : tdee + adj;
    } else {
      calories = tdee * GOAL_MULTIPLIERS[profile.goal];
    }

    const floor = profile.gender === 'male' ? 1500 : 1200;
    if (calories < floor) {
      warnings.push(`Metabolic Alert: Calories below ${floor} safety floor. Clamped.`);
      calories = floor;
      safetyLevel = 'CRITICAL';
    } else if (calories < floor + 200) {
      safetyLevel = 'CAUTION';
    }

    return { calories: Math.round(calories), safetyLevel, warnings };
  }

  private calcMacros(
    profile: UserProfile,
    weightKg: number,
    calories: number
  ): Macro {
    const proteinMultiplier = (profile.goal === 'cut' || profile.goal === 'bulk')
      ? 2.2
      : PROTEIN_MULTIPLIERS[profile.activityLevel];

    const proteinG = Math.round(weightKg * proteinMultiplier);
    const fatG     = Math.round(Math.max(0.6 * weightKg, (calories * 0.25) / 9));
    const carbsG   = Math.max(0, Math.round((calories - (proteinG * 4) - (fatG * 9)) / 4));
    const fiberG   = Math.max(20, Math.round(14 * (calories / 1000)));

    return new Macro(proteinG, carbsG, fatG, fiberG);
  }

  private buildMilestones(
    profile: UserProfile,
    weightKg: number,
    lbm: number
  ): Milestone[] {
    const milestones: Milestone[] = [];
    const rate = profile.weeklyRate ?? (profile.goal === 'bulk' ? 0.25 : 0.5);

    if (profile.goal === 'cut') {
      const abThreshold   = profile.gender === 'male' ? 12 : 20;
      const leanThreshold = profile.gender === 'male' ? 8  : 16;

      if (profile.bodyFat > abThreshold) {
        const targetWeight = lbm / (1 - abThreshold / 100);
        const diff = weightKg - (profile.unitSystem === 'imperial' ? targetWeight / 0.453592 : targetWeight);
        milestones.push({
          label: 'CORE DEFINITION',
          weeks: Math.ceil(Math.max(0, diff) / rate),
          description: `Visual abdominal separation projected at ~${abThreshold}% Body Fat.`,
          icon: 'fa-shield-halved',
        });
      }

      if (profile.bodyFat > leanThreshold) {
        const targetWeight = lbm / (1 - leanThreshold / 100);
        const diff = weightKg - (profile.unitSystem === 'imperial' ? targetWeight / 0.453592 : targetWeight);
        milestones.push({
          label: 'PEAK VASCULARITY',
          weeks: Math.ceil(Math.max(0, diff) / rate),
          description: `Subcutaneous water reduction and vein visibility peak at ${leanThreshold}%.`,
          icon: 'fa-bolt',
        });
      }
    } else if (profile.goal === 'bulk') {
      const massGain = profile.unitSystem === 'metric' ? 5 : 10;
      milestones.push(
        {
          label: `+${massGain}${profile.unitSystem === 'metric' ? 'KG' : 'LB'} BENCHMARK`,
          weeks: Math.ceil(massGain / rate),
          description: 'Significant hypertrophy crossover. Size increase becomes visible in clothing.',
          icon: 'fa-dumbbell',
        },
        {
          label: 'STRENGTH PLATEAU OVERRIDE',
          weeks: Math.ceil((massGain * 2) / rate),
          description: 'Neural adaptation and mass gain synergy. Expect multi-rep PRs across compound lifts.',
          icon: 'fa-gauge-high',
        }
      );
    }

    return milestones;
  }

  private buildTimeline(
    profile: UserProfile
  ): { expectedWeightChange: string; monthsToTarget?: string } {
    if ((profile.goal === 'cut' || profile.goal === 'bulk') && profile.targetWeight && profile.weeklyRate) {
      const totalDiff = Math.abs(profile.weight - profile.targetWeight);
      const weeks     = totalDiff / profile.weeklyRate;
      const months    = (weeks / 4.345).toFixed(1);
      return {
        expectedWeightChange: `${profile.goal === 'bulk' ? '+' : '-'}${profile.weeklyRate} ${profile.unitSystem === 'metric' ? 'kg' : 'lb'}/wk`,
        monthsToTarget: `${months} MONTHS / ${Math.ceil(weeks)} WEEKS`,
      };
    }

    const expectedWeightChange =
      profile.goal === 'bulk' ? '+0.25% bodyweight/wk' :
      profile.goal === 'cut'  ? '-0.5% bodyweight/wk'  : 'Maintenance';

    return { expectedWeightChange };
  }
}

/** Singleton instance — one controller for the whole app (Singleton Pattern) */
export const nutritionController = new NutritionController();
