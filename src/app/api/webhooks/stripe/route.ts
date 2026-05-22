import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { handleInvoicePaid } from "@/lib/webhooks/invoice-paid";
import type Stripe from "stripe";

/**
 * Stripe webhook endpoint for invoice events.
 *
 * This endpoint:
 * 1. Verifies the webhook signature from Stripe
 * 2. Checks for duplicate events (idempotency)
 * 3. Routes events to appropriate handlers
 * 4. Records processed events in webhook_events table
 *
 * Webhook URL: https://your-domain.com/api/webhooks/stripe
 * Configure at: https://dashboard.stripe.com/webhooks
 *
 * Required events to subscribe:
 * - invoice.finalized
 * - invoice.paid
 * - invoice.voided
 */

export async function POST(req: Request) {
  // 1. Get raw body for signature verification
  // IMPORTANT: Must use req.text() not req.json() - Stripe needs raw body for signature
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    console.error("Webhook error: Missing stripe-signature header");
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  // 2. Verify signature
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error(`Webhook signature verification failed: ${errorMessage}`);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${errorMessage}` },
      { status: 400 }
    );
  }

  // 3. Check idempotency - prevent duplicate processing (service role required for webhook_events)
  const supabase = createServiceRoleClient();
  const { data: existingEvent } = await supabase
    .from("webhook_events")
    .select("id")
    .eq("stripe_event_id", event.id)
    .single();

  if (existingEvent) {
    // Event already processed, return success to acknowledge receipt
    console.log(`Webhook event ${event.id} already processed, skipping`);
    return NextResponse.json({ received: true, status: "already_processed" });
  }

  // 4. Handle known event types
  switch (event.type) {
    case "invoice.finalized":
      console.log(`Invoice finalized: ${(event.data.object as Stripe.Invoice).id}`);
      break;

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      try {
        await handleInvoicePaid(invoice, supabase);
      } catch (err) {
        console.error("[Webhook] invoice.paid handler failed:", err);
        // Return 500 so Stripe retries; we haven't recorded the event yet
        return NextResponse.json(
          { error: "Invoice paid handler failed" },
          { status: 500 }
        );
      }
      break;
    }

    case "invoice.voided": {
      const invoice = event.data.object as Stripe.Invoice;
      const { error: updateErr } = await supabase
        .from("invoices")
        .update({ status: "void", voided_at: new Date().toISOString() })
        .eq("stripe_invoice_id", invoice.id);
      if (updateErr) console.error("Failed to update voided invoice:", updateErr);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // 5. Record event in webhook_events table for idempotency
  const { error: insertError } = await supabase.from("webhook_events").insert({
    stripe_event_id: event.id,
    event_type: event.type,
    payload: event.data.object as unknown as Record<string, unknown>,
  });

  if (insertError) {
    console.error(`Failed to record webhook event: ${insertError.message}`);
  }

  return NextResponse.json({ received: true });
}
