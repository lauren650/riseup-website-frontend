"use server";

import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { getResolvedTemplate } from "@/lib/actions/email-templates";
import { delayBetweenEmails, sendWithRetry } from "@/lib/resend";
import {
  sponsorInterestSchema,
  SponsorInterestFormData,
} from "@/lib/validations/sponsor-interest";
import { checkFormSpamSignals, verifyRecaptcha } from "@/lib/spam-protection";

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

const SUCCESS_MESSAGE =
  "Thank you for your interest! We'll be in touch within 2-3 business days to discuss partnership opportunities.";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function submitSponsorInterest(
  prevState: SponsorInterestFormState | null,
  formData: FormData
): Promise<SponsorInterestFormState> {
  const spam = checkFormSpamSignals(formData);
  if (spam.action === "silent_drop") {
    console.warn("[Sponsor interest] Blocked spam submission:", spam.reason);
    return { success: true, message: SUCCESS_MESSAGE };
  }
  if (spam.action === "reject") {
    console.warn("[Sponsor interest] Blocked spam submission:", spam.reason);
    return { success: false, message: spam.message };
  }

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

  const recaptcha = await verifyRecaptcha(
    data.recaptchaToken,
    "sponsor_interest_form"
  );
  if (!recaptcha.ok) {
    console.warn(
      "[Sponsor interest] reCAPTCHA blocked submission:",
      recaptcha.reason
    );
    return {
      success: false,
      message: recaptcha.message,
    };
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
      const conf = await getResolvedTemplate("sponsor_interest_confirmation", {
        name: data.name,
        companyName: data.companyName,
      });
      await sendWithRetry(resend, {
        from: fromEmail,
        to: data.email,
        subject: conf.subject,
        html: conf.html,
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
      const adminTmpl = await getResolvedTemplate(
        "sponsor_interest_admin_notification",
        {
          companyName: data.companyName,
          name: data.name,
          email: data.email,
          phone: data.phone,
        }
      );
      await sendWithRetry(resend, {
        from: fromEmail,
        to: adminEmail,
        subject: adminTmpl.subject,
        html: adminTmpl.html,
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
    message: SUCCESS_MESSAGE,
  };
}
