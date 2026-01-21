# Phase 4: Foundation & Schema - Research

**Researched:** 2026-01-20
**Domain:** Database schema design, Stripe SDK integration, webhook handling
**Confidence:** HIGH

## Summary

This phase establishes the database foundation and Stripe integration for sponsorship invoice management. The stack is clear: Supabase PostgreSQL with migrations, Stripe Node.js SDK, and Next.js API routes for webhooks.

The standard approach involves three core tables (sponsorship_packages, invoices, webhook_events) with proper foreign key relationships and RLS policies. Stripe integration follows the server-side initialization pattern with environment variables, while webhook handling requires raw body parsing and signature verification for security.

Key technical challenges identified: atomic slot decrement on payment, webhook idempotency to prevent duplicate processing, and proper ON DELETE RESTRICT constraints to prevent package deletion when invoices exist.

**Primary recommendation:** Use Supabase migrations with timestamp naming (005_invoicing.sql), PostgreSQL functions for atomic operations, and a dedicated webhook_events table for idempotency tracking.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| stripe | latest (^14.x) | Stripe API operations | Official Stripe Node.js SDK, required for server-side invoice/payment operations |
| @supabase/supabase-js | ^2.78.0 (already installed) | Database client | Project already uses Supabase, provides TypeScript-safe queries |
| next | 16.1.3 (already installed) | API routes for webhooks | Project's framework, provides serverless API endpoints |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| micro | ^10.x | Raw body buffer parsing | Pages Router webhook signature verification (if not using App Router) |
| zod | ^4.3.5 (already installed) | Environment variable validation | Runtime validation of Stripe keys and webhook secrets |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Stripe SDK | Direct REST API calls | SDK provides TypeScript types, handles retries, and manages API versioning automatically |
| Supabase migrations | Manual SQL scripts | Migrations provide version control, rollback capability, and deployment consistency |
| PostgreSQL functions | Client-side decrement | Database functions ensure atomic operations and prevent race conditions |

**Installation:**
```bash
npm install stripe
```

## Architecture Patterns

### Recommended Project Structure
```
supabase/
├── migrations/
│   └── 005_invoicing.sql      # All schema changes in single migration
src/
├── lib/
│   ├── stripe/
│   │   ├── client.ts          # Stripe SDK initialization
│   │   └── webhooks.ts        # Webhook signature verification
│   └── supabase/              # Already exists
│       ├── client.ts
│       └── server.ts
└── app/
    └── api/
        └── webhooks/
            └── stripe/
                └── route.ts   # Webhook endpoint (App Router)
```

### Pattern 1: Database Schema for Invoicing
**What:** Three-table design with immutable invoice data and atomic slot tracking
**When to use:** All invoice/payment systems where historical accuracy matters

**Schema Structure:**
```sql
-- Source: Research synthesis from invoice schema best practices
-- https://www.red-gate.com/blog/erd-for-invoice-management
-- https://copyprogramming.com/howto/database-design-for-invoices-invoice-lines-revisions

-- Sponsorship packages table
CREATE TABLE sponsorship_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  cost INTEGER NOT NULL,  -- Amount in cents (Stripe convention)
  closing_date DATE,      -- NULL for year-round packages
  total_slots INTEGER NOT NULL,
  available_slots INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT positive_cost CHECK (cost > 0),
  CONSTRAINT valid_slots CHECK (available_slots >= 0 AND available_slots <= total_slots)
);

-- Invoices table (immutable after creation)
CREATE TABLE invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_invoice_id TEXT UNIQUE NOT NULL,  -- Stripe's invoice ID
  package_id UUID NOT NULL REFERENCES sponsorship_packages(id) ON DELETE RESTRICT,

  -- Snapshot data at time of invoice creation (immutable)
  package_name TEXT NOT NULL,
  package_cost INTEGER NOT NULL,

  -- Customer information
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  finalized_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  voided_at TIMESTAMPTZ,

  -- Admin tracking
  created_by UUID REFERENCES auth.users(id)
);

-- Webhook event tracking (idempotency)
CREATE TABLE webhook_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_event_id TEXT UNIQUE NOT NULL,  -- Stripe event.id
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  payload JSONB NOT NULL
);
```

**Key Principles:**
- **Immutability**: Invoice data is snapshot at creation time, never updated based on package changes
- **Foreign Key Protection**: `ON DELETE RESTRICT` prevents deleting packages with invoices
- **Atomic Constraints**: `CHECK` constraints enforce business rules at database level

### Pattern 2: Stripe Server-Side Initialization
**What:** Singleton pattern for Stripe SDK with API version pinning
**When to use:** All server-side Stripe operations (invoices, customers, webhooks)

**Example:**
```typescript
// Source: Stripe + Next.js integration guide
// https://vercel.com/kb/guide/getting-started-with-nextjs-typescript-stripe
// https://docs.stripe.com/api

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',  // Pin to specific version
  typescript: true,
});
```

**Why singleton:** Reuses connection pool, prevents rate limiting issues

### Pattern 3: Webhook Signature Verification (App Router)
**What:** Raw body parsing with signature verification before processing
**When to use:** All Stripe webhook endpoints to prevent replay attacks

**Example:**
```typescript
// Source: Next.js App Router + Stripe webhook verification
// https://kitson-broadhurst.medium.com/next-js-app-router-stripe-webhook-signature-verification-ea9d59f3593f
// https://docs.stripe.com/webhooks/signature

import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe/client';

export async function POST(req: Request) {
  const body = await req.text();  // Raw body as text, NOT req.json()
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return new Response('Missing signature', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Process event AFTER verification
  // ...

  return new Response(JSON.stringify({ received: true }), { status: 200 });
}
```

**Critical:** Must use `req.text()` not `req.json()` - Stripe requires raw body for signature verification

### Pattern 4: Webhook Idempotency Check
**What:** Database-level deduplication using unique constraint on event ID
**When to use:** All webhook handlers to prevent duplicate processing on retries

**Example:**
```typescript
// Source: Stripe webhook best practices
// https://www.stigg.io/blog-posts/best-practices-i-wish-we-knew-when-integrating-stripe-webhooks
// https://hookdeck.com/webhooks/guides/implement-webhook-idempotency

async function processWebhook(event: Stripe.Event) {
  const supabase = createClient();

  // Check if event already processed
  const { data: existing } = await supabase
    .from('webhook_events')
    .select('id')
    .eq('stripe_event_id', event.id)
    .single();

  if (existing) {
    console.log(`Event ${event.id} already processed, skipping`);
    return { success: true, duplicate: true };
  }

  // Process event logic here
  // ...

  // Mark as processed (unique constraint prevents duplicates)
  await supabase.from('webhook_events').insert({
    stripe_event_id: event.id,
    event_type: event.type,
    payload: event,
  });

  return { success: true, duplicate: false };
}
```

**Why unique constraint:** Database enforces idempotency even under race conditions

### Pattern 5: Atomic Slot Decrement via PostgreSQL Function
**What:** RPC function for atomic decrement to prevent overselling
**When to use:** When invoice is paid, must decrement available_slots exactly once

**Example:**
```sql
-- Source: Supabase atomic operations discussion
-- https://github.com/orgs/supabase/discussions/7635
-- https://dev.to/damasosanoja/data-integrity-first-mastering-transactions-in-supabase-sql-for-reliable-applications-2dbb

CREATE OR REPLACE FUNCTION decrement_package_slots(package_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  new_slots INTEGER;
BEGIN
  UPDATE sponsorship_packages
  SET available_slots = available_slots - 1
  WHERE id = package_uuid
    AND available_slots > 0  -- Prevents negative slots
  RETURNING available_slots INTO new_slots;

  IF new_slots IS NULL THEN
    RAISE EXCEPTION 'No slots available or package not found';
  END IF;

  RETURN new_slots;
END;
$$ LANGUAGE plpgsql;
```

**Usage from TypeScript:**
```typescript
const { data, error } = await supabase.rpc('decrement_package_slots', {
  package_uuid: invoice.package_id
});
```

**Why function:** PostgREST wraps RPC calls in transactions automatically, ensuring atomicity

### Anti-Patterns to Avoid

- **Using `req.json()` for webhooks**: Stripe signature verification fails because it needs raw body
- **Updating package cost after invoices exist**: Breaks historical accuracy - invoice must snapshot data
- **Client-side slot decrement**: Race condition allows overselling - use PostgreSQL function
- **Processing webhooks without idempotency check**: Retries cause duplicate emails/database updates
- **Exposing STRIPE_SECRET_KEY to client**: Must remain server-side only, use NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY for client

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Webhook signature verification | Custom HMAC validation | `stripe.webhooks.constructEvent()` | Stripe's method handles timestamp validation, prevents replay attacks, includes 5-minute tolerance window |
| Invoice creation workflow | Manual API calls | Stripe Invoicing API workflow | Handles finalization, email sending, payment collection methods, and PDF generation automatically |
| Concurrent slot updates | Application-level locking | PostgreSQL function with transaction | Database guarantees atomicity even under high concurrency, prevents race conditions |
| Webhook retry handling | Manual retry logic | Stripe automatic retries + idempotency | Stripe retries failed webhooks automatically for 3 days, idempotency table handles duplicates |
| Environment variable validation | Runtime checks everywhere | Zod schema at startup | Fails fast on app boot with clear error, prevents runtime surprises |
| Timestamp management | Manual NOW() in queries | PostgreSQL triggers | `updated_at` trigger ensures consistency, can't be forgotten in UPDATE queries |

**Key insight:** Stripe's APIs are battle-tested for edge cases (network failures, duplicate events, partial failures). PostgreSQL's ACID guarantees are more reliable than application-level logic for data consistency.

## Common Pitfalls

### Pitfall 1: Pages Router Body Parser Interference
**What goes wrong:** Webhook signature verification fails with "No signatures found matching the expected signature" even though webhook secret is correct.
**Why it happens:** Next.js Pages Router automatically parses request body as JSON, but Stripe needs the raw body buffer for signature verification. Once parsed, the raw body is lost.
**How to avoid:**
- **App Router (recommended)**: Use `await req.text()` instead of `await req.json()`
- **Pages Router**: Export config to disable body parser
```typescript
export const config = {
  api: {
    bodyParser: false,
  },
};
```
**Warning signs:** Webhook returns 400 error with "signature verification failed" in local testing with Stripe CLI

**Sources:**
- [Next.js App Router + Stripe Webhook Signature Verification](https://kitson-broadhurst.medium.com/next-js-app-router-stripe-webhook-signature-verification-ea9d59f3593f)
- [Verify Stripe webhook signature in Next.js API Routes](https://maxkarlsson.dev/blog/verify-stripe-webhook-signature-in-next-js-api-routes)

### Pitfall 2: Using Wrong Webhook Secret in Production
**What goes wrong:** Webhooks fail in production with signature errors, but work in development with Stripe CLI.
**Why it happens:** Stripe CLI uses a different webhook secret (starts with `whsec_`) than the production endpoint secret. Developers copy the CLI secret to `.env.local` but forget to update it for production deployment.
**How to avoid:**
1. Create webhook endpoint in Stripe Dashboard for production URL
2. Use endpoint-specific secret (not CLI secret) in production environment
3. Separate environment variables: `STRIPE_WEBHOOK_SECRET_DEV` vs `STRIPE_WEBHOOK_SECRET_PROD`
**Warning signs:** Local webhooks work, production webhooks return 400 with signature errors

**Source:** [Resolve webhook signature verification errors | Stripe Documentation](https://docs.stripe.com/webhooks/signature)

### Pitfall 3: Missing Webhook Idempotency Causes Duplicate Operations
**What goes wrong:** Single payment triggers multiple slot decrements, duplicate "payment received" emails, or duplicate database records.
**Why it happens:** Stripe retries webhooks that don't return 2xx within timeout (~30 seconds). If endpoint times out during processing (database write, email send), Stripe interprets as failure and retries. Without idempotency check, retry processes event again.
**How to avoid:**
1. Check `webhook_events` table for `stripe_event_id` BEFORE processing
2. Return 200 response immediately if event already processed
3. Insert into `webhook_events` AFTER successful processing
4. Use unique constraint on `stripe_event_id` as safety net
**Warning signs:** Production logs show same `invoice.paid` event ID processed multiple times, users report duplicate emails

**Source:** [Best practices I wish we knew when integrating Stripe webhooks | Stigg](https://www.stigg.io/blog-posts/best-practices-i-wish-we-knew-when-integrating-stripe-webhooks)

### Pitfall 4: Deleting Packages With Active Invoices
**What goes wrong:** Admin deletes a sponsorship package, breaking foreign key relationships. Existing invoices reference non-existent package, causing query errors and data integrity issues.
**Why it happens:** Default foreign key behavior is `ON DELETE NO ACTION`, but application may not enforce deletion prevention. Admin sees "delete" button, clicks it, database allows it if no explicit RESTRICT constraint.
**How to avoid:**
1. Use `ON DELETE RESTRICT` in foreign key definition
2. Application-level check: query for invoices before allowing delete
3. UI feedback: disable delete button when invoices exist, show count
**Warning signs:** Error logs showing "foreign key violation" after package deletion, invoice list page crashes

**Sources:**
- [PostgreSQL ON DELETE RESTRICT](https://www.datacamp.com/tutorial/sql-on-delete-restrict)
- [Cascade Deletes | Supabase Docs](https://supabase.com/docs/guides/database/postgres/cascade-deletes)

### Pitfall 5: Race Condition in Slot Availability Check
**What goes wrong:** Two invoices are paid simultaneously for the last slot. Application checks `available_slots > 0` (both see 1), both decrement slots, result is -1 available slots (oversold).
**Why it happens:** Client-side or application-level check-then-update is not atomic. Between SELECT and UPDATE, another transaction can modify the value.
**How to avoid:**
1. Use PostgreSQL function with `UPDATE...WHERE available_slots > 0` in single statement
2. Function returns NULL if no slots available, allowing error handling
3. Call via Supabase `.rpc()` which wraps in transaction automatically
**Warning signs:** `available_slots` goes negative in production, more invoices paid than total_slots

**Source:** [Data Integrity First: Mastering Transactions in Supabase SQL](https://dev.to/damasosanoja/data-integrity-first-mastering-transactions-in-supabase-sql-for-reliable-applications-2dbb)

### Pitfall 6: Exposing Stripe Secret Key to Client
**What goes wrong:** Stripe secret key (starts with `sk_`) exposed in client-side JavaScript, visible in browser DevTools. Attacker can use key to create refunds, access customer data, or issue fraudulent invoices.
**Why it happens:** Confusion between `STRIPE_SECRET_KEY` (server-only) and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (client-safe). Developer adds `NEXT_PUBLIC_` prefix to secret key thinking it's needed for client-side Stripe.js.
**How to avoid:**
1. Never prefix secret keys with `NEXT_PUBLIC_`
2. Secret key only in server-side code (API routes, server components)
3. Publishable key (starts with `pk_`) for client-side Stripe.js initialization
4. Use `.env.local` validation on startup to catch mistakes
**Warning signs:** Build warnings about exposing secrets, security scanner alerts, unexpected Stripe API usage in logs

**Source:** [Next.js Environment Variables Guide](https://nextjs.org/docs/pages/guides/environment-variables)

### Pitfall 7: Invoice Mutability After Finalization
**What goes wrong:** Admin changes package price, existing invoice amounts update retroactively, breaking accounting records and customer trust.
**Why it happens:** Invoice table references `sponsorship_packages.cost` via foreign key without snapshot. When package cost updates, old invoices display new price.
**How to avoid:**
1. Store snapshot columns: `package_name`, `package_cost` in invoice table at creation time
2. Never update invoice amounts after finalization
3. Display snapshot values, not live package data
**Warning signs:** Customer disputes invoice amount change, accounting reconciliation fails, audit trail broken

**Source:** [Database design for invoices](https://copyprogramming.com/howto/database-design-for-invoices-invoice-lines-revisions)

## Code Examples

Verified patterns from official sources:

### Creating Invoice with Stripe API
```typescript
// Source: Stripe Invoicing Integration Guide
// https://docs.stripe.com/invoicing/integration

import { stripe } from '@/lib/stripe/client';
import { createClient } from '@/lib/supabase/server';

async function createSponsorInvoice(params: {
  packageId: string;
  customerEmail: string;
  customerName: string;
  createdBy: string;
}) {
  const supabase = createClient();

  // Get package details
  const { data: package } = await supabase
    .from('sponsorship_packages')
    .select('*')
    .eq('id', params.packageId)
    .single();

  if (!package) throw new Error('Package not found');

  // Create or get Stripe customer
  const customer = await stripe.customers.create({
    email: params.customerEmail,
    name: params.customerName,
  });

  // Create invoice with line item
  const invoice = await stripe.invoices.create({
    customer: customer.id,
    collection_method: 'send_invoice',
    days_until_due: 0,  // Due on receipt
    auto_advance: false,  // Manual finalization
  });

  // Add line item
  await stripe.invoiceItems.create({
    customer: customer.id,
    invoice: invoice.id,
    amount: package.cost,  // Amount in cents
    currency: 'usd',
    description: package.name,
  });

  // Store in database (draft status)
  const { data: dbInvoice } = await supabase
    .from('invoices')
    .insert({
      stripe_invoice_id: invoice.id,
      package_id: params.packageId,
      package_name: package.name,
      package_cost: package.cost,
      customer_email: params.customerEmail,
      customer_name: params.customerName,
      status: 'draft',
      created_by: params.createdBy,
    })
    .select()
    .single();

  return dbInvoice;
}
```

### Finalizing and Sending Invoice
```typescript
// Source: Stripe Invoicing Quickstart
// https://docs.stripe.com/invoicing/integration/quickstart

async function finalizeAndSendInvoice(invoiceId: string) {
  const supabase = createClient();

  // Get invoice from database
  const { data: dbInvoice } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .single();

  if (!dbInvoice) throw new Error('Invoice not found');
  if (dbInvoice.status !== 'draft') throw new Error('Invoice already finalized');

  // Finalize invoice (makes immutable)
  const finalizedInvoice = await stripe.invoices.finalizeInvoice(
    dbInvoice.stripe_invoice_id
  );

  // Send invoice email to customer
  await stripe.invoices.sendInvoice(dbInvoice.stripe_invoice_id);

  // Update database status
  await supabase
    .from('invoices')
    .update({
      status: 'open',
      finalized_at: new Date().toISOString(),
    })
    .eq('id', invoiceId);

  return finalizedInvoice;
}
```

### Webhook Handler for invoice.paid Event
```typescript
// Source: Stripe webhook event types
// https://docs.stripe.com/api/events/types
// https://docs.stripe.com/webhooks

import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe/client';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const supabase = createClient();

  // Idempotency check
  const { data: existing } = await supabase
    .from('webhook_events')
    .select('id')
    .eq('stripe_event_id', event.id)
    .single();

  if (existing) {
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  // Handle invoice.paid event
  if (event.type === 'invoice.paid') {
    const invoice = event.data.object as Stripe.Invoice;

    // Update invoice status
    const { data: dbInvoice } = await supabase
      .from('invoices')
      .update({
        status: 'paid',
        paid_at: new Date(invoice.status_transitions.paid_at! * 1000).toISOString(),
      })
      .eq('stripe_invoice_id', invoice.id)
      .select()
      .single();

    if (dbInvoice) {
      // Decrement package slots atomically
      await supabase.rpc('decrement_package_slots', {
        package_uuid: dbInvoice.package_id
      });

      // TODO: Send confirmation email to sponsor
      // TODO: Notify admin of payment
    }
  }

  // Mark event as processed
  await supabase.from('webhook_events').insert({
    stripe_event_id: event.id,
    event_type: event.type,
    payload: event,
  });

  return new Response(JSON.stringify({ received: true }), { status: 200 });
}
```

### Environment Variable Setup
```bash
# Source: Next.js environment variables guide
# https://nextjs.org/docs/pages/guides/environment-variables

# .env.local (never commit)

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe (add these)
STRIPE_SECRET_KEY=sk_test_...  # Server-side only
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...  # Client-safe
STRIPE_WEBHOOK_SECRET=whsec_...  # From Stripe Dashboard endpoint
```

### Migration File Structure
```sql
-- Source: Supabase migration best practices
-- https://supabase.com/docs/guides/deployment/database-migrations
-- File: supabase/migrations/005_invoicing.sql

-- ============================================================================
-- Migration: 005_invoicing
-- Description: Add sponsorship packages, invoices, and webhook event tracking
-- Created: 2026-01-20
-- ============================================================================

-- ============================================================================
-- SPONSORSHIP PACKAGES TABLE
-- ============================================================================

create table if not exists sponsorship_packages (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  cost integer not null check (cost > 0),
  closing_date date,
  total_slots integer not null check (total_slots > 0),
  available_slots integer not null check (available_slots >= 0 and available_slots <= total_slots),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS policies
alter table sponsorship_packages enable row level security;

create policy "Anyone can view packages"
on sponsorship_packages for select
using (true);

create policy "Authenticated users can insert packages"
on sponsorship_packages for insert
to authenticated
with check (true);

create policy "Authenticated users can update packages"
on sponsorship_packages for update
to authenticated
using (true);

create policy "Authenticated users can delete packages"
on sponsorship_packages for delete
to authenticated
using (true);

-- Indexes
create index if not exists idx_packages_closing_date on sponsorship_packages(closing_date);

-- Updated_at trigger
create trigger update_packages_updated_at
  before update on sponsorship_packages
  for each row
  execute function update_updated_at_column();

-- ============================================================================
-- INVOICES TABLE
-- ============================================================================

create table if not exists invoices (
  id uuid default gen_random_uuid() primary key,
  stripe_invoice_id text unique not null,
  package_id uuid not null references sponsorship_packages(id) on delete restrict,

  -- Snapshot data (immutable)
  package_name text not null,
  package_cost integer not null,

  -- Customer data
  customer_email text not null,
  customer_name text not null,

  -- Status
  status text not null default 'draft' check (status in ('draft', 'open', 'paid', 'void', 'uncollectible')),

  -- Timestamps
  created_at timestamptz default now(),
  finalized_at timestamptz,
  paid_at timestamptz,
  voided_at timestamptz,

  -- Admin tracking
  created_by uuid references auth.users(id)
);

-- RLS policies
alter table invoices enable row level security;

create policy "Authenticated users can view invoices"
on invoices for select
to authenticated
using (true);

create policy "Authenticated users can insert invoices"
on invoices for insert
to authenticated
with check (true);

create policy "Authenticated users can update invoices"
on invoices for update
to authenticated
using (true);

-- Indexes
create index if not exists idx_invoices_stripe_id on invoices(stripe_invoice_id);
create index if not exists idx_invoices_status on invoices(status);
create index if not exists idx_invoices_package_id on invoices(package_id);
create index if not exists idx_invoices_customer_email on invoices(customer_email);

-- ============================================================================
-- WEBHOOK EVENTS TABLE (Idempotency)
-- ============================================================================

create table if not exists webhook_events (
  id uuid default gen_random_uuid() primary key,
  stripe_event_id text unique not null,
  event_type text not null,
  processed_at timestamptz default now(),
  payload jsonb not null
);

-- RLS policies
alter table webhook_events enable row level security;

create policy "Authenticated users can view webhook events"
on webhook_events for select
to authenticated
using (true);

-- Service role can insert (webhooks run with service role)
create policy "Service role can insert webhook events"
on webhook_events for insert
to service_role
with check (true);

-- Indexes
create index if not exists idx_webhook_events_stripe_id on webhook_events(stripe_event_id);
create index if not exists idx_webhook_events_type on webhook_events(event_type);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Atomic slot decrement
create or replace function decrement_package_slots(package_uuid uuid)
returns integer as $$
declare
  new_slots integer;
begin
  update sponsorship_packages
  set available_slots = available_slots - 1
  where id = package_uuid
    and available_slots > 0
  returning available_slots into new_slots;

  if new_slots is null then
    raise exception 'No slots available or package not found';
  end if;

  return new_slots;
end;
$$ language plpgsql;

-- ============================================================================
-- SEED DATA (Initial packages)
-- ============================================================================

insert into sponsorship_packages (name, cost, closing_date, total_slots, available_slots)
values
  ('T-shirt (tackle & flag), website, banner, golf tournament sign', 350000, '2026-07-31', 18, 18),
  ('Website only logo', 60000, null, 15, 15),
  ('Game day package', 75000, '2026-07-31', 13, 13),
  ('Rise Up Academy t-shirt', 50000, '2026-02-18', 18, 18);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Stripe Checkout Sessions | Stripe Invoicing API | 2022 | Invoicing provides better B2B workflow with custom due dates, manual approval, and email delivery |
| Manual webhook signature checks | `stripe.webhooks.constructEvent()` | Always recommended | SDK method includes timestamp validation and replay attack prevention automatically |
| Pages Router `bodyParser: false` + micro | App Router `req.text()` | Next.js 13+ (2023) | App Router simplifies webhook handling, no external dependencies needed |
| Client-side event deduplication | Database unique constraint + check | 2024+ best practice | Database-level enforcement prevents race conditions that client-side checks miss |
| Thin events (event.data.object is ID) | Snapshot events (full object) | Default since 2023 | Snapshot events include full data in webhook, no additional API call needed |

**Deprecated/outdated:**
- `@stripe/stripe-js` for server-side: Use `stripe` package only, stripe-js is client-side only
- Hardcoded API versions: Pin version explicitly in SDK initialization to prevent breaking changes
- Single webhook endpoint for all events: Stripe recommends separate endpoints per integration for easier debugging

## Open Questions

Things that couldn't be fully resolved:

1. **Passing Processing Fees to Customer**
   - What we know: User wants to pass Stripe fees (2.9% + 30¢ for cards, 0.8% for ACH) to sponsors
   - What's unclear: Stripe Invoicing doesn't have built-in fee pass-through like Checkout Sessions. Options are: (a) calculate fees manually and add as separate line item, (b) increase package price to cover fees, or (c) use Stripe application fees (requires Connect)
   - Recommendation: Start without fee pass-through in Phase 4 foundation. Phase 5 can implement manual fee calculation if needed. Verify legal compliance (fee surcharging is restricted in some US states).

2. **Custom Invoice Branding Configuration**
   - What we know: User has logo and brand colors ready, wants custom branding on Stripe invoices
   - What's unclear: Whether branding is configured via Stripe Dashboard (manual) or API (automated)
   - Recommendation: Use Stripe Dashboard > Settings > Branding for initial setup (logo upload, color codes). This is account-level, affects all invoices. API configuration is possible but unnecessary complexity for single brand.

3. **Automatic Reminder Email Timing**
   - What we know: User wants automatic reminders for unpaid invoices
   - What's unclear: Stripe's default reminder schedule vs custom schedule
   - Recommendation: Use Stripe's default reminder configuration (Dashboard > Billing > Invoices > Reminder emails). Test timing in Phase 5. Custom scheduling requires webhook-based cron job if defaults don't fit.

4. **"Year Round (Prorated)" Package Handling**
   - What we know: "Website only logo" package is year-round with potential proration
   - What's unclear: Proration calculation logic (daily? monthly? based on what date range?)
   - Recommendation: Store `closing_date` as NULL for year-round packages in Phase 4 schema. Implement proration calculation in Phase 5 invoice creation UI. Likely manual proration (admin adjusts price) rather than automatic calculation.

## Sources

### Primary (HIGH confidence)
- [Stripe Invoicing Integration Guide](https://docs.stripe.com/invoicing/integration) - Official Stripe documentation
- [Stripe Invoice API Reference](https://docs.stripe.com/api/invoices) - Official API docs
- [Stripe Webhook Events Types](https://docs.stripe.com/api/events/types) - Official event reference
- [Stripe Webhooks Documentation](https://docs.stripe.com/webhooks) - Official webhook guide
- [Stripe Invoice Customization](https://docs.stripe.com/invoicing/customize) - Official branding guide
- [Supabase Tables and Data](https://supabase.com/docs/guides/database/tables) - Official Supabase docs
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) - Official RLS guide
- [Supabase Cascade Deletes](https://supabase.com/docs/guides/database/postgres/cascade-deletes) - Official foreign key guide
- [Supabase Database Migrations](https://supabase.com/docs/guides/deployment/database-migrations) - Official migration guide
- [Next.js Environment Variables](https://nextjs.org/docs/pages/guides/environment-variables) - Official Next.js docs
- [PostgreSQL Constraints Documentation](https://www.postgresql.org/docs/current/ddl-constraints.html) - Official PostgreSQL docs

### Secondary (MEDIUM confidence)
- [Vercel: Getting started with Next.js, TypeScript, and Stripe Checkout](https://vercel.com/kb/guide/getting-started-with-nextjs-typescript-stripe) - Vercel official guide
- [Next.js App Router + Stripe Webhook Signature Verification](https://kitson-broadhurst.medium.com/next-js-app-router-stripe-webhook-signature-verification-ea9d59f3593f) - Medium tutorial (2025)
- [Verify Stripe webhook signature in Next.js API Routes](https://maxkarlsson.dev/blog/verify-stripe-webhook-signature-in-next-js-api-routes) - Developer blog
- [Best practices I wish we knew when integrating Stripe webhooks](https://www.stigg.io/blog-posts/best-practices-i-wish-we-knew-when-integrating-stripe-webhooks) - Stigg engineering blog
- [Data Integrity First: Mastering Transactions in Supabase SQL](https://dev.to/damasosanoja/data-integrity-first-mastering-transactions-in-supabase-sql-for-reliable-applications-2dbb) - DEV Community (2025)
- [How to Design an ER Diagram for an Invoice Management System](https://www.red-gate.com/blog/erd-for-invoice-management) - Redgate blog
- [Database design for invoices, invoice lines, revisions](https://copyprogramming.com/howto/database-design-for-invoices-invoice-lines-revisions) - Developer Q&A
- [Supabase Best Practices | Security, Scaling & Maintainability](https://www.leanware.co/insights/supabase-best-practices) - Leanware insights
- [Setting Up Row-Level Security in Supabase User and Admin Roles](https://dev.to/shahidkhans/setting-up-row-level-security-in-supabase-user-and-admin-2ac1) - DEV Community

### Tertiary (LOW confidence)
- Supabase GitHub Discussions on atomic operations and transactions - Community discussions, helpful patterns but not official guidance
- Medium articles on Stripe + Next.js integration - Individual developer experiences, useful examples but verify with official docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Stripe SDK and Supabase are clearly established for this use case, Next.js already in project
- Architecture: HIGH - Schema patterns verified with official Stripe invoice schema and database design best practices
- Webhook handling: HIGH - Official Stripe documentation and multiple verified Next.js integration guides confirm patterns
- Pitfalls: MEDIUM - Based on common issues documented in GitHub discussions and developer blogs, some anecdotal
- Open questions: LOW-MEDIUM - Fee pass-through needs business/legal validation, proration logic needs clarification with user

**Research date:** 2026-01-20
**Valid until:** ~60 days (Stripe API stable, Next.js App Router patterns established, PostgreSQL fundamentals unchanged)

**Notes for planner:**
- Project already has Supabase migrations pattern established (001-004 exist), follow same structure
- Project uses App Router (Next.js 16.1.3), use `req.text()` pattern not Pages Router config
- Existing migration has `update_updated_at_column()` function, can reuse for new tables
- RLS pattern already established in 001_sponsors.sql, follow same approach for new tables
- Phase 4 is foundation only - no UI tasks, focus on schema + Stripe initialization + webhook endpoint skeleton
