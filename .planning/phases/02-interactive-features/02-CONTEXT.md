# Phase 2: Interactive Features - Context

**Gathered:** 2026-01-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Sponsors can self-submit sponsorship assets (after pre-approval) and donors can contribute via embedded GiveButter form. This phase delivers the donation integration on Ways to Give and the sponsor submission/approval workflow for the Partners page.

</domain>

<decisions>
## Implementation Decisions

### Donation Experience
- GiveButter form placed mid-page, after impact messaging
- Impact messaging is general ("Your donation helps kids play football") with photos/stories, not specific dollar amounts
- Use GiveButter's default suggested amounts and recurring options — no customization needed
- Let the embed handle its native functionality

### Sponsor Submission Flow
- Sponsors are pre-approved before they submit (admin has already arranged sponsorship)
- Form purpose: collect assets only (logo, company info for display)
- Required fields: Company name, logo, contact email, website URL, contact person name, phone, brief description
- Logo requirements: Flexible — accept common formats (PNG, JPG, SVG), any reasonable size
- After submission: Email confirmation sent to sponsor with their submission details

### Admin Approval Workflow
- Admin notified of new submissions via both email and dashboard
- Admin must review and approve uploaded assets before they appear on Partners page (not auto-publish)
- Admins can edit sponsor details directly after approval (logo, URL, description)
- No rejection workflow needed — sponsors are pre-approved, so submissions just need asset review

### Partners Page Display
- All logos displayed at uniform size (cropped/padded to fit grid)
- Logos ordered alphabetically by company name
- Clicking a logo opens sponsor's website in new tab
- No tier grouping — all sponsors displayed equally in one section

### Claude's Discretion
- Exact logo grid dimensions and padding
- Email notification templates
- Admin dashboard UI layout
- Form validation specifics

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-interactive-features*
*Context gathered: 2026-01-17*
