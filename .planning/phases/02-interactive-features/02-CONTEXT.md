# Phase 2: Interactive Features - Context

**Gathered:** 2026-01-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Enable donations via embedded GiveButter form and self-service sponsor submission with admin approval workflow. Sponsors submit their info and logo; admin reviews and approves; approved sponsors appear on Partners page. AI-powered content management is Phase 3.

</domain>

<decisions>
## Implementation Decisions

### Donation Page Experience
- Hero-level prominence: large header, emotional messaging, GiveButter form front and center
- Mission-focused messaging tone: "Help kids discover their potential" — big-picture vision
- Let GiveButter handle donation tiers/amounts — use whatever is configured in GiveButter directly

### Sponsor Submission Form
- Basic fields: company name, logo, website URL, contact email, contact name
- No sponsorship tiers — all sponsors displayed equally
- Strict logo requirements: PNG format, transparent background required, minimum 200x200px

### Admin Approval Workflow
- Dual notification: email to admin when new sponsor submits + badge/counter on dashboard
- Auto-email to sponsors on both approval ("You're live!") and rejection ("Thanks, but...")
- Optional note field: admin can add custom message that goes in the email
- List view with quick actions: table of pending sponsors with inline Approve/Reject buttons

### Partners Page Display
- Logo grid layout: clean grid of clickable logos, uniform sizing, responsive
- Alphabetical ordering by company name
- Click action: opens sponsor website in new tab
- Prominent "Become a Partner" CTA button/section linking to sponsor submission form

### Claude's Discretion
- Whether to include sponsorship/volunteering links on Ways to Give page
- Loading states and error handling UX
- Exact email template wording and design
- Admin dashboard styling and table design

</decisions>

<specifics>
## Specific Ideas

No specific product references — open to standard approaches that match the existing site aesthetic.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-interactive-features*
*Context gathered: 2026-01-17*
