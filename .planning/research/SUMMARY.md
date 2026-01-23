# Research Summary: Sponsor Management v1.2

**Milestone:** v1.2 Sponsor Management Redesign
**Research Date:** 2026-01-23
**Research Files:** STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md

---

## Executive Summary

The v1.2 milestone redesigns sponsor management with a complete invoice-driven workflow that adds Google Drive/Sheets integration, automated upload forms, and a comprehensive marketing dashboard. This builds on v1.1's Stripe infrastructure while adding significant external integrations.

**Scope:** NEW features only - v1.1 already has Stripe invoicing foundation, database schema, and webhook infrastructure in place.

---

## Key Findings

### Stack Additions

**New Dependency:**
- `googleapis@140+` (Google's official Node.js client) - **ONLY new package needed**

**No Changes Needed:**
- Stripe SDK ✓ (already installed in v1.1)
- Next.js 16 ✓
- Supabase ✓
- Resend ✓

**Authentication Method:** Service Account (not OAuth)
- Server-side only, no user consent prompts
- JSON key file stored in environment variables
- Scopes: `drive.file` + `spreadsheets`

**Environment Variables:**
```bash
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=
GOOGLE_DRIVE_ROOT_FOLDER_ID=
GOOGLE_SPREADSHEET_ID=
```

---

### New Feature Table Stakes

**Must implement for v1.2:**

1. **Invoice Management (Enhanced)**
   - Manual invoice creation with package selection
   - List view with status filters (draft/open/paid/void)
   - Void unpaid invoices
   - Tag Stripe metadata as "sponsorship"

2. **Post-Payment Upload Workflow**
   - Generate secure upload form link (unique token per invoice)
   - Public upload form (no login required)
   - Accept logo file (PNG/JPG/SVG, max 2MB) + website URL
   - Form validation and success confirmation

3. **Google Drive Integration**
   - Create folder structure by package type
   - Upload sponsor logo to appropriate folder
   - Folder naming: `{Company Name} - {Invoice ID}`
   - Store folder ID in database

4. **Google Sheets Integration**
   - Append row on invoice creation
   - Columns: Company, Package, Invoice ID, Payment Date, Upload Status, Drive Folder, Website URL
   - Update row on payment and upload completion

5. **Conditional Sponsor Display**
   - Show on Partners page ONLY if:
     - Invoice status = "paid" AND
     - Package includes website benefit
   - Display logo + company name + website link

6. **Marketing Dashboard**
   - Package status widget (available slots, closing dates)
   - Invoice tracking widget (status counts, revenue)
   - Upload completion widget (pending/completed counts)
   - Recent activity feed (last 10 events)

---

### Architecture Highlights

**Data Flow:**
```
Admin creates invoice
  → Stripe invoice created + DB insert + Sheets append

Sponsor pays
  → Webhook detects payment
  → Create Google Drive folder
  → Generate upload token
  → Update Sheets (payment status)
  → Email upload link

Sponsor uploads logo
  → Save to Google Drive
  → Update Sheets (completion status)
  → Mark token as used
  → Send confirmation emails

Public page loads
  → Query: paid invoices with website benefit
  → Fetch cached logo URLs (not live Drive API)
  → Render sponsor grid
```

**New Database Table:**
```sql
CREATE TABLE sponsor_uploads (
  id UUID PRIMARY KEY,
  invoice_id UUID REFERENCES invoices(id),
  upload_token TEXT UNIQUE,
  google_drive_folder_id TEXT,
  google_sheet_row_index INTEGER,
  logo_uploaded BOOLEAN DEFAULT false,
  website_url TEXT,
  upload_completed_at TIMESTAMPTZ,
  token_expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '90 days'
);
```

**Extends Existing:**
- Stripe webhook handler → ADD Drive/Sheets logic on `invoice.paid`
- `/partners` page → ADD conditional display query
- `/admin/dashboard` → ADD new widgets

**Replaces:**
- `/admin/dashboard/sponsors` (old self-service approval) → NEW invoice management UI

---

### Critical Pitfalls to Avoid

**Top 5 Risks:**

1. **Google Drive Rate Limits**
   - ⚠️ Fetch logos on every page load = 403 errors
   - ✅ Cache logo URLs in database, use Supabase Storage as CDN

2. **Service Account Permissions**
   - ⚠️ Forgot to share Drive folder/Spreadsheet with service account email
   - ✅ Validate permissions at startup, log service account email

3. **Webhook Idempotency**
   - ⚠️ Duplicate events create multiple folders/emails
   - ✅ Check `webhook_events` table before processing (already exists in v1.1)

4. **Upload Token Security**
   - ⚠️ Predictable tokens, no expiration, reusable
   - ✅ Crypto-secure UUIDs, 90-day expiration, mark as used after upload

5. **Email Delivery Failures**
   - ⚠️ Sponsor pays but never gets upload link
   - ✅ Log all email attempts, show upload link in admin dashboard, build "resend" button

---

### Suggested Build Order

**6 phases, dependencies managed:**

1. **Phase 1:** Database & Core Services
   - Create `sponsor_uploads` table
   - Build Google Drive/Sheets clients
   - Validate service account permissions

2. **Phase 2:** Invoice Management UI (can parallel with Phase 3)
   - `/admin/dashboard/invoices` page
   - Create/list/filter/void invoices

3. **Phase 3:** Payment Webhook Enhancement (can parallel with Phase 2)
   - Enhance `/api/webhooks/stripe` for `invoice.paid`
   - Create Drive folder, generate token, update Sheets, send email

4. **Phase 4:** Upload Form (depends on Phase 3)
   - `/upload/[token]` public route
   - File upload validation
   - Save to Drive, update Sheets, send confirmations

5. **Phase 5:** Conditional Display (depends on Phase 4)
   - Update `/partners` page query
   - Cache logos, render with tier-aware sizing

6. **Phase 6:** Marketing Dashboard (can start after Phase 1)
   - Add widgets to `/admin/dashboard`
   - Aggregate queries for stats

---

## Recommendations

### What to Build

**This milestone (v1.2):**
- All 6 categories of table stakes features (see above)
- Basic tier-based logo sizing (DISPLAY-06)
- Stripe metadata tag (INV-08)
- Upload deadline display (UPLOAD-08)

**Future milestone (v1.3):**
- Search invoices by company/email (INV-10)
- Re-upload capability (UPLOAD-09)
- Folder permission sharing (GDRIVE-06)
- Color-coded Sheets rows (GSHEET-06)
- Revenue charts (DASH-06)
- Overdue upload alerts (DASH-08)

### What NOT to Build

**Explicit anti-features:**
- Multi-file upload (just logo)
- Drag-and-drop interface
- Real-time dashboard updates (periodic refresh is fine)
- Two-way sync (Sheets → Database)
- Sponsor profile pages
- Export to CSV (query database directly)

---

## Complexity Estimate

**Database:** 1 new table, migration straightforward
**API Integration:** Moderate - googleapis is well-documented, service account auth is simple
**UI Components:** 6-8 new components, mostly CRUD forms + data tables
**Testing Surface:** Webhook idempotency, token security, file validation, conditional display logic

**Estimated Effort:** 8-12 phases (plans), 4-6 hours build time

---

## Open Questions for Requirements Definition

1. **Package benefit flag:** Add explicit `includes_website_benefit` boolean to database, or match package names containing "website"?
   - **Recommendation:** Add boolean flag (cleaner, no hardcoded strings)

2. **Historical sponsors:** How to handle existing sponsors from old `sponsors` table workflow?
   - **Recommendation:** Display both (union query), mark source as "legacy" vs "v1.2"

3. **Logo caching strategy:** Copy to Supabase Storage after Drive upload, or store Drive URLs in database and serve via redirect?
   - **Recommendation:** Copy to Supabase Storage (CDN, faster, no Drive API rate limits)

4. **Upload token expiration:** 30 days, 60 days, or 90 days?
   - **Recommendation:** 90 days (gives sponsors time, can always extend manually)

5. **Email retry logic:** Immediate retry, or queue for background job?
   - **Recommendation:** Immediate 3x retry with exponential backoff (simpler, no queue infrastructure)

---

## Next Steps

Proceed to **Phase 8: Define Requirements**
- Use FEATURES.md categories to structure requirements
- Scope each category with user
- Generate REQUIREMENTS.md with REQ-IDs
- Map to phases in roadmap

---

*Research synthesis complete - ready for requirements definition*
