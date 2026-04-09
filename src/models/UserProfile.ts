import type { UnitSystem, Gender, ActivityLevel, Goal } from '../../types';

/**
 * UserProfile — Entity
 *
 * Encapsulates user biometric data and unit-conversion logic.
 * Components never do weight/height conversions — they ask the profile.
 *
 * SRP: Owns user data and unit normalization only.
 * DIP: Depends on primitive types, not on any service.
 */
export class UserProfile {
  constructor(
    public readonly name: string,
    public readonly gender: Gender,
    public readonly weight: number,       // raw value in user's unit
    public readonly bodyFat: number,      // percentage 0-100
    public readonly activityLevel: ActivityLevel,
    public readonly goal: Goal,
    public readonly unitSystem: UnitSystem,
    public readonly age?: number,
    public readonly height?: number,      // raw value in user's unit
    public readonly targetWeight?: number,
    public readonly weeklyRate?: number
  ) {}

  // ── Normalized values (always metric internally) ──────────────────────────

  get weightKg(): number {
    return this.unitSystem === 'imperial' ? this.weight * 0.453592 : this.weight;
  }

  get heightCm(): number | undefined {
    if (!this.height) return undefined;
    return this.unitSystem === 'imperial' ? this.height * 2.54 : this.height;
  }

  get lbm(): number {
    return this.weightKg * (1 - this.bodyFat / 100);
  }

  /** Whether we have enough data for the more accurate Mifflin-St Jeor formula */
  get canUseMifflin(): boolean {
    return !!(this.age && this.heightCm);
  }

  /** Display weight in user's preferred unit */
  get displayWeight(): string {
    return `${this.weight} ${this.unitSystem === 'metric' ? 'kg' : 'lbs'}`;
  }

  /** Factory — build from the plain UserInputs shape (backward compat) */
  static fromInputs(inputs: {
    name: string; gender: Gender; weight: number; bodyFat: number;
    activityLevel: ActivityLevel; goal: Goal; unitSystem: UnitSystem;
    age?: number; height?: number; targetWeight?: number; weeklyRate?: number;
  }): UserProfile {
    return new UserProfile(
      inputs.name, inputs.gender, inputs.weight, inputs.bodyFat,
      inputs.activityLevel, inputs.goal, inputs.unitSystem,
      inputs.age, inputs.height, inputs.targetWeight, inputs.weeklyRate
    );
  }

  /** Serialize back to the legacy UserInputs shape for backward compat */
  toInputs() {
    return {
      name: this.name, gender: this.gender, weight: this.weight,
      bodyFat: this.bodyFat, activityLevel: this.activityLevel,
      goal: this.goal, unitSystem: this.unitSystem, age: this.age,
      height: this.height, targetWeight: this.targetWeight,
      weeklyRate: this.weeklyRate,
    };
  }
}
