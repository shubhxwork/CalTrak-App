
import { ActivityLevel, Goal, DietaryPreference } from './types';

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.20,
  light: 1.375,
  moderate: 1.55,
  heavy: 1.725,
  extra_active: 1.90,
};

export const ACTIVITY_DESCRIPTIONS: Record<ActivityLevel, string> = {
  sedentary: "Desk job, minimal movement, 0-1 days/week gym",
  light: "Light exercise 1-3 days/week, some daily walking",
  moderate: "Moderate exercise 3-5 days/week, active daily",
  heavy: "Intense exercise 6-7 days/week, very active job",
  extra_active: "Elite athlete, physically demanding job, 2x training",
};

export const GOAL_MULTIPLIERS: Record<Goal, number> = {
  cut: 0.85,
  recomp: 1.00,
  bulk: 1.10,
};

export const GOAL_LABELS: Record<Goal, string> = {
  cut: "Cut (15% Deficit)",
  recomp: "Recomp (Body Composition)",
  bulk: "Bulk (10% Surplus)",
};

export const PROTEIN_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.0,
  light: 1.6,
  moderate: 1.8,
  heavy: 2.0,
  extra_active: 2.2,
};

export interface MacroFood {
  name: string;
  macros: string; // Formatting: "P: Xg | C: Yg | F: Zg"
}

export const FOOD_RECOMMENDATIONS: Record<DietaryPreference, Record<'protein' | 'carbs' | 'fats', MacroFood[]>> = {
  'non-veg': {
    protein: [
      { name: 'Lean Chicken Breast', macros: 'P: 31g | C: 0g | F: 3.6g' },
      { name: 'Whole Eggs (Large)', macros: 'P: 6g | C: 0.6g | F: 5g' },
      { name: 'Rohu / Katla Fish', macros: 'P: 19g | C: 0g | F: 2g' },
      { name: 'Lean Mutton (Goat)', macros: 'P: 25g | C: 0g | F: 8g' },
      { name: 'Soya Chunks (Dry)', macros: 'P: 52g | C: 33g | F: 0.5g' },
      { name: 'Whey Protein (1 scoop)', macros: 'P: 24g | C: 2g | F: 1.5g' }
    ],
    carbs: [
      { name: 'Atta Roti (1 pc)', macros: 'P: 3g | C: 15g | F: 0.4g' },
      { name: 'Basmati Rice (Cooked)', macros: 'P: 3g | C: 28g | F: 0.3g' },
      { name: 'Ragi / Millets', macros: 'P: 7g | C: 72g | F: 1.3g' },
      { name: 'Poha (Dry)', macros: 'P: 6g | C: 77g | F: 1g' },
      { name: 'Sweet Potato', macros: 'P: 1.6g | C: 20g | F: 0.1g' },
      { name: 'Dalia (Broken Wheat)', macros: 'P: 12g | C: 76g | F: 1g' }
    ],
    fats: [
      { name: 'Desi Ghee (1 tsp)', macros: 'P: 0g | C: 0g | F: 5g' },
      { name: 'Peanuts (Moongfali)', macros: 'P: 26g | C: 16g | F: 49g' },
      { name: 'Almonds (Badam)', macros: 'P: 21g | C: 22g | F: 50g' },
      { name: 'Walnuts (Akhrot)', macros: 'P: 15g | C: 14g | F: 65g' },
      { name: 'Mustard Oil (1 tbsp)', macros: 'P: 0g | C: 0g | F: 14g' }
    ],
  },
  'veg': {
    protein: [
      { name: 'Low Fat Paneer', macros: 'P: 20g | C: 4g | F: 15g' },
      { name: 'Soya Chunks (Dry)', macros: 'P: 52g | C: 33g | F: 0.5g' },
      { name: 'Mixed Dals (Rajma/Dal)', macros: 'P: 24g | C: 60g | F: 1.5g' },
      { name: 'Greek Yogurt (Dahi)', macros: 'P: 10g | C: 4g | F: 0g' },
      { name: 'Tofu (Soya Paneer)', macros: 'P: 8g | C: 2g | F: 4g' },
      { name: 'Roasted Chana', macros: 'P: 19g | C: 58g | F: 5g' }
    ],
    carbs: [
      { name: 'Whole Wheat Roti', macros: 'P: 3g | C: 15g | F: 0.4g' },
      { name: 'Ragi Mudde', macros: 'P: 7g | C: 72g | F: 1.3g' },
      { name: 'Oats with Milk', macros: 'P: 11g | C: 60g | F: 7g' },
      { name: 'Brown Rice (Cooked)', macros: 'P: 2.6g | C: 23g | F: 0.9g' },
      { name: 'Boiled Potato', macros: 'P: 2g | C: 17g | F: 0.1g' }
    ],
    fats: [
      { name: 'Peanut Butter', macros: 'P: 25g | C: 20g | F: 50g' },
      { name: 'Mixed Nuts', macros: 'P: 20g | C: 20g | F: 50g' },
      { name: 'Chia Seeds', macros: 'P: 17g | C: 42g | F: 31g' },
      { name: 'Cow Ghee (1 tsp)', macros: 'P: 0g | C: 0g | F: 5g' },
      { name: 'Pumpkin Seeds', macros: 'P: 30g | C: 10g | F: 49g' }
    ],
  }
};
