"use server";

import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/client";
import { appendSponsorRow } from "@/lib/google-sheets";
import { revalidatePath } from "next/cache";

export type CreateInvoiceInput = {
  packageId: string;
  amountDollars: number;
  customerName: string;
  customerEmail: string;
  note?: string | null;
};

export type InvoiceWithPackage = {
  id: string;
  stripe_invoice_id: string;
  package_id: string | null;
  package_name: string;
  package_cost: number;
  customer_email: string;
  customer_name: string;
  status: string;
  created_at: string;
  finalized_at: string | null;
  paid_at: string | null;
  voided_at: string | null;
  sponsorship_packages?: { name: string } | null;
};

/**
 * Fetches sponsorship packages for the invoice create form.
 */
export async function getSponsorshipPackages() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sponsorship_packages")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    console.error("Failed to fetch packages:", error);
    return { packages: [], error: error.message };
  }
  return { packages: data ?? [], error: null };
}

/**
 * Creates a Stripe invoice, stores it in the DB, and appends a row to Google Sheets.
 * Sends the invoice email to the customer via Stripe.
 */
export async function createInvoice(
  input: CreateInvoiceInput
): Promise<{ success: boolean; error?: string; invoiceId?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "You must be signed in to create an invoice." };
  }

  const { packageId, amountDollars, customerName, customerEmail, note } = input;
  if (!packageId?.trim() || !customerName?.trim() || !customerEmail?.trim()) {
    return { success: false, error: "Package, company name, and email are required." };
  }
  if (typeof amountDollars !== "number" || amountDollars < 0.01) {
    return { success: false, error: "Invoice amount must be at least $0.01." };
  }

  const { data: pkg, error: pkgError } = await supabase
    .from("sponsorship_packages")
    .select("id, name")
    .eq("id", packageId)
    .single();

  if (pkgError || !pkg) {
    return { success: false, error: "Invalid package selected." };
  }

  const packageName = pkg.name;
  const amountCents = Math.round(amountDollars * 100);

  try {
    console.log("[createInvoice] Creating Stripe customer...", { email: customerEmail.trim() });
    const customer = await stripe.customers.create({
      email: customerEmail.trim(),
      name: customerName.trim(),
    });
    console.log("[createInvoice] Customer created:", customer.id);

    console.log("[createInvoice] Creating draft invoice...");
    const invoice = await stripe.invoices.create({
      customer: customer.id,
      collection_method: "send_invoice",
      days_until_due: 30,
      auto_advance: true,
    });
    console.log("[createInvoice] Draft invoice created:", invoice.id);

    console.log("[createInvoice] Adding invoice item...", { amountCents, packageName });
    await stripe.invoiceItems.create({
      customer: customer.id,
      invoice: invoice.id,
      amount: amountCents,
      currency: "usd",
      description: `${packageName} – RiseUp Youth Football`,
    });

    console.log("[createInvoice] Finalizing invoice...");
    const finalized = await stripe.invoices.finalizeInvoice(invoice.id);
    console.log("[createInvoice] Sending invoice email...");
    await stripe.invoices.sendInvoice(finalized.id);
    console.log("[createInvoice] Invoice sent successfully. Stripe ID:", finalized.id);

    const { data: inserted, error: insertError } = await supabase
      .from("invoices")
      .insert({
        stripe_invoice_id: finalized.id,
        package_id: pkg.id,
        package_name: packageName,
        package_cost: Math.round(amountDollars),
        customer_email: customerEmail.trim(),
        customer_name: customerName.trim(),
        status: "open",
        created_by: user.id,
        note: note?.trim() || null,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Failed to insert invoice:", insertError);
      return { success: false, error: "Invoice was sent but could not be saved locally. Check Stripe dashboard." };
    }

    try {
      await appendSponsorRow({
        companyName: customerName.trim(),
        packageName,
        invoiceId: finalized.id,
        amount: amountCents,
        uploadStatus: "Pending",
        createdDate: new Date().toISOString(),
      });
    } catch (sheetsErr) {
      console.error("Failed to append to Google Sheets:", sheetsErr);
      // Don't fail the whole flow; invoice is created
    }

    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/dashboard/invoices");
    revalidatePath("/admin/dashboard/partners");
    return { success: true, invoiceId: inserted.id };
  } catch (err) {
    const stripeErr = err as { type?: string; code?: string; message?: string };
    const message = err instanceof Error ? err.message : "Failed to create invoice.";
    const detail = stripeErr?.message ?? message;
    console.error("[createInvoice] Stripe/error:", {
      type: stripeErr?.type,
      code: stripeErr?.code,
      message: detail,
      full: err,
    });
    return {
      success: false,
      error: detail.includes("No such")
        ? "Stripe API error. Check STRIPE_SECRET_KEY and that you're in the correct Stripe mode (test vs live)."
        : detail,
    };
  }
}

/**
 * Voids an invoice in Stripe and updates local status.
 */
export async function voidInvoice(
  invoiceId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "You must be signed in to void an invoice." };
  }

  const { data: row, error: fetchError } = await supabase
    .from("invoices")
    .select("id, stripe_invoice_id, status")
    .eq("id", invoiceId)
    .single();

  if (fetchError || !row) {
    return { success: false, error: "Invoice not found." };
  }

  if (row.status === "paid") {
    return { success: false, error: "Cannot void an invoice that has already been paid." };
  }

  if (row.status === "void") {
    return { success: true };
  }

  try {
    await stripe.invoices.voidInvoice(row.stripe_invoice_id);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to void invoice in Stripe.";
    console.error("voidInvoice Stripe error:", err);
    return { success: false, error: message };
  }

  const { error: updateError } = await supabase
    .from("invoices")
    .update({ status: "void", voided_at: new Date().toISOString() })
    .eq("id", invoiceId);

  if (updateError) {
    console.error("Failed to update invoice status:", updateError);
    return { success: false, error: "Invoice voided in Stripe but status could not be updated locally." };
  }

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/dashboard/invoices");
  return { success: true };
}
