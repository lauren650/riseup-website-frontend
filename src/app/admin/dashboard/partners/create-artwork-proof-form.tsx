"use client";

import { useState } from "react";
import { createArtworkProof } from "@/lib/actions/artwork-proofs";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import type { TShirtPartner } from "@/lib/actions/artwork-proofs";

export function CreateArtworkProofForm({
  partners,
}: {
  partners: TShirtPartner[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (PNG, JPG, etc.).");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "png";
      const path = `artwork-proofs/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "-")}`;
      const { error: uploadErr } = await supabase.storage
        .from("site-images")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (uploadErr) throw uploadErr;
      const {
        data: { publicUrl },
      } = supabase.storage.from("site-images").getPublicUrl(path);
      setUploadedUrl(publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image.");
      setUploadedUrl(null);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    setPending(true);

    const urlInput = (formData.get("imageUrl") as string)?.trim();
    const imageUrl = uploadedUrl ?? urlInput;
    if (!imageUrl) {
      setError("Upload an image or paste an image URL.");
      setPending(false);
      return;
    }

    const name = (formData.get("name") as string)?.trim();
    const approvalDueAt = formData.get("approvalDueAt") as string;
    const selectedIds = formData.getAll("partnerIds") as string[];

    if (!name || !approvalDueAt || selectedIds.length === 0) {
      setError("Name, approval deadline, and at least one recipient are required.");
      setPending(false);
      return;
    }

    const result = await createArtworkProof({
      name,
      imageUrl,
      approvalDueAt,
      sponsorUploadIds: selectedIds,
    });

    setPending(false);
    if (result.success) {
      setSuccess(true);
      setUploadedUrl(null);
    } else {
      setError(result.error ?? "Something went wrong.");
    }
  }

  const defaultDue = (() => {
    const d = new Date();
    d.setHours(d.getHours() + 24);
    return d.toISOString().slice(0, 16);
  })();

  return (
    <form
      action={handleSubmit}
      className="rounded-xl border border-white/10 bg-white/5 p-6"
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="mb-1.5 block text-sm font-medium text-muted-foreground"
          >
            Proof name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="2026 Academy T-shirt"
            className="w-full rounded-lg border border-white/20 bg-black/50 px-3 py-2 text-white placeholder:text-white/40 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
            Proof image
          </label>
          <p className="mb-2 text-xs text-muted-foreground">
            Upload an image or paste a URL (e.g. from Google Drive)
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="w-full rounded-lg border border-white/20 bg-black/50 px-3 py-2 text-sm text-white file:mr-2 file:rounded file:border-0 file:bg-accent file:px-4 file:py-2 file:text-white file:hover:opacity-90"
            />
            <span className="text-sm text-muted-foreground">or</span>
            <input
              id="imageUrl"
              name="imageUrl"
              type="url"
              placeholder="https://..."
              className="w-full rounded-lg border border-white/20 bg-black/50 px-3 py-2 text-white placeholder:text-white/40 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          {uploadedUrl && (
            <p className="mt-2 text-xs text-green-400">Image uploaded</p>
          )}
        </div>

        <div>
          <label
            htmlFor="approvalDueAt"
            className="mb-1.5 block text-sm font-medium text-muted-foreground"
          >
            Approval deadline (24 hours)
          </label>
          <input
            id="approvalDueAt"
            name="approvalDueAt"
            type="datetime-local"
            required
            defaultValue={defaultDue}
            className="w-full rounded-lg border border-white/20 bg-black/50 px-3 py-2 text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-muted-foreground">
            Recipients (partners with t-shirt benefit)
          </label>
          {partners.length === 0 ? (
            <p className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground">
              No partners with t-shirt benefit yet. Partners must have completed
              their logo upload.
            </p>
          ) : (
            <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-white/10 bg-black/30 p-3">
              {partners.map((p) => (
                <label
                  key={p.id}
                  className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-white/5"
                >
                  <input
                    type="checkbox"
                    name="partnerIds"
                    value={p.id}
                    className="rounded border-white/20 bg-black/50 text-accent focus:ring-accent"
                  />
                  <span className="text-sm text-white">{p.company_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {p.customer_email}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div>
          <Button
            type="submit"
            disabled={pending || uploading || partners.length === 0}
            className="rounded-full bg-accent px-6 py-3 text-white hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "Sending…" : "Send to selected partners"}
          </Button>
        </div>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="mt-4 text-sm text-green-400" role="status">
          Proof sent. Partners will receive an email with a link to approve
          within 24 hours.
        </p>
      )}
    </form>
  );
}
