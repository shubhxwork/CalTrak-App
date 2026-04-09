import { useCallback } from 'react';
import { useAppStore } from '../store/appStore';
import { nutritionController } from '../controllers/NutritionController';
import { UserProfile } from '../models/UserProfile';
import { sessionController } from '../bootstrap';
import type { UserInputs } from '../../types';

/**
 * useCalculation — Custom Hook
 *
 * Encapsulates the full "user submits form → calculate → save → navigate"
 * flow that previously lived inline in App.tsx's handleCalculate function.
 *
 * SRP:  Only orchestrates the calculation flow.
 * Components that use this hook are completely decoupled from the
 * NutritionController and SessionController implementations.
 */
export function useCalculation() {
  const { setCalculating, setSession } = useAppStore();

  const calculate = useCallback((inputs: UserInputs) => {
    setCalculating(true);

    // Simulate the immersive scan delay (existing UX behaviour preserved)
    setTimeout(async () => {
      const profile = UserProfile.fromInputs(inputs);
      const plan    = nutritionController.calculate(profile);
      const results = plan.toLegacyResults() as any;

      const sessionId = await sessionController.save(inputs, results);

      setSession(inputs, results, sessionId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1500);
  }, [setCalculating, setSession]);

  return { calculate };
}
