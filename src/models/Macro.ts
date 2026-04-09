/**
 * Macro — Value Object
 *
 * Encapsulates a macronutrient breakdown.
 * Responsible for: calorie math, percentage distribution, display formatting.
 *
 * SRP: Only knows about macros and their derived values.
 * OCP: New macro types (e.g. alcohol) can be added without changing calorie logic.
 */
export class Macro {
  constructor(
    public readonly proteinG: number,
    public readonly carbsG: number,
    public readonly fatG: number,
    public readonly fiberG: number
  ) {}

  /** Calories from each macro using Atwater factors */
  get proteinCalories(): number { return this.proteinG * 4; }
  get carbsCalories(): number   { return this.carbsG * 4;   }
  get fatCalories(): number     { return this.fatG * 9;     }

  get totalCalories(): number {
    return this.proteinCalories + this.carbsCalories + this.fatCalories;
  }

  get proteinPct(): number { return Math.round((this.proteinCalories / this.totalCalories) * 100); }
  get fatPct(): number     { return Math.round((this.fatCalories / this.totalCalories) * 100);     }
  get carbsPct(): number   { return 100 - this.proteinPct - this.fatPct;                           }

  /** Protein per kg of bodyweight */
  proteinPerKg(weightKg: number): number {
    return parseFloat((this.proteinG / weightKg).toFixed(1));
  }

  /** Rebalance macros to a new calorie target, keeping protein fixed */
  rebalanceTo(newCalories: number): Macro {
    const proteinCals = this.proteinCalories;
    const fatCals     = this.fatCalories;
    const carbsCals   = Math.max(0, newCalories - proteinCals - fatCals);
    return new Macro(
      this.proteinG,
      Math.round(carbsCals / 4),
      this.fatG,
      this.fiberG
    );
  }

  toJSON() {
    return {
      proteinG:  this.proteinG,
      carbsG:    this.carbsG,
      fatG:      this.fatG,
      fiberG:    this.fiberG,
      proteinPct: this.proteinPct,
      carbsPct:   this.carbsPct,
      fatPct:     this.fatPct,
      totalCalories: this.totalCalories,
    };
  }
}
