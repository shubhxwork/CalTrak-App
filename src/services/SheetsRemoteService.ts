import type { IRemoteSessionService } from './IRemoteSessionService';
import type { UserInputs, CalculationResults } from '../../types';
import { GoogleSheetsService } from '../../services/googleSheetsService';

/**
 * SheetsRemoteService — Adapter
 *
 * Wraps GoogleSheetsService to implement IRemoteSessionService.
 * OCP: Adding/removing this sink requires zero changes to SessionController.
 */
export class SheetsRemoteService implements IRemoteSessionService {
  readonly name = 'GoogleSheets';

  async save(inputs: UserInputs, results: CalculationResults, sessionId: string): Promise<void> {
    await GoogleSheetsService.saveToGoogleSheets(inputs, results, sessionId);
  }
}
