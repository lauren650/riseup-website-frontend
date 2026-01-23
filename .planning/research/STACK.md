# Stack Research: Sponsor Management v1.2

**Research Date:** 2026-01-23
**Milestone:** v1.2 Sponsor Management Redesign
**Focus:** NEW capabilities - Google Drive/Sheets integration, upload workflows

## Existing Stack (v1.1)

Already validated and working:
- **Stripe SDK** (stripe@17.3.1) - Invoice creation, webhooks
- **Next.js 16** - Server actions, API routes
- **Supabase** - PostgreSQL database, Storage
- **Resend** - Email delivery

✅ **Do NOT re-research** these - they're proven.

## New Stack Requirements

### Google Drive API Integration

**Package:** `googleapis` (Google's official Node.js client)
- **Version:** Latest stable (v140+)
- **Why:** Official library with TypeScript support, handles OAuth2/service accounts
- **Usage:** File uploads, folder creation/organization

**Authentication:** Service Account (not OAuth)
- **Why:** Server-side automation without user consent prompts
- **Setup:** JSON key file, store in environment variables
- **Scopes needed:**
  - `https://www.googleapis.com/auth/drive.file` (create/manage files)
  - `https://www.googleapis.com/auth/spreadsheets` (update sheets)

**Alternative Considered:** REST API directly
- **Rejected:** More boilerplate, type safety issues, reinventing the wheel

### Google Sheets API Integration

**Package:** Included in `googleapis` (same client library)
- **Methods:** `sheets.spreadsheets.values.append()` for adding sponsor rows
- **Why:** Batch updates, formula preservation, built-in formatting

**Data Structure Recommendation:**
```typescript
// Spreadsheet columns
['Company Name', 'Package', 'Invoice ID', 'Payment Date', 'Upload Status', 'Google Drive Folder', 'Website URL']
```

### File Upload Handling

**Package:** Built-in Next.js FormData + Supabase Storage
- **Why:** No new dependencies needed
- **Flow:** 
  1. Sponsor uploads via form → Supabase Storage (temporary)
  2. Server action → Copy to Google Drive
  3. Update Google Sheets row
  4. Clean up Supabase Storage (optional retention)

**Alternative Considered:** Direct upload to Google Drive from client
- **Rejected:** Requires exposing credentials or complex OAuth, security risk

### Environment Variables Needed

```bash
# New for v1.2
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=
GOOGLE_DRIVE_ROOT_FOLDER_ID=  # Parent folder for all sponsor uploads
GOOGLE_SPREADSHEET_ID=          # Master tracking spreadsheet
```

## Integration Points

### With Existing Stripe Workflow

```typescript
// Stripe webhook (already exists in v1.1) → enhanced for v1.2
webhook: invoice.paid
→ Create Google Drive folder (package-specific subfolder)
→ Generate upload form token/link
→ Send email with upload link
→ Initialize Google Sheets row (status: "Pending Upload")
```

### With Existing Database

**New table needed:** `sponsor_uploads`
```sql
CREATE TABLE sponsor_uploads (
  id UUID PRIMARY KEY,
  invoice_id UUID REFERENCES invoices(id),
  upload_token TEXT UNIQUE,  -- secure random token for upload form
  google_drive_folder_id TEXT,
  google_sheet_row_index INTEGER,
  logo_uploaded BOOLEAN DEFAULT false,
  website_url TEXT,
  upload_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Rationale & Trade-offs

### Why Google Drive (not Supabase Storage only)?

- **User requirement:** Explicit request for Google Drive/Sheets integration
- **Business workflow:** Marketing team likely already uses Google Workspace
- **Benefit:** Centralized access for non-technical staff, familiar interface

### Why Service Account (not OAuth)?

- **Server-side only:** No user interaction needed
- **Simpler auth:** One-time setup, no token refresh complexity
- **Security:** Scoped permissions, revocable

### Why append to Google Sheets (not query database)?

- **User requirement:** Explicit request for Google Sheets tracking
- **Business workflow:** Marketing team can view/export without database access
- **Limitation:** Sheets not source of truth - database is. Sheets = reporting view.

## Installation Commands

```bash
npm install googleapis@latest
```

**Bundle size impact:** ~200KB (acceptable for server-side only)

## Quality Checklist

- [x] Versions are current (googleapis v140+, Jan 2026)
- [x] Rationale explains WHY (business workflow, explicit requirements)
- [x] Integration with existing stack considered (Stripe webhooks, Supabase Storage)
- [x] Service account vs OAuth decision documented
- [x] No unnecessary dependencies (reuse Next.js FormData, Supabase Storage temp)

---
*Stack research complete for v1.2 milestone*
