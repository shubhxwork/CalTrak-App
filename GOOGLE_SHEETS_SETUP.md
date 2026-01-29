# Google Sheets Integration Setup Guide

This guide will help you set up automatic data collection to Google Sheets for CalTrak.

## Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Name it "CalTrak User Data" (or any name you prefer)
4. Copy the **Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
   ```

## Step 2: Set up Google Apps Script

1. Go to [Google Apps Script](https://script.google.com)
2. Click "New Project"
3. Replace the default `Code.gs` content with the code from `google-apps-script/Code.gs`
4. Update the `SPREADSHEET_ID` variable with your sheet ID:
   ```javascript
   const SPREADSHEET_ID = 'your_actual_spreadsheet_id_here';
   ```

## Step 3: Deploy the Web App

1. In Google Apps Script, click "Deploy" → "New deployment"
2. Choose type: "Web app"
3. Set execute as: "Me"
4. Set access: "Anyone" (required for the app to send data)
5. Click "Deploy"
6. Copy the **Web app URL** (it will look like: `https://script.google.com/macros/s/...../exec`)

## Step 4: Configure CalTrak

**Option 1: Using Data Panel (Recommended)**
1. Open the CalTrak app
2. Press `Cmd+Shift+D` (Mac) or `Ctrl+Shift+D` (Windows) to open the data panel
3. Click on the "Google Sheets" tab
4. Click "Configure" and enter your web app URL
5. Click "Test" to verify the connection

**Option 2: Using Browser Console**
1. Open your browser's developer console on the CalTrak app
2. Run this command with your web app URL:
   ```javascript
   window.CalTrakSheets.updateConfig('YOUR_WEB_APP_URL_HERE', true);
   ```

## Step 5: Test the Integration

**Using Data Panel:**
- Click "Test" button in the Google Sheets tab

**Using Console:**
1. Test the connection:
   ```javascript
   window.CalTrakSheets.testConnection();
   ```
2. Use the CalTrak app to create a calculation
3. Check your Google Sheet - you should see the data appear automatically!

## Data Structure

The Google Sheet will automatically create columns for:

### User Information
- Timestamp, Session ID, Name, Age, Gender
- Weight, Height, Body Fat %, Unit System
- Activity Level, Goal, Target Weight, Weekly Rate

### Calculation Results
- Calories, Protein (g & %), Carbs (g & %), Fat (g & %)
- Fiber, Water Intake, Lean Body Mass
- BMR, TDEE, Formula Used
- Expected Weight Change, Safety Level
- Months to Target, Milestone Count

### Technical Data
- User Agent, Referrer

## Troubleshooting

### Common Issues:

1. **"Permission denied" error**
   - Make sure the web app is deployed with "Anyone" access
   - Re-deploy the web app if you made changes

2. **Data not appearing**
   - Check the browser console for error messages
   - Verify the web app URL is correct
   - Test the connection using `window.CalTrakSheets.testConnection()`

3. **Sheet not found**
   - Verify the SPREADSHEET_ID is correct
   - Make sure you have edit access to the sheet

### Console Commands:

```javascript
// Check current configuration
window.CalTrakSheets.getConfig();

// Update configuration
window.CalTrakSheets.updateConfig('new_url_here', true);

// Test connection
window.CalTrakSheets.testConnection();

// Disable Google Sheets (keeps local storage)
window.CalTrakSheets.updateConfig('', false);
```

## Privacy & Security

- Data is sent directly from the user's browser to your Google Sheet
- No intermediate servers are involved
- You control the Google Sheet and Apps Script
- Users' data is also saved locally in their browser
- Consider adding a privacy notice to inform users about data collection

## Data Analysis

Once data is flowing to Google Sheets, you can:

- Create charts and pivot tables for user analytics
- Export data for external analysis tools
- Set up automated reports and dashboards
- Track user trends and popular goals
- Monitor app usage patterns

## Advanced Features

### Automatic Backups
Set up Google Apps Script triggers to automatically backup your data.

### Data Validation
Add data validation rules to ensure data quality.

### Real-time Dashboards
Connect Google Data Studio for real-time analytics dashboards.

### Email Notifications
Set up email alerts for new user registrations or specific goals.

---

**Important**: Keep your Google Apps Script web app URL secure and don't share it publicly, as it allows writing to your spreadsheet.