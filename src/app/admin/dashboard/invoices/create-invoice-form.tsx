"use client";

import { useState } from "react";
import { createInvoice } from "@/lib/actions/invoices";
import { Button } from "@/components/ui/button";

type Package = { id: string; name: string };

export function CreateInvoiceForm({
  packages,
}: {
  packages: Package[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    setPending(true);

    const amountStr = (formData.get("amountDollars") as string) ?? "";
    const amount = amountStr.trim() ? parseFloat(amountStr) : NaN;

    const result = await createInvoice({
      packageId: (formData.get("packageId") as string) ?? "",
      amountDollars: amount,
      customerName: (formData.get("customerName") as string) ?? "",
      customerEmail: (formData.get("customerEmail") as string) ?? "",
      note: (formData.get("note") as string) ?? undefined,
    });

    setPending(false);

    if (result.success) {
      setSuccess(true);
      return;
    }
    setError(result.error ?? "Something went wrong.");
  }

  return (
    <form
      action={handleSubmit}
      className="rounded-xl border border-white/10 bg-white/5 p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label
            htmlFor="packageId"
            className="mb-1.5 block text-sm font-medium text-muted-foreground"
          >
            Package
          </label>
          <select
            id="packageId"
            name="packageId"
            required
            className="w-full rounded-lg border border-white/20 bg-black/50 px-3 py-2 text-white placeholder:text-white/40 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="">Select package</option>
            {packages.map((pkg) => (
              <option key={pkg.id} value={pkg.id}>
                {pkg.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="amountDollars"
            className="mb-1.5 block text-sm font-medium text-muted-foreground"
          >
            Invoice amount ($)
          </label>
          <input
            id="amountDollars"
            name="amountDollars"
            type="number"
            step="0.01"
            min="0.01"
            required
            placeholder="0.00"
            className="w-full rounded-lg border border-white/20 bg-black/50 px-3 py-2 text-white placeholder:text-white/40 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <div>
          <label
            htmlFor="customerName"
            className="mb-1.5 block text-sm font-medium text-muted-foreground"
          >
            Company / Partner name
          </label>
          <input
            id="customerName"
            name="customerName"
            type="text"
            required
            placeholder="Acme Corp"
            className="w-full rounded-lg border border-white/20 bg-black/50 px-3 py-2 text-white placeholder:text-white/40 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <div>
          <label
            htmlFor="customerEmail"
            className="mb-1.5 block text-sm font-medium text-muted-foreground"
          >
            Email
          </label>
          <input
            id="customerEmail"
            name="customerEmail"
            type="email"
            required
            placeholder="partner@example.com"
            className="w-full rounded-lg border border-white/20 bg-black/50 px-3 py-2 text-white placeholder:text-white/40 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>

      <div className="mt-4">
        <label
          htmlFor="note"
          className="mb-1.5 block text-sm font-medium text-muted-foreground"
        >
          Note (optional)
        </label>
        <input
          id="note"
          name="note"
          type="text"
          placeholder="Any note for this invoice"
          className="w-full rounded-lg border border-white/20 bg-black/50 px-3 py-2 text-white placeholder:text-white/40 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      <div className="mt-6">
        <Button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent px-6 py-3 text-white hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Sending…" : "Send invoice"}
        </Button>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="mt-4 text-sm text-green-400" role="status">
          Invoice sent. The partner will receive an email with a link to pay.
        </p>
      )}
    </form>
  );
}
