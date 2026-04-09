import type { IRemoteSessionService } from './IRemoteSessionService';
import type { UserInputs, CalculationResults } from '../../types';
import { BackendService } from '../../services/backendService';

/**
 * MongoRemoteService — Adapter
 *
 * Wraps the existing BackendService to implement IRemoteSessionService.
 * SessionController calls this through the interface — it never imports
 * BackendService directly.
 *
 * This is the Adapter pattern: adapts an existing API to a new interface.
 */
export class MongoRemoteService implements IRemoteSessionService {
  readonly name = 'MongoDB';

  async save(inputs: UserInputs, results: CalculationResults): Promise<void> {
    const id = await BackendService.saveSession(inputs, results);
    if (id) {
      console.log('[MongoRemoteService] saved:', id);
    }
  }
}
