import { UserInputs, CalculationResults } from '../types';

export interface GoogleSheetsConfig {
  scriptUrl: string;
  enabled: boolean;
}

// Configuration - You'll need to replace this with your Google Apps Script URL
const GOOGLE_SHEETS_CONFIG: GoogleSheetsConfig = {
  scriptUrl: 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE', // Replace with actual URL
  enabled: true // Set to false to disable Google Sheets integration
};

export interface SheetRowData {
  timestamp: string;
  sessionId: string;
  name: string;
  email?: string;
  age?: number;
  gender: string;
  weight: number;
  height?: number;
  bodyFat: number;
  unitSystem: string;
  activityLevel: string;
  goal: string;
  targetWeight?: number;
  weeklyRate?: number;
  calories: number;
  proteinG: number;
  proteinPct: number;
  carbsG: number;
  carbsPct: number;
  fatG: number;
  fatPct: number;
  fiberG: number;
  waterLiters: number;
  lbm: number;
  bmr: number;
  tdee: number;
  formulaUsed: string;
  expectedWeightChange: string;
  safetyLevel: string;
  monthsToTarget?: string;
  milestoneCount: number;
  userAgent: string;
  ipAddress?: string;
  referrer: string;
}

export class GoogleSheetsService {
  
  static async saveToGoogleSheets(
    inputs: UserInputs, 
    results: CalculationResults, 
    sessionId: string
  ): Promise<boolean> {
    
    if (!GOOGLE_SHEETS_CONFIG.enabled || !GOOGLE_SHEETS_CONFIG.scriptUrl) {
      console.log('📊 Google Sheets integration disabled or not configured');
      return false;
    }

    if (GOOGLE_SHEETS_CONFIG.scriptUrl === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
      console.warn('⚠️ Google Sheets URL not configured. Please update GOOGLE_SHEETS_CONFIG.scriptUrl');
      return false;
    }

    console.log('📤 Sending data to Google Sheets...', {
      sessionId,
      user: inputs.name,
      url: GOOGLE_SHEETS_CONFIG.scriptUrl
    });

    try {
      const rowData: SheetRowData = {
        timestamp: new Date().toISOString(),
        sessionId: sessionId,
        name: inputs.name,
        age: inputs.age,
        gender: inputs.gender,
        weight: inputs.weight,
        height: inputs.height,
        bodyFat: inputs.bodyFat,
        unitSystem: inputs.unitSystem,
        activityLevel: inputs.activityLevel,
        goal: inputs.goal,
        targetWeight: inputs.targetWeight,
        weeklyRate: inputs.weeklyRate,
        calories: results.calories,
        proteinG: results.proteinG,
        proteinPct: results.proteinPct,
        carbsG: results.carbsG,
        carbsPct: results.carbsPct,
        fatG: results.fatG,
        fatPct: results.fatPct,
        fiberG: results.fiberG,
        waterLiters: results.waterLiters,
        lbm: results.lbm,
        bmr: results.bmr,
        tdee: results.tdee,
        formulaUsed: results.formulaUsed,
        expectedWeightChange: results.expectedWeightChange,
        safetyLevel: results.safetyLevel,
        monthsToTarget: results.monthsToTarget,
        milestoneCount: results.milestones.length,
        userAgent: navigator.userAgent,
        referrer: document.referrer || 'Direct'
      };

      console.log('📋 Data payload:', rowData);

      const response = await fetch(GOOGLE_SHEETS_CONFIG.scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rowData),
        mode: 'no-cors' // Required for Google Apps Script
      });

      // Note: With no-cors mode, we can't read the response
      // But the request will still be sent to Google Sheets
      console.log('✅ Data sent to Google Sheets successfully');
      
      // Store success in localStorage for debugging
      const debugInfo = {
        lastSent: new Date().toISOString(),
        sessionId: sessionId,
        userName: inputs.name,
        status: 'sent'
      };
      localStorage.setItem('caltrak_sheets_debug', JSON.stringify(debugInfo));
      
      return true;

    } catch (error) {
      console.error('❌ Failed to save to Google Sheets:', error);
      
      // Store error info for debugging
      const debugInfo = {
        lastError: new Date().toISOString(),
        sessionId: sessionId,
        error: error.toString(),
        status: 'failed'
      };
      localStorage.setItem('caltrak_sheets_debug', JSON.stringify(debugInfo));
      
      return false;
    }
  }

  // Method to update the Google Sheets URL configuration
  static updateConfig(scriptUrl: string, enabled: boolean = true) {
    GOOGLE_SHEETS_CONFIG.scriptUrl = scriptUrl;
    GOOGLE_SHEETS_CONFIG.enabled = enabled;
    console.log('Google Sheets configuration updated:', GOOGLE_SHEETS_CONFIG);
  }

  // Method to test the connection
  static async testConnection(): Promise<boolean> {
    if (!GOOGLE_SHEETS_CONFIG.enabled || !GOOGLE_SHEETS_CONFIG.scriptUrl) {
      console.error('Google Sheets not configured');
      return false;
    }

    try {
      const testData = {
        test: true,
        timestamp: new Date().toISOString(),
        message: 'Connection test from CalTrak'
      };

      console.log('🧪 Testing Google Sheets connection...', GOOGLE_SHEETS_CONFIG.scriptUrl);

      await fetch(GOOGLE_SHEETS_CONFIG.scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
        mode: 'no-cors'
      });

      console.log('✅ Test connection sent to Google Sheets');
      return true;
    } catch (error) {
      console.error('❌ Google Sheets connection test failed:', error);
      return false;
    }
  }

  // Method to get debug information
  static getDebugInfo() {
    try {
      const debugInfo = localStorage.getItem('caltrak_sheets_debug');
      return debugInfo ? JSON.parse(debugInfo) : null;
    } catch (error) {
      return null;
    }
  }

  // Method to clear debug information
  static clearDebugInfo() {
    localStorage.removeItem('caltrak_sheets_debug');
  }
}

// Expose configuration methods to window for easy setup
declare global {
  interface Window {
    CalTrakSheets: {
      updateConfig: (scriptUrl: string, enabled?: boolean) => void;
      testConnection: () => Promise<boolean>;
      getConfig: () => GoogleSheetsConfig;
    };
  }
}

// Expose configuration methods to window for easy setup (only if authenticated)
if (typeof window !== 'undefined') {
  const exposeSheetsConfig = () => {
    if (typeof (window as any).CalTrakAuth !== 'undefined') {
      const AuthService = (window as any).CalTrakAuth;
      if (AuthService.isAuthenticated()) {
        window.CalTrakSheets = {
          updateConfig: GoogleSheetsService.updateConfig,
          testConnection: GoogleSheetsService.testConnection,
          getConfig: () => ({ ...GOOGLE_SHEETS_CONFIG }),
          getDebugInfo: GoogleSheetsService.getDebugInfo,
          clearDebugInfo: GoogleSheetsService.clearDebugInfo
        };
      } else {
        // Remove access if not authenticated
        delete (window as any).CalTrakSheets;
      }
    }
  };

  // Check authentication status periodically
  setInterval(exposeSheetsConfig, 5000);
  
  // Initial check
  setTimeout(exposeSheetsConfig, 1000);
}