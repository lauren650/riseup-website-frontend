import { notFound } from "next/navigation";
import {
  getApprovalByToken,
  submitArtworkApproval,
} from "@/lib/actions/artwork-proofs";
import { ApproveArtworkForm } from "./approve-artwork-form";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Approve artwork | RiseUp Youth Football",
  description:
    "Review and approve artwork for your partnership with RiseUp Youth Football.",
};

type Props = { params: Promise<{ token: string }> };

export default async function ApproveArtworkPage({ params }: Props) {
  const { token } = await params;
  const result = await getApprovalByToken(token);

  if (!result) {
    notFound();
  }

  const { proof, approval } = result;
  const isExpired = new Date(approval.approval_due_at) < new Date();
  const alreadyResponded = approval.status !== "pending";

  if (alreadyResponded) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-xl px-6 py-16">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white md:text-4xl">
              Artwork review
            </h1>
            <p className="mt-2 text-muted-foreground">
              You have already responded to this artwork review.
            </p>
            {approval.status === "approved" && (
              <p className="mt-4 text-green-400">Thank you for your approval.</p>
            )}
            {approval.status === "changes_requested" && (
              <p className="mt-4 text-amber-400">
                We received your request for changes. We&apos;ll be in touch.
              </p>
            )}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/partners" className="transition-colors hover:text-white">
              Back to Partners
            </Link>
          </p>
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-xl px-6 py-16">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white md:text-4xl">
              Artwork review
            </h1>
            <p className="mt-2 text-muted-foreground">
              The approval deadline has passed. Please contact us if you need
              assistance.
            </p>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/partners" className="transition-colors hover:text-white">
              Back to Partners
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-xl px-6 py-16">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white md:text-4xl">
            Artwork approval
          </h1>
          <p className="mt-2 text-muted-foreground">
            Please review and approve this artwork within 24 hours.
          </p>
        </div>

        <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-medium text-white">{proof.name}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Deadline:{" "}
            {new Date(approval.approval_due_at).toLocaleString(undefined, {
              dateStyle: "full",
              timeStyle: "short",
            })}
          </p>
        </div>

        <div className="relative mb-6 aspect-square w-full overflow-hidden rounded-xl border border-white/10 bg-black/50">
          <Image
            src={proof.image_url}
            alt={proof.name}
            fill
            className="object-contain"
            sizes="(max-width: 640px) 100vw, 512px"
            unoptimized
          />
        </div>

        <ApproveArtworkForm token={token} />

        <p className="mt-8 text-center text-sm text-muted-foreground">
          <Link href="/partners" className="transition-colors hover:text-white">
            Back to Partners
          </Link>
        </p>
      </div>
    </div>
  );
}
