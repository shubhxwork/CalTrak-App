import { UserInputs, CalculationResults } from '../types';

// Backend configuration
const BACKEND_CONFIG = {
  // Use environment variable or fallback to localhost for development
  baseUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001',
  adminKey: import.meta.env.VITE_ADMIN_KEY || 'shubh2910-admin-key',
  enabled: true,
  type: 'mongodb' // 'file' or 'mongodb'
};

export interface BackendSession {
  id: string;
  timestamp: number;
  inputs: UserInputs;
  results: CalculationResults;
  metadata: {
    ip: string;
    userAgent: string;
    referrer: string;
    country: string;
    timestamp: string;
  };
}

export interface BackendAnalytics {
  totalSessions: number;
  uniqueUsers: number;
  firstSession: string;
  lastSession: string;
  mostCommonGoal: string;
  mostCommonCountry: string;
  genderDistribution: Record<string, number>;
  goalDistribution: Record<string, number>;
  averageWeight: number;
  averageBodyFat: number;
  sessionsLast24h: number;
  sessionsLast7days: number;
}

export class BackendService {
  
  // Save user session to backend
  static async saveSession(inputs: UserInputs, results: CalculationResults): Promise<string | null> {
    if (!BACKEND_CONFIG.enabled) {
      console.log('🔌 Backend service disabled');
      return null;
    }

    try {
      console.log('📤 Sending data to backend...', {
        user: inputs.name,
        url: `${BACKEND_CONFIG.baseUrl}/api/sessions`
      });

      const response = await fetch(`${BACKEND_CONFIG.baseUrl}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs,
          results
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Data saved to backend successfully:', data.sessionId);
        console.log(`📊 Total sessions: ${data.totalSessions}`);
        return data.sessionId;
      } else {
        throw new Error(data.error || 'Unknown error');
      }

    } catch (error) {
      console.error('❌ Failed to save to backend:', error);
      return null;
    }
  }

  // Get all sessions (admin only) with pagination
  static async getAllSessions(page: number = 1, limit: number = 50): Promise<{sessions: BackendSession[], pagination: any}> {
    try {
      const response = await fetch(`${BACKEND_CONFIG.baseUrl}/api/sessions?page=${page}&limit=${limit}`, {
        headers: {
          'X-Admin-Key': BACKEND_CONFIG.adminKey
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        sessions: data.sessions || [],
        pagination: data.pagination || {}
      };

    } catch (error) {
      console.error('❌ Failed to fetch sessions:', error);
      return { sessions: [], pagination: {} };
    }
  }

  // Get analytics (admin only)
  static async getAnalytics(): Promise<BackendAnalytics | null> {
    try {
      const response = await fetch(`${BACKEND_CONFIG.baseUrl}/api/analytics`, {
        headers: {
          'X-Admin-Key': BACKEND_CONFIG.adminKey
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error('❌ Failed to fetch analytics:', error);
      return null;
    }
  }

  // Export data as CSV (admin only)
  static async exportCSV(): Promise<void> {
    try {
      const response = await fetch(`${BACKEND_CONFIG.baseUrl}/api/export/csv`, {
        headers: {
          'X-Admin-Key': BACKEND_CONFIG.adminKey
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Create download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `caltrak-worldwide-data-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      console.log('✅ CSV export completed');

    } catch (error) {
      console.error('❌ Failed to export CSV:', error);
      throw error;
    }
  }

  // Test backend connection
  static async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${BACKEND_CONFIG.baseUrl}/health`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Backend connection successful:', data);
      return true;

    } catch (error) {
      console.error('❌ Backend connection failed:', error);
      return false;
    }
  }

  // Update backend configuration
  static updateConfig(baseUrl: string, adminKey?: string) {
    BACKEND_CONFIG.baseUrl = baseUrl;
    if (adminKey) {
      BACKEND_CONFIG.adminKey = adminKey;
    }
    console.log('🔧 Backend configuration updated:', {
      baseUrl: BACKEND_CONFIG.baseUrl,
      adminKey: BACKEND_CONFIG.adminKey.substring(0, 8) + '...'
    });
  }

  // Get current configuration
  static getConfig() {
    return {
      baseUrl: BACKEND_CONFIG.baseUrl,
      enabled: BACKEND_CONFIG.enabled,
      hasAdminKey: !!BACKEND_CONFIG.adminKey,
      type: BACKEND_CONFIG.type
    };
  }

  // Search sessions (MongoDB only)
  static async searchSessions(query: {
    q?: string;
    goal?: string;
    country?: string;
    safetyLevel?: string;
    limit?: number;
  }): Promise<BackendSession[]> {
    try {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });

      const response = await fetch(`${BACKEND_CONFIG.baseUrl}/api/search?${params}`, {
        headers: {
          'X-Admin-Key': BACKEND_CONFIG.adminKey
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.results || [];

    } catch (error) {
      console.error('❌ Failed to search sessions:', error);
      return [];
    }
  }

  // Get user-specific sessions (MongoDB only)
  static async getUserSessions(userName: string, limit: number = 10): Promise<BackendSession[]> {
    try {
      const response = await fetch(`${BACKEND_CONFIG.baseUrl}/api/users/${encodeURIComponent(userName)}/sessions?limit=${limit}`, {
        headers: {
          'X-Admin-Key': BACKEND_CONFIG.adminKey
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.sessions || [];

    } catch (error) {
      console.error('❌ Failed to fetch user sessions:', error);
      return [];
    }
  }

  // Enable/disable backend
  static setEnabled(enabled: boolean) {
    BACKEND_CONFIG.enabled = enabled;
    console.log(`🔌 Backend service ${enabled ? 'enabled' : 'disabled'}`);
  }
}

// Expose backend methods to window for admin use
declare global {
  interface Window {
    CalTrakBackend: {
      testConnection: () => Promise<boolean>;
      getAnalytics: () => Promise<BackendAnalytics | null>;
      getAllSessions: () => Promise<BackendSession[]>;
      exportCSV: () => Promise<void>;
      updateConfig: (baseUrl: string, adminKey?: string) => void;
      getConfig: () => any;
      setEnabled: (enabled: boolean) => void;
    };
  }
}

if (typeof window !== 'undefined') {
  // Only expose if user is authenticated
  const exposeBackendMethods = () => {
    if (typeof (window as any).CalTrakAuth !== 'undefined') {
      const AuthService = (window as any).CalTrakAuth;
      if (AuthService.isAuthenticated()) {
        window.CalTrakBackend = {
          testConnection: BackendService.testConnection,
          getAnalytics: BackendService.getAnalytics,
          getAllSessions: BackendService.getAllSessions,
          exportCSV: BackendService.exportCSV,
          updateConfig: BackendService.updateConfig,
          getConfig: BackendService.getConfig,
          setEnabled: BackendService.setEnabled
        };
      } else {
        // Remove access if not authenticated
        delete (window as any).CalTrakBackend;
      }
    }
  };

  // Check authentication status periodically
  setInterval(exposeBackendMethods, 5000);
  
  // Initial check
  setTimeout(exposeBackendMethods, 1000);
}