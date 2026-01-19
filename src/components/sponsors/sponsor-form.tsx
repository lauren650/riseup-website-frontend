"use client";

import { useActionState, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sponsorSchema, SponsorFormData } from "@/lib/validations/sponsor";
import { submitSponsor, SponsorFormState } from "@/lib/actions/sponsors";
import { LogoUpload } from "./logo-upload";
import { cn } from "@/lib/utils";

export function SponsorForm() {
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [logoError, setLogoError] = useState<string>("");

  const {
    register,
    formState: { errors },
    reset,
  } = useForm<SponsorFormData>({
    resolver: zodResolver(sponsorSchema),
  });

  const [state, formAction, isPending] = useActionState<
    SponsorFormState | null,
    FormData
  >(async (prevState, formData) => {
    // Validate logo before submission
    if (!logoUrl) {
      setLogoError("Please upload your company logo");
      return {
        success: false,
        message: "Please upload your company logo",
        errors: { logoUrl: ["Logo is required"] },
      };
    }

    // Add logo URL to form data
    formData.set("logoUrl", logoUrl);

    const result = await submitSponsor(prevState, formData);

    // Reset form on success
    if (result.success) {
      reset();
      setLogoUrl("");
      setLogoError("");
    }

    return result;
  }, null);

  const handleLogoUpload = (url: string) => {
    setLogoUrl(url);
    if (url) {
      setLogoError("");
    }
  };

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

      {/* Company Name */}
      <div>
        <label
          htmlFor="companyName"
          className="mb-2 block text-sm font-medium text-white"
        >
          Company Name <span className="text-red-400">*</span>
        </label>
        <input
          {...register("companyName")}
          id="companyName"
          name="companyName"
          type="text"
          placeholder="Your company name"
          className={inputClassName}
        />
        {(errors.companyName || state?.errors?.companyName) && (
          <p className="mt-1 text-sm text-red-400">
            {errors.companyName?.message || state?.errors?.companyName?.[0]}
          </p>
        )}
      </div>

      {/* Contact Name */}
      <div>
        <label
          htmlFor="contactName"
          className="mb-2 block text-sm font-medium text-white"
        >
          Contact Name <span className="text-red-400">*</span>
        </label>
        <input
          {...register("contactName")}
          id="contactName"
          name="contactName"
          type="text"
          placeholder="Your name"
          className={inputClassName}
        />
        {(errors.contactName || state?.errors?.contactName) && (
          <p className="mt-1 text-sm text-red-400">
            {errors.contactName?.message || state?.errors?.contactName?.[0]}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="contactEmail"
          className="mb-2 block text-sm font-medium text-white"
        >
          Email <span className="text-red-400">*</span>
        </label>
        <input
          {...register("contactEmail")}
          id="contactEmail"
          name="contactEmail"
          type="email"
          placeholder="contact@company.com"
          className={inputClassName}
        />
        {(errors.contactEmail || state?.errors?.contactEmail) && (
          <p className="mt-1 text-sm text-red-400">
            {errors.contactEmail?.message || state?.errors?.contactEmail?.[0]}
          </p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label
          htmlFor="contactPhone"
          className="mb-2 block text-sm font-medium text-white"
        >
          Phone <span className="text-red-400">*</span>
        </label>
        <input
          {...register("contactPhone")}
          id="contactPhone"
          name="contactPhone"
          type="tel"
          placeholder="(555) 123-4567"
          className={inputClassName}
        />
        {(errors.contactPhone || state?.errors?.contactPhone) && (
          <p className="mt-1 text-sm text-red-400">
            {errors.contactPhone?.message || state?.errors?.contactPhone?.[0]}
          </p>
        )}
      </div>

      {/* Website URL */}
      <div>
        <label
          htmlFor="websiteUrl"
          className="mb-2 block text-sm font-medium text-white"
        >
          Website URL <span className="text-red-400">*</span>
        </label>
        <input
          {...register("websiteUrl")}
          id="websiteUrl"
          name="websiteUrl"
          type="url"
          placeholder="https://www.yourcompany.com"
          className={inputClassName}
        />
        {(errors.websiteUrl || state?.errors?.websiteUrl) && (
          <p className="mt-1 text-sm text-red-400">
            {errors.websiteUrl?.message || state?.errors?.websiteUrl?.[0]}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="mb-2 block text-sm font-medium text-white"
        >
          Description{" "}
          <span className="text-muted-foreground">(optional, max 500 chars)</span>
        </label>
        <textarea
          {...register("description")}
          id="description"
          name="description"
          rows={3}
          placeholder="Brief description of your company and partnership goals"
          className={cn(inputClassName, "resize-none")}
        />
        {(errors.description || state?.errors?.description) && (
          <p className="mt-1 text-sm text-red-400">
            {errors.description?.message || state?.errors?.description?.[0]}
          </p>
        )}
      </div>

      {/* Logo Upload */}
      <div>
        <label className="mb-2 block text-sm font-medium text-white">
          Company Logo <span className="text-red-400">*</span>
        </label>
        <LogoUpload
          onUploadComplete={handleLogoUpload}
          error={logoError || state?.errors?.logoUrl?.[0]}
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending || !logoUrl}
        className="w-full rounded-full bg-accent px-8 py-4 text-lg font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Submitting..." : "Submit Sponsorship"}
      </button>

      <p className="text-center text-xs text-muted-foreground">
        By submitting, you agree to let RiseUp Youth Football display your logo
        on our Partners page after approval.
      </p>
    </form>
  );
}
