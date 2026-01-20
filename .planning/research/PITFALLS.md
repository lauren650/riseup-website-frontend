# Pitfalls Research: Stripe Invoicing

**Project:** RiseUp Youth Football League - Stripe Invoice Integration
**Domain:** Adding Stripe invoice creation, payment webhooks, and email automation to existing Next.js + Supabase app
**Researched:** 2026-01-20
**Overall Confidence:** HIGH

## Executive Summary

Adding Stripe invoicing to an existing Next.js application introduces three categories of critical failures:

1. **Security vulnerabilities** from improper webhook verification and exposed API keys
2. **Data consistency issues** from race conditions between webhooks and database updates
3. **Operational failures** from duplicate emails, test/production mode confusion, and idempotency gaps

The highest-risk pitfall is **webhook race conditions with database sync**, which can cause duplicate credits, missing payment confirmations, or inconsistent state between Stripe and Supabase. This requires careful architectural planning in early phases.

---

## Critical Pitfalls

These mistakes cause system-breaking failures, data corruption, or security vulnerabilities.

### Pitfall 1: Webhook Signature Verification Disabled/Broken

**What goes wrong:**
Anyone can POST fake payment events to your webhook endpoint, creating fraudulent payment confirmations, unauthorized access grants, or duplicate email sends.

**Why it happens:**
- Skipping verification during development and forgetting to add it before production
- Framework middleware automatically parsing request body, breaking verification (requires raw body)
- Using wrong webhook signing secret (test secret in production, or vice versa)
- Not reading Stripe documentation emphasis: "You must verify webhook signatures to ensure requests originate from Stripe"

**Consequences:**
- Attackers send fake `invoice.payment_succeeded` events
- System grants access/credits without actual payment
- Financial loss and security breach
- CRITICAL security vulnerability

**Prevention:**
```typescript
// WRONG - Don't skip verification
app.post('/webhook', async (req, res) => {
  const event = req.body; // DANGER: Unverified
  // Process event...
});

// RIGHT - Always verify signature
app.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Requires RAW body, not parsed JSON
    event = stripe.webhooks.constructEvent(
      req.rawBody, // Must be raw buffer
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Now safe to process verified event
});
```

**Detection:**
- In Stripe Dashboard > Developers > Webhooks, check if requests show as "Failed" with signature errors
- Test by sending a manual POST to your endpoint - if it succeeds, verification is broken
- Review Next.js API route to ensure body parsing is disabled for webhook route

**Phase Assignment:** Phase 1 (Foundation/Webhook Setup) - Must be correct from the start

**Sources:**
- [Stripe Webhooks Documentation](https://docs.stripe.com/webhooks) (HIGH confidence)
- [Stripe Webhooks Integration Example](https://codehooks.io/docs/examples/webhooks/stripe) (MEDIUM confidence)

---

### Pitfall 2: Race Conditions Between Webhook and Database Sync

**What goes wrong:**
The fundamental "eager sync + webhooks = race conditions" problem. When you update your Supabase database both during the Stripe API call AND when receiving webhooks, you get duplicate records, missing updates, or inconsistent state.

**Why it happens:**
- Admin creates invoice → immediately updates Supabase with "pending" status
- Stripe sends `invoice.payment_succeeded` webhook → tries to update same record
- Both operations run concurrently, causing:
  - Duplicate credits/access grants
  - Last-write-wins overwrites (losing data)
  - Invoice shown as "pending" even after payment

**Real-world scenario:**
```
Admin creates invoice:
  1. Call Stripe API to create invoice (200ms)
  2. Write to Supabase invoices table (50ms)
  3. Return success to admin

Meanwhile, Stripe processes payment:
  4. Customer pays invoice (overlaps with step 2)
  5. Stripe sends webhook (arrives during step 3)
  6. Webhook handler updates Supabase (conflicts!)
```

**Consequences:**
- Users get double-charged or double-credited
- Payment confirmations never sent (webhook lost race)
- Subscription status shows "pending" for extended periods
- Data inconsistency between Stripe and Supabase

**Prevention Strategies:**

**Option A: Webhook-Only Updates (Recommended)**
```typescript
// Admin creates invoice - NO database write
async function createInvoice(customerId: string, amount: number) {
  const invoice = await stripe.invoices.create({
    customer: customerId,
    collection_method: 'send_invoice',
    days_until_due: 30,
    metadata: { source: 'admin_ui', created_by: adminId }
  });

  await stripe.invoiceItems.create({
    invoice: invoice.id,
    customer: customerId,
    amount: amount,
    currency: 'usd',
  });

  await stripe.invoices.finalizeInvoice(invoice.id);

  // DO NOT write to Supabase here - let webhook handle it
  return invoice;
}

// Webhook handler - ONLY place that writes to database
async function handleInvoiceFinalized(invoice: Stripe.Invoice) {
  await supabase.from('invoices').upsert({
    stripe_invoice_id: invoice.id,
    customer_id: invoice.customer,
    amount: invoice.amount_due,
    status: invoice.status,
    created_at: new Date(invoice.created * 1000),
  }, {
    onConflict: 'stripe_invoice_id' // Idempotent upsert
  });
}
```

**Option B: Queue-Based Async Processing**
```typescript
// Webhook endpoint - acknowledge immediately, process async
async function handleWebhook(req: Request) {
  const event = verifyWebhook(req); // Verify signature

  // Queue for background processing
  await queue.add('stripe-webhook', {
    eventId: event.id,
    type: event.type,
    data: event.data
  });

  // Return 200 immediately (within 5 seconds)
  return new Response('OK', { status: 200 });
}

// Background worker - processes queue
async function processWebhookEvent(job) {
  const { eventId, type, data } = job.data;

  // Check if already processed (idempotency)
  const existing = await supabase
    .from('processed_webhook_events')
    .select('id')
    .eq('stripe_event_id', eventId)
    .single();

  if (existing) {
    console.log(`Event ${eventId} already processed`);
    return;
  }

  // Process event and mark as processed atomically
  await supabase.rpc('process_stripe_event', {
    event_id: eventId,
    event_type: type,
    event_data: data
  });
}
```

**Detection:**
- Multiple database records for same Stripe invoice ID
- Users report being charged but invoice still shows "pending"
- Duplicate email confirmations
- Stripe Dashboard shows payment succeeded, but Supabase shows unpaid
- Check logs for overlapping timestamps between API calls and webhook processing

**Phase Assignment:**
- Phase 1: Architecture decision (webhook-only vs queue-based)
- Phase 2: Implementation with idempotency guards
- Phase 3: Testing race conditions with concurrent requests

**Sources:**
- [The Race Condition You're Probably Shipping Right Now With Stripe Webhooks](https://dev.to/belazy/the-race-condition-youre-probably-shipping-right-now-with-stripe-webhooks-mj4) (MEDIUM confidence)
- [Stripe Webhooks: Solving Race Conditions](https://www.pedroalonso.net/blog/stripe-webhooks-deep-dive/) (MEDIUM confidence)
- [Stripe Webhook Best Practices](https://www.stigg.io/blog-posts/best-practices-i-wish-we-knew-when-integrating-stripe-webhooks) (MEDIUM confidence)

---

### Pitfall 3: Missing Idempotency Protection

**What goes wrong:**
Stripe may send the same webhook event multiple times due to network issues, retries, or timeouts. Without idempotency protection, you process the same payment twice, sending duplicate emails, granting duplicate access, or creating duplicate database records.

**Why it happens:**
- Your webhook endpoint takes >5 seconds to respond (timeout triggers retry)
- Network issues cause Stripe to not receive your 200 response
- You assume each webhook is unique and never check for duplicates
- Not storing processed event IDs

**Consequences:**
- Customers receive 2-5 identical payment confirmation emails
- Database has duplicate invoice records
- Credits/access granted multiple times
- User confusion and support tickets

**Prevention:**

**Database-Level Idempotency:**
```sql
-- Create table to track processed events
CREATE TABLE processed_webhook_events (
  id BIGSERIAL PRIMARY KEY,
  stripe_event_id VARCHAR(255) UNIQUE NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  processed_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Unique index prevents duplicate processing
CREATE UNIQUE INDEX idx_stripe_event_id ON processed_webhook_events(stripe_event_id);
```

```typescript
async function handleWebhook(event: Stripe.Event) {
  // Check if already processed
  const { data: existing } = await supabase
    .from('processed_webhook_events')
    .select('id')
    .eq('stripe_event_id', event.id)
    .single();

  if (existing) {
    console.log(`Event ${event.id} already processed, skipping`);
    return; // Idempotent - safe to return success
  }

  // Process event and mark as processed in a transaction
  await supabase.rpc('process_invoice_payment', {
    event_id: event.id,
    invoice_id: event.data.object.id,
    customer_email: event.data.object.customer_email
  });

  // RPC function handles both processing and marking as complete atomically
}
```

**Application-Level Idempotency (Resend Emails):**
```typescript
async function sendPaymentConfirmation(invoiceId: string, email: string) {
  // Check if email already sent for this invoice
  const { data: emailLog } = await supabase
    .from('sent_emails')
    .select('id')
    .eq('invoice_id', invoiceId)
    .eq('email_type', 'payment_confirmation')
    .single();

  if (emailLog) {
    console.log(`Payment confirmation already sent for ${invoiceId}`);
    return;
  }

  // Send email
  const result = await resend.emails.send({
    from: 'noreply@riseupyouthfootball.com',
    to: email,
    subject: 'Payment Received - Thank You!',
    html: renderPaymentConfirmation(invoiceId)
  });

  // Log that email was sent
  await supabase.from('sent_emails').insert({
    invoice_id: invoiceId,
    email_type: 'payment_confirmation',
    resend_email_id: result.id,
    recipient: email,
    sent_at: new Date()
  });
}
```

**Detection:**
- Multiple entries in `sent_emails` table for same invoice
- Customers complain about duplicate emails
- Stripe Dashboard shows single payment, but database has duplicate records
- Check webhook logs for same `event.id` appearing multiple times

**Phase Assignment:**
- Phase 1: Design idempotency strategy and create `processed_webhook_events` table
- Phase 2: Implement idempotency checks in all webhook handlers
- Phase 3: Test with Stripe webhook resend feature

**Sources:**
- [Stripe Webhooks Guide](https://www.magicbell.com/blog/stripe-webhooks-guide) (HIGH confidence)
- [Stripe Webhook Idempotency Guard](https://github.com/primeautomation-dev/stripe-webhook-idempotency-guard) (MEDIUM confidence)

---

### Pitfall 4: Environment Variable Exposure (API Keys Leaked)

**What goes wrong:**
Using `NEXT_PUBLIC_` prefix for Stripe secret keys exposes them in client-side JavaScript bundles, allowing anyone to view your keys and make API calls on your behalf.

**Why it happens:**
- Misunderstanding Next.js environment variable prefixes
- Copy-pasting examples without understanding security implications
- Next.js automatically inserts `NEXT_PUBLIC_*` variables into publicly viewable source code at build/render time
- Thinking "it's just for development" and forgetting before production

**Consequences:**
- Secret API key visible in browser DevTools
- Attackers can create invoices, refunds, or access customer data
- CRITICAL security breach requiring key rotation
- Potential Stripe account suspension

**Prevention:**

```bash
# .env.local - WRONG
NEXT_PUBLIC_STRIPE_SECRET_KEY=sk_test_... # DANGER: Exposed to browser!
NEXT_PUBLIC_STRIPE_WEBHOOK_SECRET=whsec_... # DANGER: Exposed!

# .env.local - CORRECT
STRIPE_SECRET_KEY=sk_test_... # Only available server-side
STRIPE_WEBHOOK_SECRET=whsec_... # Only available server-side
STRIPE_PUBLISHABLE_KEY=pk_test_... # Safe to expose (already public)
```

```typescript
// Client component - WRONG
'use client';
import Stripe from 'stripe';

export default function InvoiceButton() {
  const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY); // DANGER!
  // This exposes secret key to browser
}

// Server component/API route - CORRECT
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia'
});

export async function POST(req: Request) {
  // Only runs on server, key never exposed
  const invoice = await stripe.invoices.create({...});
}
```

**Detection:**
- View page source or inspect JavaScript bundles
- Search for `NEXT_PUBLIC_STRIPE_SECRET` or `sk_live_` in browser DevTools
- Run: `grep -r "NEXT_PUBLIC.*STRIPE.*SECRET" .env*`
- Check Vercel/deployment platform environment variables for exposed secrets

**Phase Assignment:** Phase 1 (Environment Setup) - Must be correct from the start

**Sources:**
- [Next.js Stripe Best Practices](https://nextjsstarter.com/blog/stripe-nextjs-best-practices-revealed/) (MEDIUM confidence)
- [Getting Started with Next.js and Stripe](https://vercel.com/kb/guide/getting-started-with-nextjs-typescript-stripe) (HIGH confidence)

---

### Pitfall 5: Webhook Timeout (No Async Queue)

**What goes wrong:**
Processing complex operations synchronously in webhook handlers (sending emails, updating multiple database tables, external API calls) takes >5 seconds, causing Stripe to timeout and retry the webhook, leading to duplicate processing.

**Why it happens:**
- Doing all processing in webhook endpoint before returning 200
- Waiting for Resend email API to complete before acknowledging webhook
- Multiple sequential database queries in webhook handler
- Stripe requires response within 5 seconds, but your operations take 10-30 seconds

**Consequences:**
- Stripe retries webhook up to 72 hours
- Each retry processes the event again (duplicate emails, duplicate database writes)
- Without idempotency: cascading failures and duplicate operations
- Stripe Dashboard shows webhook as "Failed" even though it processed

**Prevention:**

```typescript
// WRONG - Synchronous processing
export async function POST(req: Request) {
  const event = verifyWebhook(req);

  // These operations take 5+ seconds combined
  await updateSupabaseInvoice(event.data.object);
  await sendPaymentConfirmation(event.data.object.customer_email);
  await notifyAdminOfPayment(event.data.object);
  await updateAnalytics(event.data.object);

  return new Response('OK', { status: 200 }); // TOO LATE - Already timed out!
}

// CORRECT - Acknowledge immediately, process async
export async function POST(req: Request) {
  const event = verifyWebhook(req);

  // Immediately queue for background processing
  await queue.add('stripe-webhook', {
    eventId: event.id,
    type: event.type,
    data: event.data.object
  });

  // Return 200 within 1 second
  return new Response('OK', { status: 200 });
}

// Separate background worker
async function processWebhookQueue(job) {
  const { eventId, type, data } = job.data;

  // Check idempotency
  if (await isAlreadyProcessed(eventId)) return;

  // Now safe to do slow operations
  await updateSupabaseInvoice(data);
  await sendPaymentConfirmation(data.customer_email);
  await notifyAdminOfPayment(data);
  await updateAnalytics(data);

  await markAsProcessed(eventId);
}
```

**Options for Async Processing:**

1. **Vercel Queue / Inngest** (recommended for Vercel deployment)
2. **BullMQ + Redis** (self-hosted)
3. **Supabase Edge Functions + pg_cron** (leverage existing Supabase)
4. **Simple database queue** (poll `webhook_queue` table)

**Detection:**
- Stripe Dashboard > Webhooks shows "Response timeout" errors
- Same event appears multiple times in logs
- Webhook endpoint logs show >5 second processing times
- Monitor with: `console.time('webhook-processing')` and `console.timeEnd()`

**Phase Assignment:**
- Phase 1: Choose queue solution and set up infrastructure
- Phase 2: Implement async webhook processing
- Phase 3: Load test with concurrent webhooks

**Sources:**
- [Stripe Webhooks Best Practices](https://www.stigg.io/blog-posts/best-practices-i-wish-we-knew-when-integrating-stripe-webhooks) (MEDIUM confidence)
- [Stripe Webhooks Documentation](https://docs.stripe.com/webhooks) (HIGH confidence)

---

## Integration Pitfalls

Issues when connecting Stripe invoicing to existing Supabase auth and Resend email.

### Pitfall 6: Admin Authentication Bypass

**What goes wrong:**
Invoice creation API route doesn't verify admin authentication, allowing any authenticated user (or unauthenticated attacker) to create invoices, potentially creating fraudulent invoices or spamming customers.

**Why it happens:**
- Assuming Next.js API routes are "server-side so they're secure"
- Not checking Supabase session in invoice creation endpoint
- Trusting client-side data without server validation
- No role-based access control (RBAC) check

**Consequences:**
- Non-admin users can create invoices
- Attackers create fake invoices for phishing
- Financial and reputational damage

**Prevention:**

```typescript
// WRONG - No auth check
export async function POST(req: Request) {
  const { customerId, amount } = await req.json();

  // DANGER: Anyone can call this!
  const invoice = await stripe.invoices.create({
    customer: customerId,
    amount: amount
  });

  return Response.json(invoice);
}

// CORRECT - Verify admin role
export async function POST(req: Request) {
  // 1. Verify Supabase session
  const supabase = createClient(req);
  const { data: { session }, error } = await supabase.auth.getSession();

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Verify admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (profile?.role !== 'admin') {
    return Response.json({ error: 'Forbidden - Admin only' }, { status: 403 });
  }

  // 3. Now safe to create invoice
  const { customerId, amount } = await req.json();
  const invoice = await stripe.invoices.create({
    customer: customerId,
    collection_method: 'send_invoice',
    metadata: { created_by: session.user.id }
  });

  return Response.json(invoice);
}
```

**Additional Security Layers:**

```sql
-- Row Level Security policy for invoices table
CREATE POLICY "Admins can insert invoices"
  ON invoices
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

**Detection:**
- Test invoice creation while logged out or as regular user
- Review API route code for `supabase.auth.getSession()` calls
- Check for role verification logic
- Monitor Stripe Dashboard for unexpected invoice creation patterns

**Phase Assignment:** Phase 1 (API Routes Setup) - Security from the start

**Sources:**
- [Next.js Stripe Integration with Supabase](https://dev.to/flnzba/33-stripe-integration-guide-for-nextjs-15-with-supabase-13b5) (MEDIUM confidence)

---

### Pitfall 7: Customer Email Mismatch Between Supabase and Stripe

**What goes wrong:**
User updates email in Supabase, but Stripe customer still has old email. Invoices and payment confirmations go to wrong address, causing missed payments and support issues.

**Why it happens:**
- No sync mechanism between Supabase user updates and Stripe customer updates
- Email change in Supabase auth doesn't trigger Stripe customer update
- Treating Stripe and Supabase as separate systems

**Consequences:**
- Invoices sent to outdated email addresses
- Payment confirmations go to wrong recipient
- Users don't receive invoices and miss payments
- Privacy issue (old email receives new financial information)

**Prevention:**

**Option A: Supabase Trigger + Edge Function**
```sql
-- Trigger on profile email changes
CREATE OR REPLACE FUNCTION sync_email_to_stripe()
RETURNS TRIGGER AS $$
BEGIN
  -- Call edge function to update Stripe
  PERFORM net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/sync-stripe-customer',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object(
      'user_id', NEW.id,
      'new_email', NEW.email,
      'stripe_customer_id', NEW.stripe_customer_id
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profile_email_change
  AFTER UPDATE OF email ON profiles
  FOR EACH ROW
  WHEN (OLD.email IS DISTINCT FROM NEW.email)
  EXECUTE FUNCTION sync_email_to_stripe();
```

```typescript
// Edge function: sync-stripe-customer
export async function POST(req: Request) {
  const { stripe_customer_id, new_email } = await req.json();

  await stripe.customers.update(stripe_customer_id, {
    email: new_email
  });

  return new Response('OK');
}
```

**Option B: Sync on Invoice Creation**
```typescript
async function createInvoiceForUser(userId: string, amount: number) {
  // Get latest user data from Supabase
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, stripe_customer_id')
    .eq('id', userId)
    .single();

  // Sync email to Stripe customer before creating invoice
  await stripe.customers.update(profile.stripe_customer_id, {
    email: profile.email
  });

  // Now create invoice with up-to-date email
  const invoice = await stripe.invoices.create({
    customer: profile.stripe_customer_id,
    // ...
  });
}
```

**Detection:**
- Compare Supabase user emails with Stripe customer emails periodically
- Monitor support tickets about "didn't receive invoice"
- Check Stripe Dashboard for bounced invoice emails
- Log email addresses when creating invoices

**Phase Assignment:**
- Phase 1: Decide sync strategy
- Phase 2: Implement email sync mechanism
- Phase 3: Add monitoring/alerting for mismatches

---

### Pitfall 8: Stripe Customer ID Not Stored in Supabase

**What goes wrong:**
Creating invoices requires Stripe customer ID, but it's not stored in Supabase profiles table. Admin UI can't create invoices because it can't look up the customer ID, forcing manual Stripe Dashboard lookup.

**Why it happens:**
- Existing auth system didn't need Stripe integration
- Adding invoicing feature to already-deployed app
- Forgetting to migrate existing users to Stripe customers

**Consequences:**
- Admin can't create invoices from UI (missing customer ID)
- Need to manually create Stripe customers for each user
- Two-step process: create customer, then create invoice
- Poor admin UX

**Prevention:**

**Database Schema:**
```sql
-- Add stripe_customer_id to profiles
ALTER TABLE profiles
ADD COLUMN stripe_customer_id VARCHAR(255) UNIQUE;

-- Index for faster lookups
CREATE INDEX idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);
```

**Migration Strategy for Existing Users:**
```typescript
// One-time migration script
async function migrateExistingUsersToStripe() {
  const { data: users } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .is('stripe_customer_id', null);

  for (const user of users) {
    // Create Stripe customer
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.full_name,
      metadata: { supabase_user_id: user.id }
    });

    // Store customer ID in Supabase
    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customer.id })
      .eq('id', user.id);

    console.log(`Migrated user ${user.email} -> ${customer.id}`);
  }
}
```

**New User Registration:**
```typescript
// When new user signs up
async function handleNewUserSignup(userId: string, email: string, name: string) {
  // Create Stripe customer immediately
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: { supabase_user_id: userId }
  });

  // Store in profile
  await supabase
    .from('profiles')
    .update({ stripe_customer_id: customer.id })
    .eq('id', userId);
}
```

**Invoice Creation with Auto-Create:**
```typescript
async function createInvoice(userId: string, amount: number) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, full_name, stripe_customer_id')
    .eq('id', userId)
    .single();

  // Auto-create customer if doesn't exist
  let customerId = profile.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile.email,
      name: profile.full_name,
      metadata: { supabase_user_id: userId }
    });

    customerId = customer.id;

    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', userId);
  }

  // Now create invoice
  const invoice = await stripe.invoices.create({
    customer: customerId,
    // ...
  });
}
```

**Detection:**
- Admin UI shows error when trying to create invoice
- `NULL` values in `profiles.stripe_customer_id` column
- Query: `SELECT COUNT(*) FROM profiles WHERE stripe_customer_id IS NULL;`

**Phase Assignment:**
- Phase 0 (Pre-development): Database schema update
- Phase 1: Migration script for existing users
- Phase 2: Auto-create customer logic in invoice creation

---

### Pitfall 9: Invoice Data Not Persisted to Supabase

**What goes wrong:**
All invoice data only exists in Stripe. Admin dashboard can't show invoice history without making Stripe API calls on every page load, causing slow performance and hitting API rate limits.

**Why it happens:**
- Assuming "Stripe is the source of truth, we don't need to store anything"
- Not implementing webhook handlers to sync data back to Supabase
- Treating Stripe as both backend AND database

**Consequences:**
- Admin dashboard extremely slow (fetches from Stripe on every load)
- Can't filter/search invoices in Supabase (must use Stripe API)
- No reporting/analytics without complex Stripe API aggregations
- Hit Stripe API rate limits with moderate usage
- Can't use Supabase Row Level Security for invoice access control

**Prevention:**

**Database Schema:**
```sql
CREATE TABLE invoices (
  id BIGSERIAL PRIMARY KEY,
  stripe_invoice_id VARCHAR(255) UNIQUE NOT NULL,
  stripe_customer_id VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES profiles(id),
  amount_due INTEGER NOT NULL, -- in cents
  amount_paid INTEGER DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'usd',
  status VARCHAR(50) NOT NULL, -- draft, open, paid, void, uncollectible
  invoice_pdf VARCHAR(500),
  hosted_invoice_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  finalized_at TIMESTAMP,
  paid_at TIMESTAMP,
  metadata JSONB
);

CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_stripe_invoice_id ON invoices(stripe_invoice_id);
```

**Sync on Creation:**
```typescript
async function createInvoice(userId: string, amount: number) {
  // Create in Stripe
  const invoice = await stripe.invoices.create({...});

  // Immediately sync to Supabase
  await supabase.from('invoices').insert({
    stripe_invoice_id: invoice.id,
    stripe_customer_id: invoice.customer,
    user_id: userId,
    amount_due: invoice.amount_due,
    currency: invoice.currency,
    status: invoice.status,
    hosted_invoice_url: invoice.hosted_invoice_url,
  });

  return invoice;
}
```

**Sync on Webhook Events:**
```typescript
async function handleInvoiceUpdated(invoice: Stripe.Invoice) {
  await supabase.from('invoices').upsert({
    stripe_invoice_id: invoice.id,
    status: invoice.status,
    amount_paid: invoice.amount_paid,
    invoice_pdf: invoice.invoice_pdf,
    paid_at: invoice.status === 'paid' ? new Date() : null,
    metadata: invoice.metadata,
  }, {
    onConflict: 'stripe_invoice_id'
  });
}
```

**Fast Admin Dashboard:**
```typescript
// SLOW - Fetches from Stripe every time
async function getInvoicesForUser(userId: string) {
  const profile = await getProfile(userId);
  const invoices = await stripe.invoices.list({
    customer: profile.stripe_customer_id
  });
  return invoices.data; // Takes 500-1000ms
}

// FAST - Queries Supabase
async function getInvoicesForUser(userId: string) {
  const { data } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return data; // Takes 20-50ms
}
```

**Detection:**
- Admin dashboard slow to load
- Network tab shows multiple Stripe API calls
- Can't filter invoices by date/status in UI
- Stripe API rate limit errors in logs

**Phase Assignment:**
- Phase 1: Create invoices table schema
- Phase 2: Implement sync on creation and webhook updates
- Phase 3: Build admin dashboard queries on Supabase data

---

## Operational Pitfalls

Issues that emerge in production/real-world usage.

### Pitfall 10: Test Mode vs Production Mode Confusion

**What goes wrong:**
Deploying with test API keys in production, or forgetting to create production webhook endpoints. Customers try to pay but get errors because production uses test mode configuration.

**Why it happens:**
- Environment variables not properly set in production
- Forgetting to switch from test to live mode before deployment
- Webhook endpoints only configured for test mode
- Copy-pasting test keys during deployment

**Consequences:**
- Production app can't accept real payments
- All invoices created in test mode (not real money)
- Webhooks never fire in production (listening to test endpoint)
- CRITICAL: Revenue lost until fixed

**Prevention:**

**Environment Variable Validation:**
```typescript
// Startup validation
function validateStripeConfig() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey || !webhookSecret) {
    throw new Error('Missing Stripe configuration');
  }

  // Check if production is using test keys
  if (process.env.NODE_ENV === 'production') {
    if (secretKey.startsWith('sk_test_')) {
      throw new Error('CRITICAL: Production is using TEST Stripe key!');
    }
    if (webhookSecret.startsWith('whsec_test_')) {
      throw new Error('CRITICAL: Production is using TEST webhook secret!');
    }
  }

  console.log(`Stripe mode: ${secretKey.startsWith('sk_test_') ? 'TEST' : 'LIVE'}`);
}

validateStripeConfig(); // Run on app startup
```

**Separate Webhook Endpoints:**
```
Test mode webhook:
  URL: https://yourdomain.com/api/webhooks/stripe-test
  Secret: whsec_test_...

Production mode webhook:
  URL: https://yourdomain.com/api/webhooks/stripe
  Secret: whsec_...
```

**Deployment Checklist:**
```markdown
## Stripe Production Deployment Checklist

- [ ] Production Stripe account activated and verified
- [ ] Live secret key set in production environment variables
- [ ] Live publishable key set in production environment variables
- [ ] Production webhook endpoint created in Stripe Dashboard
- [ ] Production webhook secret set in production environment variables
- [ ] Test payment in production with real credit card
- [ ] Verify webhook fires in production (check Stripe Dashboard logs)
- [ ] Refund test payment
- [ ] Monitor production logs for Stripe errors
```

**Detection:**
- Check environment variables: `echo $STRIPE_SECRET_KEY | grep "sk_test"`
- Stripe Dashboard shows "Test mode" toggle when viewing live data
- Webhook logs in production are empty
- Customers report payment failures
- Review Vercel/deployment environment variables

**Phase Assignment:**
- Phase 1: Set up separate test and production environments
- Phase 4 (Pre-launch): Production deployment checklist
- Phase 5: Verify production mode working correctly

**Sources:**
- [Stripe Go-Live Checklist](https://stripe.com/docs/development/checklist) (HIGH confidence)
- [5 Things About Stripe Test Mode](https://www.tier.run/blog/the-5-gotchas-of-stripe-test-mode) (MEDIUM confidence)

---

### Pitfall 11: Invoice Finalization Before Adding Items

**What goes wrong:**
Admin finalizes invoice before adding invoice items, creating empty invoices or invoices with $0 amount that can't be edited afterward.

**Why it happens:**
- Not understanding Stripe's invoice workflow (draft → add items → finalize)
- Confusing `create` with `finalize` - thinking creation automatically sends invoice
- UI that allows "Send Invoice" button before items are added
- Stripe API allows finalizing empty invoices (doesn't validate)

**Consequences:**
- Empty invoice sent to customer (embarrassing)
- Can't edit invoice after finalization
- Must void and recreate invoice
- Poor admin UX and wasted time

**Prevention:**

**Correct Invoice Creation Workflow:**
```typescript
async function createAndSendInvoice(customerId: string, items: InvoiceItem[]) {
  // Step 1: Create draft invoice
  const invoice = await stripe.invoices.create({
    customer: customerId,
    collection_method: 'send_invoice',
    days_until_due: 30,
    auto_advance: false, // Prevent automatic finalization
  });

  // Step 2: Add items to draft
  for (const item of items) {
    await stripe.invoiceItems.create({
      customer: customerId,
      invoice: invoice.id,
      amount: item.amount,
      currency: 'usd',
      description: item.description,
    });
  }

  // Step 3: Validate items exist
  const updatedInvoice = await stripe.invoices.retrieve(invoice.id);
  if (!updatedInvoice.lines.data.length) {
    throw new Error('Cannot finalize invoice without line items');
  }

  // Step 4: Finalize invoice
  const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

  // Step 5: Send invoice email
  await stripe.invoices.sendInvoice(invoice.id);

  return finalizedInvoice;
}
```

**UI Validation:**
```typescript
// Admin UI component
function InvoiceCreationForm() {
  const [items, setItems] = useState<InvoiceItem[]>([]);

  const canFinalize = items.length > 0 && items.every(item => item.amount > 0);

  return (
    <div>
      {/* Item entry UI */}

      <button
        onClick={handleFinalizeAndSend}
        disabled={!canFinalize}
      >
        {!canFinalize && items.length === 0
          ? 'Add items before sending'
          : 'Finalize and Send Invoice'}
      </button>
    </div>
  );
}
```

**API Route Validation:**
```typescript
export async function POST(req: Request) {
  const { customerId, items } = await req.json();

  // Server-side validation
  if (!items || items.length === 0) {
    return Response.json(
      { error: 'Cannot create invoice without line items' },
      { status: 400 }
    );
  }

  if (items.some(item => item.amount <= 0)) {
    return Response.json(
      { error: 'All items must have amount > 0' },
      { status: 400 }
    );
  }

  // Proceed with invoice creation
}
```

**Detection:**
- Stripe Dashboard shows finalized invoices with $0.00 amount
- Customer complaints about empty invoices
- Review webhook events for `invoice.finalized` with `amount_due: 0`

**Phase Assignment:**
- Phase 2: Implement multi-step invoice creation with validation
- Phase 3: Add UI guards against premature finalization

**Sources:**
- [Stripe Invoice Integration](https://docs.stripe.com/invoicing/integration) (HIGH confidence)

---

### Pitfall 12: Not Handling Invoice Payment Failures

**What goes wrong:**
Customer attempts to pay invoice but payment fails (insufficient funds, card declined). System doesn't handle failure states, invoice stuck in "open" status with no retry logic or notification.

**Why it happens:**
- Only implementing `invoice.payment_succeeded` webhook
- Not handling `invoice.payment_failed` event
- Assuming all payments succeed
- No follow-up process for failed payments

**Consequences:**
- Invoices stuck in "open" status indefinitely
- No notification to admin or customer about failure
- Revenue lost (no retry attempt)
- Manual follow-up required

**Prevention:**

**Implement Payment Failure Webhook:**
```typescript
async function handleWebhook(event: Stripe.Event) {
  switch (event.type) {
    case 'invoice.payment_succeeded':
      await handlePaymentSuccess(event.data.object);
      break;

    case 'invoice.payment_failed':
      await handlePaymentFailure(event.data.object);
      break;

    case 'invoice.payment_action_required':
      await handlePaymentActionRequired(event.data.object);
      break;
  }
}

async function handlePaymentFailure(invoice: Stripe.Invoice) {
  // Update database
  await supabase.from('invoices').update({
    status: 'payment_failed',
    last_payment_error: invoice.last_finalization_error?.message,
  }).eq('stripe_invoice_id', invoice.id);

  // Notify admin
  await resend.emails.send({
    to: 'admin@riseupyouthfootball.com',
    subject: `Payment Failed: Invoice ${invoice.number}`,
    html: `
      Invoice ${invoice.number} payment failed.
      Customer: ${invoice.customer_email}
      Amount: $${invoice.amount_due / 100}
      Reason: ${invoice.last_finalization_error?.message}
    `
  });

  // Notify customer about failure
  await resend.emails.send({
    to: invoice.customer_email,
    subject: 'Payment Failed - Action Required',
    html: renderPaymentFailureEmail(invoice)
  });
}
```

**Automatic Retry with Stripe Smart Retries:**
```typescript
// Enable smart retries when creating invoice
const invoice = await stripe.invoices.create({
  customer: customerId,
  collection_method: 'charge_automatically',
  // Stripe automatically retries failed payments
});
```

**Manual Retry UI for Admins:**
```typescript
async function retryInvoicePayment(invoiceId: string) {
  const invoice = await stripe.invoices.retrieve(invoiceId);

  if (invoice.status !== 'open') {
    throw new Error('Can only retry open invoices');
  }

  // Attempt to charge again
  await stripe.invoices.pay(invoiceId);
}
```

**Detection:**
- Stripe Dashboard shows invoices in "open" status past due date
- No webhook logs for `invoice.payment_failed`
- Customer complaints about "payment didn't work"
- Monitor failed payment rate: `SELECT COUNT(*) FROM invoices WHERE status = 'payment_failed'`

**Phase Assignment:**
- Phase 2: Implement all invoice webhook events (not just success)
- Phase 3: Add failure notification emails
- Phase 4: Build admin retry UI

**Sources:**
- [Stripe Invoice Workflow Transitions](https://docs.stripe.com/invoicing/integration/workflow-transitions) (HIGH confidence)

---

### Pitfall 13: Duplicate Email Sends (Stripe + Custom Resend)

**What goes wrong:**
Both Stripe AND your Resend integration send payment confirmation emails, resulting in customers receiving duplicate emails for every payment.

**Why it happens:**
- Stripe's "Email finalized invoices to customers" setting enabled
- Also implementing custom Resend email on `invoice.payment_succeeded` webhook
- Not realizing Stripe has built-in email functionality
- Wanting custom branded emails but not disabling Stripe's emails

**Consequences:**
- Customers receive 2 emails for every payment
- Confusion and poor UX
- Looks unprofessional

**Prevention:**

**Option A: Disable Stripe Emails, Use Only Resend**
```typescript
// Stripe Dashboard: Settings > Billing > Invoices
// Disable "Send invoices and receipts to customers"

// Or via API when creating invoice
const invoice = await stripe.invoices.create({
  customer: customerId,
  auto_advance: false, // Prevents automatic email sending
});

// Send custom email via Resend on webhook
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  await resend.emails.send({
    from: 'RiseUp Football <noreply@riseupyouthfootball.com>',
    to: invoice.customer_email,
    subject: 'Payment Received - Thank You!',
    html: renderCustomPaymentConfirmation(invoice), // Your branded template
  });
}
```

**Option B: Use Stripe Emails, Disable Resend**
```typescript
// Enable in Stripe Dashboard
// Don't send custom email on webhook - let Stripe handle it

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // Update database only, no email
  await supabase.from('invoices').update({
    status: 'paid',
    paid_at: new Date(),
  }).eq('stripe_invoice_id', invoice.id);

  // Stripe already sent email, don't send another
}
```

**Option C: Conditional Email (Recommended)**
```typescript
const invoice = await stripe.invoices.create({
  customer: customerId,
  metadata: {
    send_custom_email: 'true' // Flag to control email behavior
  }
});

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // Only send custom email if flagged
  if (invoice.metadata?.send_custom_email === 'true') {
    await resend.emails.send({...});
  }
  // Otherwise, Stripe default email was sent
}
```

**Detection:**
- Test payment and check inbox (should receive only 1 email)
- Review Stripe Dashboard > Settings > Emails
- Check Resend dashboard for send count vs Stripe payment count
- Customer complaints about duplicate emails

**Phase Assignment:**
- Phase 1: Decide email strategy (Stripe vs Resend vs both)
- Phase 2: Disable appropriate email source
- Phase 3: Test to confirm single email delivery

**Sources:**
- [Stripe Invoice Email Settings](https://docs.stripe.com/invoicing/send-email) (HIGH confidence)
- [Stripe Customer Emails](https://docs.stripe.com/billing/revenue-recovery/customer-emails) (HIGH confidence)

---

### Pitfall 14: Not Handling Webhook Event Ordering

**What goes wrong:**
Assuming webhooks arrive in chronological order. Processing `invoice.payment_succeeded` before `invoice.finalized`, causing database state to be inconsistent or missing invoice record when payment webhook arrives.

**Why it happens:**
- Stripe documentation states: "Stripe doesn't guarantee the delivery of events in the order that they're generated"
- Network timing differences cause out-of-order delivery
- Async webhook processing further complicates ordering
- Assuming `finalized` always comes before `payment_succeeded`

**Consequences:**
- Payment webhook arrives before invoice exists in database (foreign key error)
- Status updates applied in wrong order (paid → finalized → open)
- Race conditions with concurrent webhooks
- Database constraint violations

**Prevention:**

**Defensive Webhook Handlers:**
```typescript
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // Don't assume invoice record exists - use upsert
  await supabase.from('invoices').upsert({
    stripe_invoice_id: invoice.id,
    stripe_customer_id: invoice.customer,
    status: 'paid',
    amount_paid: invoice.amount_paid,
    paid_at: new Date(invoice.status_transitions.paid_at * 1000),
    // Include all fields from finalized event too
    amount_due: invoice.amount_due,
    invoice_pdf: invoice.invoice_pdf,
  }, {
    onConflict: 'stripe_invoice_id',
    ignoreDuplicates: false // Always update with latest data
  });
}

async function handleInvoiceFinalized(invoice: Stripe.Invoice) {
  await supabase.from('invoices').upsert({
    stripe_invoice_id: invoice.id,
    status: invoice.status, // Might be 'open' or 'paid' depending on timing
    finalized_at: new Date(invoice.status_transitions.finalized_at * 1000),
    hosted_invoice_url: invoice.hosted_invoice_url,
  }, {
    onConflict: 'stripe_invoice_id'
  });
}
```

**Status Priority Logic:**
```typescript
function shouldUpdateStatus(currentStatus: string, newStatus: string): boolean {
  const statusPriority = {
    'draft': 1,
    'open': 2,
    'paid': 3,
    'void': 4,
    'uncollectible': 4
  };

  // Only update if new status has higher priority
  return statusPriority[newStatus] >= statusPriority[currentStatus];
}

async function updateInvoiceStatus(invoiceId: string, newStatus: string) {
  const { data: current } = await supabase
    .from('invoices')
    .select('status')
    .eq('stripe_invoice_id', invoiceId)
    .single();

  if (!current || shouldUpdateStatus(current.status, newStatus)) {
    await supabase.from('invoices').update({
      status: newStatus,
      updated_at: new Date()
    }).eq('stripe_invoice_id', invoiceId);
  }
}
```

**Fetch Latest State on Webhook:**
```typescript
async function handleAnyInvoiceEvent(event: Stripe.Event) {
  // Always fetch latest invoice state from Stripe
  const invoice = await stripe.invoices.retrieve(event.data.object.id);

  // Use latest state, not event payload
  await syncInvoiceToDatabase(invoice);
}
```

**Detection:**
- Foreign key constraint errors in webhook handler logs
- Invoice status flipping between states incorrectly
- Check webhook timestamp vs database update timestamp
- Monitor for `invoice.payment_succeeded` arriving before `invoice.finalized`

**Phase Assignment:**
- Phase 2: Implement defensive upsert logic in webhook handlers
- Phase 3: Add status priority validation
- Phase 4: Load test with concurrent webhook events

**Sources:**
- [Stripe Webhooks Documentation](https://docs.stripe.com/webhooks) (HIGH confidence)
- [Using Webhooks with Subscriptions](https://docs.stripe.com/billing/subscriptions/webhooks) (HIGH confidence)

---

### Pitfall 15: Hard-Coding Invoice Configuration

**What goes wrong:**
Payment terms (days_until_due), tax rates, or invoice footer text hard-coded in application. Admin can't change these without code deployment.

**Why it happens:**
- Assuming invoice configuration never changes
- Not building admin settings UI
- Easier to hard-code than create database table for settings

**Consequences:**
- Can't change payment terms without redeploying
- Different customers might need different terms (net 30 vs net 60)
- Can't A/B test different payment deadlines
- Inflexible system requiring developer changes for business logic

**Prevention:**

**Database-Driven Configuration:**
```sql
CREATE TABLE invoice_settings (
  id BIGSERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO invoice_settings (setting_key, setting_value, description) VALUES
  ('default_days_until_due', '30', 'Default payment terms in days'),
  ('invoice_footer', 'Thank you for your business!', 'Footer text on invoices'),
  ('tax_rate_percentage', '0', 'Default tax rate percentage'),
  ('send_payment_reminders', 'true', 'Send reminder emails before due date');
```

```typescript
async function getInvoiceSetting(key: string): Promise<string> {
  const { data } = await supabase
    .from('invoice_settings')
    .select('setting_value')
    .eq('setting_key', key)
    .single();

  return data?.setting_value;
}

async function createInvoice(customerId: string, amount: number) {
  const daysUntilDue = await getInvoiceSetting('default_days_until_due');
  const footer = await getInvoiceSetting('invoice_footer');

  const invoice = await stripe.invoices.create({
    customer: customerId,
    days_until_due: parseInt(daysUntilDue),
    footer: footer,
    // ...
  });
}
```

**Admin Settings UI:**
```typescript
function InvoiceSettingsPage() {
  const [settings, setSettings] = useState({
    default_days_until_due: '30',
    invoice_footer: '',
  });

  async function updateSetting(key: string, value: string) {
    await supabase.from('invoice_settings').upsert({
      setting_key: key,
      setting_value: value,
      updated_at: new Date()
    }, {
      onConflict: 'setting_key'
    });
  }

  return (
    <div>
      <h2>Invoice Settings</h2>
      <label>
        Payment Terms (days):
        <input
          type="number"
          value={settings.default_days_until_due}
          onChange={(e) => updateSetting('default_days_until_due', e.target.value)}
        />
      </label>

      <label>
        Invoice Footer:
        <textarea
          value={settings.invoice_footer}
          onChange={(e) => updateSetting('invoice_footer', e.target.value)}
        />
      </label>
    </div>
  );
}
```

**Per-Customer Override:**
```sql
ALTER TABLE profiles
ADD COLUMN invoice_days_until_due INTEGER DEFAULT NULL;

-- NULL = use default, otherwise use custom value
```

```typescript
async function createInvoice(userId: string, amount: number) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, invoice_days_until_due')
    .eq('id', userId)
    .single();

  const daysUntilDue = profile.invoice_days_until_due
    || await getInvoiceSetting('default_days_until_due');

  const invoice = await stripe.invoices.create({
    customer: profile.stripe_customer_id,
    days_until_due: parseInt(daysUntilDue),
    // ...
  });
}
```

**Detection:**
- Need to change payment terms requires code change
- Different customers can't have different terms
- Search codebase for hard-coded numbers: `grep -r "days_until_due: [0-9]" .`

**Phase Assignment:**
- Phase 2: Create settings table and admin UI
- Phase 3: Add per-customer overrides if needed

---

## Phase Assignment Summary

| Phase | Pitfalls to Address | Priority |
|-------|---------------------|----------|
| **Phase 0 (Pre-dev)** | #8 Stripe Customer ID schema | CRITICAL |
| **Phase 1 (Foundation)** | #1 Webhook verification, #4 API key exposure, #6 Admin auth, #10 Environment setup | CRITICAL |
| **Phase 2 (Core Implementation)** | #2 Race conditions, #3 Idempotency, #5 Webhook timeout, #7 Email sync, #9 Invoice persistence, #11 Finalization workflow, #12 Duplicate emails, #14 Event ordering, #15 Configuration | HIGH |
| **Phase 3 (Testing & Refinement)** | Load testing for #2, #3, #5, #14; End-to-end payment flow validation | MEDIUM |
| **Phase 4 (Pre-launch)** | #10 Production deployment checklist, #12 Payment failures | CRITICAL |
| **Phase 5 (Monitoring)** | Production verification, error alerting, duplicate detection | MEDIUM |

---

## Quality Gate Checklist

Before marking any phase complete:

### Phase 1 (Foundation)
- [ ] Webhook signature verification implemented and tested
- [ ] No `NEXT_PUBLIC_` prefix on secret keys
- [ ] Admin role verification on invoice creation route
- [ ] Test/production environments separated
- [ ] Startup validation prevents test keys in production

### Phase 2 (Core Implementation)
- [ ] `processed_webhook_events` table created with unique constraint
- [ ] All webhook handlers check for duplicate event IDs
- [ ] Webhook endpoint returns 200 within 2 seconds
- [ ] Async queue configured for slow operations
- [ ] Invoice creation follows draft → items → finalize → send workflow
- [ ] Either Stripe OR Resend emails disabled (not both)

### Phase 3 (Testing)
- [ ] Load test: 10 concurrent invoice creations + payments
- [ ] Test: Webhook resend doesn't cause duplicate emails
- [ ] Test: Events arriving out of order handled correctly
- [ ] Test: Payment failure sends notification email

### Phase 4 (Production Launch)
- [ ] Production Stripe account verified and activated
- [ ] Live API keys set in production environment
- [ ] Production webhook endpoint registered in Stripe Dashboard
- [ ] Test payment completed and refunded in production
- [ ] Monitoring/alerting configured for webhook errors

---

## Confidence Assessment

| Pitfall Category | Confidence | Source Quality |
|------------------|------------|----------------|
| Webhook Security & Idempotency | HIGH | Official Stripe docs + multiple verified sources |
| Race Conditions & Async | HIGH | Recent 2026 articles + official docs |
| Environment & API Keys | HIGH | Official Next.js + Stripe documentation |
| Invoice Workflow | HIGH | Official Stripe API documentation |
| Email Integration | MEDIUM | Stripe docs for their emails, less info on Resend integration |
| Supabase Integration | MEDIUM | Community sources, some gaps in official docs |

---

## Sources

**HIGH Confidence Sources (Official Documentation):**
- [Stripe Webhooks Documentation](https://docs.stripe.com/webhooks)
- [Stripe Invoice Integration](https://docs.stripe.com/invoicing/integration)
- [Stripe Invoice API Reference](https://docs.stripe.com/api/invoices/create)
- [Stripe Invoice Finalization](https://docs.stripe.com/api/invoices/finalize)
- [Stripe Go-Live Checklist](https://stripe.com/docs/development/checklist)
- [Next.js Environment Variables](https://vercel.com/kb/guide/getting-started-with-nextjs-typescript-stripe)

**MEDIUM Confidence Sources (Verified Community):**
- [Stripe Webhook Race Conditions (DEV)](https://dev.to/belazy/the-race-condition-youre-probably-shipping-right-now-with-stripe-webhooks-mj4)
- [Stripe Webhooks Deep Dive](https://www.pedroalonso.net/blog/stripe-webhooks-deep-dive/)
- [Stripe Webhook Best Practices (Stigg)](https://www.stigg.io/blog-posts/best-practices-i-wish-we-knew-when-integrating-stripe-webhooks)
- [Next.js Stripe Best Practices](https://nextjsstarter.com/blog/stripe-nextjs-best-practices-revealed/)
- [Stripe Integration with Supabase](https://dev.to/flnzba/33-stripe-integration-guide-for-nextjs-15-with-supabase-13b5)
- [Stripe Test Mode Gotchas](https://www.tier.run/blog/the-5-gotchas-of-stripe-test-mode)

---

## End of Pitfalls Research

**Recommendation for Roadmap Creator:**

The most critical architectural decision is **Phase 1: Choose webhook-only database updates** to prevent race conditions. This should be decided before any code is written.

Second priority is **Phase 1: Implement idempotency from the start** - adding it later is much harder than building it in from day one.

All other pitfalls are either preventable through careful implementation or recoverable without major refactoring.
