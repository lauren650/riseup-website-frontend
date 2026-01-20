# Stack Research: Stripe Invoicing

**Project:** RiseUp Youth Football League - Sponsorship Invoicing
**Researched:** 2026-01-20
**Confidence:** HIGH

## Executive Summary

Adding Stripe invoicing to existing Next.js 16 application requires **only the official Stripe Node.js SDK** (`stripe` package v20.2.0). No additional packages needed. Next.js 16 App Router provides native support for webhook handling via `request.text()` without requiring legacy `micro` package. Integration with existing Resend setup is straightforward - webhook triggers email via existing pattern.

## Recommended Stack Additions

### Core Payment Integration

| Package | Version | Purpose | Why |
|---------|---------|---------|-----|
| `stripe` | `^20.2.0` | Stripe API client, webhook verification | Official Stripe Node.js SDK. Latest stable release (Jan 16, 2025). Handles invoice creation, customer management, and webhook signature verification. |

**Installation:**
```bash
npm install stripe
```

**No additional packages required.** The `micro` package formerly used for raw body parsing in Pages Router is NOT needed in Next.js 16 App Router.

### No Additional Dependencies Needed

| Legacy Approach | Modern Approach (Next.js 16) |
|----------------|------------------------------|
| `micro` package for `buffer()` | Native `request.text()` in App Router |
| `bodyParser: false` config | Not needed - handled in route handler |
| Custom raw body middleware | Built into Web Request API |

## Integration Points with Existing Stack

### 1. Invoice Creation (Admin Panel)

**Existing Stack Integration:**
- **Supabase:** Store invoice metadata (invoice_id, customer_id, sponsor_tier, status)
- **TypeScript + Zod:** Validate invoice creation form data
- **Next.js Server Actions:** Create invoices via `"use server"` actions (matches existing `src/lib/actions/contact.ts` pattern)

**New Pattern:**
```typescript
// src/lib/stripe.ts - Stripe client initialization
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia", // Use latest API version
  typescript: true,
});
```

```typescript
// src/lib/actions/invoices.ts - Server action
"use server";

import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function createSponsorInvoice(formData: FormData) {
  // 1. Create/lookup Stripe customer
  const customer = await stripe.customers.create({
    email: formData.get("email") as string,
    name: formData.get("name") as string,
  });

  // 2. Create invoice with send_invoice collection method
  const invoice = await stripe.invoices.create({
    customer: customer.id,
    collection_method: "send_invoice",
    days_until_due: 30,
    metadata: {
      sponsor_tier: formData.get("tier") as string,
    },
  });

  // 3. Add line item
  await stripe.invoiceItems.create({
    customer: customer.id,
    invoice: invoice.id,
    price: formData.get("price_id") as string, // Pre-created in Stripe Dashboard
  });

  // 4. Send invoice
  const sentInvoice = await stripe.invoices.sendInvoice(invoice.id);

  // 5. Store in Supabase
  const supabase = await createClient();
  await supabase.from("sponsor_invoices").insert({
    stripe_invoice_id: invoice.id,
    stripe_customer_id: customer.id,
    tier: formData.get("tier") as string,
    status: "sent",
  });

  return { success: true, invoiceUrl: sentInvoice.hosted_invoice_url };
}
```

### 2. Webhook Handling (Payment Detection)

**Existing Stack Integration:**
- **Next.js 16 Route Handlers:** `app/api/webhooks/stripe/route.ts`
- **Resend:** Trigger post-payment email using existing `Resend` client pattern
- **Supabase:** Update invoice status, create sponsor record

**New Pattern:**
```typescript
// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
  // 1. Get raw body for signature verification
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  // 2. Verify webhook signature
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // 3. Handle invoice.paid event
  if (event.type === "invoice.paid") {
    const invoice = event.data.object;
    const supabase = await createClient();

    // Update Supabase status
    await supabase
      .from("sponsor_invoices")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("stripe_invoice_id", invoice.id);

    // Send post-payment email with upload form link
    await resend.emails.send({
      from: "RiseUp Youth Football <onboarding@resend.dev>",
      to: invoice.customer_email!,
      subject: "Payment Received - Upload Your Logo",
      html: `
        <h2>Thank you for your sponsorship!</h2>
        <p>We've received your payment for ${invoice.metadata.sponsor_tier} sponsorship.</p>
        <p><a href="${process.env.NEXT_PUBLIC_URL}/sponsors/upload?invoice=${invoice.id}">
          Click here to upload your logo
        </a></p>
      `,
    });
  }

  return NextResponse.json({ received: true });
}
```

**Key Implementation Details:**
- Use `await req.text()` not `req.json()` - Stripe signature verification requires raw body
- Use `invoice.paid` event (not `invoice.payment_succeeded`) - captures both payment attempts AND out-of-band payments
- Return `200` response immediately - don't block webhook on email send

### 3. Email Integration (Resend)

**Existing Pattern (Reuse):**
The existing `Resend` client initialization pattern from `src/lib/actions/contact.ts` works perfectly:

```typescript
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;
```

**Post-Payment Email Trigger:**
Called from webhook handler (see above). Uses same HTML email pattern as contact form. Includes dynamic upload form URL with invoice ID parameter.

## Configuration Required

### Environment Variables

Add to `.env.local`:

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_...          # Test key: sk_test_*, Live: sk_live_*
STRIPE_PUBLISHABLE_KEY=pk_test_...     # For client-side (if needed later)
STRIPE_WEBHOOK_SECRET=whsec_...         # From Stripe Dashboard webhook config

# Existing (already configured)
RESEND_API_KEY=re_...
NEXT_PUBLIC_URL=http://localhost:3000   # For email links
```

### Stripe Dashboard Setup

**1. Create Products/Prices (One-time setup):**

Navigate to Products in Stripe Dashboard and create sponsorship tiers:

| Tier | Price | Stripe Price ID |
|------|-------|-----------------|
| Bronze Sponsor | $500 | `price_abc123` |
| Silver Sponsor | $1,000 | `price_def456` |
| Gold Sponsor | $2,500 | `price_ghi789` |

**2. Configure Webhook Endpoint:**

- **Local Development:** Use Stripe CLI
  ```bash
  stripe listen --forward-to localhost:3000/api/webhooks/stripe
  # Outputs webhook secret: whsec_...
  ```

- **Production:** Add endpoint in Stripe Dashboard
  - URL: `https://yourdomain.com/api/webhooks/stripe`
  - Events to send: `invoice.paid`
  - Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

**3. Email Settings (Optional):**

In Stripe Dashboard → Settings → Emails, customize invoice email template or disable (you're sending from admin panel).

### Supabase Schema Addition

```sql
-- Add to existing migrations
CREATE TABLE sponsor_invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_invoice_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  tier TEXT NOT NULL, -- 'bronze', 'silver', 'gold'
  status TEXT NOT NULL, -- 'sent', 'paid', 'void'
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sponsor_invoices_stripe_id ON sponsor_invoices(stripe_invoice_id);
```

## API Version Considerations

**Current Stripe API Version:** `2025-01-27.acacia` (latest as of Jan 2026)

**SDK Behavior:**
From Stripe SDK v12+, the Node.js SDK automatically uses the latest API version available at the time of SDK release. The `stripe` package v20.2.0 (released Jan 16, 2025) uses API version `2025-01-27.acacia`.

**Recommendation:**
Explicitly specify API version in client initialization for consistency across environments:

```typescript
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
  typescript: true,
});
```

## Alternatives Considered

| Technology | Recommended | Alternative | Why Not |
|-----------|-------------|-------------|---------|
| Payment Gateway | Stripe | PayPal, Square | Stripe has superior invoicing API, better docs, matches GiveButter (already uses Stripe backend) |
| Webhook Parsing | Native `req.text()` | `micro` package | `micro` is legacy Pages Router pattern. App Router has native support via Web Request API |
| Invoice Delivery | Stripe hosted invoice + email | Custom invoice UI | Stripe hosted invoices are PCI compliant, mobile responsive, support multiple payment methods without custom code |
| Payment Detection | Webhooks | Polling Stripe API | Webhooks are real-time, reduce API calls, industry standard |

## Development Workflow

### Local Testing (Stripe CLI)

```bash
# Install Stripe CLI (one-time)
brew install stripe/stripe-cli/stripe

# Login to Stripe account
stripe login

# Forward webhooks to local dev server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test webhook
stripe trigger invoice.paid
```

### Test Mode vs Live Mode

**Test Mode (Development):**
- Use `sk_test_*` keys
- Invoices sent with `[TEST MODE]` watermark
- No emails sent to customers (Resend still sends)
- Use Stripe test cards: `4242 4242 4242 4242`

**Live Mode (Production):**
- Use `sk_live_*` keys
- Real invoices, real charges
- Emails sent to actual customer emails
- Requires webhook endpoint to be publicly accessible

## Security Considerations

### Webhook Signature Verification (Critical)

**ALWAYS verify webhook signatures** using `stripe.webhooks.constructEvent()`. Without verification, attackers could trigger fake payment events.

```typescript
// BAD - No verification
const event = await req.json(); // Attacker can POST fake events

// GOOD - Verified signature
const event = stripe.webhooks.constructEvent(
  await req.text(),
  req.headers.get("stripe-signature")!,
  process.env.STRIPE_WEBHOOK_SECRET!
);
```

### API Key Management

- **Never commit** `.env.local` to git (already in `.gitignore`)
- **Use Vercel Environment Variables** for production secrets
- **Rotate keys** if accidentally exposed
- **Restrict API key permissions** in Stripe Dashboard (webhook endpoints only need read/write on invoices)

### Webhook Endpoint Protection

**Do NOT add authentication middleware** to webhook route. Stripe signs requests with secret, custom auth will break webhook delivery.

```typescript
// app/api/webhooks/stripe/route.ts
// NO: middleware.ts auth check
// YES: Stripe signature verification only
```

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| `400 Invalid signature` | Wrong webhook secret or using `req.json()` | Use `req.text()` and verify `STRIPE_WEBHOOK_SECRET` matches Stripe CLI output |
| `No webhooks received locally` | Stripe CLI not running | Run `stripe listen --forward-to localhost:3000/api/webhooks/stripe` |
| `Emails not sending` | Resend API key missing | Verify `RESEND_API_KEY` in `.env.local` |
| `Invoice not found in Stripe` | Using test key with live invoice ID | Match test/live mode keys |

## Migration Path (None Required)

This is a **greenfield feature addition** to existing v1.1 codebase. No migration of existing data. No breaking changes to existing functionality.

## Performance Considerations

**Invoice Creation:**
- Stripe API calls are async (~200-500ms per call)
- Use loading states in admin UI
- Consider rate limiting (Stripe limit: 100 req/sec in test mode)

**Webhook Processing:**
- Return `200` immediately (Stripe retries if timeout)
- Use background jobs for heavy processing (not needed for this use case)
- Stripe retries failed webhooks with exponential backoff (up to 3 days)

## Cost Analysis

**Stripe Pricing:**
- No monthly fee
- 2.9% + $0.30 per successful invoice payment (same as manual entry)
- Free invoice creation and sending
- Free webhook delivery

**Estimated monthly cost for 10 sponsors/month:**
- $500 average invoice × 10 = $5,000 revenue
- Stripe fees: $5,000 × 2.9% + ($0.30 × 10) = $148

**Note:** GiveButter also uses Stripe backend, so donors/sponsors already in Stripe ecosystem.

## Sources

**HIGH Confidence (Official Documentation):**
- [Stripe Node.js SDK v20.2.0 Release](https://github.com/stripe/stripe-node/releases) - Latest version (Jan 16, 2025)
- [Stripe Invoicing Integration Quickstart](https://docs.stripe.com/invoicing/integration/quickstart) - Invoice creation workflow
- [Stripe API Reference - Invoices](https://docs.stripe.com/api/invoices) - API endpoints and parameters
- [Next.js Stripe Webhook Example](https://github.com/vercel/next.js/blob/canary/examples/with-stripe-typescript/app/api/webhooks/route.ts) - Official Next.js implementation pattern
- [Stripe Event Types Reference](https://docs.stripe.com/api/events/types) - Webhook event documentation

**MEDIUM Confidence (Verified Community Sources):**
- [Stripe Webhooks Guide 2026](https://www.magicbell.com/blog/stripe-webhooks-guide) - Event comparison (`invoice.paid` vs `invoice.payment_succeeded`)
- [Next.js 15 Stripe Webhook Tutorial](https://medium.com/@gragson.john/stripe-checkout-and-webhook-in-a-next-js-15-2025-925d7529855e) - App Router `req.text()` pattern
- [Stripe Webhook Handling in Next.js App Router](https://dev.to/thekarlesi/how-to-handle-stripe-and-paystack-webhooks-in-nextjs-the-app-router-way-5bgi) - Raw body access methodology

## Next Steps for Implementation

1. **Install package:** `npm install stripe`
2. **Add environment variables:** Stripe keys to `.env.local`
3. **Create Stripe client:** `src/lib/stripe.ts`
4. **Set up products in Stripe Dashboard:** Bronze/Silver/Gold tiers
5. **Create invoice action:** `src/lib/actions/invoices.ts`
6. **Create webhook handler:** `app/api/webhooks/stripe/route.ts`
7. **Add Supabase migration:** `sponsor_invoices` table
8. **Test locally:** Stripe CLI webhook forwarding
9. **Deploy:** Add webhook endpoint in Stripe Dashboard for production
