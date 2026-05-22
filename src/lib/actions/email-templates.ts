"use server";

import {
  createClient,
  createServiceRoleClient,
} from "@/lib/supabase/server";
import {
  uploadInstructions,
  receipt,
  sponsorConfirmation,
  sponsorAdminNotification,
  sponsorInterestConfirmation,
  sponsorInterestAdminNotification,
  contactFormToAdmin,
  artworkApprovalRequest,
  escapeHtml,
} from "@/lib/email-templates";

export type EmailTemplateRow = {
  id: string;
  template_key: string;
  name: string;
  subject: string;
  html_body: string;
  updated_at: string;
};

const ALL_TEMPLATE_KEYS = [
  "upload_instructions",
  "receipt",
  "sponsor_confirmation",
  "sponsor_admin_notification",
  "sponsor_interest_confirmation",
  "sponsor_interest_admin_notification",
  "contact_form_to_admin",
  "artwork_approval_request",
] as const;

/** Template keys that are editable in the admin UI (excludes admin notification templates for user-submitted content). */
const EDITABLE_TEMPLATE_KEYS = [
  "upload_instructions",
  "receipt",
  "sponsor_confirmation",
  "sponsor_interest_confirmation",
  "sponsor_interest_admin_notification",
  "artwork_approval_request",
] as const;

export type EmailTemplateKey = (typeof ALL_TEMPLATE_KEYS)[number];

/** Substitute {{variableName}} in template with values (HTML-escaped). Message gets newlines as <br>. */
function substitute(
  template: string,
  variables: Record<string, string | undefined>
): string {
  let out = template;
  for (const [key, value] of Object.entries(variables)) {
    let safe = value != null ? escapeHtml(String(value)) : "";
    if (key === "message") safe = safe.replace(/\n/g, "<br>");
    out = out.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), safe);
  }
  return out;
}

/** Fetch editable email templates from DB for admin UI (excludes contact form and sponsor submission admin notifications). */
export async function getEmailTemplates(): Promise<EmailTemplateRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("email_templates")
    .select("id, template_key, name, subject, html_body, updated_at")
    .in("template_key", [...EDITABLE_TEMPLATE_KEYS])
    .order("template_key");

  if (error) {
    console.error("getEmailTemplates:", error);
    return [];
  }
  return (data ?? []) as EmailTemplateRow[];
}

/** Update one email template. */
export async function updateEmailTemplate(
  templateKey: string,
  input: { subject: string; html_body: string }
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "You must be signed in to edit templates." };
  }
  if (!ALL_TEMPLATE_KEYS.includes(templateKey as EmailTemplateKey)) {
    return { success: false, error: "Invalid template key." };
  }

  const { error } = await supabase
    .from("email_templates")
    .update({
      subject: input.subject,
      html_body: input.html_body,
      updated_at: new Date().toISOString(),
    })
    .eq("template_key", templateKey);

  if (error) {
    console.error("updateEmailTemplate:", error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

/** Get resolved subject and html for a template: from DB if row exists, else from code defaults. Uses service role so it works from webhooks (no user session). */
export async function getResolvedTemplate(
  templateKey: EmailTemplateKey,
  variables: Record<string, string | undefined>
): Promise<{ subject: string; html: string }> {
  const supabase = createServiceRoleClient();
  const { data: row } = await supabase
    .from("email_templates")
    .select("subject, html_body")
    .eq("template_key", templateKey)
    .single();

  if (row?.subject != null && row?.html_body != null) {
    return {
      subject: substitute(row.subject, variables),
      html: substitute(row.html_body, variables),
    };
  }

  // Fallback to code defaults
  switch (templateKey) {
    case "upload_instructions":
      return uploadInstructions({
        companyName: variables.companyName ?? "",
        uploadUrl: variables.uploadUrl ?? "",
      });
    case "receipt":
      return receipt({
        companyName: variables.companyName ?? "",
        packageName: variables.packageName ?? "",
        amountFormatted: variables.amountFormatted ?? "",
        paidAtDate: variables.paidAtDate ?? "",
        stripeInvoiceId: variables.stripeInvoiceId ?? "",
      });
    case "sponsor_confirmation":
      return sponsorConfirmation({
        contactName: variables.contactName ?? "",
        companyName: variables.companyName ?? "",
      });
    case "sponsor_admin_notification":
      return sponsorAdminNotification({
        companyName: variables.companyName ?? "",
        contactName: variables.contactName ?? "",
        contactEmail: variables.contactEmail ?? "",
        contactPhone: variables.contactPhone ?? "",
        websiteUrl: variables.websiteUrl ?? "",
        description: variables.description,
        logoUrl: variables.logoUrl ?? "",
      });
    case "sponsor_interest_confirmation":
      return sponsorInterestConfirmation({
        name: variables.name ?? "",
        companyName: variables.companyName ?? "",
      });
    case "sponsor_interest_admin_notification":
      return sponsorInterestAdminNotification({
        companyName: variables.companyName ?? "",
        name: variables.name ?? "",
        email: variables.email ?? "",
        phone: variables.phone ?? "",
      });
    case "contact_form_to_admin":
      return contactFormToAdmin({
        name: variables.name ?? "",
        email: variables.email ?? "",
        subject: variables.subject ?? "",
        message: variables.message ?? "",
        phone: variables.phone,
      });
    case "artwork_approval_request":
      return artworkApprovalRequest({
        companyName: variables.companyName ?? "",
        approvalUrl: variables.approvalUrl ?? "",
      });
    default:
      return { subject: "", html: "" };
  }
}
