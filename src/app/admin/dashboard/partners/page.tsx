import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Tables } from "@/lib/supabase/types";
import Image from "next/image";
import { approveSponsor } from "@/lib/actions/sponsors";
import { getPackagesForDashboard } from "@/lib/actions/packages";
import { getSponsorshipPackages } from "@/lib/actions/invoices";
import { getStripeInvoiceDashboardBaseUrl } from "@/lib/stripe/client";
import {
  getTShirtPartners,
  getArtworkProofsForDashboard,
} from "@/lib/actions/artwork-proofs";
import { InvoiceList } from "../invoices/invoice-list";
import { CreateInvoiceForm } from "../invoices/create-invoice-form";
import { PackageManagement } from "./package-management";
import { CreateArtworkProofForm } from "./create-artwork-proof-form";
import { ArtworkProofList } from "./artwork-proof-list";

type Sponsor = Tables<"sponsors">;

export default async function PartnerDashboardPage() {
  const supabase = await createClient();

  const { packages: packagesForDashboard } = await getPackagesForDashboard();
  const { packages: packagesForInvoice } = await getSponsorshipPackages();
  const { partners: tShirtPartners } = await getTShirtPartners();
  const { proofs: artworkProofs } = await getArtworkProofsForDashboard();

  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, stripe_invoice_id, package_name, package_cost, customer_name, customer_email, status, created_at")
    .order("created_at", { ascending: false });

  const { data: revenueRows } = await supabase
    .from("invoices")
    .select("package_cost")
    .eq("status", "paid");
  const revenue = revenueRows?.reduce((sum, r) => sum + (r.package_cost ?? 0), 0) ?? 0;

  const { count: approvedCount } = await supabase
    .from("sponsors")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved");
  const { count: completedUploads } = await supabase
    .from("sponsor_uploads")
    .select("*", { count: "exact", head: true })
    .eq("status", "completed");
  const partnerCount = (approvedCount ?? 0) + (completedUploads ?? 0);

  const { count: pendingApproval } = await supabase
    .from("sponsors")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");
  const { count: pendingUploads } = await supabase
    .from("sponsor_uploads")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  const { data: sponsors, error: sponsorsError } = await supabase
    .from("sponsors")
    .select("*")
    .order("status", { ascending: true })
    .order("created_at", { ascending: false })
    .returns<Sponsor[]>();

  const pendingPartners = sponsors?.filter((s) => s.status === "pending") ?? [];
  const approvedPartners = sponsors?.filter((s) => s.status === "approved") ?? [];

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Partner Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Metrics, packages, invoicing, and partner management
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/dashboard/partners/email-templates"
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white transition-colors hover:bg-white/10"
          >
            Email templates
          </Link>
          <Link
            href="/admin/dashboard"
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white transition-colors hover:bg-white/10"
          >
            Back to RiseUp Dashboard
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold text-white">Metrics</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-muted-foreground">Total revenue (paid)</p>
            <p className="mt-1 text-2xl font-bold text-white">
              ${revenue.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-muted-foreground">Partners</p>
            <p className="mt-1 text-2xl font-bold text-white">{partnerCount}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Pending approval: {pendingApproval ?? 0} · Pending uploads:{" "}
              {pendingUploads ?? 0}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-muted-foreground">Packages</p>
            <p className="mt-1 text-2xl font-bold text-white">
              {packagesForDashboard.length}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-muted-foreground">Open invoices</p>
            <p className="mt-1 text-2xl font-bold text-white">
              {invoices?.filter((i) => ["draft", "open"].includes(i.status))
                .length ?? 0}
            </p>
          </div>
        </div>
      </section>

      {/* Create invoice */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold text-white">
          Create invoice
        </h2>
        <CreateInvoiceForm packages={packagesForInvoice} />
      </section>

      {/* Invoices list */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold text-white">
          Invoices ({invoices?.length ?? 0})
        </h2>
        <InvoiceList invoices={invoices ?? []} stripeInvoiceBaseUrl={getStripeInvoiceDashboardBaseUrl()} />
      </section>

      {/* Artwork review */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold text-white">
          Artwork review
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Send artwork proofs (e.g. t-shirt mockups) to partners with t-shirt
          benefit. They must approve within 24 hours.
        </p>
        <div className="mb-8">
          <CreateArtworkProofForm partners={tShirtPartners} />
        </div>
        <h3 className="mb-3 text-lg font-medium text-white">Proofs</h3>
        <ArtworkProofList proofs={artworkProofs} />
      </section>

      {/* Package management */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold text-white">
          Package management
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          What’s in each package and how many are available. Use Edit to update the available count.
        </p>
        <PackageManagement packages={packagesForDashboard} />
      </section>

      {/* Partners list (legacy) */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold text-white">Partners</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Legacy submissions (pending approval) and approved partners.
        </p>

        {pendingPartners.length > 0 && (
          <div className="mb-8">
            <h3 className="mb-3 flex items-center gap-2 text-lg font-medium text-white">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-400" />
              Pending approval ({pendingPartners.length})
            </h3>
            <div className="space-y-4">
              {pendingPartners.map((partner) => (
                <div
                  key={partner.id}
                  className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/10">
                      <Image
                        src={partner.logo_url}
                        alt={`${partner.company_name} logo`}
                        fill
                        className="object-contain p-1"
                        sizes="80px"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">
                        {partner.company_name}
                      </h4>
                      <a
                        href={`mailto:${partner.contact_email}`}
                        className="text-sm text-muted-foreground hover:text-accent"
                      >
                        {partner.contact_email}
                      </a>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={partner.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white hover:bg-white/5"
                    >
                      Visit site
                    </a>
                    <form action={approveSponsor.bind(null, partner.id)}>
                      <button
                        type="submit"
                        className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-500"
                      >
                        Approve
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="mb-3 flex items-center gap-2 text-lg font-medium text-white">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-400" />
            Approved ({approvedPartners.length})
          </h3>
          {approvedPartners.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
              <p className="text-muted-foreground">No approved partners yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {approvedPartners.map((partner) => (
                <div
                  key={partner.id}
                  className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/10">
                      <Image
                        src={partner.logo_url}
                        alt={`${partner.company_name} logo`}
                        fill
                        className="object-contain p-1"
                        sizes="80px"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">
                        {partner.company_name}
                      </h4>
                      <a
                        href={`mailto:${partner.contact_email}`}
                        className="text-sm text-muted-foreground hover:text-accent"
                      >
                        {partner.contact_email}
                      </a>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={partner.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white hover:bg-white/5"
                    >
                      Visit site
                    </a>
                    <span className="rounded-lg bg-green-500/20 px-3 py-2 text-sm font-medium text-green-400">
                      Active
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Reporting placeholder */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-white">Reporting</h2>
        <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
          <p className="text-muted-foreground">
            Export and reporting tools will be available here soon.
          </p>
        </div>
      </section>
    </div>
  );
}
