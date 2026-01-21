"use client";

import { useActionState, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useReCaptcha } from "next-recaptcha-v3";
import {
  sponsorInterestSchema,
  SponsorInterestFormData,
} from "@/lib/validations/sponsor-interest";
import {
  submitSponsorInterest,
  SponsorInterestFormState,
} from "@/lib/actions/sponsor-interest";
import { ConfirmationModal } from "./confirmation-modal";

export function InterestForm() {
  const { executeRecaptcha } = useReCaptcha();
  const [showModal, setShowModal] = useState(false);

  const {
    register,
    formState: { errors },
    reset,
  } = useForm<SponsorInterestFormData>({
    resolver: zodResolver(sponsorInterestSchema),
  });

  const [state, formAction, isPending] = useActionState<
    SponsorInterestFormState | null,
    FormData
  >(async (prevState, formData) => {
    // Get reCAPTCHA token before submitting
    let recaptchaToken = "";
    try {
      if (executeRecaptcha) {
        recaptchaToken = await executeRecaptcha("sponsor_interest_form");
      }
    } catch (error) {
      console.warn("reCAPTCHA execution failed:", error);
    }

    // Add token to form data
    formData.set("recaptchaToken", recaptchaToken);

    const result = await submitSponsorInterest(prevState, formData);

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
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-white"
          >
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
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-white"
          >
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
          <label
            htmlFor="phone"
            className="mb-2 block text-sm font-medium text-white"
          >
            Phone <span className="text-red-400">*</span>
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

        {/* Company/Organization Name */}
        <div>
          <label
            htmlFor="companyName"
            className="mb-2 block text-sm font-medium text-white"
          >
            Company/Organization Name <span className="text-red-400">*</span>
          </label>
          <input
            {...register("companyName")}
            id="companyName"
            name="companyName"
            type="text"
            placeholder="Your company or organization"
            className={inputClassName}
          />
          {(errors.companyName || state?.errors?.companyName) && (
            <p className="mt-1 text-sm text-red-400">
              {errors.companyName?.message || state?.errors?.companyName?.[0]}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-full bg-accent px-8 py-4 text-lg font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Submitting..." : "Submit Interest"}
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

      {/* Confirmation Modal */}
      <ConfirmationModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
