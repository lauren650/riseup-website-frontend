# Architecture Research: Sponsor Management v1.2

**Research Date:** 2026-01-23
**Milestone:** v1.2 Sponsor Management Redesign
**Focus:** Integration patterns, data flow, build order

## Existing Architecture (v1.1)

**Current components:**
- Public pages (Next.js routes): `/become-a-partner`, `/partners`
- Database tables: `sponsorship_packages`, `invoices`, `sponsor_interest`, `webhook_events`
- API routes: `/api/webhooks/stripe`
- Server actions: `submitSponsorInterest()`
- Components: `<PricingTable>`, `<InterestForm>`, `<SponsorGrid>`

**Current data flow:**
```
User views packages → Submits interest → Email to admin
(Invoice creation not yet built in v1.1 - superseded by v1.2)
```

## NEW Architecture for v1.2

### Integration Points with Existing System

**Extends (not replaces):**
- `invoices` table schema - ADD columns: `upload_token`, `google_drive_folder_id`, `google_sheet_row_index`
- Stripe webhook handler - ADD logic for Google Drive/Sheets on `invoice.paid` event
- Partners page - ADD conditional display logic based on invoice status + package benefits

**Replaces:**
- Old sponsor approval workflow (`/admin/dashboard/sponsors`) - REPLACE with new invoice-driven workflow
- `sponsors` table logic - DEPRECATE for new sponsors (keep existing for historical data)

---

### New Components Needed

#### 1. Admin Invoice Management UI

**Location:** `/admin/dashboard/invoices`

**Components:**
```
<InvoiceList>               // Main list view with filters
  <InvoiceTable>            // Data table with status badges
    <InvoiceRow>            // Individual invoice row
<InvoiceCreateForm>         // Modal or page for creating invoice
  <PackageSelector>         // Dropdown to select package
  <CustomerInputs>          // Company name, email fields
<InvoiceDetailView>         // View/void single invoice
```

**Server Actions:**
```typescript
createInvoice(data: { companyName, email, packageId })
voidInvoice(invoiceId: string)
```

---

#### 2. Upload Form (Public)

**Location:** `/upload/[token]` (public route, no auth)

**Components:**
```
<UploadForm>
  <LogoUploadField>         // File input with preview
  <WebsiteUrlField>         // Text input with validation
  <UploadSummary>           // Read-only sponsor/package info
```

**Server Actions:**
```typescript
submitUpload(token: string, data: { logoFile, websiteUrl })
```

**Security:** Token-based access (UUID), expires after 90 days or after submission.

---

#### 3. Google Drive Service Layer

**Location:** `/lib/google-drive/` (server-side only)

**Modules:**
```typescript
// lib/google-drive/client.ts
export function getDriveClient(): drive_v3.Drive

// lib/google-drive/folders.ts
export async function createPackageFolder(packageName: string)
export async function createSponsorFolder(companyName: string, invoiceId: string, parentFolderId: string)

// lib/google-drive/upload.ts
export async function uploadLogo(file: Buffer, filename: string, folderId: string)
```

---

#### 4. Google Sheets Service Layer

**Location:** `/lib/google-sheets/` (server-side only)

**Modules:**
```typescript
// lib/google-sheets/client.ts
export function getSheetsClient(): sheets_v4.Sheets

// lib/google-sheets/tracking.ts
export async function appendSponsorRow(data: SponsorTrackingRow)
export async function updateUploadStatus(rowIndex: number, status: string, driveFolderUrl: string)
```

---

#### 5. Marketing Dashboard

**Location:** `/admin/dashboard` (enhance existing page)

**New Components:**
```
<PackageStatusWidget>       // Available slots, closing dates
<InvoiceTrackingWidget>     // Status counts, revenue
<UploadCompletionWidget>    // Pending/completed uploads
<RecentActivityFeed>        // Last 10 events
```

**Data Sources:** Aggregate queries on `sponsorship_packages`, `invoices`, `sponsor_uploads` tables.

---

### Data Flow: Invoice Creation → Upload → Display

```
┌─────────────────────────────────────────────────────────────┐
│ 1. INVOICE CREATION (Admin)                                 │
└─────────────────────────────────────────────────────────────┘
Admin fills form
  → createInvoice() server action
  → Stripe API: create invoice
  → Database: INSERT into invoices table
  → Google Sheets: append row (status: "Invoice Sent")

┌─────────────────────────────────────────────────────────────┐
│ 2. PAYMENT (Sponsor)                                         │
└─────────────────────────────────────────────────────────────┘
Sponsor pays via Stripe hosted page
  → Stripe webhook: invoice.paid
  → Database: UPDATE invoices SET status='paid', paid_at=NOW()
  → Google Drive: create folder (package type / company name)
  → Database: INSERT into sponsor_uploads (token, folder_id)
  → Google Sheets: UPDATE row (status: "Paid - Pending Upload", payment date)
  → Email: send upload form link to sponsor

┌─────────────────────────────────────────────────────────────┐
│ 3. UPLOAD (Sponsor)                                          │
└─────────────────────────────────────────────────────────────┘
Sponsor clicks link in email
  → Loads /upload/[token] page
  → Uploads logo + enters website URL
  → submitUpload() server action
  → Supabase Storage: temp save (or skip, direct to Drive)
  → Google Drive: upload logo to folder
  → Database: UPDATE sponsor_uploads SET logo_uploaded=true, website_url=..., completed_at=NOW()
  → Google Sheets: UPDATE row (status: "Complete", Drive link, website URL)
  → Email: confirmation to sponsor + notification to admin

┌─────────────────────────────────────────────────────────────┐
│ 4. DISPLAY (Public)                                          │
└─────────────────────────────────────────────────────────────┘
User visits /partners page
  → Server component: query invoices JOIN sponsor_uploads
  → Filter: WHERE invoices.status='paid' AND package includes website benefit
  → Fetch logos from Google Drive (or Supabase cache)
  → Render <SponsorGrid> with logos + website links
```

---

### Database Schema Changes

**NEW table:** `sponsor_uploads`
```sql
CREATE TABLE sponsor_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  upload_token TEXT UNIQUE NOT NULL,
  google_drive_folder_id TEXT,
  google_sheet_row_index INTEGER,
  logo_uploaded BOOLEAN DEFAULT false,
  logo_filename TEXT,
  website_url TEXT,
  upload_completed_at TIMESTAMPTZ,
  token_expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '90 days',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sponsor_uploads_token ON sponsor_uploads(upload_token);
CREATE INDEX idx_sponsor_uploads_invoice ON sponsor_uploads(invoice_id);
```

**UPDATE table:** Add package metadata for display logic
```sql
-- Option 1: Add boolean flag to sponsorship_packages table
ALTER TABLE sponsorship_packages ADD COLUMN includes_website_benefit BOOLEAN DEFAULT false;

-- Option 2: Use package name matching (simpler, no migration)
-- Check if package.name contains "website" or "web" (case-insensitive)
```

---

### Suggested Build Order

**Phase 1: Database & Core Services**
1. Create `sponsor_uploads` table migration
2. Build Google Drive client + folder management
3. Build Google Sheets client + append/update functions
4. Add `includes_website_benefit` flag to packages table (or decide on name-matching approach)

**Phase 2: Invoice Management UI**
5. Create `/admin/dashboard/invoices` page (list view)
6. Build `<InvoiceCreateForm>` component
7. Implement `createInvoice()` server action
8. Implement invoice filtering (status dropdown)
9. Add void invoice action

**Phase 3: Payment Webhook Enhancement**
10. Enhance `/api/webhooks/stripe` for `invoice.paid` event
11. Trigger Google Drive folder creation
12. Generate upload token and save to `sponsor_uploads`
13. Trigger Google Sheets row update (payment status)
14. Send upload form email via Resend

**Phase 4: Upload Form**
15. Create `/upload/[token]` public route
16. Build `<UploadForm>` component with validation
17. Implement `submitUpload()` server action
18. Upload logo to Google Drive
19. Update Google Sheets row (completion status)
20. Send confirmation emails

**Phase 5: Conditional Display**
21. Update `/partners` page query (filter by paid + benefit check)
22. Fetch logos from Google Drive or cached in Supabase
23. Render sponsors with tier-aware sizing (if implementing DISPLAY-06)

**Phase 6: Marketing Dashboard**
24. Add widgets to `/admin/dashboard` page
25. Build aggregate queries for package/invoice/upload stats
26. Add recent activity feed component

---

### Critical Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| Token-based upload access (not login) | Sponsor doesn't need full account - simpler UX, email link is sufficient |
| Google Drive as final storage (not Supabase only) | User requirement, marketing team needs Google Workspace access |
| Database as source of truth (not Sheets) | Sheets is reporting view, database ensures data integrity and enables queries |
| Deprecate old `sponsors` table workflow | Invoice-driven workflow replaces self-service submission, old data kept for historical |
| Service account authentication | Server-side automation, no user interaction needed, simpler than OAuth |

---

### Build Order Considerations

**Dependencies:**
- Phase 1 must complete before all others (database + services are foundation)
- Phase 2 and 3 can be parallel (UI and webhook are independent)
- Phase 4 depends on Phase 3 (webhook must create token before upload form can use it)
- Phase 5 depends on Phase 4 (display needs uploaded logos)
- Phase 6 can be built in parallel with Phases 4-5 (dashboard is read-only view)

**Suggested Parallelization:**
- Phase 1 → (Phase 2 || Phase 3) → Phase 4 → Phase 5
- Phase 6 can start anytime after Phase 1

---
*Architecture research complete for v1.2 milestone*
