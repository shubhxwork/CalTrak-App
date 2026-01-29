/**
 * Quick Setup Script for Google Sheets Integration
 * 
 * Run this in the browser console after deploying your Google Apps Script
 * to quickly configure CalTrak to send data to your Google Sheet.
 */

console.log('🚀 CalTrak Google Sheets Setup');
console.log('================================');

// Check if CalTrak is loaded
if (typeof window.CalTrakSheets === 'undefined') {
  console.error('❌ CalTrak not found. Make sure you\'re on the CalTrak app page.');
} else {
  console.log('✅ CalTrak detected');
  
  // Show current configuration
  const currentConfig = window.CalTrakSheets.getConfig();
  console.log('📋 Current Configuration:', currentConfig);
  
  if (!currentConfig.enabled || currentConfig.scriptUrl === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
    console.log('⚠️  Google Sheets not configured yet');
    console.log('');
    console.log('📝 To configure:');
    console.log('1. Deploy your Google Apps Script as a web app');
    console.log('2. Copy the web app URL');
    console.log('3. Run: window.CalTrakSheets.updateConfig("YOUR_WEB_APP_URL", true)');
    console.log('4. Test: window.CalTrakSheets.testConnection()');
  } else {
    console.log('✅ Google Sheets is configured and enabled');
    console.log('');
    console.log('🧪 Test your connection:');
    console.log('window.CalTrakSheets.testConnection()');
  }
  
  console.log('');
  console.log('🔧 Available Commands:');
  console.log('- window.CalTrakSheets.getConfig()');
  console.log('- window.CalTrakSheets.updateConfig(url, enabled)');
  console.log('- window.CalTrakSheets.testConnection()');
  console.log('');
  console.log('⌨️  Keyboard Shortcut: Cmd+Shift+D (Mac) or Ctrl+Shift+D (Windows)');
  console.log('📖 For detailed setup instructions, see GOOGLE_SHEETS_SETUP.md');
}

// Helper function to set up with prompts
window.setupGoogleSheets = function() {
  const url = prompt('Enter your Google Apps Script web app URL:');
  if (url) {
    window.CalTrakSheets.updateConfig(url, true);
    console.log('✅ Configuration updated!');
    
    const test = confirm('Would you like to test the connection now?');
    if (test) {
      window.CalTrakSheets.testConnection().then(success => {
        if (success) {
          alert('✅ Connection test successful! Check your Google Sheet.');
        } else {
          alert('❌ Connection test failed. Check the console for details.');
        }
      });
    }
  }
};

console.log('💡 Quick setup: run setupGoogleSheets() for guided configuration');