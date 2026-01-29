# Google Sheets Troubleshooting Guide

If your Google Sheet is empty after configuration, follow this step-by-step debugging process.

## Quick Diagnostic Checklist

### 1. Verify Configuration
```javascript
// Run in browser console (after admin login)
window.CalTrakSheets.getConfig();
```

**Expected Output:**
```javascript
{
  scriptUrl: "https://script.google.com/macros/s/.../exec",
  enabled: true
}
```

### 2. Test Connection
```javascript
window.CalTrakSheets.testConnection();
```

### 3. Check Browser Console
- Open Developer Tools (F12)
- Go to Console tab
- Look for error messages when using the calculator

## Common Issues & Solutions

### Issue 1: Google Apps Script Not Deployed Correctly

**Symptoms:**
- Connection test fails
- No data appears in sheet
- Console shows network errors

**Solution:**
1. Go to [Google Apps Script](https://script.google.com)
2. Open your project
3. Click "Deploy" → "Manage deployments"
4. Verify deployment settings:
   - Type: Web app
   - Execute as: Me
   - Who has access: **Anyone** (This is crucial!)
5. If settings are wrong, create a new deployment

### Issue 2: Wrong Spreadsheet ID

**Symptoms:**
- Apps Script runs but no data appears
- Script execution logs show "Spreadsheet not found"

**Solution:**
1. Open your Google Sheet
2. Copy the ID from URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit`
3. Update the ID in your Apps Script:
   ```javascript
   const SPREADSHEET_ID = 'your_actual_spreadsheet_id_here';
   ```
4. Save and redeploy

### Issue 3: CORS/Network Issues

**Symptoms:**
- Console shows CORS errors
- Network requests fail

**Solution:**
This is normal with `no-cors` mode. The data is still being sent, but we can't read the response.

### Issue 4: CalTrak Not Sending Data

**Symptoms:**
- No network requests in browser dev tools
- No console logs about data being sent

**Solution:**
Check if Google Sheets integration is properly configured:
```javascript
// Should show data being sent
console.log('Checking data flow...');
```

## Step-by-Step Debugging

### Step 1: Verify Apps Script Setup

1. **Check your Apps Script code:**
   - Ensure `SPREADSHEET_ID` is correct
   - Verify the code matches the provided template

2. **Test the script directly:**
   ```javascript
   // Add this to your Apps Script for testing
   function testScript() {
     console.log('Script is working');
     console.log('Spreadsheet ID:', SPREADSHEET_ID);
     
     try {
       const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
       console.log('Spreadsheet found:', spreadsheet.getName());
     } catch (error) {
       console.error('Spreadsheet error:', error);
     }
   }
   ```

3. **Run the test function:**
   - Click "Run" button in Apps Script
   - Check execution logs for errors

### Step 2: Verify Deployment

1. **Check deployment URL:**
   - Copy the web app URL
   - It should end with `/exec` not `/dev`

2. **Test deployment directly:**
   - Visit the URL in browser
   - Should show: "CalTrak Google Sheets Integration is running!"

### Step 3: Debug CalTrak Integration

1. **Enable detailed logging:**
   ```javascript
   // Add to browser console
   window.addEventListener('beforeunload', () => {
     console.log('Page unloading - check if data was sent');
   });
   ```

2. **Monitor network requests:**
   - Open Dev Tools → Network tab
   - Use CalTrak calculator
   - Look for requests to `script.google.com`

### Step 4: Test with Manual Data

Add this test function to your Apps Script:

```javascript
function manualTest() {
  const testData = {
    timestamp: new Date().toISOString(),
    sessionId: 'test-session-123',
    name: 'Test User',
    gender: 'male',
    weight: 70,
    bodyFat: 15,
    unitSystem: 'metric',
    activityLevel: 'moderate',
    goal: 'cut',
    calories: 2000,
    proteinG: 150,
    proteinPct: 30,
    carbsG: 200,
    carbsPct: 40,
    fatG: 67,
    fatPct: 30,
    fiberG: 25,
    waterLiters: 2.5,
    lbm: 60,
    bmr: 1800,
    tdee: 2200,
    formulaUsed: 'Katch-McArdle',
    expectedWeightChange: '-0.5kg/wk',
    safetyLevel: 'OPTIMAL',
    milestoneCount: 2,
    userAgent: 'Test Browser',
    referrer: 'Manual Test'
  };
  
  // Simulate the doPost function
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  return doPost(mockEvent);
}
```

Run this function to test if data can be written to your sheet.

## Advanced Debugging

### Enable Apps Script Logging

Add detailed logging to your Apps Script:

```javascript
function doPost(e) {
  console.log('=== CalTrak Data Received ===');
  console.log('Raw data:', e.postData.contents);
  
  try {
    const data = JSON.parse(e.postData.contents);
    console.log('Parsed data:', data);
    console.log('User name:', data.name);
    console.log('Calories:', data.calories);
    
    // ... rest of your code
    
    console.log('Data saved successfully to row:', lastRow);
    
  } catch (error) {
    console.error('Error in doPost:', error);
    console.error('Error stack:', error.stack);
  }
}
```

### Check Execution Logs

1. In Apps Script, go to "Executions"
2. Look for recent executions
3. Click on executions to see detailed logs
4. Check for errors or successful completions

## Quick Fixes

### Fix 1: Reset Everything
```javascript
// In CalTrak console (after admin login)
window.CalTrakSheets.updateConfig('', false); // Disable
window.CalTrakSheets.updateConfig('YOUR_NEW_URL', true); // Re-enable
window.CalTrakSheets.testConnection();
```

### Fix 2: Force Data Send
```javascript
// Manually trigger data send (for testing)
// This requires modifying the code temporarily
```

### Fix 3: Check Permissions
1. In Google Sheets, ensure you have edit permissions
2. In Apps Script, check if authorization is required
3. Run the script manually once to authorize permissions

## Still Not Working?

### Contact Information Needed:
1. **Apps Script execution logs** (screenshot)
2. **Browser console errors** (screenshot)
3. **Network tab** showing requests to script.google.com
4. **CalTrak configuration** output from `getConfig()`

### Emergency Workaround:
If nothing works, you can manually export data:
```javascript
// Get all data as JSON
const data = window.CalTrakData.export();
console.log(data); // Copy this and manually import to sheets
```

## Prevention

### Best Practices:
1. **Test immediately** after setup
2. **Use test data** before real users
3. **Monitor regularly** for data flow
4. **Keep backups** of your Apps Script code
5. **Document your setup** for future reference