/**
 * unitConversion — Pure utility functions
 *
 * All unit math lives here. No component or service imports conversion
 * factors directly — they call these functions.
 *
 * SRP: Only converts units.
 * Testable: pure functions, zero dependencies.
 */

export const kgToLbs  = (kg: number):  number => kg * 2.20462;
export const lbsToKg  = (lbs: number): number => lbs * 0.453592;
export const cmToIn   = (cm: number):  number => cm / 2.54;
export const inToCm   = (inches: number): number => inches * 2.54;

export const toKg = (value: number, unit: 'metric' | 'imperial'): number =>
  unit === 'imperial' ? lbsToKg(value) : value;

export const toCm = (value: number, unit: 'metric' | 'imperial'): number =>
  unit === 'imperial' ? inToCm(value) : value;
