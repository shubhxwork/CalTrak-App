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
    console.log('=== CalTrak Data Request Received ===');
    console.log('Event object:', e);
    console.log('Event keys:', Object.keys(e || {}));
    
    // Check if we have postData
    if (!e || !e.postData) {
      console.error('No postData found in request');
      console.log('Request method might be GET instead of POST');
      
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false, 
          error: 'No POST data received. Ensure request is sent as POST with JSON body.'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    console.log('POST data contents:', e.postData.contents);
    console.log('POST data type:', e.postData.type);
    
    // Parse the incoming data
    let data;
    try {
      data = JSON.parse(e.postData.contents);
      console.log('Parsed data successfully:', data);
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError);
      console.log('Raw contents:', e.postData.contents);
      
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false, 
          error: 'Invalid JSON data: ' + parseError.toString()
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Handle test connections
    if (data.test) {
      console.log('Test connection received:', data.message);
      return ContentService
        .createTextOutput(JSON.stringify({success: true, message: 'Test successful'}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Validate required data fields
    if (!data.name || !data.calories) {
      console.error('Missing required fields:', {
        hasName: !!data.name,
        hasCalories: !!data.calories
      });
      
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false, 
          error: 'Missing required fields: name and calories are required'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    console.log('Processing data for user:', data.name);
    
    // Get or create the spreadsheet
    let spreadsheet;
    try {
      spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
      console.log('Spreadsheet opened successfully:', spreadsheet.getName());
    } catch (spreadsheetError) {
      console.error('Failed to open spreadsheet:', spreadsheetError);
      console.log('Spreadsheet ID used:', SPREADSHEET_ID);
      
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false, 
          error: 'Failed to access spreadsheet. Check SPREADSHEET_ID: ' + spreadsheetError.toString()
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    // Create sheet if it doesn't exist
    if (!sheet) {
      console.log('Creating new sheet:', SHEET_NAME);
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
      
      console.log('Sheet created and formatted successfully');
    }
    
    // Prepare row data with safe defaults
    const rowData = [
      data.timestamp || new Date().toISOString(),
      data.sessionId || 'unknown',
      data.name || 'Unknown User',
      data.age || '',
      data.gender || 'unknown',
      data.weight || 0,
      data.height || '',
      data.bodyFat || 0,
      data.unitSystem || 'metric',
      data.activityLevel || 'moderate',
      data.goal || 'maintenance',
      data.targetWeight || '',
      data.weeklyRate || '',
      data.calories || 0,
      data.proteinG || 0,
      data.proteinPct || 0,
      data.carbsG || 0,
      data.carbsPct || 0,
      data.fatG || 0,
      data.fatPct || 0,
      data.fiberG || 0,
      data.waterLiters || 0,
      data.lbm || 0,
      data.bmr || 0,
      data.tdee || 0,
      data.formulaUsed || 'Unknown',
      data.expectedWeightChange || '',
      data.safetyLevel || 'UNKNOWN',
      data.monthsToTarget || '',
      data.milestoneCount || 0,
      data.userAgent || 'Unknown Browser',
      data.referrer || 'Direct'
    ];
    
    console.log('Row data prepared, adding to sheet...');
    
    // Add the data to the sheet
    try {
      sheet.appendRow(rowData);
      const lastRow = sheet.getLastRow();
      console.log('Data added successfully to row:', lastRow);
      
      // Optional: Add conditional formatting for safety levels
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
        
    } catch (appendError) {
      console.error('Failed to append data to sheet:', appendError);
      
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false, 
          error: 'Failed to save data to sheet: ' + appendError.toString()
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
      
  } catch (error) {
    console.error('Unexpected error in doPost:', error);
    console.error('Error stack:', error.stack);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false, 
        error: 'Unexpected server error: ' + error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  console.log('=== GET Request Received ===');
  console.log('Parameters:', e.parameter);
  
  // Handle GET requests (for testing)
  return ContentService
    .createTextOutput(JSON.stringify({
      message: 'CalTrak Google Sheets Integration is running!',
      timestamp: new Date().toISOString(),
      method: 'GET',
      note: 'Use POST requests to send data'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Helper function to create a new spreadsheet (run this once if needed)
function createNewSpreadsheet() {
  const spreadsheet = SpreadsheetApp.create('CalTrak User Data');
  console.log('Created spreadsheet with ID:', spreadsheet.getId());
  console.log('Spreadsheet URL:', spreadsheet.getUrl());
  return spreadsheet.getId();
}