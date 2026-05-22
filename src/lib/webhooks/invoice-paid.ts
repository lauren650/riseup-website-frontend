/**
 * Handles Stripe invoice.paid webhook: updates DB, creates Drive folder,
 * sends upload instructions + receipt emails.
 */

import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { getOrCreatePackageFolder, createSponsorFolder } from "@/lib/google-drive";
import {
  findRowByInvoiceId,
  updateSponsorRow,
  appendSponsorRow,
} from "@/lib/google-sheets";
import { Resend } from "resend";
import { sendWithRetry, delayBetweenEmails } from "@/lib/resend";
import { getSiteBaseUrl } from "@/lib/site-config";
import { getResolvedTemplate } from "@/lib/actions/email-templates";

const resend =
  process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const fromEmail =
  process.env.RESEND_FROM_EMAIL || "RiseUp Youth Football <noreply@riseupfootball.org>";

export async function handleInvoicePaid(
  invoice: Stripe.Invoice,
  supabase: SupabaseClient<Database>
) {
  const stripeInvoiceId = invoice.id;
  const customerEmail =
    (typeof invoice.customer_email === "string" ? invoice.customer_email : null) ??
    (invoice.customer as Stripe.Customer | null)?.email;
  const amountPaidCents = invoice.amount_paid ?? 0;

  if (!customerEmail) {
    throw new Error(`Invoice ${stripeInvoiceId} has no customer email`);
  }

  // 1. Find our invoice record
  const { data: dbInvoice, error: fetchErr } = await supabase
    .from("invoices")
    .select("id, customer_name, customer_email, package_id, package_name, package_cost")
    .eq("stripe_invoice_id", stripeInvoiceId)
    .single();

  if (fetchErr || !dbInvoice) {
    throw new Error(
      `Invoice ${stripeInvoiceId} not found in database: ${fetchErr?.message ?? "no row"}`
    );
  }

  const companyName = dbInvoice.customer_name ?? "Partner";
  const packageName = dbInvoice.package_name ?? "Sponsorship Package";

  // 2. Update invoice status
  const paidAt = invoice.status_transitions?.paid_at
    ? new Date(invoice.status_transitions.paid_at * 1000).toISOString()
    : new Date().toISOString();

  const { error: updateErr } = await supabase
    .from("invoices")
    .update({ status: "paid", paid_at: paidAt })
    .eq("id", dbInvoice.id);

  if (updateErr) {
    throw new Error(`Failed to update invoice status: ${updateErr.message}`);
  }

  // 3. Create Drive folder and sponsor_uploads
  let driveFolderId: string;
  try {
    const packageFolderId = await getOrCreatePackageFolder(packageName);
    driveFolderId = await createSponsorFolder(
      companyName,
      stripeInvoiceId,
      packageFolderId
    );
  } catch (err) {
    console.error("[invoice.paid] Drive folder creation failed:", err);
    throw err;
  }

  const uploadToken = crypto.randomUUID();
  const tokenExpiresAt = new Date();
  tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 90);

  const { error: insertErr } = await supabase.from("sponsor_uploads").insert({
    invoice_id: dbInvoice.id,
    upload_token: uploadToken,
    company_name: companyName,
    package_id: dbInvoice.package_id!,
    drive_folder_id: driveFolderId,
    status: "pending",
    token_expires_at: tokenExpiresAt.toISOString(),
  });

  if (insertErr) {
    throw new Error(`Failed to create sponsor_upload: ${insertErr.message}`);
  }

  // 4. Update Google Sheets (row was appended when invoice was created)
  const rowIndex = await findRowByInvoiceId(stripeInvoiceId);
  if (rowIndex != null) {
    try {
      await updateSponsorRow(rowIndex, {
        paymentDate: paidAt.split("T")[0],
        uploadStatus: "Paid - Pending Upload",
        driveFolderUrl: `https://drive.google.com/drive/folders/${driveFolderId}`,
      });
    } catch (sheetsErr) {
      console.error("[invoice.paid] Google Sheets update failed:", sheetsErr);
      // Non-fatal
    }
  } else {
    // Row may not exist if created before Sheets integration; append if possible
    try {
      await appendSponsorRow({
        companyName,
        packageName,
        invoiceId: stripeInvoiceId,
        amount: amountPaidCents,
        paymentDate: paidAt.split("T")[0],
        uploadStatus: "Paid - Pending Upload",
        driveFolderUrl: `https://drive.google.com/drive/folders/${driveFolderId}`,
        createdDate: paidAt,
      });
    } catch (sheetsErr) {
      console.error("[invoice.paid] Google Sheets append failed:", sheetsErr);
    }
  }

  // 5. Decrement package slots
  if (dbInvoice.package_id) {
    const { error: rpcErr } = await supabase.rpc("decrement_package_slots", {
      package_uuid: dbInvoice.package_id,
    });
    if (rpcErr) {
      console.error("[invoice.paid] decrement_package_slots failed:", rpcErr);
      // Non-fatal; slot may already be 0 or function may not exist in older DBs
    }
  }

  // 6. Send both emails
  const baseUrl = getSiteBaseUrl();
  const uploadUrl = `${baseUrl}/upload/${uploadToken}`;
  const amountFormatted = `$${(amountPaidCents / 100).toFixed(2)}`;

  if (!resend) {
    console.warn("[invoice.paid] RESEND_API_KEY not set; skipping emails");
    return;
  }

  // Email 1: Upload instructions
  try {
    const uploadTmpl = await getResolvedTemplate("upload_instructions", {
      companyName,
      uploadUrl,
    });
    const { error: email1Err } = await sendWithRetry(resend, {
      from: fromEmail,
      to: customerEmail,
      subject: uploadTmpl.subject,
      html: uploadTmpl.html,
    });
    if (email1Err) {
      console.error("[invoice.paid] Upload instructions email failed:", email1Err);
    }
    await delayBetweenEmails();
  } catch (err) {
    console.error("[invoice.paid] Upload instructions email error:", err);
  }

  // Email 2: Receipt for goods/services
  try {
    const receiptTmpl = await getResolvedTemplate("receipt", {
      companyName,
      packageName,
      amountFormatted,
      paidAtDate: paidAt.split("T")[0],
      stripeInvoiceId,
    });
    const { error: email2Err } = await sendWithRetry(resend, {
      from: fromEmail,
      to: customerEmail,
      subject: receiptTmpl.subject,
      html: receiptTmpl.html,
    });
    if (email2Err) {
      console.error("[invoice.paid] Receipt email failed:", email2Err);
    }
  } catch (err) {
    console.error("[invoice.paid] Receipt email error:", err);
  }
}
