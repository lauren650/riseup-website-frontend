"use server";

import { Resend } from "resend";
import { contactSchema, ContactFormData } from "@/lib/validations/contact";

export interface ContactFormState {
  success: boolean;
  message: string;
  errors?: {
    name?: string[];
    email?: string[];
    phone?: string[];
    subject?: string[];
    message?: string[];
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

export async function submitContactForm(
  prevState: ContactFormState | null,
  formData: FormData
): Promise<ContactFormState> {
  // Parse form data
  const rawData: ContactFormData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: (formData.get("phone") as string) || undefined,
    subject: formData.get("subject") as string,
    message: formData.get("message") as string,
    recaptchaToken: (formData.get("recaptchaToken") as string) || undefined,
  };

  // Validate with Zod
  const validationResult = contactSchema.safeParse(rawData);

  if (!validationResult.success) {
    const errors = validationResult.error.flatten().fieldErrors;
    return {
      success: false,
      message: "Please fix the errors below",
      errors: {
        name: errors.name,
        email: errors.email,
        phone: errors.phone,
        subject: errors.subject,
        message: errors.message,
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

  // Send email via Resend
  try {
    if (!resend) {
      console.warn("Resend not configured, skipping email send");
      // Still return success for development
      return {
        success: true,
        message:
          "Thank you for your message! We'll get back to you soon. (Note: Email delivery not configured)",
      };
    }

    const contactEmail =
      process.env.CONTACT_EMAIL || "info@riseupyouthfootball.com";

    await resend.emails.send({
      from: "RiseUp Website <onboarding@resend.dev>",
      to: contactEmail,
      subject: `New Contact: ${data.subject} from ${data.name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        ${data.phone ? `<p><strong>Phone:</strong> ${data.phone}</p>` : ""}
        <p><strong>Subject:</strong> ${data.subject}</p>
        <p><strong>Message:</strong></p>
        <p>${data.message.replace(/\n/g, "<br>")}</p>
      `,
      replyTo: data.email,
    });

    return {
      success: true,
      message: "Thank you for your message! We'll get back to you soon.",
    };
  } catch (error) {
    console.error("Failed to send email:", error);
    return {
      success: false,
      message: "Failed to send message. Please try again later.",
    };
  }
}
