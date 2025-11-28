import { GoogleSpreadsheet } from 'google-spreadsheet';

const GOOGLE_SHEET_ID = Deno.env.get('GOOGLE_SHEET_ID'); // 或 Cloudflare Secret
const GOOGLE_SA_KEY = Deno.env.get('GOOGLE_SA_KEY');

export class GoogleSheet {
  constructor(sheetName) {
    this.sheetName = sheetName;
    this.doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID);
  }

  async init() {
    await this.doc.useServiceAccountAuth(JSON.parse(GOOGLE_SA_KEY));
    await this.doc.loadInfo();
    this.sheet = this.doc.sheetsByTitle[this.sheetName];
    if (!this.sheet) throw new Error(`Sheet "${this.sheetName}" not found`);
  }

  async appendRow(row) {
    await this.init();
    await this.sheet.addRow(row);
  }

  async rowExists(criteria) {
    await this.init();
    const rows = await this.sheet.getRows();
    return rows.some(r =>
      Object.keys(criteria).every(key => r[key] && r[key].toString() === criteria[key])
    );
  }
}
