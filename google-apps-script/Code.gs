/**
 * CalTrak Google Sheets Integration
 * 
 * Instructions:
 * 1. Open Google Apps Script (script.google.com)
 * 2. Create a new project
 * 3. Replace the default code with this script
 * 4. Update SPREADSHEET_ID with your Google Sheet ID
 * 5. Deploy as web app with execute permissions for "Anyone"
 * 6. Copy the web app URL and update it in googleSheetsService.ts
 */

// Replace with your Google Sheet ID (found in the URL)
const SPREADSHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE';
const SHEET_NAME = 'CalTrak Data';

function doPost(e) {
  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Handle test connections
    if (data.test) {
      console.log('Test connection received:', data.message);
      return ContentService
        .createTextOutput(JSON.stringify({success: true, message: 'Test successful'}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get or create the spreadsheet
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      
      // Add headers
      const headers = [
        'Timestamp', 'Session ID', 'Name', 'Age', 'Gender', 'Weight', 'Height', 
        'Body Fat %', 'Unit System', 'Activity Level', 'Goal', 'Target Weight', 
        'Weekly Rate', 'Calories', 'Protein (g)', 'Protein %', 'Carbs (g)', 
        'Carbs %', 'Fat (g)', 'Fat %', 'Fiber (g)', 'Water (L)', 'LBM', 
        'BMR', 'TDEE', 'Formula Used', 'Expected Change', 'Safety Level', 
        'Months to Target', 'Milestone Count', 'User Agent', 'Referrer'
      ];
      
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // Format header row
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('white');
      headerRange.setFontWeight('bold');
      headerRange.setFontSize(10);
      
      // Freeze header row
      sheet.setFrozenRows(1);
      
      // Auto-resize columns
      sheet.autoResizeColumns(1, headers.length);
    }
    
    // Prepare row data
    const rowData = [
      data.timestamp,
      data.sessionId,
      data.name,
      data.age || '',
      data.gender,
      data.weight,
      data.height || '',
      data.bodyFat,
      data.unitSystem,
      data.activityLevel,
      data.goal,
      data.targetWeight || '',
      data.weeklyRate || '',
      data.calories,
      data.proteinG,
      data.proteinPct,
      data.carbsG,
      data.carbsPct,
      data.fatG,
      data.fatPct,
      data.fiberG,
      data.waterLiters,
      data.lbm,
      data.bmr,
      data.tdee,
      data.formulaUsed,
      data.expectedWeightChange,
      data.safetyLevel,
      data.monthsToTarget || '',
      data.milestoneCount,
      data.userAgent,
      data.referrer
    ];
    
    // Add the data to the sheet
    sheet.appendRow(rowData);
    
    // Optional: Add conditional formatting for safety levels
    const lastRow = sheet.getLastRow();
    const safetyCell = sheet.getRange(lastRow, 28); // Safety Level column
    
    if (data.safetyLevel === 'CRITICAL') {
      safetyCell.setBackground('#ffebee').setFontColor('#c62828');
    } else if (data.safetyLevel === 'CAUTION') {
      safetyCell.setBackground('#fff3e0').setFontColor('#ef6c00');
    } else {
      safetyCell.setBackground('#e8f5e8').setFontColor('#2e7d32');
    }
    
    console.log('Data saved successfully for user:', data.name);
    
    return ContentService
      .createTextOutput(JSON.stringify({success: true, row: lastRow}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error saving data:', error);
    
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  // Handle GET requests (for testing)
  return ContentService
    .createTextOutput('CalTrak Google Sheets Integration is running!')
    .setMimeType(ContentService.MimeType.TEXT);
}

// Helper function to create a new spreadsheet (run this once if needed)
function createNewSpreadsheet() {
  const spreadsheet = SpreadsheetApp.create('CalTrak User Data');
  console.log('Created spreadsheet with ID:', spreadsheet.getId());
  console.log('Spreadsheet URL:', spreadsheet.getUrl());
  return spreadsheet.getId();
}