import { google } from 'googleapis';

/**
 * Google Sheets client for sponsor tracking spreadsheet
 * Uses service account authentication for automated operations
 */

// Initialize Sheets client with service account
function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}

/**
 * Sponsor row data for Google Sheets
 */
export interface SponsorSheetRow {
  companyName: string;
  packageName: string;
  invoiceId: string;
  amount: number;
  paymentDate?: string; // ISO date string
  uploadStatus: 'Pending' | 'Completed';
  driveFolderUrl?: string;
  websiteUrl?: string;
  createdDate: string; // ISO date string
}

/**
 * Creates the master sponsor tracking spreadsheet
 * @returns Spreadsheet ID
 */
export async function createSponsorSpreadsheet(): Promise<string> {
  const sheets = getSheetsClient();

  const spreadsheet = {
    properties: {
      title: 'RiseUp Sponsor Tracking',
    },
    sheets: [
      {
        properties: {
          title: 'Sponsors',
        },
        data: [
          {
            startRow: 0,
            startColumn: 0,
            rowData: [
              {
                values: [
                  { userEnteredValue: { stringValue: 'Company Name' } },
                  { userEnteredValue: { stringValue: 'Package' } },
                  { userEnteredValue: { stringValue: 'Invoice ID' } },
                  { userEnteredValue: { stringValue: 'Amount' } },
                  { userEnteredValue: { stringValue: 'Payment Date' } },
                  { userEnteredValue: { stringValue: 'Upload Status' } },
                  { userEnteredValue: { stringValue: 'Drive Folder' } },
                  { userEnteredValue: { stringValue: 'Website URL' } },
                  { userEnteredValue: { stringValue: 'Created Date' } },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  try {
    const response = await sheets.spreadsheets.create({
      requestBody: spreadsheet,
    });

    if (!response.data.spreadsheetId) {
      throw new Error('Failed to create spreadsheet: No ID returned');
    }

    // Format header row (dark background, white text - RiseUp brand)
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: response.data.spreadsheetId,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.0, green: 0.0, blue: 0.0 },
                  textFormat: {
                    foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 },
                    fontSize: 12,
                    bold: true,
                  },
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)',
            },
          },
        ],
      },
    });

    console.log('Created spreadsheet:', response.data.spreadsheetUrl);
    return response.data.spreadsheetId;
  } catch (error) {
    console.error('Error creating spreadsheet:', error);
    throw new Error('Failed to create sponsor tracking spreadsheet');
  }
}

/**
 * Appends a new sponsor row to the spreadsheet
 * @param data - Sponsor row data
 * @returns Row index (1-based, excluding header)
 */
export async function appendSponsorRow(data: SponsorSheetRow): Promise<number> {
  const sheets = getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

  if (!spreadsheetId) {
    throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID not configured');
  }

  const values = [
    [
      data.companyName,
      data.packageName,
      data.invoiceId,
      `$${(data.amount / 100).toFixed(2)}`,
      data.paymentDate || '',
      data.uploadStatus,
      data.driveFolderUrl || '',
      data.websiteUrl || '',
      data.createdDate,
    ],
  ];

  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sponsors!A2', // Start after header
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });

    // Extract row number from updates
    const updatedRange = response.data.updates?.updatedRange || '';
    const rowMatch = updatedRange.match(/!A(\d+)/);
    const rowIndex = rowMatch ? parseInt(rowMatch[1]) : 0;

    return rowIndex;
  } catch (error) {
    console.error('Error appending to spreadsheet:', error);
    throw new Error('Failed to append sponsor row to spreadsheet');
  }
}

/**
 * Updates an existing sponsor row in the spreadsheet
 * @param rowIndex - Row number (1-based, excluding header)
 * @param updates - Partial row data to update
 */
export async function updateSponsorRow(
  rowIndex: number,
  updates: Partial<SponsorSheetRow>
): Promise<void> {
  const sheets = getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

  if (!spreadsheetId) {
    throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID not configured');
  }

  // Column mapping for updates
  const columnMap = {
    companyName: 0,
    packageName: 1,
    invoiceId: 2,
    amount: 3,
    paymentDate: 4,
    uploadStatus: 5,
    driveFolderUrl: 6,
    websiteUrl: 7,
    createdDate: 8,
  };

  // Get existing row first
  try {
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `Sponsors!A${rowIndex}:I${rowIndex}`,
    });

    const existingValues = existing.data.values?.[0] || [];

    // Update specific columns
    if (updates.paymentDate !== undefined) {
      existingValues[columnMap.paymentDate] = updates.paymentDate;
    }
    if (updates.uploadStatus !== undefined) {
      existingValues[columnMap.uploadStatus] = updates.uploadStatus;
    }
    if (updates.driveFolderUrl !== undefined) {
      existingValues[columnMap.driveFolderUrl] = updates.driveFolderUrl;
    }
    if (updates.websiteUrl !== undefined) {
      existingValues[columnMap.websiteUrl] = updates.websiteUrl;
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Sponsors!A${rowIndex}:I${rowIndex}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [existingValues],
      },
    });
  } catch (error) {
    console.error('Error updating spreadsheet row:', error);
    throw new Error(`Failed to update row ${rowIndex} in spreadsheet`);
  }
}

/**
 * Finds a row index by invoice ID
 * @param invoiceId - Stripe invoice ID to search for
 * @returns Row index (1-based) or null if not found
 */
export async function findRowByInvoiceId(
  invoiceId: string
): Promise<number | null> {
  const sheets = getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

  if (!spreadsheetId) {
    throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID not configured');
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sponsors!C2:C', // Invoice ID column, starting after header
    });

    const values = response.data.values || [];
    const rowIndex = values.findIndex((row: any) => row[0] === invoiceId);

    // Convert to 1-based index, accounting for header row
    return rowIndex >= 0 ? rowIndex + 2 : null;
  } catch (error) {
    console.error('Error finding row in spreadsheet:', error);
    return null;
  }
}

/**
 * Gets the spreadsheet URL for viewing
 * @returns Spreadsheet URL or null if not configured
 */
export function getSpreadsheetUrl(): string | null {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId) return null;
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
}
