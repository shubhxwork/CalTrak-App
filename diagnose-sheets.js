/**
 * Google Sheets Integration Diagnostic Script
 * 
 * Run this in the browser console to diagnose Google Sheets issues
 */

console.log('🔍 CalTrak Google Sheets Diagnostic');
console.log('===================================');

// Check if CalTrak is loaded
if (typeof window.CalTrakAuth === 'undefined') {
  console.error('❌ CalTrak not loaded. Make sure you\'re on the CalTrak app page.');
} else {
  console.log('✅ CalTrak detected');
  
  // Check authentication
  const isAuth = window.CalTrakAuth.isAuthenticated();
  console.log(`🔐 Authentication: ${isAuth ? '✅ Authenticated' : '❌ Not authenticated'}`);
  
  if (!isAuth) {
    console.log('⚠️  You need to login first. Run: window.CalTrakAuth.login("your_password")');
  } else {
    // Check Google Sheets configuration
    if (typeof window.CalTrakSheets !== 'undefined') {
      const config = window.CalTrakSheets.getConfig();
      console.log('📊 Google Sheets Config:', config);
      
      if (!config.enabled) {
        console.log('❌ Google Sheets is disabled');
      } else if (config.scriptUrl === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
        console.log('❌ Google Sheets URL not configured');
      } else {
        console.log('✅ Google Sheets appears to be configured');
        
        // Check debug info
        const debugInfo = window.CalTrakSheets.getDebugInfo();
        if (debugInfo) {
          console.log('🐛 Debug Info:', debugInfo);
          
          if (debugInfo.status === 'failed') {
            console.log('❌ Last attempt failed:', debugInfo.error);
          } else if (debugInfo.status === 'sent') {
            console.log('✅ Last data was sent successfully');
            console.log(`   User: ${debugInfo.userName}`);
            console.log(`   Time: ${debugInfo.lastSent}`);
          }
        } else {
          console.log('ℹ️  No debug info available (no data sent yet)');
        }
        
        // Test connection
        console.log('🧪 Testing connection...');
        window.CalTrakSheets.testConnection().then(success => {
          console.log(`🔗 Connection test: ${success ? '✅ Success' : '❌ Failed'}`);
        });
      }
    } else {
      console.log('❌ CalTrakSheets not available (authentication required)');
    }
  }
}

console.log('');
console.log('🛠️  Common Solutions:');
console.log('1. Verify Google Apps Script is deployed with "Anyone" access');
console.log('2. Check that SPREADSHEET_ID is correct in your Apps Script');
console.log('3. Ensure the web app URL ends with /exec not /dev');
console.log('4. Try using the calculator to generate test data');
console.log('5. Check Google Apps Script execution logs for errors');

console.log('');
console.log('📋 Quick Commands:');
console.log('- window.CalTrakAuth.login("password")');
console.log('- window.CalTrakSheets.getConfig()');
console.log('- window.CalTrakSheets.testConnection()');
console.log('- window.CalTrakSheets.getDebugInfo()');

// Helper function for manual testing
window.diagnoseSheetsIssue = function() {
  console.log('🔍 Running comprehensive diagnosis...');
  
  // Check all components
  const checks = {
    calTrakLoaded: typeof window.CalTrakAuth !== 'undefined',
    authenticated: window.CalTrakAuth?.isAuthenticated() || false,
    sheetsAvailable: typeof window.CalTrakSheets !== 'undefined',
    sheetsConfig: window.CalTrakSheets?.getConfig() || null,
    debugInfo: window.CalTrakSheets?.getDebugInfo() || null
  };
  
  console.table(checks);
  
  // Provide specific recommendations
  if (!checks.calTrakLoaded) {
    console.log('❌ CalTrak not loaded - refresh the page');
  } else if (!checks.authenticated) {
    console.log('❌ Not authenticated - run: window.CalTrakAuth.login("password")');
  } else if (!checks.sheetsAvailable) {
    console.log('❌ Sheets API not available - check authentication');
  } else if (!checks.sheetsConfig?.enabled) {
    console.log('❌ Sheets not enabled - configure first');
  } else if (checks.sheetsConfig?.scriptUrl === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
    console.log('❌ Sheets URL not set - configure with your Apps Script URL');
  } else {
    console.log('✅ Configuration looks good - try using the calculator');
    
    if (checks.debugInfo) {
      console.log('📊 Last activity:', checks.debugInfo);
    }
  }
  
  return checks;
};

console.log('💡 Run diagnoseSheetsIssue() for comprehensive diagnosis');