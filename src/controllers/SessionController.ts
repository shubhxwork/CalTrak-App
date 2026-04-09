import type { ISessionRepository } from '../services/ISessionRepository';
import type { IRemoteSessionService } from '../services/IRemoteSessionService';
import type { UserInputs, CalculationResults } from '../../types';

/**
 * SessionController — Orchestration Layer
 *
 * Coordinates saving a session to local storage, the remote backend,
 * and Google Sheets. Previously this logic was split across App.tsx
 * (calling DataService directly) and DataService itself (calling
 * BackendService and GoogleSheetsService inline).
 *
 * SRP:  Only orchestrates session persistence. No UI, no calculations.
 * DIP:  Depends on interfaces (ISessionRepository, IRemoteSessionService),
 *       not on concrete implementations. Implementations are injected.
 *
 * This makes the controller fully testable — swap real services for mocks.
 */
export class SessionController {
  constructor(
    private readonly localRepo: ISessionRepository,
    private readonly remoteServices: IRemoteSessionService[]
  ) {}

  /**
   * Persist a completed calculation session everywhere.
   * Returns the local session ID immediately; remote saves are fire-and-forget.
   */
  async save(inputs: UserInputs, results: CalculationResults): Promise<string> {
    // 1. Local save is synchronous and always succeeds
    const sessionId = this.localRepo.save(inputs, results);

    // 2. Remote saves are async and non-blocking — failures don't affect the user
    for (const remote of this.remoteServices) {
      remote.save(inputs, results, sessionId).catch((err) => {
        console.warn(`[SessionController] Remote save failed (${remote.name}):`, err);
      });
    }

    return sessionId;
  }
}
