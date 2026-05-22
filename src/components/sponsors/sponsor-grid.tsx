import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";
import Image from "next/image";
import Link from "next/link";

type Sponsor = Tables<"sponsors">;

type GridItem = {
  id: string;
  company_name: string;
  logo_url: string;
  website_url: string;
};

function driveThumbnailUrl(fileId: string): string {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
}

/**
 * SponsorGrid - Displays partners from both legacy sponsors and invoice-driven uploads.
 * Shows approved sponsors (old table) plus completed sponsor_uploads for paid invoices
 * whose package includes the website benefit.
 */
export async function SponsorGrid() {
  const supabase = await createClient();
  const items: GridItem[] = [];

  // 1. Legacy approved sponsors
  const { data: sponsors, error: sponsorsError } = await supabase
    .from("sponsors")
    .select("id, company_name, logo_url, website_url")
    .eq("status", "approved")
    .order("company_name")
    .returns<Pick<Sponsor, "id" | "company_name" | "logo_url" | "website_url">[]>();

  if (!sponsorsError && sponsors?.length) {
    for (const s of sponsors) {
      items.push({
        id: s.id,
        company_name: s.company_name,
        logo_url: s.logo_url,
        website_url: s.website_url,
      });
    }
  }

  // 2. Invoice-driven: completed uploads for paid invoices with website benefit
  const { data: paidInvoices } = await supabase
    .from("invoices")
    .select("id")
    .eq("status", "paid");
  const paidInvoiceIds = new Set(paidInvoices?.map((i) => i.id) ?? []);

  const { data: uploads } = await supabase
    .from("sponsor_uploads")
    .select("id, company_name, logo_url, website_url, drive_file_id, invoice_id, sponsorship_packages(includes_website_benefit)")
    .eq("status", "completed");

  const uploadList = uploads ?? [];
  if (uploadList.length) {
    for (const u of uploadList) {
      const row = u as { invoice_id: string; id: string; company_name: string; logo_url: string | null; website_url: string | null; drive_file_id: string | null; sponsorship_packages: { includes_website_benefit?: boolean } | null };
      if (!paidInvoiceIds.has(row.invoice_id)) continue;
      const pkg = row.sponsorship_packages;
      if (!pkg?.includes_website_benefit) continue;

      const logoUrl = row.drive_file_id
        ? driveThumbnailUrl(row.drive_file_id)
        : (row.logo_url || "");
      if (!logoUrl) continue;

      items.push({
        id: row.id,
        company_name: row.company_name,
        logo_url: logoUrl,
        website_url: row.website_url || "#",
      });
    }
  }

  // Dedupe by company_name (legacy first)
  const seen = new Set<string>();
  const deduped = items.filter((i) => {
    const key = i.company_name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  deduped.sort((a, b) => a.company_name.localeCompare(b.company_name));

  if (deduped.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
        <p className="text-muted-foreground">
          No sponsors yet. Be the first to partner with us!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
      {deduped.map((item) => (
        <Link
          key={item.id}
          href={item.website_url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex aspect-[5/3] items-center justify-center rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-accent/50 hover:bg-white/10"
          title={item.company_name}
        >
          <div className="relative h-full w-full">
            <Image
              src={item.logo_url}
              alt={`${item.company_name} logo`}
              fill
              className="object-contain transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 45vw, (max-width: 1024px) 30vw, 22vw"
              unoptimized={item.logo_url.includes("drive.google.com")}
            />
          </div>
        </Link>
      ))}
    </div>
  );
}
