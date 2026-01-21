import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { createClient } from "@/lib/supabase/server";
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

  // 3. Check idempotency - prevent duplicate processing
  const supabase = await createClient();
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
  // TODO (Phase 7): Implement full event handling
  switch (event.type) {
    case "invoice.finalized":
      // TODO: Update invoice status to 'open' in database
      console.log(`Invoice finalized: ${(event.data.object as Stripe.Invoice).id}`);
      break;

    case "invoice.paid":
      // TODO: Update invoice status to 'paid' in database
      // TODO: Call decrement_package_slots() for the associated package
      console.log(`Invoice paid: ${(event.data.object as Stripe.Invoice).id}`);
      break;

    case "invoice.voided":
      // TODO: Update invoice status to 'void' in database
      console.log(`Invoice voided: ${(event.data.object as Stripe.Invoice).id}`);
      break;

    default:
      // Log unhandled events but don't fail
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
    // Don't fail the webhook - Stripe will retry and hit idempotency check
  }

  // 6. Return success
  return NextResponse.json({ received: true });
}
