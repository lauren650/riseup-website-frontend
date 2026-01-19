import { Metadata } from "next";
import Link from "next/link";
import { GivebutterWidget } from "@/components/donations/givebutter-widget";

export const metadata: Metadata = {
  title: "Ways to Give | RiseUp Youth Football League",
  description:
    "Support RiseUp Youth Football League through donations, volunteering, or corporate sponsorship. Every contribution helps young athletes succeed.",
};

export default function WaysToGivePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative flex h-[25vh] min-h-[200px] items-center justify-center bg-gradient-to-br from-accent/20 to-transparent pt-16">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="relative z-10 text-center">
          <h1 className="text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            Support RiseUp
          </h1>
        </div>
      </section>

      {/* Donation Section - GiveButter Widget */}
      <section className="bg-white/5 pt-8 pb-12 md:pt-10 md:pb-16">
        <div className="mx-auto max-w-3xl px-6">
          <GivebutterWidget align="center" />
          
          {/* Tax-Deductible Note */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              RiseUp Youth Football League is a registered 501(c)(3) nonprofit organization. All donations are tax-deductible to the fullest extent allowed by law.
            </p>
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

    </>
  );
}
