# Phase 8 Verification: Database & Core Services

**Phase:** 8 - Database & Core Services
**Verified:** [DATE] by [NAME]

---

## Success Criteria Verification

Mark each criterion as passed ✓ or failed ✗:

### Database Schema

- [ ] `sponsor_uploads` table exists with all required columns
- [ ] `sponsorship_packages` has benefit flag columns (includes_website_benefit, etc.)
- [ ] RLS policies configured correctly on sponsor_uploads
- [ ] Indexes created for performance (upload_token, invoice_id, status)
- [ ] Migration `006_sponsor_uploads.sql` runs without errors
- [ ] Existing seed data updated with benefit flags

**Verification commands:**
```bash
# Check tables exist
psql -h localhost -U postgres -d postgres -c "\dt sponsor_uploads"
psql -h localhost -U postgres -d postgres -c "\d sponsorship_packages"

# Check package benefits
psql -h localhost -U postgres -d postgres -c "SELECT name, includes_website_benefit, includes_tshirt, includes_banner FROM sponsorship_packages;"

# Check sponsor_uploads schema
psql -h localhost -U postgres -d postgres -c "\d sponsor_uploads"
```

### Google Drive Integration

- [ ] `googleapis` package installed
- [ ] Google Drive client authenticates successfully
- [ ] Can create folders in root Drive folder
- [ ] Can upload files to Drive folders
- [ ] Package folders auto-created correctly
- [ ] Sponsor folder naming convention works: `{Company} - {Invoice ID}`

**Verification command:**
```bash
npm run validate:google
# Check: ✓ Successfully authenticated with Google Drive API
# Check: ✓ Created test folder
# Check: ✓ Package folder ready
# Check: ✓ Uploaded test file
```

### Google Sheets Integration

- [ ] Google Sheets client authenticates successfully
- [ ] Can create/access sponsor tracking spreadsheet
- [ ] Can append rows to spreadsheet
- [ ] Can update existing rows
- [ ] Can find rows by invoice ID
- [ ] Header row formatted correctly (dark bg, white text)

**Verification command:**
```bash
npm run validate:google
# Check: ✓ Successfully authenticated with Google Sheets API
# Check: ✓ Appended row at index: X
# Check: ✓ Found row at correct index: X
# Check: ✓ Successfully updated row
```

### Environment Configuration

- [ ] `.env.local` has all required variables
- [ ] `GOOGLE_SERVICE_ACCOUNT_EMAIL` configured
- [ ] `GOOGLE_PRIVATE_KEY` configured with proper \n escaping
- [ ] `GOOGLE_DRIVE_ROOT_FOLDER_ID` configured
- [ ] `GOOGLE_SHEETS_SPREADSHEET_ID` configured
- [ ] `.env.example` updated with Google variables and setup instructions

**Verification:**
Check `.env.local` contains:
```bash
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
GOOGLE_DRIVE_ROOT_FOLDER_ID=
GOOGLE_SHEETS_SPREADSHEET_ID=
```

### Service Account Setup

- [ ] Google Cloud project created
- [ ] Drive API enabled
- [ ] Sheets API enabled
- [ ] Service account created
- [ ] Service account key downloaded
- [ ] Root Drive folder shared with service account (Editor access)
- [ ] Spreadsheet shared with service account (Editor access)

**Manual verification:**
- Check Google Drive "RiseUp Sponsors" folder has service account as Editor
- Check Google Sheets has service account as Editor
- Service account email matches `.env.local`

### Code Quality

- [ ] TypeScript types generated (`database.types.ts`)
- [ ] No linter errors in new files
- [ ] Upload validation schema created (`sponsor-upload.ts`)
- [ ] All imports resolve correctly
- [ ] Comments/documentation in code

**Verification commands:**
```bash
# Regenerate types
npx supabase gen types typescript --local > src/lib/database.types.ts

# Check for TypeScript errors
npx tsc --noEmit

# Check for linter errors
npm run lint
```

### Documentation

- [ ] Setup guide created (`docs/GOOGLE_SETUP_GUIDE.md`)
- [ ] README updated with Google setup reference
- [ ] Research document complete (`08-RESEARCH.md`)
- [ ] Context document complete (`08-CONTEXT.md`)
- [ ] All 3 plan documents complete (08-01, 08-02, 08-03)

### Testing

- [ ] Validation script runs successfully (`npm run validate:google`)
- [ ] All 6 validation tests pass
- [ ] Test folders visible in Google Drive
- [ ] Test rows visible in Google Sheets
- [ ] No console errors during validation

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

---

## Requirements Coverage

Phase 8 requirements from REQUIREMENTS.md:

- [ ] **GDRIVE-01**: System creates folder structure organized by package type
- [ ] **GDRIVE-02**: System uploads sponsor logo to appropriate package folder
- [ ] **GDRIVE-03**: System names folders using format: `{Company Name} - {Invoice ID}`
- [ ] **GDRIVE-04**: System stores Google Drive folder ID in database for reference
- [ ] **GSHEET-01**: System appends new row to master spreadsheet when invoice is created
- [ ] **GSHEET-02**: Spreadsheet includes columns: Company, Package, Invoice ID, Payment Date, Upload Status, Drive Folder Link, Website URL
- [ ] **GSHEET-03**: System updates row when invoice is paid (Payment Date, status)
- [ ] **GSHEET-04**: System updates row when upload is completed (Upload Status, Drive link, Website URL)
- [ ] **DISPLAY-02**: System checks if package includes website benefit (database flag)

---

## Manual Testing Checklist

Perform these manual tests after automated validation passes:

### Google Drive Tests

1. **Folder Creation**
   - [ ] Run validation script
   - [ ] Open Google Drive "RiseUp Sponsors" folder
   - [ ] Verify test folder appears with timestamp name
   - [ ] Verify "Championship Package" folder exists
   - [ ] Delete test folders after verification

2. **File Upload**
   - [ ] Check test file uploaded to Championship Package folder
   - [ ] Verify file is accessible (not permission denied)
   - [ ] Delete test file after verification

### Google Sheets Tests

1. **Spreadsheet Access**
   - [ ] Open spreadsheet from validation script output URL
   - [ ] Verify header row is formatted (black bg, white text)
   - [ ] Verify all 9 columns present

2. **Row Operations**
   - [ ] Verify test row appears with correct data
   - [ ] Verify row updates show payment date + completed status
   - [ ] Delete test row after verification

### Database Tests

1. **Schema Verification**
   ```sql
   -- Check sponsor_uploads structure
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'sponsor_uploads';
   
   -- Check package benefits
   SELECT name, includes_website_benefit, includes_banner, includes_tshirt 
   FROM sponsorship_packages;
   ```

2. **RLS Policies**
   ```sql
   -- Check policies exist
   SELECT policyname, roles, cmd 
   FROM pg_policies 
   WHERE tablename = 'sponsor_uploads';
   ```

---

## Rollback Procedure

If verification fails and rollback is needed:

```sql
-- Rollback database migration
DROP TABLE IF EXISTS sponsor_uploads CASCADE;

ALTER TABLE sponsorship_packages
DROP COLUMN IF EXISTS includes_website_benefit,
DROP COLUMN IF EXISTS includes_banner,
DROP COLUMN IF EXISTS includes_tshirt,
DROP COLUMN IF EXISTS includes_golf_sign,
DROP COLUMN IF EXISTS includes_game_day,
DROP COLUMN IF EXISTS description;
```

```bash
# Uninstall Google packages (if needed)
npm uninstall googleapis
```

---

## Known Issues / Workarounds

Document any issues encountered during verification:

### Issue 1: [Title]
**Symptom:** 
**Root cause:** 
**Workaround:** 
**Resolution:** 

---

## Performance Verification

Measure and record performance metrics:

- [ ] Migration runs in < 5 seconds
- [ ] Validation script completes in < 30 seconds
- [ ] Drive folder creation < 2 seconds per folder
- [ ] Sheets append operation < 1 second per row
- [ ] No memory leaks in validation script

---

## Security Verification

- [ ] `.env.local` NOT committed to git
- [ ] Service account JSON NOT committed to git
- [ ] `.gitignore` includes service account patterns
- [ ] Private key properly escaped with \n
- [ ] Service account has minimal necessary permissions (not entire Drive)
- [ ] Folder/Spreadsheet access limited to service account + admins

---

## Sign-off

**Phase 8 Completed By:** ___________________  
**Date:** ___________________  
**Verification Status:** ☐ PASSED  ☐ FAILED  

**Notes:**




---

**Next Phase:** Phase 9 - Invoice Management UI

---

*Verification checklist created: 2026-01-23*
