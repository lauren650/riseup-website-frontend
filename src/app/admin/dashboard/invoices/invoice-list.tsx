import { voidInvoice } from "@/lib/actions/invoices";

type InvoiceRow = {
  id: string;
  stripe_invoice_id: string;
  package_name: string;
  package_cost: number;
  customer_name: string;
  customer_email: string;
  status: string;
  created_at: string;
};

/** Base URL for Stripe dashboard invoices (test or live). Pass from server to show "View in Stripe" link. */
type InvoiceListProps = {
  invoices: InvoiceRow[];
  stripeInvoiceBaseUrl?: string;
};

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: "bg-white/10 text-muted-foreground",
    open: "bg-amber-500/20 text-amber-400",
    paid: "bg-green-500/20 text-green-400",
    void: "bg-white/10 text-muted-foreground",
    uncollectible: "bg-red-500/20 text-red-400",
  };
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] ?? "bg-white/10 text-muted-foreground"}`}
    >
      {label}
    </span>
  );
}

export function InvoiceList({ invoices, stripeInvoiceBaseUrl }: InvoiceListProps) {
  if (invoices.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
        <p className="text-muted-foreground">No invoices yet. Create one above.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-muted-foreground">
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Package</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr
                key={inv.id}
                className="border-b border-white/5 transition-colors hover:bg-white/5"
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-white">{inv.customer_name}</div>
                  <a
                    href={`mailto:${inv.customer_email}`}
                    className="text-xs text-muted-foreground hover:text-accent"
                  >
                    {inv.customer_email}
                  </a>
                </td>
                <td className="px-4 py-3 text-white">{inv.package_name}</td>
                <td className="px-4 py-3 text-white">
                  ${inv.package_cost.toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={inv.status} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(inv.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {stripeInvoiceBaseUrl && (
                      <a
                        href={`${stripeInvoiceBaseUrl}/${inv.stripe_invoice_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full border border-white/20 px-3 py-1.5 text-xs text-white transition-colors hover:bg-white/10"
                      >
                        View in Stripe
                      </a>
                    )}
                    {inv.status !== "paid" && inv.status !== "void" && (
                      <form action={async () => { await voidInvoice(inv.id); }} className="inline">
                        <button
                          type="submit"
                          className="rounded-full border border-white/20 px-3 py-1.5 text-xs text-white transition-colors hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400"
                        >
                          Void
                        </button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
