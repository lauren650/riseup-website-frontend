"use server";

import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { delayBetweenEmails, sendWithRetry } from "@/lib/resend";
import {
  sponsorInterestSchema,
  SponsorInterestFormData,
} from "@/lib/validations/sponsor-interest";

export interface SponsorInterestFormState {
  success: boolean;
  message: string;
  errors?: {
    name?: string[];
    email?: string[];
    phone?: string[];
    companyName?: string[];
  };
}

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

async function verifyRecaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY?.trim();

  if (!secretKey) {
    return true; // Skip when not configured
  }

  if (!token || token.length < 20) {
    return true; // Invalid token - skip verification
  }

  try {
    const body = new URLSearchParams({
      secret: secretKey,
      response: token,
    }).toString();

    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      }
    );

    const data = (await response.json()) as {
      success?: boolean;
      score?: number;
    };
    return !!data.success && (data.score ?? 0) >= 0.5;
  } catch (error) {
    // Allow submission when verification fails (network/API errors) - don't block users
    console.warn("reCAPTCHA verification error (allowing submission):", error);
    return true;
  }
}

export async function submitSponsorInterest(
  prevState: SponsorInterestFormState | null,
  formData: FormData
): Promise<SponsorInterestFormState> {
  // Parse form data
  const rawData: SponsorInterestFormData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    companyName: formData.get("companyName") as string,
    recaptchaToken: (formData.get("recaptchaToken") as string) || undefined,
  };

  // Validate with Zod
  const validationResult = sponsorInterestSchema.safeParse(rawData);

  if (!validationResult.success) {
    const errors = validationResult.error.flatten().fieldErrors;
    return {
      success: false,
      message: "Please fix the errors below",
      errors: {
        name: errors.name,
        email: errors.email,
        phone: errors.phone,
        companyName: errors.companyName,
      },
    };
  }

  const data = validationResult.data;

  // Verify reCAPTCHA if token provided
  if (data.recaptchaToken) {
    const isValidRecaptcha = await verifyRecaptcha(data.recaptchaToken);
    if (!isValidRecaptcha) {
      return {
        success: false,
        message: "reCAPTCHA verification failed. Please try again.",
      };
    }
  }

  // Save to database
  try {
    const supabase = await createClient();
    const { error: dbError } = await supabase.from("sponsor_interest").insert({
      name: data.name,
      email: data.email,
      phone: data.phone,
      company_name: data.companyName,
      status: "new",
    });

    if (dbError) {
      console.error("Failed to save sponsor interest to database:", dbError);
      // Continue anyway - we don't want to fail the submission if DB fails
      // The email notifications will still go out
    }
  } catch (error) {
    console.error("Database error saving sponsor interest:", error);
    // Continue with email sending even if DB fails
  }

  // Send confirmation email to prospect
  try {
    if (!resend) {
      console.warn(
        "Resend not configured, skipping prospect confirmation email"
      );
    } else {
      const fromEmail =
        process.env.RESEND_FROM_EMAIL || "RiseUp Website <noreply@riseupfootball.org>";
      await sendWithRetry(resend, {
        from: fromEmail,
        to: data.email,
        subject: "Partner Interest Received - RiseUp Youth Football",
        html: `
          <h2>Thank you for your interest in partnering with RiseUp Youth Football!</h2>
          <p>Hi ${data.name},</p>
          <p>We've received your partnership inquiry for <strong>${data.companyName}</strong>.</p>
          <p>A member of our team will reach out within 2-3 business days to discuss partnership opportunities and answer any questions you may have.</p>
          <p>We're excited about the possibility of partnering with you to support youth football in our community!</p>
          <br>
          <p>Best regards,<br>RiseUp Football Team</p>
        `,
      });
      await delayBetweenEmails();
    }
  } catch (error) {
    console.error("Failed to send prospect confirmation email:", error);
    // Don't fail the submission if email fails
  }

  // Send notification email to admin
  try {
    if (!resend) {
      console.warn("Resend not configured, skipping admin notification");
    } else {
      const adminEmail =
        process.env.SPONSOR_INTEREST_EMAIL || "krystie@riseupfootball.org";
      const fromEmail =
        process.env.RESEND_FROM_EMAIL || "RiseUp Website <noreply@riseupfootball.org>";

      await sendWithRetry(resend, {
        from: fromEmail,
        to: adminEmail,
        subject: `New Partner Interest: ${data.companyName}`,
        html: `
          <h2>New Partnership Interest Submission</h2>
          <p><strong>Company:</strong> ${data.companyName}</p>
          <p><strong>Contact Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
          <p><strong>Phone:</strong> ${data.phone}</p>
          <br>
          <p><em>Follow up with this potential partner to discuss available packages.</em></p>
        `,
        replyTo: data.email,
      });
    }
  } catch (error) {
    console.error("Failed to send admin notification:", error);
    // Don't fail the submission if email fails
  }

  // Return success even if emails failed - the form submission itself succeeded
  return {
    success: true,
    message:
      "Thank you for your interest! We'll be in touch within 2-3 business days to discuss partnership opportunities.",
  };
}
