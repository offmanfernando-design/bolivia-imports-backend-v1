console.log('>>> sheets.service.js CORRECTO CARGADO <<<');
import { google } from 'googleapis';

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

if (!process.env.GOOGLE_CREDENTIALS_JSON) {
  throw new Error('GOOGLE_CREDENTIALS_JSON no está definido');
}

const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

async function getEntregas() {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'entregas_DB!A1:Z',
  });

  const [headers, ...rows] = res.data.values || [];

  return rows.map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = row[i] ?? '';
    });
    return obj;
  });
}

async function actualizarFilas(updates) {
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      valueInputOption: 'RAW',
      data: updates,
    },
  });
}

export default {
  getEntregas,
  actualizarFilas,
};

// force git change
// force redeploy
