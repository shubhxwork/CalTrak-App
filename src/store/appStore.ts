import { create } from 'zustand';
import type { UserInputs, CalculationResults } from '../../types';

/**
 * appStore — Global State (Singleton Pattern via Zustand)
 *
 * Zustand's `create` returns a singleton store hook. The store is the
 * single source of truth for app-level state that was previously scattered
 * across App.tsx's useState calls.
 *
 * SRP:  Only manages UI-level state (active tab, modals, session data).
 *       Business logic stays in controllers.
 * Singleton: One store instance for the entire app.
 *
 * Before: App.tsx had 7 useState calls, passed everything as props.
 * After:  Any component reads/writes state directly — no prop drilling.
 */

export type Tab = 'home' | 'blueprint' | 'insights';

interface AppState {
  // Navigation
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;

  // Calculation session
  inputs:        UserInputs | null;
  results:       CalculationResults | null;
  sessionId:     string | null;
  isCalculating: boolean;

  setCalculating: (v: boolean) => void;
  setSession: (inputs: UserInputs, results: CalculationResults, sessionId: string) => void;
  clearSession: () => void;

  // Modal visibility
  showDataPanel:  boolean;
  showAdminLogin: boolean;
  showAboutUs:    boolean;

  openDataPanel:   () => void;
  closeDataPanel:  () => void;
  openAdminLogin:  () => void;
  closeAdminLogin: () => void;
  openAboutUs:     () => void;
  closeAboutUs:    () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Navigation
  activeTab:    'home',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Session
  inputs:        null,
  results:       null,
  sessionId:     null,
  isCalculating: false,

  setCalculating: (v) => set({ isCalculating: v }),

  setSession: (inputs, results, sessionId) =>
    set({ inputs, results, sessionId, activeTab: 'home', isCalculating: false }),

  clearSession: () =>
    set({ inputs: null, results: null, sessionId: null, activeTab: 'blueprint' }),

  // Modals
  showDataPanel:  false,
  showAdminLogin: false,
  showAboutUs:    false,

  openDataPanel:   () => set({ showDataPanel: true }),
  closeDataPanel:  () => set({ showDataPanel: false }),
  openAdminLogin:  () => set({ showAdminLogin: true }),
  closeAdminLogin: () => set({ showAdminLogin: false }),
  openAboutUs:     () => set({ showAboutUs: true }),
  closeAboutUs:    () => set({ showAboutUs: false }),
}));
