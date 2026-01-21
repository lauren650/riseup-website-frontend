# Phase 5: Public Sponsorship Page - Context

**Gathered:** 2026-01-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Prospective sponsors can view sponsorship tiers and submit interest forms. The page is accessible from the Partners page. Invoice creation and payment handling are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Tier presentation
- Classic horizontal pricing table with tiers as columns, benefits as rows
- All tiers presented equally — no highlighting or "recommended" badges
- Each tier shows: name, price, short description/tagline, and benefits list
- Single CTA button below the table that scrolls to the interest form (no per-tier buttons)

### Page layout & feel
- No hero section — jump directly into content
- Accessible via link from Partners page only (not in main navigation)
- Match the existing site tone
- Include a brief benefits blurb explaining why sponsoring matters (visibility, community impact, etc.)

### Interest form design
- Required fields: name, email, phone, company/organization name
- No tier selection in form — users view tiers above but don't pick one when submitting
- No message/notes field — keep form short
- Form appears below the tier table, scrolled to via CTA button

### Confirmation experience
- Modal confirmation after successful submission
- Message: "Thank you! We'll be in touch within [X] days"
- Auto-email sent to prospect confirming receipt
- Admin receives email notification when new inquiry is submitted

### Claude's Discretion
- Exact modal styling and animation
- Benefits blurb copywriting
- Form validation behavior and error messages
- Email template design
- Response timeline mentioned in confirmation (e.g., "2-3 business days")

</decisions>

<specifics>
## Specific Ideas

- Page tone should match the rest of the site (warm community feel with professional presentation)
- Tiers are for viewing/comparison only — the form is a general "express interest" submission

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-public-sponsorship-page*
*Context gathered: 2026-01-20*
