"use client";

import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useReCaptcha } from "next-recaptcha-v3";
import { contactSchema, ContactFormData } from "@/lib/validations/contact";
import {
  submitContactForm,
  ContactFormState,
} from "@/lib/actions/contact";
import { cn } from "@/lib/utils";

const subjectOptions = [
  { value: "", label: "Select a subject" },
  { value: "General Inquiry", label: "General Inquiry" },
  { value: "Registration Question", label: "Registration Question" },
  { value: "Sponsorship Inquiry", label: "Sponsorship Inquiry" },
  { value: "Volunteer Interest", label: "Volunteer Interest" },
  { value: "Other", label: "Other" },
];

export function ContactForm() {
  const { executeRecaptcha } = useReCaptcha();

  const {
    register,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const [state, formAction, isPending] = useActionState<
    ContactFormState | null,
    FormData
  >(async (prevState, formData) => {
    // Get reCAPTCHA token before submitting
    let recaptchaToken = "";
    try {
      if (executeRecaptcha) {
        recaptchaToken = await executeRecaptcha("contact_form");
      }
    } catch (error) {
      console.warn("reCAPTCHA execution failed:", error);
    }

    // Add token to form data
    formData.set("recaptchaToken", recaptchaToken);

    const result = await submitContactForm(prevState, formData);

    // Reset form on success
    if (result.success) {
      reset();
    }

    return result;
  }, null);

  const inputClassName =
    "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

  return (
    <form action={formAction} className="space-y-6">
      {/* Success/Error Message */}
      {state?.message && (
        <div
          className={cn(
            "rounded-lg p-4",
            state.success
              ? "bg-green-500/10 text-green-400"
              : "bg-red-500/10 text-red-400"
          )}
        >
          {state.message}
        </div>
      )}

      {/* Name */}
      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium text-white">
          Name <span className="text-red-400">*</span>
        </label>
        <input
          {...register("name")}
          id="name"
          name="name"
          type="text"
          placeholder="Your name"
          className={inputClassName}
        />
        {(errors.name || state?.errors?.name) && (
          <p className="mt-1 text-sm text-red-400">
            {errors.name?.message || state?.errors?.name?.[0]}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-white">
          Email <span className="text-red-400">*</span>
        </label>
        <input
          {...register("email")}
          id="email"
          name="email"
          type="email"
          placeholder="your.email@example.com"
          className={inputClassName}
        />
        {(errors.email || state?.errors?.email) && (
          <p className="mt-1 text-sm text-red-400">
            {errors.email?.message || state?.errors?.email?.[0]}
          </p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="mb-2 block text-sm font-medium text-white">
          Phone <span className="text-muted-foreground">(optional)</span>
        </label>
        <input
          {...register("phone")}
          id="phone"
          name="phone"
          type="tel"
          placeholder="(555) 123-4567"
          className={inputClassName}
        />
        {(errors.phone || state?.errors?.phone) && (
          <p className="mt-1 text-sm text-red-400">
            {errors.phone?.message || state?.errors?.phone?.[0]}
          </p>
        )}
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="subject" className="mb-2 block text-sm font-medium text-white">
          Subject <span className="text-red-400">*</span>
        </label>
        <select
          {...register("subject")}
          id="subject"
          name="subject"
          className={inputClassName}
        >
          {subjectOptions.map((option) => (
            <option key={option.value} value={option.value} className="bg-black">
              {option.label}
            </option>
          ))}
        </select>
        {(errors.subject || state?.errors?.subject) && (
          <p className="mt-1 text-sm text-red-400">
            {errors.subject?.message || state?.errors?.subject?.[0]}
          </p>
        )}
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="mb-2 block text-sm font-medium text-white">
          Message <span className="text-red-400">*</span>
        </label>
        <textarea
          {...register("message")}
          id="message"
          name="message"
          rows={5}
          placeholder="How can we help you?"
          className={cn(inputClassName, "resize-none")}
        />
        {(errors.message || state?.errors?.message) && (
          <p className="mt-1 text-sm text-red-400">
            {errors.message?.message || state?.errors?.message?.[0]}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-accent px-8 py-4 text-lg font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Sending..." : "Send Message"}
      </button>

      <p className="text-center text-xs text-muted-foreground">
        This site is protected by reCAPTCHA and the Google{" "}
        <a
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-white"
        >
          Privacy Policy
        </a>{" "}
        and{" "}
        <a
          href="https://policies.google.com/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-white"
        >
          Terms of Service
        </a>{" "}
        apply.
      </p>
    </form>
  );
}
