"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { uploadFileToDrive, getDriveFileUrl } from "@/lib/google-drive";
import { findRowByInvoiceId, updateSponsorRow } from "@/lib/google-sheets";

const MAX_LOGO_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export type SponsorUploadByToken = {
  company_name: string;
  package_name: string;
  status: string;
  token_expires_at: string;
};

/**
 * Fetches sponsor_upload by token for the public upload page.
 * Returns null if not found, expired, or already completed.
 */
export async function getUploadByToken(
  token: string
): Promise<{ upload: SponsorUploadByToken; packageName: string } | null> {
  const supabase = await createClient();

  const { data: raw, error } = await supabase
    .from("sponsor_uploads")
    .select("company_name, status, token_expires_at, package_id")
    .eq("upload_token", token)
    .single();

  const data = raw as { company_name: string; status: string; token_expires_at: string; package_id: string } | null;
  if (error || !data) return null;
  if (data.status !== "pending") return null;
  if (new Date(data.token_expires_at) <= new Date()) return null;

  const { data: pkg } = await supabase
    .from("sponsorship_packages")
    .select("name")
    .eq("id", data.package_id)
    .single();

  return {
    upload: {
      company_name: data.company_name,
      package_name: pkg?.name ?? "Partnership",
      status: data.status,
      token_expires_at: data.token_expires_at,
    },
    packageName: pkg?.name ?? "Partnership",
  };
}

/**
 * Submits logo and website URL for a sponsor upload.
 * Token must be valid, pending, and not expired.
 */
export async function submitUpload(
  token: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { data: rawRow, error: fetchError } = await supabase
    .from("sponsor_uploads")
    .select("id, company_name, drive_folder_id, invoice_id")
    .eq("upload_token", token)
    .single();

  const row = rawRow as { id: string; company_name: string; drive_folder_id: string; invoice_id: string } | null;
  if (fetchError || !row) {
    return { success: false, error: "Invalid or expired link." };
  }

  const websiteUrl = (formData.get("websiteUrl") as string)?.trim() ?? "";
  const file = formData.get("logo") as File | null;

  if (!file || file.size === 0) {
    return { success: false, error: "Please upload a logo file." };
  }

  if (file.size > MAX_LOGO_SIZE_BYTES) {
    return { success: false, error: "Logo must be 5MB or smaller." };
  }

  const type = file.type?.toLowerCase();
  if (!type || !ALLOWED_TYPES.includes(type)) {
    return { success: false, error: "Logo must be JPEG, PNG, GIF, or WebP." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = type.split("/")[1] || "png";
  const fileName = `logo-${Date.now()}.${ext}`;

  let driveFileId: string;
  try {
    driveFileId = await uploadFileToDrive(
      fileName,
      buffer,
      type,
      row.drive_folder_id
    );
  } catch (err) {
    console.error("submitUpload: Drive upload failed", err);
    return { success: false, error: "Failed to upload logo. Please try again." };
  }

  const logoUrl = getDriveFileUrl(driveFileId);
  const now = new Date().toISOString();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateError } = await (supabase as any)
    .from("sponsor_uploads")
    .update({
      logo_url: logoUrl,
      drive_file_id: driveFileId,
      website_url: websiteUrl || null,
      status: "completed",
      uploaded_at: now,
    })
    .eq("upload_token", token);

  if (updateError) {
    console.error("submitUpload: update failed", updateError);
    return { success: false, error: "Failed to save. Please try again." };
  }

  const serviceSupabase = createServiceRoleClient();
  const { data: inv } = await serviceSupabase
    .from("invoices")
    .select("stripe_invoice_id")
    .eq("id", row.invoice_id)
    .single();

  if (inv?.stripe_invoice_id) {
    const rowIndex = await findRowByInvoiceId(inv.stripe_invoice_id);
    if (rowIndex != null) {
      try {
        await updateSponsorRow(rowIndex, {
          uploadStatus: "Completed",
          websiteUrl: websiteUrl || undefined,
          driveFolderUrl: undefined,
        });
      } catch {
        // non-fatal
      }
    }
  }

  return { success: true };
}
