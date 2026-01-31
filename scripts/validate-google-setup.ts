#!/usr/bin/env tsx

/**
 * Validation script for Google Drive and Sheets integration
 * Run after setting up service account to verify configuration
 * 
 * Usage: npm run validate:google
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { google } from 'googleapis';
import {
  createDriveFolder,
  getOrCreatePackageFolder,
  uploadFileToDrive,
} from '../src/lib/google-drive';
import {
  createSponsorSpreadsheet,
  appendSponsorRow,
  updateSponsorRow,
  findRowByInvoiceId,
} from '../src/lib/google-sheets';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message: string) {
  log(`✓ ${message}`, colors.green);
}

function error(message: string) {
  log(`✗ ${message}`, colors.red);
}

function warning(message: string) {
  log(`⚠ ${message}`, colors.yellow);
}

function info(message: string) {
  log(`ℹ ${message}`, colors.blue);
}

function header(message: string) {
  log(`\n${colors.bold}${message}${colors.reset}`);
}

async function validateEnvironmentVariables(): Promise<boolean> {
  header('1. Validating Environment Variables');

  const required = [
    'GOOGLE_SERVICE_ACCOUNT_EMAIL',
    'GOOGLE_PRIVATE_KEY',
    'GOOGLE_DRIVE_ROOT_FOLDER_ID',
  ];

  let allPresent = true;

  for (const key of required) {
    if (process.env[key]) {
      success(`${key} is set`);
    } else {
      error(`${key} is missing`);
      allPresent = false;
    }
  }

  // GOOGLE_SHEETS_SPREADSHEET_ID is optional (created by this script if missing)
  if (process.env.GOOGLE_SHEETS_SPREADSHEET_ID) {
    success('GOOGLE_SHEETS_SPREADSHEET_ID is set');
  } else {
    warning('GOOGLE_SHEETS_SPREADSHEET_ID not set (will be created)');
  }

  return allPresent;
}

async function validateDriveAuthentication(): Promise<boolean> {
  header('2. Testing Google Drive Authentication');

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // Test access to root folder
    const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
    const response = await drive.files.get({
      fileId: rootFolderId!,
      fields: 'id, name, mimeType',
    });

    success('Successfully authenticated with Google Drive API');
    info(`Root folder: ${response.data.name} (${response.data.id})`);

    return true;
  } catch (err: any) {
    error('Failed to authenticate with Google Drive API');
    error(err.message);
    return false;
  }
}

async function validateDriveFolderOperations(): Promise<boolean> {
  header('3. Testing Google Drive Folder Operations');

  try {
    // Test creating a test folder
    const testFolderName = `TEST-${Date.now()}`;
    info(`Creating test folder: ${testFolderName}`);

    const folderId = await createDriveFolder(testFolderName);
    success(`Created test folder: ${folderId}`);

    // Test package folder creation
    info('Testing package folder creation...');
    const packageFolderId = await getOrCreatePackageFolder('Championship Package');
    success(`Package folder ready: ${packageFolderId}`);

    return true;
  } catch (err: any) {
    error('Failed to create folders in Google Drive');
    error(err.message);
    return false;
  }
}

async function validateDriveFileUpload(): Promise<boolean> {
  header('4. Testing Google Drive File Upload');

  try {
    // Create a test file buffer
    const testContent = 'RiseUp Google Drive Integration Test';
    const testBuffer = Buffer.from(testContent, 'utf-8');

    // Get package folder
    const packageFolderId = await getOrCreatePackageFolder('Championship Package');

    // Upload test file
    const testFileName = `test-${Date.now()}.txt`;
    info(`Uploading test file: ${testFileName}`);

    const fileId = await uploadFileToDrive(
      testFileName,
      testBuffer,
      'text/plain',
      packageFolderId
    );

    success(`Uploaded test file: ${fileId}`);
    info(`View at: https://drive.google.com/file/d/${fileId}/view`);

    return true;
  } catch (err: any) {
    error('Failed to upload file to Google Drive');
    error(err.message);
    return false;
  }
}

async function validateSheetsAuthentication(): Promise<boolean> {
  header('5. Testing Google Sheets Authentication');

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // If spreadsheet ID exists, test access
    if (process.env.GOOGLE_SHEETS_SPREADSHEET_ID) {
      const response = await sheets.spreadsheets.get({
        spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      });

      success('Successfully authenticated with Google Sheets API');
      info(`Spreadsheet: ${response.data.properties?.title}`);
      info(`URL: ${response.data.spreadsheetUrl}`);
    } else {
      // Create new spreadsheet
      info('No spreadsheet configured, creating new one...');
      const spreadsheetId = await createSponsorSpreadsheet();

      success('Successfully created sponsor tracking spreadsheet');
      info(`Spreadsheet ID: ${spreadsheetId}`);
      warning('Add this to your .env.local as GOOGLE_SHEETS_SPREADSHEET_ID');
    }

    return true;
  } catch (err: any) {
    error('Failed to authenticate with Google Sheets API');
    error(err.message);
    return false;
  }
}

async function validateSheetsOperations(): Promise<boolean> {
  header('6. Testing Google Sheets Operations');

  if (!process.env.GOOGLE_SHEETS_SPREADSHEET_ID) {
    warning('Skipping Sheets operations test (no spreadsheet ID)');
    return true;
  }

  try {
    // Test append
    const testInvoiceId = `test_inv_${Date.now()}`;
    info(`Appending test row with invoice: ${testInvoiceId}`);

    const rowIndex = await appendSponsorRow({
      companyName: 'Test Company',
      packageName: 'Test Package',
      invoiceId: testInvoiceId,
      amount: 350000,
      uploadStatus: 'Pending',
      createdDate: new Date().toISOString().split('T')[0],
    });

    success(`Appended row at index: ${rowIndex}`);

    // Test find
    info('Testing row lookup by invoice ID...');
    const foundIndex = await findRowByInvoiceId(testInvoiceId);

    if (foundIndex === rowIndex) {
      success(`Found row at correct index: ${foundIndex}`);
    } else {
      error(`Row mismatch: expected ${rowIndex}, found ${foundIndex}`);
      return false;
    }

    // Test update
    info('Testing row update...');
    await updateSponsorRow(rowIndex, {
      paymentDate: new Date().toISOString().split('T')[0],
      uploadStatus: 'Completed',
      websiteUrl: 'https://test.com',
    });

    success('Successfully updated row');

    return true;
  } catch (err: any) {
    error('Failed to perform Sheets operations');
    error(err.message);
    return false;
  }
}

async function main() {
  log(`${colors.bold}${colors.blue}
╔═══════════════════════════════════════════════════════╗
║   RiseUp Google Integration Validation               ║
║   Testing Drive & Sheets Service Account Setup       ║
╚═══════════════════════════════════════════════════════╝
${colors.reset}`);

  const tests = [
    { name: 'Environment Variables', fn: validateEnvironmentVariables },
    { name: 'Drive Authentication', fn: validateDriveAuthentication },
    { name: 'Drive Folder Operations', fn: validateDriveFolderOperations },
    { name: 'Drive File Upload', fn: validateDriveFileUpload },
    { name: 'Sheets Authentication', fn: validateSheetsAuthentication },
    { name: 'Sheets Operations', fn: validateSheetsOperations },
  ];

  const results: boolean[] = [];

  for (const test of tests) {
    const passed = await test.fn();
    results.push(passed);

    if (!passed) {
      warning(`Stopping at failed test: ${test.name}`);
      break;
    }
  }

  // Summary
  header('Validation Summary');

  const passed = results.filter((r) => r).length;
  const total = results.length;

  if (passed === total) {
    success(`All ${total} tests passed! ✨`);
    info('Your Google integration is ready to use.');
    process.exit(0);
  } else {
    error(`${passed}/${total} tests passed`);
    warning('Please fix the errors above and run again.');
    process.exit(1);
  }
}

// Run validation
main().catch((err) => {
  error(`Unexpected error: ${err.message}`);
  process.exit(1);
});
