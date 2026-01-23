# Features Research: Sponsor Management v1.2

**Research Date:** 2026-01-23
**Milestone:** v1.2 Sponsor Management Redesign
**Focus:** Upload workflows, marketing dashboard, conditional display

## Existing Features (Already Built - v1.1)

✅ **Do NOT re-research** these validated capabilities:
- Public sponsorship package display
- Sponsor interest form
- Stripe invoice creation (basic)
- Webhook payment detection
- Email delivery (Resend)

## NEW Features for v1.2

### Category 1: Invoice Management (Enhanced)

**Table Stakes:**
- **INV-01:** Marketing admin creates invoice with manual data entry (company, email, package selection)
- **INV-02:** Select package from dropdown (pre-populated from database)
- **INV-03:** Invoice preview before sending to sponsor
- **INV-04:** Send invoice via Stripe (sponsor receives payment link email)
- **INV-05:** View all invoices in list view with status badges
- **INV-06:** Filter invoices by status (draft, open, paid, void)
- **INV-07:** Void unpaid invoices

**Differentiators:**
- **INV-08:** Tag invoice metadata in Stripe as "sponsorship" for accounting
- **INV-09:** Auto-populate invoice from sponsor interest form (if exists)
- **INV-10:** Search invoices by company name or email

**Complexity Notes:**
- INV-01 to INV-07: Medium complexity (Stripe API wrapper, form handling)
- INV-08: Low complexity (metadata field in Stripe API)
- INV-09: Low complexity (database join, pre-fill form)
- INV-10: Low complexity (SQL search query)

**Dependencies:** Requires existing Stripe SDK (v1.1) and invoices table.

---

### Category 2: Post-Payment Upload Workflow

**Table Stakes:**
- **UPLOAD-01:** Generate secure upload form link after payment (unique token per invoice)
- **UPLOAD-02:** Sponsor accesses upload form via email link (no login required)
- **UPLOAD-03:** Upload form accepts logo file (image validation: PNG/JPG/SVG, max 2MB)
- **UPLOAD-04:** Upload form accepts website URL field
- **UPLOAD-05:** Upload form shows sponsor's company name and package details (read-only)
- **UPLOAD-06:** Form validation before submission (required fields, file type/size)
- **UPLOAD-07:** Success confirmation after submission

**Differentiators:**
- **UPLOAD-08:** Show upload deadline (e.g., "Please upload within 30 days")
- **UPLOAD-09:** Allow re-upload if sponsor makes mistake (before admin approval)
- **UPLOAD-10:** Preview uploaded logo before final submit

**Anti-features** (deliberately NOT building):
- Multi-file upload (just logo) - reduces complexity
- Drag-and-drop interface - nice-to-have, not critical
- Progress bars for upload - files are small (<2MB)

**Complexity Notes:**
- UPLOAD-01: Medium (secure token generation, expiration logic)
- UPLOAD-02 to UPLOAD-07: Medium (public form, file handling, storage)
- UPLOAD-08 to UPLOAD-10: Low (UI enhancements)

**Dependencies:** Requires Supabase Storage (temp), Google Drive API (final destination).

---

### Category 3: Google Drive Integration

**Table Stakes:**
- **GDRIVE-01:** Create folder structure organized by package type (e.g., `/Sponsors/Game Day Package/`)
- **GDRIVE-02:** Upload sponsor logo to appropriate package folder
- **GDRIVE-03:** Folder naming: `{Company Name} - {Invoice ID}` for uniqueness
- **GDRIVE-04:** Store Google Drive folder ID in database for reference

**Differentiators:**
- **GDRIVE-05:** Auto-create parent folders if missing (e.g., new package types)
- **GDRIVE-06:** Set folder permissions (shared with marketing team)

**Anti-features:**
- Version history in Drive - Drive handles this natively
- Backup/sync to other services - Drive is source of truth
- File compression/optimization - upload as-is

**Complexity Notes:**
- GDRIVE-01 to GDRIVE-04: Medium (Google Drive API, folder management)
- GDRIVE-05: Low (recursive folder creation)
- GDRIVE-06: Medium (Drive sharing API)

**Dependencies:** Requires `googleapis` package, service account credentials.

---

### Category 4: Google Sheets Integration

**Table Stakes:**
- **GSHEET-01:** Append new row to master spreadsheet when invoice is created
- **GSHEET-02:** Spreadsheet columns: Company, Package, Invoice ID, Payment Date, Upload Status, Drive Folder Link, Website URL
- **GSHEET-03:** Update row when upload is completed (Upload Status → "Complete")
- **GSHEET-04:** Update Payment Date when invoice is paid

**Differentiators:**
- **GSHEET-05:** Hyperlink Drive folder in spreadsheet (clickable)
- **GSHEET-06:** Color-code rows by status (pending payment = yellow, uploaded = green)

**Anti-features:**
- Two-way sync (Sheets → Database) - Database is source of truth
- Real-time updates - batch updates on webhook events are sufficient
- Custom formulas/charts - user can add manually

**Complexity Notes:**
- GSHEET-01 to GSHEET-04: Medium (Sheets API, row updates)
- GSHEET-05: Low (formula string in append)
- GSHEET-06: Medium (conditional formatting API)

**Dependencies:** Requires `googleapis` package, Sheets API scope.

---

### Category 5: Conditional Sponsor Display

**Table Stakes:**
- **DISPLAY-01:** Check if invoice is paid (status = "paid")
- **DISPLAY-02:** Check if package includes website benefit (database flag or package name match)
- **DISPLAY-03:** Only display on Partners page if BOTH conditions true
- **DISPLAY-04:** Fetch sponsor logos from Google Drive (or cache in Supabase Storage)
- **DISPLAY-05:** Display company name and link to website URL

**Differentiators:**
- **DISPLAY-06:** Tier-based display sizing (higher tiers = larger logo)
- **DISPLAY-07:** Sort by tier priority (higher tiers first)
- **DISPLAY-08:** Fallback to default placeholder if logo missing

**Anti-features:**
- Sponsor profile pages - just logo + link
- Sponsor carousel/animation - static grid is sufficient
- Sponsor testimonials - out of scope for v1.2

**Complexity Notes:**
- DISPLAY-01 to DISPLAY-05: Medium (database query with joins, image optimization)
- DISPLAY-06 to DISPLAY-08: Low (CSS sizing, sorting logic)

**Dependencies:** Requires invoices table, sponsor_uploads table, Google Drive API.

---

### Category 6: Marketing Dashboard

**Table Stakes:**
- **DASH-01:** Package status widget: show all packages with available slots, closing dates
- **DASH-02:** Invoice tracking widget: count by status (draft, open, paid, void), total revenue
- **DASH-03:** Upload completion widget: pending uploads count, completed uploads count
- **DASH-04:** Recent activity feed: last 10 invoices created/paid/uploaded
- **DASH-05:** Quick actions: "Create Invoice" button, "View All Invoices" link

**Differentiators:**
- **DASH-06:** Revenue chart by package type
- **DASH-07:** Upload completion rate percentage
- **DASH-08:** Overdue upload alerts (invoices paid >30 days ago, no upload)

**Anti-features:**
- Real-time websocket updates - periodic refresh is sufficient
- Export to CSV - can query database directly
- Custom dashboard builder - fixed layout is fine

**Complexity Notes:**
- DASH-01 to DASH-05: Medium (aggregate queries, component composition)
- DASH-06 to DASH-08: Low (calculations, conditional alerts)

**Dependencies:** Requires invoices table, sponsorship_packages table, sponsor_uploads table.

---

## Feature Priority Summary

**MUST HAVE (This Milestone):**
- Invoice management (INV-01 to INV-07)
- Upload workflow (UPLOAD-01 to UPLOAD-07)
- Google Drive integration (GDRIVE-01 to GDRIVE-04)
- Google Sheets integration (GSHEET-01 to GSHEET-04)
- Conditional display (DISPLAY-01 to DISPLAY-05)
- Marketing dashboard (DASH-01 to DASH-05)

**NICE TO HAVE (This Milestone):**
- INV-08 (Stripe metadata tag)
- UPLOAD-08 (upload deadline display)
- GDRIVE-05 (auto-create parent folders)
- GSHEET-05 (hyperlink Drive folder)
- DISPLAY-06 (tier-based sizing)
- DASH-07 (upload completion rate)

**FUTURE MILESTONE:**
- INV-09, INV-10 (search, auto-populate)
- UPLOAD-09, UPLOAD-10 (re-upload, preview)
- GDRIVE-06 (folder permissions)
- GSHEET-06 (color-code rows)
- DISPLAY-07, DISPLAY-08 (sorting, fallback)
- DASH-06, DASH-08 (charts, alerts)

---
*Features research complete for v1.2 milestone*
