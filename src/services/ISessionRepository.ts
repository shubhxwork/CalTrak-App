import type { UserInputs, CalculationResults } from '../../types';
import type { UserSession, UserData } from '../services/LocalSessionRepository';

/**
 * ISessionRepository — Interface (Dependency Inversion Principle)
 *
 * SessionController depends on this interface, not on LocalSessionRepository.
 * This means we can swap localStorage for IndexedDB, SQLite, or a mock
 * in tests without touching the controller.
 */
export interface ISessionRepository {
  save(inputs: UserInputs, results: CalculationResults): string;
  getAll(): UserSession[];
  getData(): UserData;
  clear(): void;
}
