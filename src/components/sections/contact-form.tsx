"use client";

import { useActionState, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useReCaptcha } from "next-recaptcha-v3";
import { contactSchema, ContactFormData } from "@/lib/validations/contact";
import {
  submitContactForm,
  ContactFormState,
} from "@/lib/actions/contact";
import { ConfirmationModal } from "@/components/sponsors/confirmation-modal";
import { cn } from "@/lib/utils";

const subjectOptions = [
  { value: "", label: "Select a subject" },
  { value: "General Inquiry", label: "General Inquiry" },
  { value: "Registration Question", label: "Registration Question" },
  { value: "Volunteer Interest", label: "Volunteer Interest" },
  { value: "Other", label: "Other" },
];

export function ContactForm() {
  const { executeRecaptcha, loaded, reCaptchaKey } = useReCaptcha();
  const [showModal, setShowModal] = useState(false);
  const [recaptchaFallback, setRecaptchaFallback] = useState(false);

  // Allow submit after 10s if reCAPTCHA never loads (e.g. ad blocker, wrong domain)
  useEffect(() => {
    if (!reCaptchaKey) return;
    const t = setTimeout(() => setRecaptchaFallback(true), 10000);
    return () => clearTimeout(t);
  }, [reCaptchaKey]);

  // Disable submit until reCAPTCHA is loaded when configured (prevents "Recaptcha has not been loaded" error)
  const isRecaptchaReady = !reCaptchaKey || loaded || recaptchaFallback;

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
    // Get reCAPTCHA token - only call when loaded to avoid "Recaptcha has not been loaded" error
    // If reCAPTCHA fails or isn't configured, submit anyway (server skips verification when no token)
    let recaptchaToken = "";
    try {
      if (reCaptchaKey && loaded && executeRecaptcha) {
        recaptchaToken = await executeRecaptcha("contact_form");
      }
    } catch (error) {
      console.warn("reCAPTCHA execution failed:", error);
    }

    formData.set("recaptchaToken", recaptchaToken);

    const result = await submitContactForm(prevState, formData);

    // On success: reset form and show modal
    if (result.success) {
      reset();
      setShowModal(true);
    }

    return result;
  }, null);

  const inputClassName =
    "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

  return (
    <>
      <form action={formAction} className="space-y-6">
        {/* Error Message - only show errors, not success (modal handles success) */}
        {state?.message && !state.success && (
          <div className="rounded-lg bg-red-500/10 p-4 text-red-400">
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
        disabled={isPending || !isRecaptchaReady}
        className="w-full rounded-full bg-accent px-8 py-4 text-lg font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {!isRecaptchaReady
          ? "Loading..."
          : isPending
            ? "Sending..."
            : "Send Message"}
      </button>

      {process.env.NEXT_PUBLIC_DISABLE_RECAPTCHA !== "true" && (
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
      )}
    </form>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        message={
          state?.success && state?.message
            ? state.message
            : "Thank you for your message! We'll get back to you soon."
        }
      />
    </>
  );
}
