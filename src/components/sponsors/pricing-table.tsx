import { Tables } from "@/lib/supabase/types";

type SponsorshipPackage = Tables<"sponsorship_packages">;

interface PricingTableProps {
  packages: SponsorshipPackage[];
}

export function PricingTable({ packages }: PricingTableProps) {
  // Filter out packages where closing_date is in the past
  const now = new Date();
  const availablePackages = packages.filter((pkg) => {
    if (!pkg.closing_date) return true;
    return new Date(pkg.closing_date) > now;
  });

  // Sort by cost ascending
  const sortedPackages = [...availablePackages].sort(
    (a, b) => a.cost - b.cost
  );

  if (sortedPackages.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        No sponsorship packages are currently available. Please check back
        later.
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {sortedPackages.map((pkg) => (
        <div
          key={pkg.id}
          className="flex flex-col rounded-xl border border-white/10 bg-background p-8"
        >
          {/* Package Name */}
          <h3 className="text-2xl font-bold text-white">{pkg.name}</h3>

          {/* Price - cost is in cents */}
          <p className="mt-2 text-3xl font-bold text-accent">
            ${(pkg.cost / 100).toLocaleString()}
          </p>

          {/* Description */}
          {pkg.description && (
            <p className="mt-3 text-sm text-muted-foreground">
              {pkg.description}
            </p>
          )}

          {/* Benefits list */}
          {pkg.benefits && pkg.benefits.length > 0 && (
            <ul className="mt-6 flex-1 space-y-3">
              {pkg.benefits.map((benefit, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-muted-foreground"
                >
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Availability note */}
          <p className="mt-6 text-sm text-muted-foreground">
            {pkg.closing_date
              ? `Available until ${new Date(pkg.closing_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
              : "Year-round"}
          </p>
        </div>
      ))}
    </div>
  );
}
