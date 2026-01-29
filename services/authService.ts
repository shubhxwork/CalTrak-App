/**
 * Authentication service for developer/admin access
 * Controls access to data panel and developer features
 */

// Configuration - Update these for your security needs
const ADMIN_CONFIG = {
  // Set to true to require authentication for data panel access
  requireAuth: true,
  
  // Simple password protection (you can change this)
  adminPassword: 'shubh2910',
  
  // Session duration in milliseconds (24 hours)
  sessionDuration: 24 * 60 * 60 * 1000,
  
  // Local storage key for auth session
  authKey: 'caltrak_admin_session'
};

export interface AdminSession {
  authenticated: boolean;
  timestamp: number;
  expires: number;
}

export class AuthService {
  
  // Check if user is authenticated as admin
  static isAuthenticated(): boolean {
    if (!ADMIN_CONFIG.requireAuth) {
      return true; // If auth is disabled, always allow access
    }

    try {
      const sessionData = localStorage.getItem(ADMIN_CONFIG.authKey);
      if (!sessionData) return false;

      const session: AdminSession = JSON.parse(sessionData);
      
      // Check if session is still valid
      if (Date.now() > session.expires) {
        this.logout();
        return false;
      }

      return session.authenticated;
    } catch (error) {
      console.error('Auth check failed:', error);
      return false;
    }
  }

  // Authenticate user with password
  static authenticate(password: string): boolean {
    if (!ADMIN_CONFIG.requireAuth) {
      return true;
    }

    if (password === ADMIN_CONFIG.adminPassword) {
      const session: AdminSession = {
        authenticated: true,
        timestamp: Date.now(),
        expires: Date.now() + ADMIN_CONFIG.sessionDuration
      };

      localStorage.setItem(ADMIN_CONFIG.authKey, JSON.stringify(session));
      console.log('✅ Admin authenticated successfully');
      return true;
    }

    console.warn('❌ Invalid admin password');
    return false;
  }

  // Logout and clear session
  static logout(): void {
    localStorage.removeItem(ADMIN_CONFIG.authKey);
    console.log('🔓 Admin logged out');
  }

  // Get remaining session time in minutes
  static getSessionTimeRemaining(): number {
    if (!ADMIN_CONFIG.requireAuth) return Infinity;

    try {
      const sessionData = localStorage.getItem(ADMIN_CONFIG.authKey);
      if (!sessionData) return 0;

      const session: AdminSession = JSON.parse(sessionData);
      const remaining = session.expires - Date.now();
      return Math.max(0, Math.floor(remaining / (1000 * 60)));
    } catch (error) {
      return 0;
    }
  }

  // Update admin password (for security)
  static updatePassword(currentPassword: string, newPassword: string): boolean {
    if (currentPassword !== ADMIN_CONFIG.adminPassword) {
      console.warn('❌ Current password incorrect');
      return false;
    }

    ADMIN_CONFIG.adminPassword = newPassword;
    console.log('✅ Admin password updated');
    return true;
  }

  // Disable authentication (for development)
  static disableAuth(): void {
    ADMIN_CONFIG.requireAuth = false;
    console.log('⚠️ Authentication disabled - all users can access admin features');
  }

  // Enable authentication
  static enableAuth(): void {
    ADMIN_CONFIG.requireAuth = true;
    console.log('🔒 Authentication enabled - password required for admin access');
  }

  // Get auth configuration (without sensitive data)
  static getConfig() {
    return {
      requireAuth: ADMIN_CONFIG.requireAuth,
      sessionDuration: ADMIN_CONFIG.sessionDuration,
      isAuthenticated: this.isAuthenticated(),
      sessionTimeRemaining: this.getSessionTimeRemaining()
    };
  }
}

// Expose limited auth methods to window for admin use
declare global {
  interface Window {
    CalTrakAuth: {
      login: (password: string) => boolean;
      logout: () => void;
      isAuthenticated: () => boolean;
      getConfig: () => any;
      disableAuth: () => void;
      enableAuth: () => void;
    };
  }
}

if (typeof window !== 'undefined') {
  window.CalTrakAuth = {
    login: AuthService.authenticate,
    logout: AuthService.logout,
    isAuthenticated: AuthService.isAuthenticated,
    getConfig: AuthService.getConfig,
    disableAuth: AuthService.disableAuth,
    enableAuth: AuthService.enableAuth
  };
}