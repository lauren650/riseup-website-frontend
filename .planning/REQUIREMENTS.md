# Requirements: RiseUp Youth Football League Website

**Defined:** 2026-01-20
**Milestone:** v1.1 Sponsorship Packages
**Core Value:** Non-technical administrators can update website content instantly using natural language commands

## v1.1 Requirements

Requirements for sponsorship packages milestone. Each maps to roadmap phases.

### Public Sponsorship Page

- [x] **SPUB-01**: User can access "Become a Sponsor" page from Partners page link
- [x] **SPUB-02**: User can view sponsorship tier table with tier names, prices, and benefits
- [x] **SPUB-03**: User can submit sponsor interest form with contact info and preferred tier
- [x] **SPUB-04**: User receives confirmation after submitting interest form

### Admin Invoice Management

- [ ] **SINV-01**: Marketing admin can view list of all invoices with status filters
- [ ] **SINV-02**: Marketing admin can create invoice from sponsor inquiry (pre-filled data)
- [ ] **SINV-03**: Marketing admin can create invoice from scratch (manual entry)
- [ ] **SINV-04**: Marketing admin can select sponsorship tier to set invoice amount
- [ ] **SINV-05**: Marketing admin can send invoice via Stripe (sponsor receives payment link email)
- [ ] **SINV-06**: Marketing admin can view invoice status (draft/open/paid/void)
- [ ] **SINV-07**: Marketing admin can void unpaid invoices

### Payment Automation

- [ ] **SAUT-01**: System detects payment via Stripe webhook
- [ ] **SAUT-02**: System updates invoice status in database when paid
- [ ] **SAUT-03**: System sends automated email to sponsor with upload form link after payment
- [ ] **SAUT-04**: System notifies admin when payment is received

### Data & Integration

- [ ] **SDAT-01**: System stores sponsor tier in database for future display options
- [ ] **SDAT-02**: System persists invoice history (ID, amount, status, dates)
- [ ] **SDAT-03**: Admin-configurable sponsorship tiers (name, price, benefits description)

## Future Requirements

Deferred to later milestones. Tracked but not in current roadmap.

### Enhanced Sponsor Display

- **SDISP-01**: Partners page displays sponsors differently based on tier (size, placement)
- **SDISP-02**: Higher-tier sponsors appear more prominently

### Advanced Invoice Features

- **SINV-08**: Payment retry/reminder emails for overdue invoices
- **SINV-09**: Invoice customization with RiseUp branding/logo
- **SINV-10**: Custom invoice numbering scheme (INV-2026-001)
- **SINV-11**: ACH/bank transfer payment option

### Sponsor Self-Service

- **SSELF-01**: Sponsor can view their invoice history
- **SSELF-02**: Sponsor can download invoice PDFs

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Subscription/recurring billing | Over-engineered for annual sponsorships; one-time invoices simpler |
| Invoice editing after finalization | Stripe doesn't support; void and recreate instead |
| Multi-currency support | RiseUp is local; USD only |
| Payment plans/installments | Adds complexity for sponsorship amounts |
| Late fee automation | Damages sponsor relationships; manual follow-up preferred |
| Custom payment form | Stripe hosted pages handle PCI compliance |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SPUB-01 | Phase 5 | Complete |
| SPUB-02 | Phase 5 | Complete |
| SPUB-03 | Phase 5 | Complete |
| SPUB-04 | Phase 5 | Complete |
| SINV-01 | Phase 6 | Pending |
| SINV-02 | Phase 6 | Pending |
| SINV-03 | Phase 6 | Pending |
| SINV-04 | Phase 6 | Pending |
| SINV-05 | Phase 6 | Pending |
| SINV-06 | Phase 6 | Pending |
| SINV-07 | Phase 6 | Pending |
| SAUT-01 | Phase 7 | Pending |
| SAUT-02 | Phase 7 | Pending |
| SAUT-03 | Phase 7 | Pending |
| SAUT-04 | Phase 7 | Pending |
| SDAT-01 | Phase 6 | Pending |
| SDAT-02 | Phase 6 | Pending |
| SDAT-03 | Phase 6 | Pending |

**Coverage:**
- v1.1 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0

**Phase Distribution:**
- Phase 4 (Foundation & Schema): 0 direct requirements (enables all others)
- Phase 5 (Public Sponsorship Page): 4 requirements (SPUB-01 to SPUB-04)
- Phase 6 (Invoice Management): 10 requirements (SINV-01 to SINV-07, SDAT-01 to SDAT-03)
- Phase 7 (Payment Automation): 4 requirements (SAUT-01 to SAUT-04)

---
*Requirements defined: 2026-01-20*
*Last updated: 2026-01-20 after roadmap creation*
