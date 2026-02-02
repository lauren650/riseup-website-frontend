'use client';

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

  const handleContactClick = () => {
    const formSection = document.getElementById('interest-form');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Year-Round";
    
    // Parse date without timezone conversion by using the date parts directly
    const [year, month, day] = dateString.split('T')[0].split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    return date.toLocaleDateString("en-US", { 
      month: "long", 
      day: "numeric", 
      year: "numeric",
      timeZone: 'UTC'
    });
  };

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
          className="grid grid-cols-1 gap-6 rounded-xl border border-white/10 bg-background p-6 md:grid-cols-3 md:gap-8 md:p-8"
        >
          {/* Column 1: Package Name & Description */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-3">{pkg.name}</h3>
            {pkg.description && (
              <p className="text-sm text-muted-foreground">
                {pkg.description}
              </p>
            )}
          </div>

          {/* Column 2: What's Included (Benefits) */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">
              What's Included
            </h4>
            {pkg.benefits && pkg.benefits.length > 0 && (
              <ul className="space-y-2">
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
            )}
          </div>

          {/* Column 3: Closing Date & Contact Button (or SOLD OUT for Academy Sponsor) */}
          <div className="flex flex-col items-start md:items-center justify-center gap-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                Available Until
              </p>
              <p className="text-lg font-bold text-white">
                {formatDate(pkg.closing_date)}
              </p>
              {pkg.name === "Academy Sponsor" && (
                <p className="mt-3 text-2xl font-bold text-accent">SOLD OUT</p>
              )}
            </div>
            {pkg.name !== "Academy Sponsor" && (
              <button
                onClick={handleContactClick}
                className="w-full rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Contact for More Info
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
