import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";
import Image from "next/image";
import Link from "next/link";

type Sponsor = Tables<"sponsors">;

/**
 * SponsorGrid - Displays approved sponsors in a responsive grid
 * Server component that fetches approved sponsors from database
 */
export async function SponsorGrid() {
  const supabase = await createClient();

  // Fetch only approved sponsors, ordered by company name
  const { data: sponsors, error } = await supabase
    .from("sponsors")
    .select("*")
    .eq("status", "approved")
    .order("company_name")
    .returns<Sponsor[]>();

  if (error) {
    console.error("Failed to fetch sponsors:", error);
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
        <p className="text-muted-foreground">
          Unable to load sponsors at this time.
        </p>
      </div>
    );
  }

  if (!sponsors || sponsors.length === 0) {
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
      {sponsors.map((sponsor) => (
        <Link
          key={sponsor.id}
          href={sponsor.website_url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex aspect-[5/3] items-center justify-center rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-accent/50 hover:bg-white/10"
          title={sponsor.company_name}
        >
          <div className="relative h-full w-full">
            <Image
              src={sponsor.logo_url}
              alt={`${sponsor.company_name} logo`}
              fill
              className="object-contain transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 45vw, (max-width: 1024px) 30vw, 22vw"
            />
          </div>
        </Link>
      ))}
    </div>
  );
}
