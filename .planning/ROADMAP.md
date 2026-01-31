# Roadmap: RiseUp Youth Football League Website

## Milestones

- ✅ **v1.0 MVP** - Phases 1-3 (shipped 2026-01-18)
- ✅ **v1.1 Sponsorship Packages** - Phases 4-5 (partial, 2026-01-21)
- 🚧 **v1.2 Sponsor Management Redesign** - Phases 8-13 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-3) - SHIPPED 2026-01-18</summary>

### Phase 1: Project Foundation
**Goal**: Development environment and foundational infrastructure ready
**Plans**: 3 plans

Plans:
- [x] 01-01: Next.js project setup with TypeScript and Tailwind
- [x] 01-02: Supabase database and authentication configuration
- [x] 01-03: Basic routing structure and admin panel skeleton

### Phase 2: Content Management System
**Goal**: AI-powered content editing with preview and rollback
**Plans**: 3 plans

Plans:
- [x] 02-01: Content storage schema and API layer
- [x] 02-02: Claude integration for natural language commands
- [x] 02-03: Preview, publish, and rollback workflows

### Phase 3: Public Website & Sponsor Portal
**Goal**: Full public website with self-service sponsor submission
**Plans**: 3 plans

Plans:
- [x] 03-01: Public pages with responsive design and video hero
- [x] 03-02: GiveButter donation integration
- [x] 03-03: Sponsor submission portal with admin approval

</details>

<details>
<summary>✅ v1.1 Sponsorship Packages (Phases 4-5) - PARTIAL</summary>

### Phase 4: Foundation & Schema
**Goal**: Database schema, Stripe SDK, and environment configuration ready for invoice features
**Status**: Complete (2026-01-20)
**Plans**: 1 plan

Plans:
- [x] 04-01: Database migration, Stripe SDK setup, and webhook endpoint

### Phase 5: Public Sponsorship Page
**Goal**: Prospective sponsors can view tiers and submit interest forms
**Status**: Complete (2026-01-21)
**Plans**: 2 plans

Plans:
- [x] 05-01: Schema migration for display fields, validation schema, and server action
- [x] 05-02: Pricing table, interest form, confirmation modal, and page assembly

**Note:** v1.1 Phases 6-7 were superseded by v1.2 redesign.

</details>

### 🚧 v1.2 Sponsor Management Redesign

**Milestone Goal:** Complete redesign of sponsor management workflow with invoice creation, Google Drive integration, automated upload processing, and comprehensive marketing dashboard.

#### Phase 8: Database & Core Services
**Goal**: Google Drive/Sheets integration foundation and database schema ready
**Depends on**: Phase 5
**Requirements**: GDRIVE-01, GDRIVE-02, GDRIVE-03, GDRIVE-04, GSHEET-01, GSHEET-02, GSHEET-03, GSHEET-04, DISPLAY-02
**Success Criteria** (what must be TRUE):
  1. `sponsor_uploads` table exists with all required columns
  2. `sponsorship_packages` table has flexible package benefits (checkbox system)
  3. Google Drive client can authenticate via service account and create folders
  4. Google Sheets client can authenticate and append/update rows
  5. Service account permissions validated (can access Drive folder and Spreadsheet)
  6. Validation script passes all tests
**Plans**: 3 plans

Plans:
- [ ] 08-01: Database schema & package benefits (migration 006)
- [ ] 08-02: Google Drive & Sheets integration (googleapis clients)
- [ ] 08-03: Setup validation & documentation (scripts + guides)

#### Phase 9: Invoice Management UI
**Goal**: Marketing admins can create, view, filter, and void invoices from admin panel
**Depends on**: Phase 8
**Requirements**: INV-01, INV-02, INV-03, INV-04, INV-05
**Success Criteria** (what must be TRUE):
  1. Marketing admin can access invoice management page at `/admin/dashboard/invoices`
  2. Marketing admin can create invoice by selecting package and entering sponsor details
  3. Marketing admin can view all invoices in list view with status badges
  4. Marketing admin can filter invoices by status (draft, open, paid, void)
  5. Marketing admin can void unpaid invoices with one click
  6. Invoice metadata in Stripe includes "sponsorship" tag
**Plans**: TBD

Plans:
- [ ] 09-01: TBD
- [ ] 09-02: TBD

#### Phase 10: Payment Webhook Enhancement
**Goal**: Automated post-payment workflow triggers Google Drive folder, upload token, and emails
**Depends on**: Phase 8, Phase 9
**Requirements**: UPLOAD-01, GSHEET-03
**Success Criteria** (what must be TRUE):
  1. Stripe webhook detects `invoice.paid` event within seconds of payment
  2. System creates Google Drive folder organized by package type
  3. System generates secure upload token (crypto-secure UUID, 90-day expiration)
  4. System saves upload token to database with invoice reference and folder ID
  5. System updates Google Sheets row with payment date and status
  6. System sends email to sponsor with upload form link
  7. Webhook handles duplicate events safely (idempotency via `webhook_events` table)
**Plans**: TBD

Plans:
- [ ] 10-01: TBD
- [ ] 10-02: TBD

#### Phase 11: Upload Form
**Goal**: Sponsors can access upload form and submit logo + website URL
**Depends on**: Phase 10
**Requirements**: UPLOAD-02, UPLOAD-03, UPLOAD-04, UPLOAD-05, UPLOAD-06, UPLOAD-07, GDRIVE-02, GDRIVE-03, GSHEET-04
**Success Criteria** (what must be TRUE):
  1. Sponsor can access upload form at `/upload/[token]` (public route, no login)
  2. Upload form validates token (checks expiration, not already used)
  3. Upload form displays sponsor's company name and package details (read-only)
  4. Upload form accepts logo file with client-side validation (PNG/JPG/SVG, max 2MB)
  5. Upload form accepts website URL with format validation
  6. Upload form validates before submission (required fields, file size/type)
  7. System uploads logo to Google Drive folder created in Phase 10
  8. System updates Google Sheets row with upload completion status and Drive link
  9. System marks upload token as used (prevents reuse)
  10. Sponsor receives success confirmation message
  11. System sends confirmation email to sponsor and notification email to admin
**Plans**: TBD

Plans:
- [ ] 11-01: TBD
- [ ] 11-02: TBD
- [ ] 11-03: TBD

#### Phase 12: Conditional Sponsor Display
**Goal**: Partners page displays sponsors based on payment status and package benefits
**Depends on**: Phase 11
**Requirements**: DISPLAY-01, DISPLAY-03, DISPLAY-04, DISPLAY-05
**Success Criteria** (what must be TRUE):
  1. Partners page queries sponsors with JOIN on invoices and sponsor_uploads tables
  2. Partners page filters to show only sponsors with paid invoices AND package includes website benefit
  3. Partners page displays company name and logo for qualifying sponsors
  4. Company name links to sponsor's website URL
  5. Logos are fetched from Supabase Storage cache (not live Drive API calls)
  6. Partners page handles missing logos gracefully (no broken images)
  7. Historical sponsors from old `sponsors` table continue to display (union query)
**Plans**: TBD

Plans:
- [ ] 12-01: TBD
- [ ] 12-02: TBD

#### Phase 13: Marketing Dashboard
**Goal**: Marketing admins have visibility into packages, invoices, and upload status
**Depends on**: Phase 8, Phase 9
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04, DASH-05
**Success Criteria** (what must be TRUE):
  1. Dashboard displays package status widget with available slots and closing dates
  2. Dashboard displays invoice tracking widget with status counts and total revenue
  3. Dashboard displays upload completion widget with pending/completed counts
  4. Dashboard displays recent activity feed showing last 10 invoice/upload events
  5. Dashboard includes "Create Invoice" button linking to invoice creation form
  6. Dashboard data updates on page refresh (30s auto-refresh optional)
**Plans**: TBD

Plans:
- [ ] 13-01: TBD
- [ ] 13-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 8 → 9 → 10 → 11 → 12 → 13

**Note:** Phase 13 (Marketing Dashboard) can be built in parallel with Phases 10-12 since it's read-only and depends only on Phase 8-9 data structures.

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Project Foundation | v1.0 | 3/3 | Complete | 2026-01-18 |
| 2. Content Management System | v1.0 | 3/3 | Complete | 2026-01-18 |
| 3. Public Website & Sponsor Portal | v1.0 | 3/3 | Complete | 2026-01-18 |
| 4. Foundation & Schema | v1.1 | 1/1 | Complete | 2026-01-20 |
| 5. Public Sponsorship Page | v1.1 | 2/2 | Complete | 2026-01-21 |
| 8. Database & Core Services | v1.2 | 0/3 | Ready to start | - |
| 9. Invoice Management UI | v1.2 | 0/TBD | Not started | - |
| 10. Payment Webhook Enhancement | v1.2 | 0/TBD | Not started | - |
| 11. Upload Form | v1.2 | 0/TBD | Not started | - |
| 12. Conditional Sponsor Display | v1.2 | 0/TBD | Not started | - |
| 13. Marketing Dashboard | v1.2 | 0/TBD | Not started | - |
