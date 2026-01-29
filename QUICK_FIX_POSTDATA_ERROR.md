# Quick Fix: "Cannot read properties of undefined (reading 'postData')" Error

## The Problem
Your Google Apps Script is receiving a request without the expected `postData` property. This typically happens due to:

1. **Wrong deployment type** (deployed as library instead of web app)
2. **Incorrect access permissions** (not set to "Anyone")
3. **GET request instead of POST** (browser preflight or direct access)
4. **Malformed request** from CalTrak

## Immediate Fix Steps

### Step 1: Update Your Google Apps Script Code
Replace your entire `Code.gs` file with the improved version that includes better error handling:

```javascript
// The updated code is in google-apps-script/Code.gs
// It now handles missing postData gracefully
```

### Step 2: Verify Deployment Settings
1. Go to your Google Apps Script project
2. Click **Deploy** → **Manage deployments**
3. Verify these settings:
   - **Type**: Web app
   - **Execute as**: Me (your email)
   - **Who has access**: **Anyone** (This is crucial!)
4. If settings are wrong, create a **New deployment**

### Step 3: Test the Fixed Script
1. **Save** your updated script
2. **Deploy** (or redeploy if settings were wrong)
3. **Copy the new web app URL** (ends with `/exec`)
4. **Test in browser**: Visit the URL directly - should show JSON response

### Step 4: Update CalTrak Configuration
```javascript
// In CalTrak admin panel or console:
window.CalTrakSheets.updateConfig('YOUR_NEW_WEB_APP_URL', true);
window.CalTrakSheets.testConnection();
```

## What the Fix Does

### Enhanced Error Handling:
- ✅ Checks if `postData` exists before accessing it
- ✅ Provides detailed error messages
- ✅ Handles malformed JSON gracefully
- ✅ Validates required fields
- ✅ Logs all steps for debugging

### Better Request Handling:
- ✅ Handles both GET and POST requests
- ✅ Provides informative responses for GET requests
- ✅ Validates spreadsheet access
- ✅ Creates sheets with proper error handling

## Testing the Fix

### 1. Test Direct Access:
Visit your web app URL in browser - should see:
```json
{
  "message": "CalTrak Google Sheets Integration is running!",
  "timestamp": "2024-01-29T...",
  "method": "GET",
  "note": "Use POST requests to send data"
}
```

### 2. Test from CalTrak:
```javascript
// In admin console:
window.CalTrakSheets.testConnection();
// Should log: "✅ Test connection sent to Google Sheets"
```

### 3. Test with Real Data:
Use the CalTrak calculator - check console for:
```
📤 Sending data to Google Sheets...
📋 Data payload: {...}
🚀 Making request with options: {...}
✅ Request sent to Google Sheets
```

## Still Getting Errors?

### Check Apps Script Execution Logs:
1. In Google Apps Script, go to **Executions**
2. Look for recent executions
3. Click on failed executions to see detailed error logs

### Common Issues After Fix:

**"Spreadsheet not found":**
- Verify `SPREADSHEET_ID` in your script
- Ensure you have edit access to the sheet

**"Authorization required":**
- Run the script manually once to authorize permissions
- Check if you're signed into the correct Google account

**"Still no data in sheet":**
- Check if the sheet name matches `SHEET_NAME` in script
- Look for execution logs showing successful data saves

## Emergency Workaround

If nothing works, you can manually test with this function in your Apps Script:

```javascript
function manualTestData() {
  const testEvent = {
    postData: {
      contents: JSON.stringify({
        timestamp: new Date().toISOString(),
        sessionId: 'manual-test-123',
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
        userAgent: 'Manual Test',
        referrer: 'Direct'
      })
    }
  };
  
  return doPost(testEvent);
}
```

Run this function to test if data can be written to your sheet.

---

**The updated code should resolve the postData error and provide much better debugging information!**