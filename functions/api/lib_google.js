// lib_google.js
// helper: connect to Google Sheets using googleapis JWT
import { google } from 'googleapis';

let authClientCache = null;

function getSaFromEnv() {
  const raw = process.env.GOOGLE_SA_KEY;
  if (!raw) throw new Error('Missing GOOGLE_SA_KEY');
  try {
    return JSON.parse(raw);
  } catch (e) {
    throw new Error('Invalid GOOGLE_SA_KEY JSON: ' + e.message);
  }
}

export async function getSheetsClient() {
  if (authClientCache) return authClientCache;

  const sa = getSaFromEnv();
  const jwtClient = new google.auth.JWT({
    email: sa.client_email,
    key: sa.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets','https://www.googleapis.com/auth/drive'],
  });

  await jwtClient.authorize(); // get access token
  const sheets = google.sheets({ version: 'v4', auth: jwtClient });
  authClientCache = { sheets, jwtClient };
  return authClientCache;
}

// Ensure the spreadsheet and sheet exist; create header row if empty
export async function ensureSheetAndHeader(sheetTitle, headers) {
  const SHEET_ID = process.env.SHEET_ID;
  if (!SHEET_ID) throw new Error('Missing SHEET_ID');

  const { sheets } = await getSheetsClient();

  // load spreadsheet metadata
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const sheetsList = meta.data.sheets || [];

  const found = sheetsList.find(s => (s.properties && s.properties.title) === sheetTitle);
  if (!found) {
    // create new sheet
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: [
          { addSheet: { properties: { title: sheetTitle } } }
        ]
      }
    });
  }

  // check if first row exists (header)
  const resp = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${sheetTitle}!A1:Z1`
  });

  const values = resp.data.values || [];
  if (values.length === 0 || values[0].every(v => v === '' || v === undefined)) {
    // write header row
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${sheetTitle}!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: [headers] }
    });
  }
}

// Append a row (values is array)
export async function appendRow(sheetTitle, values) {
  const SHEET_ID = process.env.SHEET_ID;
  if (!SHEET_ID) throw new Error('Missing SHEET_ID');

  const { sheets } = await getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${sheetTitle}!A1`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [values] }
  });
}
