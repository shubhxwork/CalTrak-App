import { UserInputs, CalculationResults } from '../types';
import { GoogleSheetsService } from './googleSheetsService';

export interface UserSession {
  id: string;
  timestamp: number;
  inputs: UserInputs;
  results: CalculationResults;
  sessionDuration?: number;
}

export interface UserData {
  sessions: UserSession[];
  totalSessions: number;
  lastAccessed: number;
}

const STORAGE_KEY = 'caltrak_user_data';

export class DataService {
  
  // Save user session data
  static saveUserSession(inputs: UserInputs, results: CalculationResults): string {
    const sessionId = this.generateSessionId();
    const session: UserSession = {
      id: sessionId,
      timestamp: Date.now(),
      inputs,
      results
    };

    const userData = this.getUserData();
    userData.sessions.push(session);
    userData.totalSessions++;
    userData.lastAccessed = Date.now();

    // Keep only last 50 sessions to prevent storage bloat
    if (userData.sessions.length > 50) {
      userData.sessions = userData.sessions.slice(-50);
    }

    this.saveUserData(userData);
    
    // Save to Google Sheets asynchronously (don't block the UI)
    GoogleSheetsService.saveToGoogleSheets(inputs, results, sessionId)
      .then(success => {
        if (success) {
          console.log('✅ Data saved to Google Sheets:', sessionId);
        } else {
          console.log('⚠️ Google Sheets save failed for session:', sessionId);
        }
      })
      .catch(error => {
        console.error('❌ Google Sheets error:', error);
      });
    
    // Also log to console for developer access
    console.log('CalTrak Session Saved:', {
      sessionId,
      user: inputs.name,
      goal: inputs.goal,
      calories: results.calories,
      timestamp: new Date(session.timestamp).toISOString(),
      googleSheetsEnabled: true
    });

    return sessionId;
  }

  // Get all user data
  static getUserData(): UserData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Error reading user data:', error);
    }

    return {
      sessions: [],
      totalSessions: 0,
      lastAccessed: Date.now()
    };
  }

  // Save user data to localStorage
  private static saveUserData(userData: UserData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  }

  // Get user sessions for analytics
  static getUserSessions(): UserSession[] {
    return this.getUserData().sessions;
  }

  // Get user analytics
  static getUserAnalytics() {
    const userData = this.getUserData();
    const sessions = userData.sessions;

    if (sessions.length === 0) {
      return null;
    }

    const goals = sessions.map(s => s.inputs.goal);
    const weights = sessions.map(s => s.inputs.weight);
    const bodyFats = sessions.map(s => s.inputs.bodyFat);

    return {
      totalSessions: userData.totalSessions,
      firstSession: new Date(sessions[0]?.timestamp).toISOString(),
      lastSession: new Date(sessions[sessions.length - 1]?.timestamp).toISOString(),
      mostCommonGoal: this.getMostCommon(goals),
      averageWeight: this.getAverage(weights),
      averageBodyFat: this.getAverage(bodyFats),
      weightTrend: this.getTrend(weights),
      bodyFatTrend: this.getTrend(bodyFats),
      uniqueUsers: [...new Set(sessions.map(s => s.inputs.name))].length
    };
  }

  // Export user data for developer access
  static exportUserData(): string {
    const userData = this.getUserData();
    return JSON.stringify(userData, null, 2);
  }

  // Clear all user data
  static clearUserData(): void {
    localStorage.removeItem(STORAGE_KEY);
    console.log('CalTrak user data cleared');
  }

  // Generate unique session ID
  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Helper: Get most common value in array
  private static getMostCommon<T>(arr: T[]): T | null {
    if (arr.length === 0) return null;
    const counts = arr.reduce((acc, val) => {
      acc[val as string] = (acc[val as string] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b) as T;
  }

  // Helper: Get average of numbers
  private static getAverage(arr: number[]): number {
    return arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  }

  // Helper: Get trend (positive/negative/stable)
  private static getTrend(arr: number[]): 'increasing' | 'decreasing' | 'stable' | 'insufficient_data' {
    if (arr.length < 3) return 'insufficient_data';
    
    const recent = arr.slice(-3);
    const older = arr.slice(-6, -3);
    
    if (older.length === 0) return 'insufficient_data';
    
    const recentAvg = this.getAverage(recent);
    const olderAvg = this.getAverage(older);
    
    const diff = recentAvg - olderAvg;
    const threshold = olderAvg * 0.02; // 2% threshold
    
    if (diff > threshold) return 'increasing';
    if (diff < -threshold) return 'decreasing';
    return 'stable';
  }
}

// Developer console helpers
declare global {
  interface Window {
    CalTrakData: {
      export: () => string;
      analytics: () => any;
      sessions: () => UserSession[];
      clear: () => void;
    };
  }
}

// Expose data access methods to window for developer use
if (typeof window !== 'undefined') {
  window.CalTrakData = {
    export: () => DataService.exportUserData(),
    analytics: () => DataService.getUserAnalytics(),
    sessions: () => DataService.getUserSessions(),
    clear: () => DataService.clearUserData()
  };
}