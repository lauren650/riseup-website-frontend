"use client";

import { useState } from "react";
import { submitUpload } from "@/lib/actions/sponsor-upload";
import { Button } from "@/components/ui/button";

export function UploadForm({ token }: { token: string }) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    setPending(true);

    const result = await submitUpload(token, formData);

    setPending(false);

    if (result.success) {
      setSuccess(true);
      return;
    }
    setError(result.error ?? "Something went wrong.");
  }

  if (success) {
    return (
      <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-8 text-center">
        <h2 className="text-xl font-semibold text-green-400">Thank you!</h2>
        <p className="mt-2 text-muted-foreground">
          Your logo and information have been received. We&apos;ll add you to our
          Partners page soon.
        </p>
      </div>
    );
  }

  return (
    <form
      action={handleSubmit}
      className="rounded-xl border border-white/10 bg-white/5 p-6"
    >
      <div className="space-y-6">
        <div>
          <label
            htmlFor="logo"
            className="mb-1.5 block text-sm font-medium text-muted-foreground"
          >
            Logo (JPEG, PNG, GIF or WebP, max 5MB)
          </label>
          <input
            id="logo"
            name="logo"
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            required
            className="w-full rounded-lg border border-white/20 bg-black/50 px-3 py-2 text-white file:mr-4 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-medium file:text-white file:hover:opacity-90"
          />
        </div>
        <div>
          <label
            htmlFor="websiteUrl"
            className="mb-1.5 block text-sm font-medium text-muted-foreground"
          >
            Website URL (optional)
          </label>
          <input
            id="websiteUrl"
            name="websiteUrl"
            type="url"
            placeholder="https://example.com"
            className="w-full rounded-lg border border-white/20 bg-black/50 px-3 py-2 text-white placeholder:text-white/40 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <Button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-accent px-6 py-3 text-white hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Uploading…" : "Submit"}
        </Button>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
