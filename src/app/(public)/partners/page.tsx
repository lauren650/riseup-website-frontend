import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Partners | RiseUp Youth Football League",
  description:
    "Meet the sponsors and partners who make RiseUp Youth Football League possible. Learn how your organization can support youth athletics.",
};

export default function PartnersPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative flex h-[40vh] min-h-[300px] items-end justify-center bg-gradient-to-br from-accent/20 to-transparent">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="relative z-10 pb-12 text-center">
          <h1 className="text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            Our Partners
          </h1>
          <p className="mt-4 text-lg text-muted-foreground md:text-xl">
            Thank you to the organizations that support our mission
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-lg leading-relaxed text-muted-foreground md:text-xl">
            Our partners and sponsors play a vital role in making youth football
            accessible to all. Their generous support helps provide equipment,
            scholarships, and programming that benefits hundreds of young athletes
            each year.
          </p>
        </div>
      </section>

      {/* Partner Logos Grid */}
      <section className="bg-white/5 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold text-white md:text-4xl">
            Our Sponsors
          </h2>

          {/* Placeholder for dynamic sponsor logos - Phase 2 */}
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {/* These will be replaced with dynamic content in Phase 2 */}
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="flex aspect-[3/2] items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/5 p-6"
              >
                <span className="text-sm text-muted-foreground">
                  Partner Logo
                </span>
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-muted-foreground">
            Partner logos will be displayed here. Sponsors can submit their
            information through our self-service portal.
          </p>
        </div>
      </section>

      {/* Become a Partner CTA */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Become a Partner
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Partner with RiseUp Youth Football League and make a lasting impact in
            our community. We offer various sponsorship levels with benefits
            including logo placement, event recognition, and community engagement
            opportunities.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/contact"
              className="inline-block rounded-full bg-accent px-8 py-4 text-lg font-semibold text-black transition-opacity hover:opacity-90"
            >
              Contact Us About Sponsorship
            </Link>
          </div>
        </div>
      </section>

      {/* Sponsorship Levels */}
      <section className="bg-white/5 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold text-white md:text-4xl">
            Sponsorship Levels
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-background p-8 text-center">
              <h3 className="text-2xl font-bold text-white">Bronze</h3>
              <p className="mt-2 text-3xl font-bold text-accent">$500</p>
              <ul className="mt-6 space-y-3 text-left text-muted-foreground">
                <li>• Logo on website</li>
                <li>• Social media recognition</li>
                <li>• Certificate of appreciation</li>
              </ul>
            </div>
            <div className="rounded-xl border-2 border-accent bg-background p-8 text-center">
              <h3 className="text-2xl font-bold text-white">Silver</h3>
              <p className="mt-2 text-3xl font-bold text-accent">$1,000</p>
              <ul className="mt-6 space-y-3 text-left text-muted-foreground">
                <li>• All Bronze benefits</li>
                <li>• Logo on team banners</li>
                <li>• Event booth opportunity</li>
              </ul>
            </div>
            <div className="rounded-xl border border-white/10 bg-background p-8 text-center">
              <h3 className="text-2xl font-bold text-white">Gold</h3>
              <p className="mt-2 text-3xl font-bold text-accent">$2,500</p>
              <ul className="mt-6 space-y-3 text-left text-muted-foreground">
                <li>• All Silver benefits</li>
                <li>• Logo on team jerseys</li>
                <li>• VIP game day experience</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
