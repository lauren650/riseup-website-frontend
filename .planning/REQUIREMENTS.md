# Requirements: RiseUp Youth Football League Website

**Defined:** 2026-01-23
**Milestone:** v1.2 Sponsor Management Redesign
**Core Value:** Non-technical administrators can update website content instantly using natural language commands

---

## v1.2 Requirements

Requirements for sponsor management redesign milestone. Each maps to roadmap phases.

### Invoice Management

- [ ] **INV-01**: Marketing admin can create invoice with manual data entry (company name, email, package selection)
- [ ] **INV-02**: Marketing admin can view all invoices in list view
- [ ] **INV-03**: Marketing admin can filter invoices by status (draft, open, paid, void)
- [ ] **INV-04**: Marketing admin can void unpaid invoices
- [ ] **INV-05**: System tags invoice metadata in Stripe as "sponsorship" transaction type

### Post-Payment Upload Workflow

- [ ] **UPLOAD-01**: System generates secure upload form link after payment (unique token, 90-day expiration)
- [ ] **UPLOAD-02**: Sponsor can access upload form via email link (no login required)
- [ ] **UPLOAD-03**: Upload form accepts logo file with validation (PNG/JPG/SVG, max 2MB)
- [ ] **UPLOAD-04**: Upload form accepts website URL field
- [ ] **UPLOAD-05**: Upload form displays sponsor's company name and package details (read-only)
- [ ] **UPLOAD-06**: Upload form validates required fields and file type/size before submission
- [ ] **UPLOAD-07**: Sponsor receives success confirmation after submission

### Google Drive Integration

- [ ] **GDRIVE-01**: System creates folder structure organized by package type
- [ ] **GDRIVE-02**: System uploads sponsor logo to appropriate package folder
- [ ] **GDRIVE-03**: System names folders using format: `{Company Name} - {Invoice ID}`
- [ ] **GDRIVE-04**: System stores Google Drive folder ID in database for reference

### Google Sheets Integration

- [ ] **GSHEET-01**: System appends new row to master spreadsheet when invoice is created
- [ ] **GSHEET-02**: Spreadsheet includes columns: Company, Package, Invoice ID, Payment Date, Upload Status, Drive Folder Link, Website URL
- [ ] **GSHEET-03**: System updates row when invoice is paid (Payment Date, status)
- [ ] **GSHEET-04**: System updates row when upload is completed (Upload Status, Drive link, Website URL)

### Conditional Sponsor Display

- [ ] **DISPLAY-01**: System checks if invoice status is "paid"
- [ ] **DISPLAY-02**: System checks if package includes website benefit (database flag)
- [ ] **DISPLAY-03**: System displays sponsor on Partners page only if both conditions are true
- [ ] **DISPLAY-04**: Public Partners page shows company name and links to website URL
- [ ] **DISPLAY-05**: System fetches logos from cached source (not live Drive API on page load)

### Marketing Dashboard

- [ ] **DASH-01**: Dashboard displays package status widget (available slots, closing dates for each package)
- [ ] **DASH-02**: Dashboard displays invoice tracking widget (counts by status, total revenue)
- [ ] **DASH-03**: Dashboard displays upload completion widget (pending uploads count, completed uploads count)
- [ ] **DASH-04**: Dashboard displays recent activity feed (last 10 invoices created/paid/uploaded)
- [ ] **DASH-05**: Dashboard includes quick action button to create new invoice

---

## Future Requirements

Deferred to later milestones. Tracked but not in current roadmap.

### Enhanced Invoice Features

- **INV-06**: Marketing admin can search invoices by company name or email
- **INV-07**: System can auto-populate invoice from sponsor interest form (if exists)

### Enhanced Upload Features

- **UPLOAD-08**: Upload form displays upload deadline message (e.g., "Please upload within 30 days")
- **UPLOAD-09**: Sponsor can re-upload logo if mistake made (before admin approval)
- **UPLOAD-10**: Upload form shows preview of uploaded logo before final submission

### Enhanced Google Drive Features

- **GDRIVE-05**: System auto-creates parent folders if missing (new package types)
- **GDRIVE-06**: System sets folder sharing permissions (shared with marketing team)

### Enhanced Google Sheets Features

- **GSHEET-05**: Spreadsheet includes hyperlinked Drive folder (clickable link)
- **GSHEET-06**: Spreadsheet rows are color-coded by status (pending = yellow, complete = green)

### Enhanced Display Features

- **DISPLAY-06**: Partners page displays logos with tier-based sizing (higher tiers larger)
- **DISPLAY-07**: Partners page sorts sponsors by tier priority (higher tiers first)
- **DISPLAY-08**: Partners page shows placeholder if logo is missing

### Enhanced Dashboard Features

- **DASH-06**: Dashboard displays revenue chart by package type
- **DASH-07**: Dashboard displays upload completion rate percentage
- **DASH-08**: Dashboard displays overdue upload alerts (invoices paid >30 days ago, no upload)

---

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Multi-file upload per sponsor | Single logo is sufficient; reduces complexity |
| Drag-and-drop upload interface | Standard file input is adequate for target users |
| Real-time dashboard updates | Periodic refresh (30s) is sufficient; no websocket infrastructure needed |
| Two-way sync (Sheets → Database) | Database is source of truth; Sheets is reporting view only |
| Sponsor profile pages | Just logo + link on Partners page; full profiles over-engineered |
| CSV export from dashboard | Users can query database directly or use Sheets |
| OAuth user authentication for Google | Service account handles server-side automation; simpler than OAuth |
| Stripe subscription/recurring billing | One-time annual sponsorships; subscriptions add unnecessary complexity |

---

## Traceability

Which phases cover which requirements.

| Requirement | Phase | Status |
|-------------|-------|--------|
| INV-01 | Phase 9 | Pending |
| INV-02 | Phase 9 | Pending |
| INV-03 | Phase 9 | Pending |
| INV-04 | Phase 9 | Pending |
| INV-05 | Phase 9 | Pending |
| UPLOAD-01 | Phase 10 | Pending |
| UPLOAD-02 | Phase 11 | Pending |
| UPLOAD-03 | Phase 11 | Pending |
| UPLOAD-04 | Phase 11 | Pending |
| UPLOAD-05 | Phase 11 | Pending |
| UPLOAD-06 | Phase 11 | Pending |
| UPLOAD-07 | Phase 11 | Pending |
| GDRIVE-01 | Phase 8 | Pending |
| GDRIVE-02 | Phase 8, Phase 11 | Pending |
| GDRIVE-03 | Phase 8, Phase 11 | Pending |
| GDRIVE-04 | Phase 8 | Pending |
| GSHEET-01 | Phase 8 | Pending |
| GSHEET-02 | Phase 8 | Pending |
| GSHEET-03 | Phase 8, Phase 10 | Pending |
| GSHEET-04 | Phase 8, Phase 11 | Pending |
| DISPLAY-01 | Phase 12 | Pending |
| DISPLAY-02 | Phase 8 | Pending |
| DISPLAY-03 | Phase 12 | Pending |
| DISPLAY-04 | Phase 12 | Pending |
| DISPLAY-05 | Phase 12 | Pending |
| DASH-01 | Phase 13 | Pending |
| DASH-02 | Phase 13 | Pending |
| DASH-03 | Phase 13 | Pending |
| DASH-04 | Phase 13 | Pending |
| DASH-05 | Phase 13 | Pending |

---

**Coverage:**
- v1.2 requirements: 31 total
- Mapped to phases: 31
- Unmapped: 0

**Phase Distribution:**
- Phase 8 (Database & Core Services): 9 requirements
- Phase 9 (Invoice Management UI): 5 requirements
- Phase 10 (Payment Webhook Enhancement): 2 requirements
- Phase 11 (Upload Form): 9 requirements
- Phase 12 (Conditional Sponsor Display): 5 requirements
- Phase 13 (Marketing Dashboard): 5 requirements

---

*Requirements defined: 2026-01-23*
*Last updated: 2026-01-23*
