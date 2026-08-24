import { Metadata } from "next";
import Link from "next/link";
import { SponsorGrid } from "@/components/sponsors/sponsor-grid";
import { partners } from "@/lib/partners";

export const metadata: Metadata = {
  title: "Our Partners | RiseUp Youth Football League",
  description:
    "Meet the partners who make RiseUp Youth Football League possible. Learn how your organization can support youth athletics.",
};

const titleSponsor = partners.find((partner) => partner.tier === "title");
const majorPartners = partners.filter((partner) => partner.tier === "major");
const blueLevelPartners = partners.filter((partner) => partner.tier === "blue");

export default function PartnersPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative flex h-[40vh] min-h-[300px] items-end justify-center bg-gradient-to-br from-accent/20 to-transparent">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="relative z-10 pb-12 text-center">
          {titleSponsor && (
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-accent">
              Title Sponsor: {titleSponsor.name}
            </p>
          )}
          <h1 className="text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            Our Partners
          </h1>
          <p className="mt-4 text-lg text-muted-foreground md:text-xl">
            Organizations helping us empower youth through football
          </p>
        </div>
      </section>

      {/* Title Sponsor Spotlight */}
      {titleSponsor && (
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-6xl px-6">
            <article className="rounded-xl border border-accent/60 bg-accent/10 p-8 md:p-12">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
                Title Sponsor
              </p>
              <h2 className="mt-3 text-3xl font-bold text-white md:text-5xl">
                {titleSponsor.name}
              </h2>
              <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
                {titleSponsor.description}
              </p>
              <div className="mt-8">
                <Link
                  href={titleSponsor.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex rounded-full bg-accent px-8 py-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black"
                >
                  {titleSponsor.websiteLabel ?? "Visit Sponsor"}
                </Link>
              </div>
            </article>
          </div>
        </section>
      )}

      {/* Introduction */}
      <section className="bg-white/5 py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-lg leading-relaxed text-muted-foreground md:text-xl">
            Our partners play a vital role in making youth football
            accessible to all. Their generous support helps provide equipment,
            scholarships, and programming that benefits hundreds of young athletes
            each year.
          </p>
          <p className="mt-4 text-base text-muted-foreground">
            Every logo you see below represents real community investment in our
            players, families, and future leaders.
          </p>
        </div>
      </section>

      {/* Premier Partner Showcase */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold text-white md:text-4xl">
            Premier Partners
          </h2>
          <SponsorGrid partners={majorPartners} />
        </div>
      </section>

      {/* Blue Level Sponsors */}
      <section className="bg-white/5 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold text-white md:text-4xl">
            Blue Level Sponsors
          </h2>
          <SponsorGrid partners={blueLevelPartners} compact />
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Interested in joining this list? Start with our partner packages below.
          </p>
        </div>
      </section>

      {/* Become a Partner CTA */}
      <section className="bg-white/5 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Become a Partner
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Ready to make an impact with us? Explore partnership packages and join
            the organizations investing in young athletes across our community.
          </p>
          <div className="mt-8">
            <Link
              href="/become-a-partner"
              className="inline-flex rounded-full bg-accent px-8 py-4 text-lg font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black"
            >
              View Partnership Opportunities
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
