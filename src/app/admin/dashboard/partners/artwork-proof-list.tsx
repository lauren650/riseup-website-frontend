"use client";

import Image from "next/image";
import type { ArtworkProofWithApprovals } from "@/lib/actions/artwork-proofs";

export function ArtworkProofList({
  proofs,
}: {
  proofs: ArtworkProofWithApprovals[];
}) {
  if (proofs.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
        <p className="text-muted-foreground">No artwork proofs yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {proofs.map((proof) => {
        const approved = proof.approvals.filter((a) => a.status === "approved");
        const pending = proof.approvals.filter((a) => a.status === "pending");
        const overdue = pending.filter(
          (a) => new Date(proof.approval_due_at) < new Date()
        );
        const pendingOnTime = pending.filter(
          (a) => new Date(proof.approval_due_at) >= new Date()
        );
        const changesRequested = proof.approvals.filter(
          (a) => a.status === "changes_requested"
        );

        return (
          <div
            key={proof.id}
            className="rounded-xl border border-white/10 bg-white/5 p-6"
          >
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-semibold text-white">{proof.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Deadline:{" "}
                  {new Date(proof.approval_due_at).toLocaleString(undefined, {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                  {" · "}
                  Approved: {approved.length} · Pending: {pendingOnTime.length} · Overdue:{" "}
                  {overdue.length}
                  {changesRequested.length > 0 &&
                    ` · Changes requested: ${changesRequested.length}`}
                </p>
              </div>
              <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black/50">
                <Image
                  src={proof.image_url}
                  alt={proof.name}
                  fill
                  className="object-contain"
                  sizes="128px"
                  unoptimized
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">Partner</th>
                    <th className="pb-2 pr-4 font-medium">Status</th>
                    <th className="pb-2 font-medium">Responded</th>
                  </tr>
                </thead>
                <tbody>
                  {proof.approvals.map((a) => {
                    const isOverdue =
                      a.status === "pending" &&
                      new Date(proof.approval_due_at) < new Date();
                    const statusLabel =
                      a.status === "approved"
                        ? "Approved"
                        : a.status === "changes_requested"
                          ? "Changes requested"
                          : isOverdue
                            ? "Overdue"
                            : "Pending";
                    const statusColor =
                      a.status === "approved"
                        ? "text-green-400"
                        : a.status === "changes_requested"
                          ? "text-amber-400"
                          : isOverdue
                            ? "text-red-400"
                            : "text-muted-foreground";

                    return (
                      <tr key={a.id} className="border-b border-white/5">
                        <td className="py-2 pr-4 text-white">
                          {a.company_name || "—"}
                        </td>
                        <td className={`py-2 pr-4 ${statusColor}`}>
                          {statusLabel}
                        </td>
                        <td className="py-2 text-muted-foreground">
                          {a.responded_at
                            ? new Date(a.responded_at).toLocaleString(
                                undefined,
                                { dateStyle: "short", timeStyle: "short" }
                              )
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
