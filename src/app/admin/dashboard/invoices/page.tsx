import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { getStripeInvoiceDashboardBaseUrl } from "@/lib/stripe/client";
import { InvoiceList } from "./invoice-list";
import { CreateInvoiceForm } from "./create-invoice-form";
import { getSponsorshipPackages } from "@/lib/actions/invoices";

export default async function AdminInvoicesPage() {
  const supabase = await createClient();
  const { packages } = await getSponsorshipPackages();

  const { data: invoices, error } = await supabase
    .from("invoices")
    .select("id, stripe_invoice_id, package_name, package_cost, customer_name, customer_email, status, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6">
        <h2 className="text-lg font-semibold text-red-400">
          Error loading invoices
        </h2>
        <p className="text-sm text-red-400/80">{error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Invoices</h1>
          <p className="mt-1 text-muted-foreground">
            Send invoices to partners and track payment status
          </p>
        </div>
        <Link
          href="/admin/dashboard"
          className="rounded-full border border-white/20 px-4 py-2 text-sm text-white transition-colors hover:bg-white/10"
        >
          Back to dashboard
        </Link>
      </div>

      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold text-white">
          Create invoice
        </h2>
        <CreateInvoiceForm packages={packages} />
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-white">
          All invoices ({invoices?.length ?? 0})
        </h2>
        <InvoiceList invoices={invoices ?? []} stripeInvoiceBaseUrl={getStripeInvoiceDashboardBaseUrl()} />
      </section>
    </div>
  );
}
