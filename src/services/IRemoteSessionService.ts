import type { UserInputs, CalculationResults } from '../../types';

/**
 * IRemoteSessionService — Interface (Dependency Inversion Principle)
 *
 * Any remote sink (MongoDB backend, Google Sheets, analytics) implements
 * this interface. SessionController doesn't know or care which ones exist.
 *
 * OCP: Add a new remote sink (e.g. Mixpanel) by creating a new class that
 *      implements this interface — zero changes to SessionController.
 */
export interface IRemoteSessionService {
  readonly name: string;
  save(inputs: UserInputs, results: CalculationResults, sessionId: string): Promise<void>;
}
