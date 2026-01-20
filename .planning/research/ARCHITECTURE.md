# Architecture Research: Stripe Invoicing Integration

**Project:** RiseUp Youth Football League - Sponsorship Invoicing
**Researched:** 2026-01-20
**Overall confidence:** HIGH

## Executive Summary

Stripe invoicing integrates cleanly with the existing Next.js 16 App Router + Supabase architecture through three main touchpoints: (1) server actions for admin invoice creation, (2) API route handlers for webhook processing, and (3) database schema extensions to track invoice state. The architecture follows Stripe's recommended workflow: create draft invoices via API, finalize and send them, then listen for webhook events to trigger post-payment actions like email notifications.

**Key finding:** Next.js 16 App Router simplifies webhook implementation by providing `req.text()` for raw body access, eliminating the need for custom body parser configuration that was required in the Pages Router.

## Integration Points with Existing Architecture

### 1. Admin Panel Integration

**Existing:** `/admin/dashboard` with role-based access via Supabase auth
**New touchpoint:** `/admin/dashboard/invoices` page for invoice management

**Integration pattern:**
- Reuse existing admin layout (`/src/app/admin/layout.tsx`)
- Follow established authentication pattern (Supabase server client)
- Match existing admin UI styling (black background, white/10 borders)
- Add "Invoices" navigation link to header alongside Dashboard/Sponsors/History

**Code references:**
- Auth pattern: `/src/app/admin/layout.tsx` lines 19-22 (Supabase auth check)
- Server actions pattern: `/src/lib/actions/sponsors.ts` (similar structure needed)

### 2. Server Actions Integration

**Existing:** `/src/lib/actions/` directory with `sponsors.ts`, `contact.ts`, `content.ts`
**New touchpoint:** `/src/lib/actions/invoices.ts` for invoice operations

**Integration pattern:**
```typescript
// Follows existing pattern from sponsors.ts
"use server";
import { createClient } from "@/lib/supabase/server";
import Stripe from "stripe";

export async function createInvoice(sponsorId: string, amount: number) {
  // 1. Verify admin auth (like approveSponsor in sponsors.ts)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // 2. Get sponsor details from database
  // 3. Create/retrieve Stripe customer
  // 4. Create draft invoice via Stripe API
  // 5. Finalize and send invoice
  // 6. Store invoice metadata in Supabase
  // 7. Revalidate paths
}
```

**Dependencies:**
- Stripe Node.js SDK (needs to be added to package.json)
- Environment variable: `STRIPE_SECRET_KEY`
- Supabase client for database operations

### 3. Database Integration (Supabase)

**Existing:** `sponsors` table with contact info, status tracking, and approval workflow
**New tables needed:**
1. Extend `sponsors` table with Stripe customer ID
2. Create `invoices` table to track invoice state

**Schema modifications:**
```sql
-- Extend existing sponsors table
ALTER TABLE sponsors
ADD COLUMN stripe_customer_id TEXT UNIQUE;

-- New invoices table
CREATE TABLE invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sponsor_id UUID REFERENCES sponsors(id) NOT NULL,
  stripe_invoice_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
  invoice_pdf_url TEXT,
  hosted_invoice_url TEXT,
  payment_intent_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);
```

**Integration rationale:**
- `sponsor_id` links to existing sponsors table
- `stripe_invoice_id` and `stripe_customer_id` enable Stripe API lookups
- `status` mirrors Stripe's invoice status for quick queries
- `hosted_invoice_url` provides shareable payment link
- `paid_at` timestamp for reporting and email triggers

### 4. Email Integration (Resend)

**Existing:** Resend SDK configured in `sponsors.ts` for confirmation emails
**New touchpoint:** Post-payment confirmation emails

**Integration pattern:**
```typescript
// Similar to existing pattern in sponsors.ts lines 106-127
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Triggered by webhook handler after invoice.paid event
await resend.emails.send({
  from: "RiseUp Website <onboarding@resend.dev>",
  to: sponsor.contact_email,
  subject: "Payment Received - RiseUp Youth Football",
  html: `...payment confirmation template...`
});
```

**No changes needed** to existing Resend configuration - reuse existing patterns.

### 5. Environment Variables

**Existing:** `.env.local.example` contains Supabase, Resend, reCAPTCHA keys
**Additions needed:**
```bash
# ===========================================
# Stripe
# ===========================================
# Get from: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Get from: https://dashboard.stripe.com/webhooks
STRIPE_WEBHOOK_SECRET=whsec_...
```

## New Components Required

### 1. API Route Handler: `/src/app/api/webhooks/stripe/route.ts`

**Purpose:** Receive Stripe webhook events, verify signatures, update database, trigger emails

**File location:** `/src/app/api/webhooks/stripe/route.ts`
**Pattern reference:** Similar to `/src/app/admin/api/chat/route.ts` (existing route handler)

**Implementation pattern (Next.js 16 App Router):**
```typescript
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia", // Latest version as of 2026
});

export async function POST(req: NextRequest) {
  // 1. Get raw body using req.text() (Next.js 16 App Router method)
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  // 2. Verify webhook signature
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // 3. Return 200 immediately (before complex logic)
  // Process events asynchronously to avoid timeouts
  processWebhookEvent(event);

  return NextResponse.json({ received: true });
}

async function processWebhookEvent(event: Stripe.Event) {
  const supabase = await createClient();

  switch (event.type) {
    case "invoice.finalized":
      // Update database: status = 'open'
      break;
    case "invoice.paid":
      // Update database: status = 'paid', paid_at = timestamp
      // Send confirmation email via Resend
      break;
    case "invoice.payment_failed":
      // Log failure, potentially notify admin
      break;
    case "invoice.voided":
      // Update database: status = 'void'
      break;
  }
}
```

**Key technical details:**
- Uses `req.text()` to get raw body (Next.js 16 App Router eliminates need for custom body parser)
- Returns 200 status immediately to avoid Stripe timeouts (best practice)
- Processes events asynchronously after response sent
- No `export const config = { api: { bodyParser: false } }` needed (App Router handles this)

**Source:** [Next.js App Router + Stripe Webhook Signature Verification](https://kitson-broadhurst.medium.com/next-js-app-router-stripe-webhook-signature-verification-ea9d59f3593f)

### 2. Admin Invoice Creation Page: `/src/app/admin/dashboard/invoices/page.tsx`

**Purpose:** Admin UI for creating and managing invoices

**Component structure:**
```
/admin/dashboard/invoices
  ├─ page.tsx (list of all invoices with filters)
  └─ new/
      └─ page.tsx (create invoice form)
```

**UI elements:**
- Table showing invoice history (sponsor, amount, status, date)
- "Create Invoice" button
- Form selecting sponsor from dropdown (query approved sponsors)
- Amount input field
- Description/notes field
- "Create & Send" button (calls server action)

**Data flow:**
1. Form submission calls `createInvoice` server action
2. Server action creates Stripe customer (if needed), creates invoice, sends it
3. Success: redirect to invoice list with success message
4. Failure: display error in form

### 3. Server Actions: `/src/lib/actions/invoices.ts`

**Purpose:** Server-side invoice operations callable from admin UI

**Functions needed:**
```typescript
"use server";

export async function createInvoice(sponsorId: string, amountCents: number, description: string)
export async function listInvoices()
export async function voidInvoice(invoiceId: string)
export async function resendInvoice(invoiceId: string)
```

**Pattern:** Follows existing `/src/lib/actions/sponsors.ts` structure

### 4. Stripe Client Utility: `/src/lib/stripe/client.ts`

**Purpose:** Initialize Stripe SDK instance for reuse

**Implementation:**
```typescript
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
});
```

**Usage:** Import in server actions and webhook handler

### 5. Email Templates: `/src/lib/email/templates.ts`

**Purpose:** Reusable HTML email templates for invoice notifications

**Templates needed:**
- `invoiceSentTemplate` - Sent when invoice is created
- `paymentReceivedTemplate` - Sent when invoice is paid
- `paymentFailedTemplate` - Sent if payment fails (to admin)

**Pattern:** Similar to inline HTML in `/src/lib/actions/sponsors.ts` lines 114-121, but extracted for reuse

## Data Flow Architecture

### Flow 1: Admin Creates Invoice

```
[Admin UI Form]
    ↓ Form submission
[Server Action: createInvoice]
    ↓ Validate auth + sponsor data
[Supabase Query]
    ↓ Get sponsor contact info
[Stripe API: Create/Get Customer]
    ↓ Customer ID
[Stripe API: Create Invoice]
    ↓ Draft invoice
[Stripe API: Finalize Invoice]
    ↓ Open invoice (triggers webhook)
[Stripe API: Send Invoice]
    ↓ Email sent to sponsor
[Supabase Insert]
    ↓ Store invoice metadata
[Return Success]
    ↓ Redirect to invoice list
[Admin UI: Success Message]
```

**Key operations:**
1. Admin fills form with sponsor selection, amount, description
2. Server action validates user is authenticated admin
3. Queries sponsors table for contact info and stripe_customer_id
4. If no stripe_customer_id, creates Stripe customer and stores ID in sponsors table
5. Creates draft invoice via Stripe API
6. Finalizes invoice (makes it payable, locks fields)
7. Sends invoice (Stripe emails hosted invoice URL to sponsor)
8. Stores invoice metadata in local invoices table
9. Revalidates `/admin/dashboard/invoices` path
10. Returns success/error state

**Error handling:** Each Stripe API call wrapped in try/catch, returns user-friendly error messages

### Flow 2: Sponsor Pays Invoice

```
[Sponsor Receives Email]
    ↓ Clicks payment link
[Stripe Hosted Invoice Page]
    ↓ Enters payment details
[Stripe Payment Processing]
    ↓ Payment succeeds
[Stripe Webhook: invoice.paid]
    ↓ POST to /api/webhooks/stripe
[Webhook Handler]
    ↓ Verify signature
    ↓ Return 200 immediately
    ↓ Process async
[Supabase Update]
    ↓ Update invoice status = 'paid', paid_at = now
[Resend Email]
    ↓ Send confirmation to sponsor
    ↓ Send notification to admin
[Complete]
```

**Key operations:**
1. Sponsor receives Stripe-generated email with hosted_invoice_url
2. Clicks link, lands on Stripe-hosted payment page
3. Enters payment method (credit card, ACH, etc.)
4. Stripe processes payment
5. On success, Stripe sends `invoice.paid` webhook to `/api/webhooks/stripe`
6. Webhook handler verifies signature using stripe.webhooks.constructEvent()
7. Returns 200 status immediately (prevents timeout)
8. Asynchronously processes event:
   - Updates invoices table: status='paid', paid_at=timestamp
   - Queries sponsor contact info
   - Sends payment confirmation email to sponsor via Resend
   - Sends payment received notification to admin
9. Admin sees updated status in dashboard

**Idempotency:** Webhook handler checks if invoice already marked paid before processing (prevents duplicate emails)

### Flow 3: Webhook Event Processing

```
[Stripe Event Occurs]
    ↓ invoice.finalized, invoice.paid, invoice.payment_failed, etc.
[Stripe Webhook POST]
    ↓ POST to /api/webhooks/stripe with signature
[Next.js Route Handler]
    ↓ await req.text() (raw body)
    ↓ req.headers.get("stripe-signature")
[Stripe SDK: Verify Signature]
    ↓ stripe.webhooks.constructEvent()
    ✓ Valid → continue
    ✗ Invalid → return 400
[Return 200 Immediately]
[Async: Process Event]
    ↓ Switch on event.type
    ├─ invoice.finalized → Update status to 'open'
    ├─ invoice.paid → Update status, send emails
    ├─ invoice.payment_failed → Log, notify admin
    └─ invoice.voided → Update status to 'void'
[Supabase Update]
[Resend Email (if applicable)]
[Complete]
```

**Key webhook events to handle:**

| Event Type | Action | Database Update | Email Triggered |
|------------|--------|-----------------|-----------------|
| `invoice.finalized` | Invoice ready for payment | status='open' | None |
| `invoice.paid` | Payment successful | status='paid', paid_at=now | Sponsor confirmation + admin notification |
| `invoice.payment_failed` | Payment declined | (no status change) | Admin alert |
| `invoice.voided` | Admin cancelled invoice | status='void' | None |
| `invoice.marked_uncollectible` | Marked as bad debt | status='uncollectible' | Admin notification |

**Source:** [Stripe Invoice Status Transitions](https://docs.stripe.com/invoicing/integration/workflow-transitions)

## Database Schema Design

### Extended Sponsors Table

```sql
-- Add to existing sponsors table (from 001_sponsors.sql)
ALTER TABLE sponsors
ADD COLUMN stripe_customer_id TEXT UNIQUE,
ADD COLUMN stripe_metadata JSONB DEFAULT '{}';

CREATE INDEX idx_sponsors_stripe_customer_id ON sponsors(stripe_customer_id);
```

**Rationale:**
- `stripe_customer_id`: Stores Stripe's customer ID for invoice creation (prevents duplicate customers)
- `stripe_metadata`: Flexible JSONB field for storing additional Stripe-related data
- UNIQUE constraint prevents duplicate Stripe customers
- Index enables fast lookup when processing webhooks

### New Invoices Table

```sql
CREATE TABLE invoices (
  -- Primary identification
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sponsor_id UUID REFERENCES sponsors(id) ON DELETE CASCADE NOT NULL,

  -- Stripe references
  stripe_invoice_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  stripe_payment_intent_id TEXT,

  -- Invoice details
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  currency TEXT NOT NULL DEFAULT 'usd',
  description TEXT,

  -- Status tracking
  status TEXT NOT NULL CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),

  -- URLs for accessing invoice
  invoice_pdf_url TEXT,
  hosted_invoice_url TEXT,

  -- Payment tracking
  paid_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,

  -- Metadata
  stripe_metadata JSONB DEFAULT '{}',
  internal_notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Audit trail
  created_by UUID REFERENCES auth.users(id) NOT NULL
);

-- Indexes for common queries
CREATE INDEX idx_invoices_sponsor_id ON invoices(sponsor_id);
CREATE INDEX idx_invoices_stripe_invoice_id ON invoices(stripe_invoice_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_created_at ON invoices(created_at DESC);

-- Updated timestamp trigger (reuse existing function)
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row-level security policies
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Only authenticated users (admins) can view invoices
CREATE POLICY "Admins can view all invoices"
ON invoices FOR SELECT
TO authenticated
USING (true);

-- Only authenticated users (admins) can create invoices
CREATE POLICY "Admins can create invoices"
ON invoices FOR INSERT
TO authenticated
WITH CHECK (true);

-- Only authenticated users (admins) can update invoices (via webhooks in practice)
CREATE POLICY "Admins can update invoices"
ON invoices FOR UPDATE
TO authenticated
USING (true);
```

**Design rationale:**

| Field | Purpose | Why Stored Locally |
|-------|---------|-------------------|
| `stripe_invoice_id` | Unique Stripe identifier | Webhook event matching, API lookups |
| `stripe_customer_id` | Links to Stripe customer | Join with sponsors table, API operations |
| `amount_cents` | Invoice amount (avoids float precision issues) | Reporting, display without API calls |
| `status` | Current invoice state | Fast filtering, dashboard queries |
| `hosted_invoice_url` | Shareable payment link | Admin can resend link without API call |
| `invoice_pdf_url` | Receipt download | Archive, records keeping |
| `paid_at` | Payment timestamp | Financial reporting, tax records |
| `created_by` | Admin who created invoice | Audit trail, accountability |

**Why duplicate Stripe data locally?**
- Performance: Dashboard queries don't require Stripe API calls
- Reliability: Works even if Stripe API is down
- Reporting: SQL queries for financial reports
- History: Preserved even if invoice deleted in Stripe

**Source:** [Stripe Invoice Database Schema Best Practices](https://docs.stripe.com/stripe-data/query-billing-data)

### Migration File Structure

**File:** `/supabase/migrations/005_invoicing.sql`

Following existing pattern from `001_sponsors.sql`:
- Comments with migration metadata
- Table creation with constraints
- Indexes for performance
- RLS policies for security
- Triggers for auto-updated timestamps

## Suggested Build Order

Based on dependency analysis and risk mitigation:

### Phase 1: Foundation Setup (Low Risk)

**Goal:** Install dependencies, configure environment, create database schema

**Tasks:**
1. Add Stripe SDK to package.json
   ```bash
   npm install stripe
   ```
2. Update `.env.local.example` with Stripe keys documentation
3. Create migration file: `005_invoicing.sql`
4. Run migration to create invoices table and extend sponsors table
5. Create Stripe utility: `/src/lib/stripe/client.ts`
6. Create email templates: `/src/lib/email/templates.ts`

**Validation:**
- Migration runs successfully in local Supabase
- Stripe client initializes without errors
- No runtime errors in existing functionality

**Why first:** Zero risk to existing features, establishes foundation for subsequent phases

### Phase 2: Server Actions (Medium Risk)

**Goal:** Implement invoice creation logic callable from admin UI

**Tasks:**
1. Create `/src/lib/actions/invoices.ts`
2. Implement `createInvoice` function:
   - Auth validation
   - Sponsor lookup
   - Stripe customer creation/retrieval
   - Draft invoice creation
   - Invoice finalization
   - Database storage
3. Implement `listInvoices` function (query invoices table)
4. Implement `voidInvoice` function (cancel invoice)
5. Add validation schemas: `/src/lib/validations/invoice.ts`

**Testing approach:**
- Unit test each server action in isolation
- Test Stripe API calls with test mode keys
- Verify database insertions in local Supabase

**Why second:** Server actions can be tested independently before UI exists

### Phase 3: Webhook Handler (High Risk - Requires Testing)

**Goal:** Receive and process Stripe webhook events

**Tasks:**
1. Create `/src/app/api/webhooks/stripe/route.ts`
2. Implement signature verification with `req.text()`
3. Implement event handlers for:
   - `invoice.finalized`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `invoice.voided`
4. Add database update logic
5. Add email notification logic
6. Add error logging

**Testing approach:**
- Use Stripe CLI for local webhook forwarding:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
- Trigger test events via Stripe CLI
- Verify database updates and email sends
- Test signature verification with invalid signatures

**Why third:** Webhook handler can be tested with Stripe CLI before UI deployment

**Critical:** Must test webhook reliability before production (use Stripe Dashboard test events)

### Phase 4: Admin UI (Low Risk - UI Only)

**Goal:** Create admin interface for invoice management

**Tasks:**
1. Create `/src/app/admin/dashboard/invoices/page.tsx` (list view)
2. Create `/src/app/admin/dashboard/invoices/new/page.tsx` (create form)
3. Add "Invoices" link to admin navigation (update `/src/app/admin/layout.tsx`)
4. Implement invoice list table with filters (status, date range)
5. Implement create invoice form with sponsor dropdown
6. Add loading states and error handling
7. Style components to match existing admin UI

**Testing approach:**
- Test form validation client-side
- Test server action integration
- Verify success/error states
- Test with multiple sponsors and amounts

**Why fourth:** UI is lowest risk, depends on server actions being stable

### Phase 5: Email Notifications (Low Risk)

**Goal:** Send automated emails on invoice events

**Tasks:**
1. Implement email templates in `/src/lib/email/templates.ts`
2. Add email sending to webhook handler
3. Add admin notification emails
4. Test email delivery with Resend

**Testing approach:**
- Send test emails via Resend
- Verify formatting and content
- Test with real sponsor email addresses (test mode)

**Why fifth:** Emails are enhancement, not critical path (can be added after core flow works)

### Phase 6: Production Deployment (Requires Coordination)

**Goal:** Deploy to production with proper Stripe webhook configuration

**Tasks:**
1. Set up production Stripe webhook endpoint in Stripe Dashboard
2. Add production environment variables (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET)
3. Run database migration in production Supabase
4. Deploy Next.js application to Vercel/hosting
5. Test end-to-end with Stripe test mode
6. Switch to Stripe live mode
7. Create first real invoice to validate

**Validation checklist:**
- [ ] Webhook endpoint receives events (check Stripe Dashboard webhook logs)
- [ ] Database updates on webhook events
- [ ] Emails send successfully
- [ ] Admin UI displays invoices correctly
- [ ] Invoice payment flow works end-to-end

**Why last:** Production deployment requires all previous phases complete and tested

## Architecture Patterns to Follow

### Pattern 1: Idempotent Webhook Handling

**What:** Webhook handlers must safely handle duplicate events

**Implementation:**
```typescript
async function processInvoicePaid(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  const supabase = await createClient();

  // Check if already processed
  const { data: existing } = await supabase
    .from("invoices")
    .select("status")
    .eq("stripe_invoice_id", invoice.id)
    .single();

  if (existing?.status === "paid") {
    console.log("Invoice already marked as paid, skipping");
    return; // Idempotent - safe to receive multiple times
  }

  // Process payment...
}
```

**Why:** Stripe may send duplicate webhook events (network retries, etc.)

**Source:** [Stripe Webhook Best Practices](https://docs.stripe.com/webhooks)

### Pattern 2: Optimistic Stripe Customer Creation

**What:** Create Stripe customer on first invoice, cache ID in database

**Implementation:**
```typescript
async function getOrCreateStripeCustomer(sponsorId: string) {
  const supabase = await createClient();

  // Try to get existing customer ID
  const { data: sponsor } = await supabase
    .from("sponsors")
    .select("stripe_customer_id, contact_email, contact_name")
    .eq("id", sponsorId)
    .single();

  if (sponsor?.stripe_customer_id) {
    return sponsor.stripe_customer_id; // Use cached ID
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email: sponsor.contact_email,
    name: sponsor.contact_name,
    metadata: { sponsor_id: sponsorId }
  });

  // Cache customer ID
  await supabase
    .from("sponsors")
    .update({ stripe_customer_id: customer.id })
    .eq("id", sponsorId);

  return customer.id;
}
```

**Why:** Avoids duplicate Stripe customers, reduces API calls

### Pattern 3: Immediate Webhook Response

**What:** Return 200 status before processing complex logic

**Implementation:**
```typescript
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  // Verify signature
  const event = stripe.webhooks.constructEvent(body, signature!, webhookSecret);

  // Return 200 immediately
  const response = NextResponse.json({ received: true });

  // Process asynchronously (don't await)
  processWebhookEvent(event).catch(err => {
    console.error("Webhook processing error:", err);
  });

  return response;
}
```

**Why:** Prevents Stripe webhook timeouts (must respond within 5 seconds)

**Source:** [Stripe Webhook Best Practices](https://docs.stripe.com/webhooks)

### Pattern 4: Typed Stripe Events

**What:** Use TypeScript for type-safe webhook event handling

**Implementation:**
```typescript
import Stripe from "stripe";

function handleInvoicePaid(event: Stripe.InvoicePaymentSucceededEvent) {
  const invoice = event.data.object; // Typed as Stripe.Invoice
  const amountPaid = invoice.amount_paid; // TypeScript autocomplete
  const customerId = invoice.customer as string; // Type assertion
}

async function processWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    case "invoice.paid":
      return handleInvoicePaid(event as Stripe.InvoicePaymentSucceededEvent);
    case "invoice.payment_failed":
      return handleInvoicePaymentFailed(event as Stripe.InvoicePaymentFailedEvent);
  }
}
```

**Why:** Prevents runtime errors, improves developer experience

## Anti-Patterns to Avoid

### Anti-Pattern 1: Blocking Webhook Responses

**What:** Awaiting complex operations before returning 200

**Why bad:** Stripe times out after 5 seconds, marks webhook as failed, retries

**Example (BAD):**
```typescript
export async function POST(req: NextRequest) {
  const event = await verifyWebhook(req);

  // BAD: Awaiting email send before response
  await sendEmail(event.data.object);
  await updateDatabase(event.data.object);

  return NextResponse.json({ received: true }); // May timeout
}
```

**Instead:** Return 200 immediately, process asynchronously (see Pattern 3)

### Anti-Pattern 2: Storing Only Stripe Invoice ID

**What:** Not caching invoice details locally, always fetching from Stripe API

**Why bad:**
- Slow dashboard queries (multiple API calls)
- API rate limiting issues
- Dashboard breaks if Stripe API is down
- Increased Stripe API costs

**Example (BAD):**
```typescript
// BAD: Requires Stripe API call for every invoice row
async function listInvoices() {
  const { data } = await supabase.from("invoices").select("stripe_invoice_id");
  const invoices = await Promise.all(
    data.map(row => stripe.invoices.retrieve(row.stripe_invoice_id))
  );
  return invoices;
}
```

**Instead:** Store invoice details locally, use Stripe ID only for updates (see Database Schema Design)

### Anti-Pattern 3: Using Stripe as Source of Truth for Status

**What:** Querying Stripe API to check if invoice is paid

**Why bad:**
- Webhooks provide real-time status updates
- API calls are slower and cost money
- Race conditions if checking status before webhook arrives

**Example (BAD):**
```typescript
// BAD: Polling Stripe API for status
async function checkPaymentStatus(stripeInvoiceId: string) {
  const invoice = await stripe.invoices.retrieve(stripeInvoiceId);
  return invoice.status === "paid";
}
```

**Instead:** Trust local database status updated by webhooks, use Stripe API only for manual refresh

### Anti-Pattern 4: Manually Parsing Webhook Body

**What:** Implementing custom signature verification instead of using Stripe SDK

**Why bad:**
- Security vulnerabilities
- Hard to maintain as Stripe updates signature algorithm
- Prone to timing attack vulnerabilities

**Example (BAD):**
```typescript
// BAD: Manual signature verification
const signature = req.headers.get("stripe-signature");
const expectedSig = crypto.createHmac("sha256", webhookSecret)
  .update(body)
  .digest("hex");
if (signature !== expectedSig) { /* ... */ }
```

**Instead:** Always use `stripe.webhooks.constructEvent()` (see Pattern 3)

## Scalability Considerations

### At Current Scale (< 100 Sponsors)

**Approach:** Simple, synchronous architecture

- Single webhook endpoint handles all events
- Direct database writes (no queue)
- Immediate email sends via Resend
- No caching layer needed

**Estimated load:**
- ~10 invoices/month
- ~30 webhook events/month
- Negligible database load

**Infrastructure:** Current Next.js + Supabase setup handles this easily

### At Medium Scale (100-1000 Sponsors)

**Approach:** Add monitoring and error handling

**Recommended additions:**
1. Webhook event logging table for debugging
2. Error alerting (e.g., Sentry integration)
3. Retry logic for failed email sends
4. Database indexes on frequently queried columns (already included)

**Estimated load:**
- ~100 invoices/month
- ~300 webhook events/month
- Still well within Supabase free tier limits

**No architectural changes needed** - current design scales to this level

### At High Scale (1000+ Sponsors)

**Approach:** Consider async processing and queueing

**Potential optimizations:**
1. Add background job queue (e.g., BullMQ, Inngest) for webhook processing
2. Batch email sends instead of one-by-one
3. Add Redis cache for frequently accessed sponsor/invoice data
4. Consider Stripe's "thin events" if payloads get too large
5. Implement webhook event deduplication table

**Estimated load:**
- ~1000+ invoices/month
- ~3000+ webhook events/month
- May need Supabase paid tier

**When to upgrade:** If webhook processing time exceeds 2 seconds or email sends start failing

## Testing Strategy

### Local Development Testing

**Stripe CLI Webhook Forwarding:**
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe account
stripe login

# Forward webhooks to local Next.js dev server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# In another terminal, trigger test events
stripe trigger invoice.paid
stripe trigger invoice.payment_failed
```

**Benefits:**
- Test webhook handler without deploying
- Verify signature verification logic
- Debug database updates and email sends
- See webhook payload structure

**Source:** [Stripe CLI Testing](https://docs.stripe.com/webhooks)

### Integration Testing Checklist

- [ ] Create invoice via admin UI
- [ ] Verify invoice appears in Stripe Dashboard
- [ ] Verify invoice stored in local database
- [ ] Trigger `invoice.finalized` webhook, verify status update
- [ ] Trigger `invoice.paid` webhook, verify status + email sent
- [ ] Trigger `invoice.payment_failed` webhook, verify handling
- [ ] Test with invalid webhook signature, verify 400 response
- [ ] Test idempotency: send same webhook twice, verify no duplicate emails
- [ ] Test void invoice flow
- [ ] Test dashboard displays correct invoice status

### Production Validation

**Pre-launch checklist:**
- [ ] Webhook endpoint registered in Stripe Dashboard
- [ ] Webhook secret added to production environment variables
- [ ] Test mode invoice created and paid successfully
- [ ] Live mode webhook endpoint tested with Stripe Dashboard "Send test webhook"
- [ ] Error monitoring configured (e.g., Sentry)
- [ ] Database migration run in production Supabase

## Environment Setup

### Required Environment Variables

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_... # Use sk_live_... in production
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # Use pk_live_... in production

# Stripe Webhook Secret (from Stripe Dashboard -> Webhooks)
STRIPE_WEBHOOK_SECRET=whsec_...

# Existing variables (already configured)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
RESEND_API_KEY=...
CONTACT_EMAIL=...
```

### Stripe Dashboard Configuration

**Development:**
1. Create webhook endpoint: `https://localhost:3000/api/webhooks/stripe` (via Stripe CLI)
2. Select events to listen for:
   - `invoice.finalized`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `invoice.voided`
   - `invoice.marked_uncollectible`

**Production:**
1. Create webhook endpoint: `https://your-domain.com/api/webhooks/stripe`
2. Select same events as development
3. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET` environment variable

## Security Considerations

### 1. Webhook Signature Verification

**Critical:** Always verify webhook signatures to prevent spoofed events

**Implementation:**
```typescript
try {
  const event = stripe.webhooks.constructEvent(
    body,
    signature!,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
} catch (err) {
  console.error("Webhook signature verification failed:", err);
  return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
}
```

**Why:** Without verification, attackers could send fake payment events

### 2. Admin-Only Invoice Creation

**Implementation:** Verify authentication on all invoice server actions

```typescript
export async function createInvoice(...) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized: Admin authentication required");
  }

  // Proceed with invoice creation...
}
```

**Why:** Prevents unauthorized invoice creation by non-admins

### 3. Row-Level Security on Invoices Table

**Implementation:** RLS policies ensure only authenticated admins can access invoices

```sql
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all invoices"
ON invoices FOR SELECT
TO authenticated
USING (true);
```

**Why:** Defense in depth - even if server action auth fails, database blocks unauthorized access

### 4. Environment Variable Protection

**Critical:** Never commit `.env.local` to version control

**Implementation:**
- `.env.local` in `.gitignore` (already configured)
- Use `.env.local.example` for documentation
- Store production secrets in Vercel environment variables

**Why:** Leaked Stripe secret key allows unauthorized API access

## Open Questions for Phase-Specific Research

### Invoice Customization

**Question:** Should invoices include custom branding (logo, colors)?

**Research needed:**
- Stripe Invoice Settings API for custom branding
- Logo upload and storage requirements
- Whether to use Stripe Dashboard settings or API

**Decision point:** Phase 4 (Admin UI) - determines if UI needs logo upload

### Payment Methods

**Question:** Which payment methods to enable? (Credit card, ACH, wire transfer)

**Current assumption:** Credit card only (Stripe default)

**Research needed:**
- ACH setup requirements and timeline
- Wire transfer handling (manual reconciliation)
- Customer preference data

**Decision point:** Phase 1 (Foundation) - affects Stripe account configuration

### Invoice Numbering

**Question:** Should invoices use custom numbering scheme (e.g., "INV-2026-001")?

**Current assumption:** Use Stripe's default invoice numbering

**Research needed:**
- Custom invoice number API parameter
- Sequential number generation strategy (avoid race conditions)
- Whether organization requires specific format for accounting

**Decision point:** Phase 2 (Server Actions) - affects createInvoice implementation

### Multi-Currency Support

**Question:** Will sponsors be billed in currencies other than USD?

**Current assumption:** USD only

**Research needed:**
- Stripe multi-currency setup
- Currency conversion handling
- Database schema changes (currency field already included)

**Decision point:** Phase 1 (Foundation) - affects database schema migration

## Summary

The Stripe invoicing integration follows a clean, event-driven architecture that extends the existing Next.js 16 + Supabase patterns:

1. **Admin creates invoice** → Server action calls Stripe API → Stores metadata locally
2. **Sponsor pays invoice** → Stripe processes payment → Webhook updates database → Email sent
3. **Admin views invoices** → Queries local database → Fast dashboard without API calls

**Key integration points:**
- Extends existing admin panel with new `/admin/dashboard/invoices` route
- Follows existing server actions pattern (`/src/lib/actions/invoices.ts`)
- Reuses existing Resend email configuration
- Adds new `/src/app/api/webhooks/stripe/route.ts` webhook handler
- Extends database with invoices table and sponsor Stripe customer ID

**Build order minimizes risk:**
1. Foundation setup (safe, no code changes)
2. Server actions (testable in isolation)
3. Webhook handler (testable with Stripe CLI)
4. Admin UI (depends on stable server actions)
5. Email notifications (enhancement, not critical path)
6. Production deployment (all components validated)

**Confidence:** HIGH - Architecture is well-documented by Stripe, follows Next.js 16 App Router best practices, and integrates cleanly with existing patterns.

## Sources

**Stripe Official Documentation:**
- [Stripe Invoicing Overview](https://docs.stripe.com/invoicing/overview)
- [Stripe Invoice API Reference](https://docs.stripe.com/api/invoices/create?lang=node)
- [Stripe Customer API Reference](https://docs.stripe.com/api/customers/create?lang=node)
- [Stripe Webhooks Documentation](https://docs.stripe.com/webhooks)
- [Stripe Invoice Status Transitions](https://docs.stripe.com/invoicing/integration/workflow-transitions)
- [Stripe Billing Data Schema](https://docs.stripe.com/stripe-data/query-billing-data)

**Next.js App Router Integration:**
- [Next.js App Router + Stripe Webhook Signature Verification](https://kitson-broadhurst.medium.com/next-js-app-router-stripe-webhook-signature-verification-ea9d59f3593f)
- [How to Handle Stripe and Paystack Webhooks in Next.js (The App Router Way)](https://dev.to/thekarlesi/how-to-handle-stripe-and-paystack-webhooks-in-nextjs-the-app-router-way-5bgi)
- [Stripe Checkout and Webhook in a Next.js 15 (2025)](https://medium.com/@gragson.john/stripe-checkout-and-webhook-in-a-next-js-15-2025-925d7529855e) (access blocked but search results provided key insights)
- [Stripe Node.js Library](https://github.com/stripe/stripe-node)

**Best Practices:**
- [Stripe Payment Processing Best Practices](https://stripe.com/guides/payment-processing-best-practices)
- [Stripe Invoice Payment Methods](https://stripe.com/resources/more/invoice-payment-methods-101)
