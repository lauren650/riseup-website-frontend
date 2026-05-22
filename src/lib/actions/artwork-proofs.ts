"use server";

import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { getResolvedTemplate } from "@/lib/actions/email-templates";
import { sendWithRetry, delayBetweenEmails } from "@/lib/resend";
import { getSiteBaseUrl } from "@/lib/site-config";
import { revalidatePath } from "next/cache";

const resend =
  process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const fromEmail =
  process.env.RESEND_FROM_EMAIL ||
  "RiseUp Youth Football <noreply@riseupfootball.org>";

export type TShirtPartner = {
  id: string;
  company_name: string;
  customer_email: string;
  customer_name: string;
};

export type ArtworkProofWithApprovals = {
  id: string;
  name: string;
  image_url: string;
  approval_due_at: string;
  created_at: string;
  approvals: {
    id: string;
    company_name: string;
    status: string;
    responded_at: string | null;
  }[];
};

/**
 * Fetches partners with t-shirt benefit (completed sponsor_uploads, package includes_tshirt).
 */
export async function getTShirtPartners(): Promise<{
  partners: TShirtPartner[];
  error?: string;
}> {
  const supabase = await createClient();
  const { data: raw, error } = await supabase
    .from("sponsor_uploads")
    .select(
      `
      id,
      company_name,
      invoice_id,
      invoices(customer_email, customer_name),
      sponsorship_packages(includes_tshirt)
    `
    )
    .eq("status", "completed");

  if (error) {
    console.error("[artwork-proofs] getTShirtPartners error:", error);
    return { partners: [], error: error.message };
  }

  const rows = (raw ?? []) as Array<{
    id: string;
    company_name: string;
    invoice_id: string;
    invoices: { customer_email: string; customer_name: string } | null;
    sponsorship_packages: { includes_tshirt: boolean } | null;
  }>;

  const partners: TShirtPartner[] = rows
    .filter((r) => r.sponsorship_packages?.includes_tshirt === true)
    .map((r) => ({
      id: r.id,
      company_name: r.company_name,
      customer_email: r.invoices?.customer_email ?? "",
      customer_name: r.invoices?.customer_name ?? r.company_name,
    }))
    .filter((p) => p.customer_email);

  return { partners };
}

/**
 * Creates an artwork proof and sends approval links to selected partners.
 */
export async function createArtworkProof(input: {
  name: string;
  imageUrl: string;
  approvalDueAt: string;
  sponsorUploadIds: string[];
}): Promise<{ success: boolean; error?: string; proofId?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "You must be signed in to create a proof." };
  }

  const { name, imageUrl, approvalDueAt, sponsorUploadIds } = input;
  if (!name?.trim() || !imageUrl?.trim() || !approvalDueAt || !sponsorUploadIds?.length) {
    return {
      success: false,
      error: "Name, image URL, approval deadline, and at least one recipient are required.",
    };
  }

  const dueDate = new Date(approvalDueAt);
  if (isNaN(dueDate.getTime())) {
    return { success: false, error: "Invalid approval deadline." };
  }

  // 1. Insert artwork_proofs
  const { data: proof, error: proofErr } = await supabase
    .from("artwork_proofs")
    .insert({
      name: name.trim(),
      image_url: imageUrl.trim(),
      approval_due_at: dueDate.toISOString(),
      created_by: user.id,
    })
    .select("id")
    .single();

  if (proofErr || !proof) {
    console.error("[artwork-proofs] create proof error:", proofErr);
    return { success: false, error: proofErr?.message ?? "Failed to create proof." };
  }

  // 2. Get partner details for each sponsor_upload_id
  const { data: uploads } = await supabase
    .from("sponsor_uploads")
    .select("id, company_name, invoice_id, invoices(customer_email, customer_name)")
    .in("id", sponsorUploadIds)
    .eq("status", "completed");

  const uploadRows = (uploads ?? []) as Array<{
    id: string;
    company_name: string;
    invoice_id: string;
    invoices: { customer_email: string; customer_name: string } | null;
  }>;

  // 3. Create artwork_proof_approvals and send emails
  const baseUrl = getSiteBaseUrl();

  for (const u of uploadRows) {
    const token = crypto.randomUUID();
    const customerEmail = u.invoices?.customer_email;
    if (!customerEmail) continue;

    const { error: approvalErr } = await supabase
      .from("artwork_proof_approvals")
      .insert({
        artwork_proof_id: proof.id,
        sponsor_upload_id: u.id,
        approval_token: token,
        approval_due_at: dueDate.toISOString(),
      });

    if (approvalErr) {
      console.error("[artwork-proofs] insert approval error:", approvalErr);
      continue;
    }

    const approvalUrl = `${baseUrl}/approve-artwork/${token}`;
    const companyName = u.invoices?.customer_name ?? u.company_name ?? "Partner";

    if (resend) {
      try {
        const artworkTmpl = await getResolvedTemplate("artwork_approval_request", {
          companyName,
          approvalUrl,
        });
        const { error: emailErr } = await sendWithRetry(resend, {
          from: fromEmail,
          to: customerEmail,
          subject: artworkTmpl.subject,
          html: artworkTmpl.html,
        });
        if (emailErr) {
          console.error("[artwork-proofs] email failed:", emailErr);
        }
        await delayBetweenEmails();
      } catch (err) {
        console.error("[artwork-proofs] email error:", err);
      }
    }
  }

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/dashboard/partners");
  return { success: true, proofId: proof.id };
}

/**
 * Fetches all artwork proofs with approval counts for the dashboard.
 */
export async function getArtworkProofsForDashboard(): Promise<{
  proofs: ArtworkProofWithApprovals[];
  error?: string;
}> {
  const supabase = await createClient();
  const { data: proofs, error: proofsErr } = await supabase
    .from("artwork_proofs")
    .select("id, name, image_url, approval_due_at, created_at")
    .order("created_at", { ascending: false });

  if (proofsErr) {
    console.error("[artwork-proofs] getArtworkProofs error:", proofsErr);
    return { proofs: [], error: proofsErr.message };
  }

  const result: ArtworkProofWithApprovals[] = [];

  for (const p of proofs ?? []) {
    const { data: approvals } = await supabase
      .from("artwork_proof_approvals")
      .select(
        `
        id,
        status,
        responded_at,
        sponsor_uploads(company_name)
      `
      )
      .eq("artwork_proof_id", p.id);

    const approvalRows = (approvals ?? []) as Array<{
      id: string;
      status: string;
      responded_at: string | null;
      sponsor_uploads: { company_name: string } | null;
    }>;

    result.push({
      id: p.id,
      name: p.name,
      image_url: p.image_url,
      approval_due_at: p.approval_due_at,
      created_at: p.created_at,
      approvals: approvalRows.map((a) => ({
        id: a.id,
        company_name: a.sponsor_uploads?.company_name ?? "",
        status: a.status,
        responded_at: a.responded_at,
      })),
    });
  }

  return { proofs: result };
}

/**
 * Fetches approval by token for the public approval page.
 */
export async function getApprovalByToken(token: string): Promise<{
  proof: { id: string; name: string; image_url: string };
  approval: {
    id: string;
    status: string;
    approval_due_at: string;
  };
} | null> {
  const supabase = await createClient();
  const { data: approval, error } = await supabase
    .from("artwork_proof_approvals")
    .select(
      `
      id,
      status,
      approval_due_at,
      artwork_proofs(id, name, image_url)
    `
    )
    .eq("approval_token", token)
    .single();

  if (error || !approval) return null;

  const proof = (approval as { artwork_proofs: { id: string; name: string; image_url: string } | null })
    ?.artwork_proofs;
  if (!proof) return null;

  return {
    proof: { id: proof.id, name: proof.name, image_url: proof.image_url },
    approval: {
      id: (approval as { id: string }).id,
      status: (approval as { status: string }).status,
      approval_due_at: (approval as { approval_due_at: string }).approval_due_at,
    },
  };
}

/**
 * Records approval or changes_requested. Public action (no auth).
 */
export async function submitArtworkApproval(
  token: string,
  status: "approved" | "changes_requested"
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("artwork_proof_approvals")
    .update({
      status,
      responded_at: now,
    })
    .eq("approval_token", token)
    .eq("status", "pending")
    .gt("approval_due_at", now)
    .select("id")
    .single();

  if (error || !data) {
    return {
      success: false,
      error:
        error?.message ??
        "Invalid link, already responded, or past the approval deadline.",
    };
  }

  return { success: true };
}
