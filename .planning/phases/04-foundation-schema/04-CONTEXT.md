# Phase 4: Foundation & Schema - Context

**Gathered:** 2026-01-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Database schema, Stripe SDK, and environment configuration ready for sponsorship invoice features. This phase establishes the foundation — tables for packages, invoices, and webhook tracking; Stripe SDK initialization; environment variables.

</domain>

<decisions>
## Implementation Decisions

### Sponsorship Package Structure
- **Not traditional tiers** — a table of sponsorship packages with 4 columns
- Column structure: Package Name | Cost | Closing Date | Available Slots
- 4 packages defined:

| Package | Cost | Closing Date | Slots |
|---------|------|--------------|-------|
| T-shirt (tackle & flag), website, banner, golf tournament sign | $3,500 | July 31, 2026 | 18 |
| Website only logo | $600 | Year Round (Prorated) | 15 |
| Game day package | $750 | July 31, 2026 | 13 |
| Rise Up Academy t-shirt | $500 | February 18, 2026 | 18 |

### Package Management
- Admins can fully edit packages (name, price, dates, slots)
- Admins can add new packages and delete existing ones
- Packages with active invoices cannot be deleted (prevent deletion)
- Available slots decrease automatically when invoice is paid

### Invoice Branding
- Custom RiseUp branding on Stripe invoices
- Logo: Ready to upload (user has logo file)
- Colors: User has specific brand colors (to be provided before launch)

### Payment Methods
- Credit card and ACH bank transfer enabled
- Processing fees passed to sponsor (invoice amount + fees)
- Due on receipt (immediate payment expected)
- Automatic reminder emails for unpaid invoices via Stripe

### Claude's Discretion
- Exact database schema field names and types
- Stripe SDK initialization patterns
- Environment variable naming conventions
- Webhook endpoint implementation details

</decisions>

<specifics>
## Specific Ideas

- Packages have closing dates — schema must support date-based availability
- "Year Round (Prorated)" closing date needs special handling (always available, price may vary)
- Slot tracking is critical — must decrement atomically on payment

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-foundation-schema*
*Context gathered: 2026-01-20*
