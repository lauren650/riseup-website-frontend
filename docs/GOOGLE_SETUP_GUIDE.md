# Google Drive & Sheets Integration Setup Guide

This guide walks through setting up Google Cloud service account for automated sponsor upload workflow.

---

## Overview

The RiseUp sponsor management system uses Google Drive to store sponsor logos and Google Sheets to track sponsorship status. This integration requires a Google Cloud service account with API access.

**What you'll need:**
- Google Cloud account (free tier is sufficient)
- Google Drive account
- About 15 minutes

---

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click **Create Project**
3. Name it "RiseUp Website" (or similar)
4. Click **Create**
5. Wait for project to be created (~30 seconds)

---

## Step 2: Enable APIs

1. In Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Google Drive API"
3. Click **Enable**
4. Go back to Library
5. Search for "Google Sheets API"
6. Click **Enable**

---

## Step 3: Create Service Account

1. Go to **IAM & Admin** > **Service Accounts**
2. Click **Create Service Account**
3. Name: `riseup-sponsor-automation`
4. Description: "Automated sponsor upload workflow"
5. Click **Create and Continue**
6. Skip role assignment (we'll use folder-level permissions)
7. Click **Done**

---

## Step 4: Create Service Account Key

1. Click on the service account you just created
2. Go to **Keys** tab
3. Click **Add Key** > **Create new key**
4. Choose **JSON** format
5. Click **Create**
6. Save the downloaded JSON file securely (NEVER commit to git!)

---

## Step 5: Extract Credentials

Open the downloaded JSON file. You need two values:

```json
{
  "client_email": "riseup-sponsor-automation@project-id.iam.gserviceaccount.com",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
}
```

Copy these to your `.env.local`:

```bash
GOOGLE_SERVICE_ACCOUNT_EMAIL=riseup-sponsor-automation@project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

**Important:** The private key MUST include `\n` characters for line breaks.

---

## Step 6: Create Google Drive Folder

1. Go to [Google Drive](https://drive.google.com)
2. Create a new folder named "RiseUp Sponsors"
3. Right-click folder > **Share**
4. Add your service account email (from Step 5)
5. Give it **Editor** access
6. Click **Share**

Get the folder ID from the URL:
```
https://drive.google.com/drive/folders/1abc123xyz456
                                          ↑ This is the ID
```

Add to `.env.local`:
```bash
GOOGLE_DRIVE_ROOT_FOLDER_ID=1abc123xyz456
```

---

## Step 7: Create Google Sheets Spreadsheet

**Option A: Let the setup script create it** (recommended)
- Run validation script (Step 8) and it will create the spreadsheet
- Add the generated ID to `.env.local`

**Option B: Create manually**
1. Go to [Google Sheets](https://sheets.google.com)
2. Create new spreadsheet named "RiseUp Sponsor Tracking"
3. Right-click > **Share**
4. Add service account email with **Editor** access
5. Get spreadsheet ID from URL:
   ```
   https://docs.google.com/spreadsheets/d/1def789uvw321/edit
                                           ↑ This is the ID
   ```
6. Add to `.env.local`:
   ```bash
   GOOGLE_SHEETS_SPREADSHEET_ID=1def789uvw321
   ```

---

## Step 8: Validate Setup

Run the validation script to test all connections:

```bash
npm run validate:google
```

**Expected output:**
```
✓ GOOGLE_SERVICE_ACCOUNT_EMAIL is set
✓ GOOGLE_PRIVATE_KEY is set
✓ GOOGLE_DRIVE_ROOT_FOLDER_ID is set
✓ Successfully authenticated with Google Drive API
✓ Created test folder
✓ Package folder ready
✓ Uploaded test file
✓ Successfully authenticated with Google Sheets API
✓ Appended test row
✓ All 6 tests passed! ✨
```

If any tests fail, check:
- Service account email has access to Drive folder
- Service account email has access to Spreadsheet
- Private key includes proper `\n` line breaks
- Folder/Spreadsheet IDs are correct

---

## Environment Variables Summary

Add these to your `.env.local`:

```bash
# =============================================================================
# GOOGLE APIS - Service Account Authentication
# =============================================================================

GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_ROOT_FOLDER_ID=1abc123xyz456
GOOGLE_SHEETS_SPREADSHEET_ID=1def789uvw321
```

---

## Troubleshooting

### "Failed to authenticate with Google Drive API"
- Verify `GOOGLE_SERVICE_ACCOUNT_EMAIL` matches JSON file
- Check `GOOGLE_PRIVATE_KEY` includes `\n` characters
- Ensure Drive API is enabled in Google Cloud Console

### "Failed to create folders in Google Drive"
- Service account needs **Editor** access to root folder
- Check `GOOGLE_DRIVE_ROOT_FOLDER_ID` is correct
- Verify folder exists and is not in trash

### "Failed to authenticate with Google Sheets API"
- Ensure Sheets API is enabled in Google Cloud Console
- Service account needs **Editor** access to spreadsheet
- Check `GOOGLE_SHEETS_SPREADSHEET_ID` is correct

### "ENOENT: no such file or directory" when running validation
- Run `npm install` to ensure all dependencies installed
- Make sure you're in project root directory

---

## Security Best Practices

✅ **DO:**
- Store credentials in `.env.local` (never committed)
- Use service account (not personal OAuth)
- Limit service account to specific folder/spreadsheet
- Rotate service account keys annually

❌ **DON'T:**
- Commit `.env.local` or service account JSON to git
- Share service account credentials publicly
- Use personal Google account credentials
- Give service account access to entire Drive

---

## How It Works

### Folder Structure

```
RiseUp Sponsors/ (root folder)
├── Championship Package/
│   ├── Company A - inv_123/
│   │   └── logo.png
│   └── Company B - inv_456/
│       └── logo.svg
├── Website Only Package/
├── Game Day Package/
└── Rise Up Academy t-shirt/
```

- **Package folders** are created automatically when first needed
- **Sponsor folders** are created by webhook when invoice is paid
- **Naming convention** ensures uniqueness and easy searching

### Spreadsheet Tracking

The system maintains a Google Sheets tracker with columns:
- Company Name
- Package
- Invoice ID
- Amount
- Payment Date
- Upload Status
- Drive Folder (link)
- Website URL
- Created Date

**Update lifecycle:**
1. Row appended when invoice created (Phase 9)
2. Payment date updated when invoice paid (Phase 10)
3. Upload status updated when logo submitted (Phase 11)

---

## Next Steps

After successful validation:
1. ✓ Phase 8 complete - Infrastructure ready
2. → Phase 9: Build invoice management UI
3. → Phase 10: Enhance payment webhook
4. → Phase 11: Build sponsor upload form

---

*Last updated: 2026-01-24*
