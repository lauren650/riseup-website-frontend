"use server";

import { Resend } from "resend";
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
      await resend.emails.send({
        from: "RiseUp Website <onboarding@resend.dev>",
        to: data.contactEmail,
        subject: "Sponsor Submission Received - RiseUp Youth Football",
        html: `
          <h2>Thank you for your sponsorship submission!</h2>
          <p>Hi ${data.contactName},</p>
          <p>We've received your submission for <strong>${data.companyName}</strong>.</p>
          <p>Our team will review your submission and you'll see your logo on our Partners page shortly.</p>
          <br>
          <p>Best regards,<br>RiseUp Youth Football</p>
        `,
      });
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
        process.env.ADMIN_EMAIL || process.env.CONTACT_EMAIL || "info@riseupyouthfootball.com";

      await resend.emails.send({
        from: "RiseUp Website <onboarding@resend.dev>",
        to: adminEmail,
        subject: `New Sponsor Submission: ${data.companyName}`,
        html: `
          <h2>New Sponsor Submission</h2>
          <p><strong>Company:</strong> ${data.companyName}</p>
          <p><strong>Contact:</strong> ${data.contactName}</p>
          <p><strong>Email:</strong> <a href="mailto:${data.contactEmail}">${data.contactEmail}</a></p>
          <p><strong>Phone:</strong> ${data.contactPhone}</p>
          <p><strong>Website:</strong> <a href="${data.websiteUrl}">${data.websiteUrl}</a></p>
          ${data.description ? `<p><strong>Description:</strong> ${data.description}</p>` : ""}
          <p><strong>Logo:</strong> <a href="${logoUrl}">View Logo</a></p>
          <br>
          <p><em>Review and approve this sponsor in the admin dashboard.</em></p>
        `,
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
