/**
 * macroUtils — Pure macro math helpers
 *
 * Previously duplicated across ResultsView, DietMaker, and calculationService.
 * Now lives in one place.
 *
 * SRP: Only computes macro-related values.
 */

/** Grams of a macro from its calorie percentage */
export const gramsFromPct = (
  totalCalories: number,
  pct: number,
  caloriesPerGram: 4 | 9
): number => Math.round((totalCalories * (pct / 100)) / caloriesPerGram);

/** Percentage of total calories from grams */
export const pctFromGrams = (
  grams: number,
  caloriesPerGram: 4 | 9,
  totalCalories: number
): number => Math.round(((grams * caloriesPerGram) / totalCalories) * 100);

/** Clamp a percentage adjustment so the three macros always sum to 100 */
export const clampMacroPct = (
  changed: 'p' | 'c' | 'f',
  newValue: number,
  current: { p: number; c: number; f: number }
): { p: number; c: number; f: number } => {
  const clamped = Math.max(0, Math.min(100, newValue));
  const remainder = 100 - clamped;

  if (changed === 'p') {
    const ratio = current.c / (current.c + current.f) || 0.5;
    return { p: clamped, c: Math.round(remainder * ratio), f: Math.round(remainder * (1 - ratio)) };
  }
  if (changed === 'c') {
    const ratio = current.p / (current.p + current.f) || 0.5;
    return { p: Math.round(remainder * ratio), c: clamped, f: Math.round(remainder * (1 - ratio)) };
  }
  const ratio = current.p / (current.p + current.c) || 0.5;
  return { p: Math.round(remainder * ratio), c: Math.round(remainder * (1 - ratio)), f: clamped };
};
