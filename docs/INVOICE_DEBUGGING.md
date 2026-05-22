# Invoice debugging: logs and Stripe

If the app says "Invoice sent" but you don't see the invoice in Stripe, or you want to track down errors, use the following.

## 1. Where to see logs

- **Local dev:** Run `npm run dev` and watch the **terminal** where the dev server is running. All `console.log` and `console.error` from server code (including `createInvoice`) appear there. Look for lines starting with `[createInvoice]`.
- **Production (e.g. Vercel):** Use your host’s log viewer:
  - **Vercel:** Project → Logs (or Deployments → a deployment → "View Function Logs").
  - **Other hosts:** Check their docs for "server logs" or "function logs".

## 2. What we log when creating an invoice

When you click "Send invoice", the server logs each step:

- `[createInvoice] Creating Stripe customer...`
- `[createInvoice] Customer created: cus_xxx`
- `[createInvoice] Adding invoice item...`
- `[createInvoice] Creating draft invoice...`
- `[createInvoice] Draft invoice created: in_xxx`
- `[createInvoice] Finalizing invoice...`
- `[createInvoice] Sending invoice email...`
- `[createInvoice] Invoice sent successfully. Stripe ID: in_xxx`

If something fails, you’ll see `[createInvoice] Stripe/error:` with type, code, and message. The **same error message** is shown in the UI after "Send invoice".

## 3. View invoices in Stripe

- In the admin **Invoices** table (or Partner Dashboard), each row has a **"View in Stripe"** link. It opens that invoice in the Stripe dashboard (test or live, depending on your key).
- If no invoice row appears after clicking "Send invoice", Stripe never succeeded; check the UI error and the server logs (step 1).

## 4. Common issues

| Symptom | What to check |
|--------|----------------|
| "Invoice sent" but nothing in Stripe | Logs should show which step failed. If you see "Invoice sent successfully" but no row in our DB, the failure is when saving to the database (check Supabase). |
| Invalid API Key / authentication error | `.env.local`: `STRIPE_SECRET_KEY` must be correct for the Stripe mode you’re using (test vs live). Test keys start with `sk_test_`. |
| Invoices in Stripe but not in our list | Our app only shows invoices we saved (after Stripe success). If DB insert fails, we return an error; if it’s a transient failure, check Supabase and RLS. |
| Wrong Stripe mode | "View in Stripe" uses test or live dashboard based on `STRIPE_SECRET_KEY` (test key → test dashboard). Make sure you’re looking at the same mode in the Stripe dashboard. |

## 5. Checklist

- [ ] `STRIPE_SECRET_KEY` is set in `.env.local` (and in production env).
- [ ] You’re looking at the correct Stripe mode: **Test** vs **Live** (toggle in Stripe dashboard).
- [ ] Terminal (dev) or host logs (prod) show `[createInvoice]` lines when you send an invoice.
- [ ] If the UI shows an error after "Send invoice", read that message and the matching `[createInvoice] Stripe/error:` log line.
