/**
 * bootstrap.ts — Dependency Injection Root
 *
 * This is the ONLY place where concrete implementations are wired together.
 * Everything else depends on interfaces or abstract classes.
 *
 * DIP in action:
 *   - SessionController doesn't know about LocalSessionRepository
 *   - SessionController doesn't know about MongoRemoteService
 *   - They are injected here, at the composition root
 *
 * To swap localStorage for IndexedDB: change one line here.
 * To add a new remote sink: add one line here.
 * Zero changes to controllers, hooks, or components.
 *
 * Factory Pattern: createSessionController() is a factory that assembles
 * the SessionController with its dependencies.
 */

import { SessionController }      from './controllers/SessionController';
import { LocalSessionRepository } from './services/LocalSessionRepository';
import { MongoRemoteService }     from './services/MongoRemoteService';
import { SheetsRemoteService }    from './services/SheetsRemoteService';

function createSessionController(): SessionController {
  const localRepo       = new LocalSessionRepository();
  const remoteServices  = [
    new MongoRemoteService(),
    new SheetsRemoteService(),
  ];
  return new SessionController(localRepo, remoteServices);
}

/** Singleton — created once, shared across the app */
export const sessionController = createSessionController();
