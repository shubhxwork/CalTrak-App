import type { ISessionRepository } from './ISessionRepository';
import type { UserInputs, CalculationResults } from '../../types';

export interface UserSession {
  id: string;
  timestamp: number;
  inputs: UserInputs;
  results: CalculationResults;
}

export interface UserData {
  sessions: UserSession[];
  totalSessions: number;
  lastAccessed: number;
}

const STORAGE_KEY = 'caltrak_user_data';
const MAX_SESSIONS = 50;

/**
 * LocalSessionRepository — Concrete implementation of ISessionRepository
 *
 * Wraps localStorage. All localStorage access is isolated here.
 * Nothing else in the app touches localStorage for session data.
 *
 * SRP: Only reads/writes session data to localStorage.
 */
export class LocalSessionRepository implements ISessionRepository {

  save(inputs: UserInputs, results: CalculationResults): string {
    const sessionId = this.generateId();
    const data      = this.getData();

    data.sessions.push({ id: sessionId, timestamp: Date.now(), inputs, results });
    data.totalSessions++;
    data.lastAccessed = Date.now();

    if (data.sessions.length > MAX_SESSIONS) {
      data.sessions = data.sessions.slice(-MAX_SESSIONS);
    }

    this.persist(data);
    localStorage.setItem('lastSessionId', sessionId);
    return sessionId;
  }

  getAll(): UserSession[] {
    return this.getData().sessions;
  }

  getData(): UserData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as UserData;
    } catch { /* fall through */ }
    return { sessions: [], totalSessions: 0, lastAccessed: Date.now() };
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  private persist(data: UserData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('[LocalSessionRepository] persist failed:', err);
    }
  }

  private generateId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }
}
