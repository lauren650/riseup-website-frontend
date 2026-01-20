# Roadmap: RiseUp Youth Football League Website

## Milestones

- ✅ **v1.0 MVP** - Phases 1-3 (shipped 2026-01-18)
- 🚧 **v1.1 Sponsorship Packages** - Phases 4-7 (in progress)

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

### 🚧 v1.1 Sponsorship Packages (In Progress)

**Milestone Goal:** Marketing admins can manage sponsorship packages and send Stripe invoices directly from admin panel, with automated post-payment workflows.

#### Phase 4: Foundation & Schema
**Goal**: Database schema, Stripe SDK, and environment configuration ready for invoice features
**Depends on**: Phase 3
**Requirements**: Foundation for SINV, SAUT, SDAT features
**Success Criteria** (what must be TRUE):
  1. Database tables exist for invoices, sponsorship tiers, and webhook event tracking
  2. Stripe SDK is installed and initialized with proper environment variables
  3. Sponsorship tier configuration can be stored and retrieved from database
  4. Webhook endpoint exists and can verify Stripe signatures
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD

#### Phase 5: Public Sponsorship Page
**Goal**: Prospective sponsors can view tiers and submit interest forms
**Depends on**: Phase 4
**Requirements**: SPUB-01, SPUB-02, SPUB-03, SPUB-04
**Success Criteria** (what must be TRUE):
  1. User can access "Become a Sponsor" page from Partners page link
  2. User can view sponsorship tier table with names, prices, and benefits
  3. User can submit sponsor interest form with contact info and preferred tier
  4. User receives confirmation message after submitting interest form
**Plans**: TBD

Plans:
- [ ] 05-01: TBD

#### Phase 6: Invoice Management
**Goal**: Marketing admins can create, view, and manage Stripe invoices from admin panel
**Depends on**: Phase 4
**Requirements**: SINV-01, SINV-02, SINV-03, SINV-04, SINV-05, SINV-06, SINV-07, SDAT-01, SDAT-02, SDAT-03
**Success Criteria** (what must be TRUE):
  1. Marketing admin can view list of all invoices with status filters (draft/open/paid/void)
  2. Marketing admin can create invoice from sponsor inquiry with pre-filled data
  3. Marketing admin can create invoice from scratch with manual entry
  4. Marketing admin can select sponsorship tier to auto-populate invoice amount
  5. Marketing admin can send invoice via Stripe (sponsor receives payment link email)
  6. Marketing admin can void unpaid invoices
  7. System stores sponsor tier in database for each invoice
**Plans**: TBD

Plans:
- [ ] 06-01: TBD
- [ ] 06-02: TBD

#### Phase 7: Payment Automation
**Goal**: Automated payment detection and post-payment workflows via Stripe webhooks
**Depends on**: Phase 4, Phase 6
**Requirements**: SAUT-01, SAUT-02, SAUT-03, SAUT-04
**Success Criteria** (what must be TRUE):
  1. System detects payment via Stripe webhook within seconds of sponsor payment
  2. System updates invoice status in database when payment is received
  3. System sends automated email to sponsor with upload form link after payment
  4. System notifies admin when payment is received
  5. Webhook handles duplicate events safely (idempotency protection)
**Plans**: TBD

Plans:
- [ ] 07-01: TBD
- [ ] 07-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 4 → 5 → 6 → 7

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Project Foundation | v1.0 | 3/3 | Complete | 2026-01-18 |
| 2. Content Management System | v1.0 | 3/3 | Complete | 2026-01-18 |
| 3. Public Website & Sponsor Portal | v1.0 | 3/3 | Complete | 2026-01-18 |
| 4. Foundation & Schema | v1.1 | 0/TBD | Not started | - |
| 5. Public Sponsorship Page | v1.1 | 0/TBD | Not started | - |
| 6. Invoice Management | v1.1 | 0/TBD | Not started | - |
| 7. Payment Automation | v1.1 | 0/TBD | Not started | - |
