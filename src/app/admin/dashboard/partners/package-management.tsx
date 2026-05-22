"use client";

import { useState } from "react";
import { updatePackage } from "@/lib/actions/packages";
import type { PackageRow } from "@/lib/actions/packages";
import { Button } from "@/components/ui/button";

export function PackageManagement({ packages }: { packages: PackageRow[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [available, setAvailable] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function startEdit(pkg: PackageRow) {
    setEditingId(pkg.id);
    setAvailable(String(pkg.available_slots));
    setError(null);
    setSuccess(false);
  }

  function cancelEdit() {
    setEditingId(null);
    setError(null);
    setSuccess(false);
  }

  async function handleSubmit(e: React.FormEvent, packageId: string) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const availableNum = available.trim() ? parseInt(available, 10) : undefined;

    if (availableNum === undefined || isNaN(availableNum) || availableNum < 0) {
      setError("Available must be 0 or more.");
      return;
    }

    const result = await updatePackage(packageId, {
      available_slots: availableNum,
    });

    if (result.success) {
      setSuccess(true);
      setEditingId(null);
    } else {
      setError(result.error ?? "Update failed.");
    }
  }

  if (packages.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
        <p className="text-muted-foreground">No packages in the system yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[400px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-muted-foreground">
              <th className="px-4 py-3 font-medium">Package</th>
              <th className="px-4 py-3 font-medium">What’s included</th>
              <th className="px-4 py-3 font-medium">Available</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {packages.map((pkg) => (
              <tr
                key={pkg.id}
                className="border-b border-white/5 transition-colors hover:bg-white/5"
              >
                {editingId === pkg.id ? (
                  <td colSpan={4} className="px-4 py-3">
                    <form
                      onSubmit={(e) => handleSubmit(e, pkg.id)}
                      className="flex flex-wrap items-end gap-4"
                    >
                      <div>
                        <label className="mb-1 block text-xs text-muted-foreground">
                          How many available
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={available}
                          onChange={(e) => setAvailable(e.target.value)}
                          className="w-28 rounded-lg border border-white/20 bg-black/50 px-2 py-1.5 text-white"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          className="rounded-full bg-accent px-4 py-2 text-sm text-white hover:opacity-90"
                        >
                          Save
                        </Button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="rounded-full border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/10"
                        >
                          Cancel
                        </button>
                      </div>
                      {error && (
                        <p className="w-full text-sm text-red-400">{error}</p>
                      )}
                      {success && (
                        <p className="w-full text-sm text-green-400">Saved.</p>
                      )}
                    </form>
                  </td>
                ) : (
                  <>
                    <td className="px-4 py-3 font-medium text-white">
                      {pkg.name}
                    </td>
                    <td className="max-w-xs px-4 py-3 text-muted-foreground">
                      {pkg.description?.trim() || "—"}
                    </td>
                    <td className="px-4 py-3 text-white">
                      {pkg.available_slots}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => startEdit(pkg)}
                        className="rounded-full border border-white/20 px-3 py-1.5 text-xs text-white transition-colors hover:bg-white/10"
                      >
                        Edit
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
