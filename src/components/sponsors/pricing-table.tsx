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
        No partnership packages are currently available. Please check back
        later.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedPackages.map((pkg) => (
        <div
          key={pkg.id}
          className="flex flex-col gap-6 rounded-xl border border-white/10 bg-background p-6 md:flex-row md:items-start md:p-8"
        >
          {/* Left side: Package Name & Description */}
          <div className="md:w-1/3">
            {/* Package Name */}
            <h3 className="text-2xl font-bold text-white">{pkg.name}</h3>

            {/* Description */}
            {pkg.description && (
              <p className="mt-3 text-sm text-muted-foreground">
                {pkg.description}
              </p>
            )}

            {/* Availability note */}
            <p className="mt-4 text-sm text-muted-foreground">
              {pkg.closing_date
                ? `Available until ${new Date(pkg.closing_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
                : "Year-round"}
            </p>
          </div>

          {/* Right side: Benefits list */}
          {pkg.benefits && pkg.benefits.length > 0 && (
            <div className="md:w-2/3">
              <ul className="grid gap-3 sm:grid-cols-2">
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
                    <span className="text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
