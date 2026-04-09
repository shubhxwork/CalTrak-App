import { Macro } from './Macro';
import type { Milestone } from '../../types';

/**
 * NutritionPlan — Aggregate Root
 *
 * The output of a calculation run. Owns calories, macros, hydration,
 * milestones, and safety metadata. Components read from this object —
 * they never recalculate anything themselves.
 *
 * SRP: Represents a complete nutrition prescription. No I/O, no side effects.
 * OCP: New fields (e.g. micronutrients) can be added without changing consumers.
 */
export class NutritionPlan {
  constructor(
    public readonly calories: number,
    public readonly macro: Macro,
    public readonly bmr: number,
    public readonly tdee: number,
    public readonly waterLiters: number,
    public readonly formulaUsed: 'Katch-McArdle' | 'Mifflin-St Jeor',
    public readonly safetyLevel: 'OPTIMAL' | 'CAUTION' | 'CRITICAL',
    public readonly expectedWeightChange: string,
    public readonly milestones: Milestone[],
    public readonly warnings: string[],
    public readonly monthsToTarget?: string
  ) {}

  get isCalorieRestricted(): boolean {
    return this.safetyLevel !== 'OPTIMAL';
  }

  get hydrationDisplay(): string {
    return `${this.waterLiters.toFixed(2)} LITERS`;
  }

  /**
   * Serialize to the legacy CalculationResults shape.
   * Keeps all existing components working without modification.
   */
  toLegacyResults() {
    return {
      calories:     this.calories,
      proteinG:     this.macro.proteinG,
      proteinPct:   this.macro.proteinPct,
      carbsG:       this.macro.carbsG,
      carbsPct:     this.macro.carbsPct,
      fatG:         this.macro.fatG,
      fatPct:       this.macro.fatPct,
      fiberG:       this.macro.fiberG,
      lbm:          Math.round(this.bmr), // lbm stored separately in legacy
      bmr:          this.bmr,
      tdee:         this.tdee,
      waterLiters:  this.waterLiters,
      formulaUsed:  this.formulaUsed,
      expectedWeightChange: this.expectedWeightChange,
      warnings:     this.warnings,
      monthsToTarget: this.monthsToTarget,
      safetyLevel:  this.safetyLevel,
      milestones:   this.milestones,
    };
  }

  /** Factory — rebuild from legacy CalculationResults (for hydration from storage) */
  static fromLegacyResults(r: any): NutritionPlan {
    return new NutritionPlan(
      r.calories,
      new Macro(r.proteinG, r.carbsG, r.fatG, r.fiberG),
      r.bmr, r.tdee, r.waterLiters,
      r.formulaUsed, r.safetyLevel,
      r.expectedWeightChange, r.milestones, r.warnings, r.monthsToTarget
    );
  }
}
