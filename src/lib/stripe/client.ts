import Stripe from "stripe";

/**
 * Server-side Stripe client for invoice operations.
 * Use this in Server Actions, Route Handlers, and API routes.
 *
 * IMPORTANT: This client uses STRIPE_SECRET_KEY which must never be exposed to the browser.
 *
 * @example
 * import { stripe } from '@/lib/stripe/client';
 *
 * // Create an invoice
 * const invoice = await stripe.invoices.create({
 *   customer: customerId,
 *   collection_method: 'send_invoice',
 *   days_until_due: 0,
 * });
 */

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  // API version: Use the latest stable version from the installed SDK
  // https://stripe.com/docs/api/versioning
  apiVersion: "2025-12-15.clover",
  typescript: true,
});
