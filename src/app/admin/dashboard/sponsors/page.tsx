import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";
import Image from "next/image";
import { approveSponsor } from "@/lib/actions/sponsors";

type Sponsor = Tables<"sponsors">;

export default async function AdminSponsorsPage() {
  const supabase = await createClient();

  // Fetch all sponsors, pending first
  const { data: sponsors, error } = await supabase
    .from("sponsors")
    .select("*")
    .order("status", { ascending: true }) // pending comes before approved alphabetically
    .order("created_at", { ascending: false })
    .returns<Sponsor[]>();

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6">
        <h2 className="text-lg font-semibold text-red-400">
          Error loading partners
        </h2>
        <p className="text-sm text-red-400/80">{error.message}</p>
      </div>
    );
  }

  const pendingSponsors = sponsors?.filter((s) => s.status === "pending") || [];
  const approvedSponsors =
    sponsors?.filter((s) => s.status === "approved") || [];

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-white">Partner Management</h1>
      <p className="mb-8 text-muted-foreground">
        Review and approve partner submissions
      </p>

      {/* Pending Partners Section */}
      <section className="mb-12">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
          <span className="inline-block h-3 w-3 rounded-full bg-amber-400"></span>
          Pending Approval ({pendingSponsors.length})
        </h2>

        {pendingSponsors.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-muted-foreground">
              No pending partner submissions
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingSponsors.map((sponsor) => (
              <div
                key={sponsor.id}
                className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-6 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  {/* Logo Preview */}
                  <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/10">
                    <Image
                      src={sponsor.logo_url}
                      alt={`${sponsor.company_name} logo`}
                      fill
                      className="object-contain p-1"
                      sizes="96px"
                    />
                  </div>

                  {/* Sponsor Info */}
                  <div>
                    <h3 className="font-semibold text-white">
                      {sponsor.company_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {sponsor.contact_name} &middot;{" "}
                      <a
                        href={`mailto:${sponsor.contact_email}`}
                        className="text-accent hover:underline"
                      >
                        {sponsor.contact_email}
                      </a>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Submitted{" "}
                      {new Date(sponsor.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 sm:shrink-0">
                  <a
                    href={sponsor.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white transition-colors hover:bg-white/5"
                  >
                    Visit Site
                  </a>
                  <form action={approveSponsor.bind(null, sponsor.id)}>
                    <button
                      type="submit"
                      className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-500"
                    >
                      Approve
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Approved Partners Section */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
          <span className="inline-block h-3 w-3 rounded-full bg-green-400"></span>
          Approved ({approvedSponsors.length})
        </h2>

        {approvedSponsors.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-muted-foreground">No approved partners yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {approvedSponsors.map((sponsor) => (
              <div
                key={sponsor.id}
                className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-6 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  {/* Logo Preview */}
                  <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/10">
                    <Image
                      src={sponsor.logo_url}
                      alt={`${sponsor.company_name} logo`}
                      fill
                      className="object-contain p-1"
                      sizes="96px"
                    />
                  </div>

                  {/* Sponsor Info */}
                  <div>
                    <h3 className="font-semibold text-white">
                      {sponsor.company_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {sponsor.contact_name} &middot;{" "}
                      <a
                        href={`mailto:${sponsor.contact_email}`}
                        className="text-accent hover:underline"
                      >
                        {sponsor.contact_email}
                      </a>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Approved{" "}
                      {sponsor.approved_at
                        ? new Date(sponsor.approved_at).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 sm:shrink-0">
                  <a
                    href={sponsor.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white transition-colors hover:bg-white/5"
                  >
                    Visit Site
                  </a>
                  <span className="rounded-lg bg-green-500/20 px-4 py-2 text-sm font-medium text-green-400">
                    Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
