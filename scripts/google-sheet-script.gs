/**
 * 1. Open your Google Sheet
 * 2. Go to "Extensions" > "Apps Script"
 * 3. Paste this code completely, replacing any existing code.
 * 4. Click "Deploy" > "New deployment"
 * 5. Select type: "Web app"
 * 6. Description: "i18n sync"
 * 7. Execute as: "Me"
 * 8. Who has access: "Anyone" (Important! So your script can access it without login)
 * 9. Click "Deploy"
 * 10. Copy the "Web App URL" and paste it into your local scripts/i18n-check.cjs
 */

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    
    // data should be an array of objects: [{ key: '...', zh-TW: '...', ... }]
    if (!Array.isArray(data) || data.length === 0) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'No data to append' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Get headers from the first row of the sheet
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Map data to rows based on headers
    const rowsToAdd = data.map(item => {
      return headers.map(header => {
        // Handle special column mapping if needed, or just match header name
        // The Node.js script sends keys matching the headers (e.g. "zh-TW", "en")
        return item[header] || '';
      });
    });

    // Append all rows at once
    sheet.getRange(sheet.getLastRow() + 1, 1, rowsToAdd.length, headers.length).setValues(rowsToAdd);

    return ContentService.createTextOutput(JSON.stringify({ status: 'success', added: rowsToAdd.length }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("i18n Sync Server is running. Use POST to send data.");
}
