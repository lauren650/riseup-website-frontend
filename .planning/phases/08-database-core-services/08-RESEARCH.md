# Phase 8 Research: Database & Core Services

**Created:** 2026-01-23
**Phase Goal:** Google Drive/Sheets integration foundation and database schema ready

---

## Technical Requirements

### Google APIs Authentication

**Service Account vs OAuth:**
- **Decision:** Use Service Account (server-side, no user interaction)
- **Why:** Automated workflows need unattended access; OAuth requires user consent flow
- **Package:** `googleapis` (official Google APIs Node.js client v134+)

**Credentials Setup:**
```typescript
// Service account authentication
import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/spreadsheets',
  ],
});
```

### Google Drive API

**Folder Structure:**
```
RiseUp Sponsors (root folder - shared with service account)
├── Championship Package/
│   ├── Company A - inv_123/
│   │   └── logo.png
│   └── Company B - inv_456/
│       └── logo.png
├── All-Star Package/
├── Game Day Package/
└── Website Only Package/
```

**Key Operations:**
- Create folder: `drive.files.create()` with `mimeType: 'application/vnd.google-apps.folder'`
- Upload file: `drive.files.create()` with media body
- Set parent folder: Use `parents` array in metadata
- Get folder ID: Store in database for reference

**Naming Convention:**
- Package folders: `{Package Name}/`
- Sponsor folders: `{Company Name} - {Invoice ID}/`
- Files: Keep original filename (validated on upload)

### Google Sheets API

**Spreadsheet Structure:**

| Column | Type | Description |
|--------|------|-------------|
| Company Name | TEXT | From invoice |
| Package | TEXT | Package name snapshot |
| Invoice ID | TEXT | Stripe invoice ID |
| Amount | CURRENCY | Package cost |
| Payment Date | DATE | When paid (empty until webhook) |
| Upload Status | TEXT | "Pending" / "Completed" |
| Drive Folder Link | URL | Hyperlink to folder |
| Website URL | URL | From upload form |
| Created Date | DATE | Invoice creation |

**Key Operations:**
- Create spreadsheet: `sheets.spreadsheets.create()`
- Append row: `sheets.spreadsheets.values.append()` with `valueInputOption: 'USER_ENTERED'`
- Update row: `sheets.spreadsheets.values.update()` by range (find by Invoice ID first)
- Format cells: Use `spreadsheets.batchUpdate()` for hyperlinks

**Update Strategy:**
- Append on invoice creation (Phase 9)
- Update payment date on webhook (Phase 10)
- Update upload status + Drive link on upload completion (Phase 11)
- Use A1 notation: `Sheet1!A2:I2` for row updates

### Database Schema

#### New Table: `sponsor_uploads`

```sql
CREATE TABLE sponsor_uploads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  upload_token TEXT UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  package_id UUID REFERENCES sponsorship_packages(id),
  
  -- Upload data
  logo_url TEXT, -- Supabase Storage URL (cached from Drive)
  website_url TEXT,
  drive_folder_id TEXT NOT NULL,
  drive_file_id TEXT,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  uploaded_at TIMESTAMPTZ,
  
  -- Token security
  token_expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT token_not_expired CHECK (token_expires_at > created_at)
);
```

**Indexes:**
- `upload_token` (unique, for fast lookup)
- `invoice_id` (foreign key queries)
- `status` (dashboard filtering)

#### Alter Table: `sponsorship_packages`

Add flexible benefits system:

```sql
ALTER TABLE sponsorship_packages
ADD COLUMN includes_website_benefit BOOLEAN DEFAULT false,
ADD COLUMN includes_banner BOOLEAN DEFAULT false,
ADD COLUMN includes_tshirt BOOLEAN DEFAULT false,
ADD COLUMN includes_golf_sign BOOLEAN DEFAULT false,
ADD COLUMN includes_game_day BOOLEAN DEFAULT false;
```

**Migration Strategy:**
- Update existing seed data to set appropriate benefits
- Future: Add new benefit columns as needed (scalable)

### Environment Variables

```bash
# Google Service Account
GOOGLE_SERVICE_ACCOUNT_EMAIL=riseup-sponsor-automation@project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Google Drive
GOOGLE_DRIVE_ROOT_FOLDER_ID=1abc123xyz456  # Root "RiseUp Sponsors" folder

# Google Sheets
GOOGLE_SHEETS_SPREADSHEET_ID=1def789uvw321  # Created in setup
```

### Security Considerations

**Service Account Permissions:**
- Drive: Editor access to specific folder (not entire Drive)
- Sheets: Editor access to specific spreadsheet
- Principle of least privilege

**Token Generation:**
```typescript
import crypto from 'crypto';

function generateUploadToken(): string {
  return crypto.randomUUID(); // Crypto-secure UUID v4
}

function calculateExpiration(): Date {
  const expiration = new Date();
  expiration.setDate(expiration.getDate() + 90); // 90 days
  return expiration;
}
```

**Error Handling:**
- Google API failures should NOT break invoice creation
- Log errors, notify admin, allow manual retry
- Graceful degradation: Sheets update failure doesn't break upload

### Package Benefits System

**Current Packages (from seed data):**

1. **Championship Package** ($3,500)
   - T-shirt (tackle & flag) ✓
   - Website logo ✓
   - Banner ✓
   - Golf tournament sign ✓

2. **Website Only** ($600)
   - Website logo ✓

3. **Game Day Package** ($750)
   - Game day presence ✓

4. **Rise Up Academy T-shirt** ($500)
   - T-shirt ✓

**Benefits to Track:**
- `includes_website_benefit` - Display on Partners page
- `includes_banner` - Physical banner at events
- `includes_tshirt` - Logo on t-shirts
- `includes_golf_sign` - Golf tournament signage
- `includes_game_day` - Game day booth/presence

**UI Pattern:**
When creating/editing packages in admin panel, show checkboxes:
```
☑ Website logo display
☐ Physical banner
☑ T-shirt logo
☐ Golf tournament sign
☐ Game day presence
```

### Testing Strategy

**Integration Tests:**
1. Service account can authenticate with Drive API
2. Service account can create folders in root folder
3. Service account can upload files to folders
4. Service account can authenticate with Sheets API
5. Service account can append rows to spreadsheet
6. Service account can update specific rows

**Setup Validation Script:**
Create `/scripts/validate-google-setup.ts` to test all connections before building features.

---

## Implementation Priorities

1. **Database schema first** - Blocking for all features
2. **Google Drive client** - Needed for Phase 10 webhook
3. **Google Sheets client** - Needed for Phase 9 invoice creation
4. **Setup validation** - Confidence in configuration

---

## References

- [Google APIs Node.js Client](https://github.com/googleapis/google-api-nodejs-client)
- [Drive API v3 Reference](https://developers.google.com/drive/api/v3/reference)
- [Sheets API v4 Reference](https://developers.google.com/sheets/api/reference/rest)
- [Service Account Authentication](https://cloud.google.com/iam/docs/service-accounts)

---

*Research complete: 2026-01-23*
