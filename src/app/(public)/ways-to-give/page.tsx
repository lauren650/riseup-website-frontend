import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ways to Give | RiseUp Youth Football League",
  description:
    "Support RiseUp Youth Football League through donations, volunteering, or corporate sponsorship. Every contribution helps young athletes succeed.",
};

const impactStatements = [
  {
    amount: "$50",
    impact: "Provides equipment for one player",
    description: "Cleats, mouthguard, and practice gear for a season",
    icon: "🏈",
  },
  {
    amount: "$100",
    impact: "Sponsors a player's registration",
    description: "Covers full registration fees for one child",
    icon: "🎟️",
  },
  {
    amount: "$250",
    impact: "Funds coaching certification",
    description: "USA Football certification for one volunteer coach",
    icon: "📋",
  },
  {
    amount: "$500",
    impact: "Funds a team for a season",
    description: "Equipment, uniforms, and supplies for 15 players",
    icon: "👕",
  },
];

export default function WaysToGivePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative flex h-[40vh] min-h-[300px] items-end justify-center bg-gradient-to-br from-accent/20 to-transparent">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="relative z-10 pb-12 text-center">
          <h1 className="text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            Support RiseUp
          </h1>
          <p className="mt-4 text-lg text-muted-foreground md:text-xl">
            Your generosity changes lives
          </p>
        </div>
      </section>

      {/* Impact Statements */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-4 text-center text-3xl font-bold text-white md:text-4xl">
            Your Impact
          </h2>
          <p className="mb-12 text-center text-lg text-muted-foreground">
            See how your donation makes a difference
          </p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {impactStatements.map((item, index) => (
              <div
                key={index}
                className="rounded-xl border border-white/10 bg-white/5 p-6 text-center"
              >
                <span className="text-4xl">{item.icon}</span>
                <p className="mt-4 text-3xl font-bold text-accent">
                  {item.amount}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-white">
                  {item.impact}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Donation Section - GiveButter Placeholder */}
      <section className="bg-white/5 py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-8 text-center text-3xl font-bold text-white md:text-4xl">
            Make a Donation
          </h2>

          {/* GiveButter embed placeholder - will be replaced in Phase 2 */}
          <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-dashed border-white/20 bg-background p-8">
            <div className="text-center">
              <p className="text-lg text-muted-foreground">
                Donation form coming soon
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                GiveButter integration will be added in Phase 2
              </p>
              <Link
                href="/contact"
                className="mt-6 inline-block rounded-full bg-accent px-6 py-3 font-semibold text-black transition-opacity hover:opacity-90"
              >
                Contact Us to Donate
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Other Ways to Give */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold text-white md:text-4xl">
            Other Ways to Give
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {/* Volunteer */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-8">
              <h3 className="text-xl font-bold text-white">Volunteer</h3>
              <p className="mt-4 text-muted-foreground">
                Share your time and talents. We need coaches, team parents, event
                volunteers, and more. No football experience required!
              </p>
              <Link
                href="/contact"
                className="mt-6 inline-block text-accent hover:underline"
              >
                Get Involved →
              </Link>
            </div>

            {/* Corporate Sponsorship */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-8">
              <h3 className="text-xl font-bold text-white">
                Corporate Sponsorship
              </h3>
              <p className="mt-4 text-muted-foreground">
                Partner with RiseUp and showcase your company&apos;s commitment to
                youth development. Multiple sponsorship levels available.
              </p>
              <Link
                href="/partners"
                className="mt-6 inline-block text-accent hover:underline"
              >
                Learn More →
              </Link>
            </div>

            {/* In-Kind Donations */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-8">
              <h3 className="text-xl font-bold text-white">In-Kind Donations</h3>
              <p className="mt-4 text-muted-foreground">
                Donate equipment, supplies, or services. We accept gently used
                football equipment, snacks for game days, and professional
                services.
              </p>
              <Link
                href="/contact"
                className="mt-6 inline-block text-accent hover:underline"
              >
                Contact Us →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tax Information */}
      <section className="bg-white/5 py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Tax-Deductible Giving
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            RiseUp Youth Football League is a registered 501(c)(3) nonprofit
            organization. All donations are tax-deductible to the fullest extent
            allowed by law. You will receive a receipt for your records.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            EIN: XX-XXXXXXX
          </p>
        </div>
      </section>
    </>
  );
}
