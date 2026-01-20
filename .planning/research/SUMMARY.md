# Research Summary: v1.1 Sponsorship Packages

**Project:** RiseUp Youth Football League - Sponsorship Invoicing
**Domain:** Nonprofit invoice management with payment automation
**Researched:** 2026-01-20
**Overall Confidence:** HIGH

## Executive Summary

Sponsorship invoice systems in 2026 are built on a streamlined workflow: admin creates invoice via Stripe API, Stripe sends payment link, payment triggers webhook, automated actions follow. The recommended approach for RiseUp is **webhook-driven architecture with Stripe as payment processor and minimal UI overhead**. This leverages the existing Next.js 16 App Router + Supabase + Resend stack without requiring additional dependencies beyond the Stripe Node.js SDK.

The core technical approach is straightforward: use Next.js server actions for admin invoice creation, store minimal invoice metadata in Supabase for fast queries, and use Stripe webhooks as the single source of truth for payment status updates. This avoids the most common pitfall in Stripe integrations: race conditions between eager database writes and webhook processing. The key architectural decision is to **only write to Supabase from webhook handlers**, never from invoice creation endpoints.

**Critical risks:** Webhook signature verification failures (security vulnerability), race conditions from dual database updates (data corruption), and missing idempotency guards (duplicate emails/credits). All three are preventable with proper Phase 1 architecture decisions. The recommended implementation follows official Stripe patterns proven across thousands of production integrations.

## Key Findings

### Recommended Stack

Adding Stripe invoicing requires **only one new dependency**: the official Stripe Node.js SDK v20.2.0. Next.js 16 App Router eliminated the need for legacy packages like `micro` (for raw body parsing) by providing native `req.text()` for webhook signature verification. This integration fits cleanly into the existing architecture patterns.

**Core technologies:**
- **Stripe SDK v20.2.0**: Invoice creation, customer management, webhook verification — Latest stable release with full TypeScript support, industry-standard payment processing
- **Next.js 16 App Router**: Native webhook handling via `req.text()` — Eliminates need for custom body parser middleware, cleaner than Pages Router approach
- **Supabase**: Invoice metadata storage, status tracking — Enables fast admin queries without hitting Stripe API on every page load
- **Resend**: Post-payment email notifications — Already integrated, reuse existing patterns for payment confirmations

**No additional packages needed.** The `micro` package used in older Next.js examples is obsolete. App Router handles raw request bodies natively.

### Expected Features

The research identified a clear feature hierarchy for nonprofit sponsorship invoice systems. The focus is on **automation to reduce manual admin work** while maintaining **clear payment visibility**.

**Must have (table stakes):**
- Invoice creation UI in admin panel — Admins expect to create invoices without leaving their system
- Invoice status tracking (draft/open/paid/void) — Standard invoice lifecycle visibility
- Automated payment confirmation email — 60% more likely to get timely payment with clear confirmation
- Payment link in invoice email — One-click payment is standard; manual instructions are outdated
- Payment method flexibility (card, ACH) — Sponsors expect multiple payment options
- Invoice PDF generation — Sponsors need downloadable receipts for accounting (Stripe handles automatically)

**Should have (competitive differentiators):**
- Auto-send upload form link after payment — Reduces admin manual work; sponsor gets immediate next steps (RiseUp's key differentiator)
- Invoice creation from sponsor inquiry — Pre-populate from interest form data
- Tier-based invoice templates — Pre-configured amounts per sponsorship tier
- Payment received notification to sponsor — Thank-you email reinforces relationship

**Defer to v2+ (anti-features for v1):**
- Subscription/recurring billing — Over-engineered for annual sponsorships; one-time invoices are simpler
- Invoice editing after finalization — Stripe doesn't support; void and recreate instead
- Multi-currency support — RiseUp is local; USD only
- Payment plans/installments — Adds complexity for small amounts
- Late fee automation — Damages sponsor relationships; manual follow-up preferred

### Architecture Approach

The architecture follows a clean **event-driven pattern with webhook-based state synchronization**. Admin creates invoice via server action → Stripe sends payment link → sponsor pays → webhook updates database → emails triggered. This avoids race conditions by making webhooks the single source of truth for payment state.

**Major components:**

1. **Admin Invoice Creation** (`/src/lib/actions/invoices.ts`) — Server actions create Stripe customers, draft invoices, add line items, finalize and send. Follows existing pattern from `sponsors.ts`. No database writes during creation; webhooks handle persistence.

2. **Webhook Handler** (`/app/api/webhooks/stripe/route.ts`) — Receives Stripe events, verifies signatures using `req.text()`, returns 200 immediately, processes asynchronously. Handles `invoice.finalized`, `invoice.paid`, `invoice.payment_failed`, `invoice.voided`. Single source of truth for invoice status.

3. **Database Schema** — New `invoices` table stores Stripe invoice metadata (ID, customer, amount, status, URLs). Extends `sponsors` table with `stripe_customer_id` column. Enables fast admin queries without Stripe API calls.

4. **Email Integration** — Resend triggers on `invoice.paid` webhook. Sends payment confirmation and upload form link. Stripe's built-in invoice emails disabled to prevent duplicates.

**Key pattern:** Webhook-only database updates. Invoice creation endpoint calls Stripe API but doesn't write to Supabase. The `invoice.finalized` webhook creates the database record. This eliminates race conditions.

### Critical Pitfalls

From PITFALLS.md analysis, these five failures cause the most severe production issues:

1. **Webhook signature verification disabled/broken** — Attackers send fake payment events, granting unauthorized access. Prevention: Always use `stripe.webhooks.constructEvent()` with raw body from `req.text()`. Verify `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard. Test by sending unsigned POST (should fail with 400).

2. **Race conditions from dual database writes** — Admin creates invoice and writes to Supabase; webhook also writes; last-write-wins causes lost data. Prevention: **Webhook-only updates**. Invoice creation calls Stripe API only. The `invoice.finalized` webhook creates database record. Avoids all race conditions.

3. **Missing idempotency protection** — Stripe retries webhooks on timeout/network issues. Without deduplication, duplicate emails sent and duplicate credits granted. Prevention: Create `processed_webhook_events` table with unique constraint on `stripe_event_id`. Check before processing.

4. **Environment variable exposure** — Using `NEXT_PUBLIC_STRIPE_SECRET_KEY` exposes secret in client JavaScript bundle. Prevention: Never prefix Stripe secrets with `NEXT_PUBLIC_`. Only `STRIPE_PUBLISHABLE_KEY` is safe to expose.

5. **Webhook timeout from synchronous processing** — Sending emails and updating database before returning 200 takes >5 seconds. Stripe times out and retries. Prevention: Return 200 immediately, process asynchronously. For small scale (<100 invoices/month), simple async processing sufficient.

**Additional operational pitfall:** Test mode vs production mode confusion. Deploying with `sk_test_*` keys in production means no real payments accepted. Prevention: Startup validation checks for test keys in production environment, fails fast with clear error.

## Implications for Roadmap

Based on dependency analysis and risk mitigation priorities, suggested phase structure:

### Phase 1: Foundation & Schema
**Rationale:** Establish database schema, Stripe client, and environment configuration before any feature code. Zero risk to existing features.

**Delivers:**
- Supabase migration adding `invoices` table and `sponsors.stripe_customer_id` column
- Stripe SDK installed and client initialized (`/src/lib/stripe.ts`)
- Environment variables documented in `.env.local.example`
- Email templates extracted to `/src/lib/email/templates.ts`

**Addresses:** Pitfall #8 (Stripe customer ID storage), establishes foundation for all subsequent phases

**Avoids:** Schema changes mid-development, allows testing server actions in isolation

**Research flag:** Standard schema design, no deeper research needed

---

### Phase 2: Server Actions & Invoice Creation
**Rationale:** Implement invoice creation logic before UI exists. Enables isolated testing with Stripe test mode.

**Delivers:**
- `/src/lib/actions/invoices.ts` with `createInvoice`, `listInvoices`, `voidInvoice` functions
- Authentication verification (admin-only access)
- Stripe customer creation/lookup logic with caching
- Invoice workflow: draft → add items → finalize → send
- Validation schemas for invoice data

**Uses:** Stripe SDK, Supabase client, existing auth patterns from `sponsors.ts`

**Implements:** Admin Invoice Creation component from ARCHITECTURE.md

**Addresses:** Table stakes features (invoice creation, status tracking)

**Avoids:** Pitfall #6 (admin authentication bypass), Pitfall #11 (invoice finalization before items)

**Research flag:** Standard CRUD operations, no deeper research needed

---

### Phase 3: Webhook Handler & Payment Detection
**Rationale:** Webhook handler must be rock-solid before production. Stripe CLI enables local testing.

**Delivers:**
- `/app/api/webhooks/stripe/route.ts` with signature verification
- Event handlers for `invoice.finalized`, `invoice.paid`, `invoice.payment_failed`, `invoice.voided`
- Idempotency guards with `processed_webhook_events` table
- Immediate 200 response with async processing
- Database updates from webhook events only

**Uses:** Stripe webhook SDK, Next.js `req.text()`, Supabase upserts

**Implements:** Webhook Handler component from ARCHITECTURE.md

**Addresses:** Core payment detection (table stakes), post-payment automation (differentiator)

**Avoids:** Pitfall #1 (signature verification), Pitfall #2 (race conditions), Pitfall #3 (idempotency), Pitfall #5 (timeouts), Pitfall #14 (event ordering)

**Research flag:** **Needs deeper research** — Idempotency strategies, async queue options (Vercel Queue vs simple async), event ordering edge cases. Recommend `/gsd:research-phase` for webhook reliability patterns.

---

### Phase 4: Admin UI
**Rationale:** UI is lowest risk once server actions are stable. Follows existing admin panel patterns.

**Delivers:**
- `/app/admin/dashboard/invoices/page.tsx` (list view with filters)
- `/app/admin/dashboard/invoices/new/page.tsx` (create form)
- "Invoices" navigation link in admin header
- Sponsor dropdown populated from approved sponsors
- Invoice status display with color coding
- Loading states and error handling

**Implements:** Admin Panel Integration from ARCHITECTURE.md

**Addresses:** Table stakes (admin invoice UI), should-have (tier-based templates)

**Avoids:** Standard UI patterns, no unique pitfalls

**Research flag:** Standard Next.js UI patterns, no deeper research needed

---

### Phase 5: Email Notifications
**Rationale:** Emails enhance UX but aren't critical path. Add after core flow validated.

**Delivers:**
- Payment confirmation email template
- Upload form link in confirmation email (key differentiator)
- Admin notification on payment received
- Payment failed notification to admin

**Uses:** Resend SDK (already integrated), email templates from Phase 1

**Implements:** Email Integration component from ARCHITECTURE.md

**Addresses:** Table stakes (payment confirmation), differentiator (auto-send upload link)

**Avoids:** Pitfall #13 (duplicate emails — disable Stripe's built-in emails), Pitfall #3 (idempotency for email sends)

**Research flag:** Standard transactional email patterns, no deeper research needed

---

### Phase 6: Production Deployment
**Rationale:** Final validation in production environment after all components tested in isolation.

**Delivers:**
- Production webhook endpoint registered in Stripe Dashboard
- Live API keys configured in Vercel environment variables
- Database migration run in production Supabase
- End-to-end test with real Stripe payment (refunded)
- Production validation checklist completed

**Addresses:** Pitfall #10 (test vs production mode confusion)

**Avoids:** All critical pitfalls via deployment checklist validation

**Research flag:** **Needs validation** — Production webhook delivery, email deliverability testing, error monitoring setup. Not deep research, but operational validation.

---

### Phase Ordering Rationale

- **Database first** (Phase 1) — Enables server action development without blocking on UI
- **Server actions before UI** (Phase 2 → Phase 4) — Testable in isolation via Stripe CLI, reduces feedback loop
- **Webhooks before emails** (Phase 3 → Phase 5) — Core payment detection must be reliable before enhancement features
- **Production as final phase** (Phase 6) — All components validated in test mode before real money involved

**Dependency chain:** Phase 1 → Phase 2 → Phase 3 → Phase 4/5 (parallel) → Phase 6

**Risk mitigation:** Phases 1-2 are zero-risk foundation. Phase 3 is highest risk (webhooks) and gets dedicated testing with Stripe CLI. Phase 6 catches environment configuration issues before launch.

### Research Flags

**Phases needing deeper research during planning:**
- **Phase 3 (Webhook Handler):** Complex integration with idempotency, async processing, and event ordering edge cases. Recommend `/gsd:research-phase` to investigate queue options (Vercel Queue vs Inngest vs simple async), advanced idempotency patterns, and webhook retry strategies.

**Phases with standard patterns (skip research-phase):**
- **Phase 1:** Schema migrations are well-documented in Supabase docs
- **Phase 2:** Server actions follow existing patterns in codebase (`sponsors.ts`, `contact.ts`)
- **Phase 4:** Admin UI follows established Next.js + TailwindCSS patterns in existing admin panel
- **Phase 5:** Transactional emails follow existing Resend patterns in codebase

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Official Stripe Node.js SDK v20.2.0 docs, Next.js 16 App Router verified patterns, existing Supabase/Resend integration proven |
| Features | MEDIUM | Industry best practices from multiple sources (Stripe docs, nonprofit tooling articles), but limited RiseUp-specific sponsor feedback |
| Architecture | HIGH | Stripe's official webhook-driven pattern, Next.js App Router documented extensively, existing codebase patterns match recommendations |
| Pitfalls | HIGH | Verified from official Stripe documentation, real-world production failures documented in community sources, phase-specific assignments validated |

**Overall confidence:** HIGH

The technical implementation is well-documented with official sources. The only medium-confidence area is feature prioritization, which depends on sponsor preferences not fully validated. However, table stakes features (invoice creation, payment detection, confirmation emails) are universally expected and low-risk to implement.

### Gaps to Address

**Invoice customization (branding, logos):**
- Research identified Stripe supports custom branding in Dashboard settings
- Gap: Whether RiseUp wants custom branding or default Stripe appearance
- Handle: Add to Phase 1 if needed, defer to v2 if not critical

**Payment method selection (credit card vs ACH vs wire):**
- Research shows Stripe supports ACH and wire transfers
- Gap: Which payment methods sponsors prefer (ACH has lower fees but longer settlement)
- Handle: Start with credit card only (default), add ACH in Phase 2 if requested

**Invoice numbering scheme:**
- Stripe auto-generates invoice numbers
- Gap: Whether RiseUp accounting requires specific format (e.g., "INV-2026-001")
- Handle: Use Stripe default for v1, add custom numbering in v2 if accounting requires

**Webhook async processing strategy:**
- Multiple options: Vercel Queue, Inngest, simple async, BullMQ
- Gap: Which strategy for current scale (<100 invoices/month)
- Handle: Start with simple async (return 200 immediately, don't await processing). Upgrade to queue if webhook processing exceeds 2 seconds.

**Email strategy (Stripe vs Resend):**
- Both can send invoice emails
- Gap: Which system should send (avoid duplicates)
- Handle: Disable Stripe's invoice emails, use only Resend for consistent branding and upload form link inclusion

## Sources

### Primary (HIGH confidence)
- [Stripe Node.js SDK v20.2.0](https://github.com/stripe/stripe-node/releases) — Latest version verification
- [Stripe Invoicing Integration Quickstart](https://docs.stripe.com/invoicing/integration/quickstart) — Invoice creation workflow
- [Stripe API Reference - Invoices](https://docs.stripe.com/api/invoices) — API endpoints and parameters
- [Stripe Webhooks Documentation](https://docs.stripe.com/webhooks) — Webhook verification and best practices
- [Next.js with Stripe Webhook Example](https://github.com/vercel/next.js/blob/canary/examples/with-stripe-typescript/app/api/webhooks/route.ts) — Official pattern verification
- [Stripe Invoice Status Transitions](https://docs.stripe.com/invoicing/integration/workflow-transitions) — Event ordering and lifecycle

### Secondary (MEDIUM confidence)
- [Stripe Webhooks Guide 2026](https://www.magicbell.com/blog/stripe-webhooks-guide) — Event type comparisons and idempotency patterns
- [Next.js 15 Stripe Webhook Tutorial](https://medium.com/@gragson.john/stripe-checkout-and-webhook-in-a-next-js-15-2025-925d7529855e) — App Router `req.text()` pattern verification
- [Stripe Webhook Race Conditions](https://dev.to/belazy/the-race-condition-youre-probably-shipping-right-now-with-stripe-webhooks-mj4) — Real-world pitfall documentation
- [Sponsorship Management Best Practices](https://www.optimy.com/blog-optimy/sponsorship-management-software) — Feature expectations for 2026
- [Nonprofit Invoice Management Guide](https://www.artsyltech.com/invoice-management) — Workflow automation insights

### Tertiary (LOW confidence)
- Community discussions on sponsorship tier management — Used for differentiator features, not core workflow

---

**Research completed:** 2026-01-20
**Ready for roadmap:** Yes

All four research files (STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md) completed with high confidence. Clear phase structure identified with dependency chain validated. One phase (Phase 3: Webhook Handler) flagged for deeper research during planning due to idempotency complexity.
