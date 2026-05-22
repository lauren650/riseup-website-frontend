"use server";

import { Resend } from "resend";
import { revalidatePath } from "next/cache";
import { getResolvedTemplate } from "@/lib/actions/email-templates";
import { delayBetweenEmails, sendWithRetry } from "@/lib/resend";
import { createClient } from "@/lib/supabase/server";
import { sponsorSchema, SponsorFormData } from "@/lib/validations/sponsor";

export interface SponsorFormState {
  success: boolean;
  message: string;
  errors?: {
    companyName?: string[];
    contactName?: string[];
    contactEmail?: string[];
    contactPhone?: string[];
    websiteUrl?: string[];
    description?: string[];
    logoUrl?: string[];
  };
}

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function submitSponsor(
  prevState: SponsorFormState | null,
  formData: FormData
): Promise<SponsorFormState> {
  // Parse form data
  const rawData: SponsorFormData = {
    companyName: formData.get("companyName") as string,
    contactName: formData.get("contactName") as string,
    contactEmail: formData.get("contactEmail") as string,
    contactPhone: formData.get("contactPhone") as string,
    websiteUrl: formData.get("websiteUrl") as string,
    description: (formData.get("description") as string) || undefined,
  };

  // Get logo URL (already uploaded by client)
  const logoUrl = formData.get("logoUrl") as string;

  // Validate logo URL is present
  if (!logoUrl) {
    return {
      success: false,
      message: "Please upload your company logo",
      errors: {
        logoUrl: ["Logo is required"],
      },
    };
  }

  // Validate with Zod
  const validationResult = sponsorSchema.safeParse(rawData);

  if (!validationResult.success) {
    const errors = validationResult.error.flatten().fieldErrors;
    return {
      success: false,
      message: "Please fix the errors below",
      errors: {
        companyName: errors.companyName,
        contactName: errors.contactName,
        contactEmail: errors.contactEmail,
        contactPhone: errors.contactPhone,
        websiteUrl: errors.websiteUrl,
        description: errors.description,
      },
    };
  }

  const data = validationResult.data;

  // Insert into database
  try {
    const supabase = await createClient();

    const { error: dbError } = await supabase.from("sponsors").insert({
      company_name: data.companyName,
      contact_name: data.contactName,
      contact_email: data.contactEmail,
      contact_phone: data.contactPhone,
      website_url: data.websiteUrl,
      description: data.description || null,
      logo_url: logoUrl,
      status: "pending",
    });

    if (dbError) {
      console.error("Failed to insert sponsor:", dbError);
      return {
        success: false,
        message: "Failed to submit. Please try again.",
      };
    }
  } catch (error) {
    console.error("Database error:", error);
    return {
      success: false,
      message: "Failed to submit. Please try again.",
    };
  }

  // Send confirmation email to sponsor
  try {
    if (!resend) {
      console.warn("Resend not configured, skipping confirmation email");
    } else {
      const fromEmail =
        process.env.RESEND_FROM_EMAIL || "RiseUp Website <noreply@riseupfootball.org>";
      const conf = await getResolvedTemplate("sponsor_confirmation", {
        contactName: data.contactName,
        companyName: data.companyName,
      });
      await sendWithRetry(resend, {
        from: fromEmail,
        to: data.contactEmail,
        subject: conf.subject,
        html: conf.html,
      });
      await delayBetweenEmails();
    }
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
    // Don't fail the submission if email fails
  }

  // Send notification email to admin
  try {
    if (!resend) {
      console.warn("Resend not configured, skipping admin notification");
    } else {
      const adminEmail =
        process.env.ADMIN_EMAIL || process.env.CONTACT_EMAIL || "admin@riseupfootball.org";
      const fromEmail =
        process.env.RESEND_FROM_EMAIL || "RiseUp Website <noreply@riseupfootball.org>";
      const adminTmpl = await getResolvedTemplate("sponsor_admin_notification", {
        companyName: data.companyName,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        websiteUrl: data.websiteUrl,
        description: data.description,
        logoUrl,
      });
      await sendWithRetry(resend, {
        from: fromEmail,
        to: adminEmail,
        subject: adminTmpl.subject,
        html: adminTmpl.html,
        replyTo: data.contactEmail,
      });
    }
  } catch (error) {
    console.error("Failed to send admin notification:", error);
    // Don't fail the submission if email fails
  }

  return {
    success: true,
    message:
      "Thank you for your submission! We'll review your information and add your logo to our Partners page soon.",
  };
}

/**
 * Approve a sponsor submission - admin only action
 */
export async function approveSponsor(sponsorId: string): Promise<void> {
  const supabase = await createClient();

  // Verify the user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized: Admin authentication required");
  }

  // Update sponsor status to approved
  const { error } = await supabase
    .from("sponsors")
    .update({
      status: "approved" as const,
      approved_at: new Date().toISOString(),
      approved_by: user.id,
    })
    .eq("id", sponsorId);

  if (error) {
    console.error("Failed to approve sponsor:", error);
    throw new Error("Failed to approve sponsor");
  }

  // Revalidate the partners page so the new sponsor appears
  revalidatePath("/partners");

  // Also revalidate the admin sponsors page
  revalidatePath("/admin/dashboard/sponsors");
}
