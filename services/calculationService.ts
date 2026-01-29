
import { UserInputs, CalculationResults, Milestone } from '../types';
import { 
  ACTIVITY_MULTIPLIERS, 
  GOAL_MULTIPLIERS, 
  PROTEIN_MULTIPLIERS 
} from '../constants';

export const calculateResults = (inputs: UserInputs): CalculationResults => {
  const { 
    weight, 
    bodyFat, 
    gender, 
    activityLevel, 
    goal, 
    age, 
    height, 
    unitSystem,
    targetWeight,
    weeklyRate
  } = inputs;

  const weightKg = unitSystem === 'imperial' ? weight * 0.453592 : weight;
  const heightCm = (unitSystem === 'imperial' && height) ? height * 2.54 : height;

  // 1. LBM & BMR
  const lbm = weightKg * (1 - bodyFat / 100);
  let bmr: number;
  let formulaUsed: 'Katch-McArdle' | 'Mifflin-St Jeor';

  if (age && heightCm) {
    bmr = (gender === 'male') 
      ? (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5
      : (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
    formulaUsed = 'Mifflin-St Jeor';
  } else {
    bmr = 370 + (21.6 * lbm);
    formulaUsed = 'Katch-McArdle';
  }

  // 2. TDEE
  const tdee = bmr * ACTIVITY_MULTIPLIERS[activityLevel];

  // 3. Target Calories
  let targetCalories: number;
  const warnings: string[] = [];
  let safetyLevel: 'OPTIMAL' | 'CAUTION' | 'CRITICAL' = 'OPTIMAL';

  if ((goal === 'cut' || goal === 'bulk') && weeklyRate) {
    const calorieAdjustmentPerDay = unitSystem === 'metric' 
      ? weeklyRate * 1100 
      : weeklyRate * 500; // rough estimate for imperial lbs
    
    if (goal === 'cut') {
      targetCalories = tdee - calorieAdjustmentPerDay;
    } else {
      targetCalories = tdee + calorieAdjustmentPerDay;
    }
  } else {
    targetCalories = tdee * GOAL_MULTIPLIERS[goal];
  }

  // Safety Floors
  const floor = gender === 'male' ? 1500 : 1200;
  if (targetCalories < floor) {
    warnings.push(`Metabolic Alert: Calories below ${floor} safety floor. Clamped.`);
    targetCalories = floor;
    safetyLevel = 'CRITICAL';
  } else if (targetCalories < floor + 200) {
    safetyLevel = 'CAUTION';
  }

  // 4. Macros
  let proteinMultiplier = (goal === 'cut' || goal === 'bulk') ? 2.2 : PROTEIN_MULTIPLIERS[activityLevel];
  const proteinG = weightKg * proteinMultiplier;
  const proteinCalories = proteinG * 4;

  let fatG = Math.max(0.6 * weightKg, (targetCalories * 0.25) / 9);
  const fatCalories = fatG * 9;

  let carbsCalories = targetCalories - (proteinCalories + fatCalories);
  let carbsG = Math.max(0, carbsCalories / 4);

  const proteinPct = Math.round((proteinCalories / targetCalories) * 100);
  const fatPct = Math.round((fatCalories / targetCalories) * 100);
  const carbsPct = 100 - proteinPct - fatPct;

  // 5. Milestones & Projections
  const milestones: Milestone[] = [];
  const rate = weeklyRate || (goal === 'bulk' ? 0.25 : 0.5);

  if (goal === 'cut') {
    // Abs visibility logic
    const abThreshold = gender === 'male' ? 12 : 20;
    if (bodyFat > abThreshold) {
      const weightAtAbs = lbm / (1 - abThreshold / 100);
      const diff = weightKg - (unitSystem === 'imperial' ? weightAtAbs / 0.453592 : weightAtAbs);
      const weeksToAbs = Math.max(0, diff / rate);
      milestones.push({
        label: "CORE DEFINITION",
        weeks: Math.ceil(weeksToAbs),
        description: `Visual abdominal separation projected at ~${abThreshold}% Body Fat.`,
        icon: "fa-shield-halved"
      });
    }
    
    // Paper thin skin / Vascularity
    const leanThreshold = gender === 'male' ? 8 : 16;
    if (bodyFat > leanThreshold) {
      const weightAtLean = lbm / (1 - leanThreshold / 100);
      const diff = weightKg - (unitSystem === 'imperial' ? weightAtLean / 0.453592 : weightAtLean);
      const weeksToLean = Math.max(0, diff / rate);
      milestones.push({
        label: "PEAK VASCULARITY",
        weeks: Math.ceil(weeksToLean),
        description: `Subcutaneous water reduction and vein visibility peak at ${leanThreshold}%.`,
        icon: "fa-bolt"
      });
    }
  } else if (goal === 'bulk') {
    // Mass Thresholds
    const massGain = unitSystem === 'metric' ? 5 : 10;
    milestones.push({
      label: `+${massGain}${unitSystem === 'metric' ? 'KG' : 'LB'} BENCHMARK`,
      weeks: Math.ceil(massGain / rate),
      description: "Significant hypertrophy crossover. Size increase becomes visible in clothing.",
      icon: "fa-dumbbell"
    });
    milestones.push({
      label: "STRENGTH PLATEAU OVERRIDE",
      weeks: Math.ceil((massGain * 2) / rate),
      description: "Neural adaptation and mass gain synergy. Expect multi-rep PRs across compound lifts.",
      icon: "fa-gauge-high"
    });
  }

  // 6. Timeline Formatting
  let monthsToTarget: string | undefined;
  let expectedChangeText = "";

  if ((goal === 'cut' || goal === 'bulk') && targetWeight && weeklyRate) {
    const totalWeightDiff = Math.abs(weight - targetWeight);
    const weeks = totalWeightDiff / weeklyRate;
    const monthsValue = (weeks / 4.345);
    monthsToTarget = `${monthsValue.toFixed(1)} MONTHS / ${Math.ceil(weeks)} WEEKS`;
    expectedChangeText = `${goal === 'bulk' ? '+' : '-'}${weeklyRate} ${unitSystem === 'metric' ? 'kg' : 'lb'}/wk`;
  } else {
    expectedChangeText = goal === 'bulk' ? `+0.25% bodyweight/wk` : 
                        goal === 'cut' ? `-0.5% bodyweight/wk` : "Maintenance";
  }

  return {
    calories: Math.round(targetCalories),
    proteinG: Math.round(proteinG),
    proteinPct,
    carbsG: Math.round(carbsG),
    carbsPct: Math.max(0, carbsPct),
    fatG: Math.round(fatG),
    fatPct,
    fiberG: Math.max(20, Math.round(14 * (targetCalories / 1000))),
    lbm: Math.round(lbm),
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    formulaUsed,
    expectedWeightChange: expectedChangeText,
    warnings,
    monthsToTarget,
    safetyLevel,
    milestones
  };
};
