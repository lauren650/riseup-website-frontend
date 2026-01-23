"use server";

import { Resend } from "resend";
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
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    // Skip verification if not configured (local dev)
    console.warn("reCAPTCHA secret key not configured, skipping verification");
    return true;
  }

  try {
    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `secret=${secretKey}&response=${token}`,
      }
    );

    const data = await response.json();
    return data.success && data.score >= 0.5;
  } catch (error) {
    console.error("reCAPTCHA verification failed:", error);
    return false;
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

  // Send confirmation email to prospect
  try {
    if (!resend) {
      console.warn(
        "Resend not configured, skipping prospect confirmation email"
      );
    } else {
      await resend.emails.send({
        from: "RiseUp Website <onboarding@resend.dev>",
        to: data.email,
        subject: "Partner Interest Received - RiseUp Youth Football",
        html: `
          <h2>Thank you for your interest in partnering with RiseUp Youth Football!</h2>
          <p>Hi ${data.name},</p>
          <p>We've received your partnership inquiry for <strong>${data.companyName}</strong>.</p>
          <p>A member of our team will reach out within 2-3 business days to discuss partnership opportunities and answer any questions you may have.</p>
          <p>We're excited about the possibility of partnering with you to support youth football in our community!</p>
          <br>
          <p>Best regards,<br>RiseUp Youth Football</p>
        `,
      });
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
        process.env.ADMIN_EMAIL ||
        process.env.CONTACT_EMAIL ||
        "info@riseupyouthfootball.com";

      await resend.emails.send({
        from: "RiseUp Website <onboarding@resend.dev>",
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
