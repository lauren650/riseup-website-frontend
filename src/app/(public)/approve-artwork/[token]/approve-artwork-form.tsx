"use client";

import { useState } from "react";
import { submitArtworkApproval } from "@/lib/actions/artwork-proofs";
import { Button } from "@/components/ui/button";

export function ApproveArtworkForm({ token }: { token: string }) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleApprove() {
    setError(null);
    setSuccess(false);
    setPending(true);

    const result = await submitArtworkApproval(token, "approved");

    setPending(false);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error ?? "Something went wrong.");
    }
  }

  async function handleRequestChanges() {
    setError(null);
    setSuccess(false);
    setPending(true);

    const result = await submitArtworkApproval(token, "changes_requested");

    setPending(false);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error ?? "Something went wrong.");
    }
  }

  if (success) {
    return (
      <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-8 text-center">
        <h2 className="text-xl font-semibold text-green-400">Thank you!</h2>
        <p className="mt-2 text-muted-foreground">
          Your response has been recorded. We&apos;ll be in touch if needed.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
      <p className="mb-4 text-sm text-muted-foreground">
        Please review the artwork above and approve or request changes.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          type="button"
          onClick={handleApprove}
          disabled={pending}
          className="w-full rounded-full bg-accent px-6 py-3 text-white hover:opacity-90 disabled:opacity-50 sm:w-auto"
        >
          {pending ? "Submitting…" : "Approve"}
        </Button>
        <Button
          type="button"
          onClick={handleRequestChanges}
          disabled={pending}
          variant="outline"
          className="w-full rounded-full border-white/20 px-6 py-3 text-white hover:bg-white/10 disabled:opacity-50 sm:w-auto"
        >
          Request changes
        </Button>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
