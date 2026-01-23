import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PricingTable } from "@/components/sponsors/pricing-table";
import { InterestForm } from "@/components/sponsors/interest-form";
import { EditableHeroImage } from "@/components/sections/editable-hero-image";

export const metadata: Metadata = {
  title: "Become a Partner | RiseUp Youth Football League",
  description:
    "Support youth athletics by becoming a partner. View partnership packages and express your interest.",
};

export default async function BecomeAPartnerPage() {
  const supabase = await createClient();
  const { data: packages } = await supabase
    .from("sponsorship_packages")
    .select("*")
    .order("cost", { ascending: true });

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] overflow-hidden">
        <EditableHeroImage
          contentKey="become_a_partner.hero"
          src="/images/partners-hero.jpg"
          alt="RiseUp Partners and Community"
          page="become-a-partner"
          section="hero"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80 pointer-events-none" />
      </section>

      {/* Opening Section */}
      <section className="bg-white/5 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="mb-16 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            Become a Partner
          </h1>
        </div>

        {/* Impact Stats Section */}
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-8 text-center text-3xl font-bold text-white md:text-4xl">
            Your Brand, Front and Center
          </h2>
          <p className="mx-auto mb-12 max-w-3xl text-center text-lg leading-relaxed text-muted-foreground">
            When you partner with RiseUp, you&apos;re not just supporting youth sports—you&apos;re 
            getting your brand in front of an engaged, growing community.
          </p>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Game Day Attendance */}
            <div className="rounded-xl border border-white/10 bg-background p-8 text-center">
              <h3 className="mb-3 text-2xl font-bold text-white">
                Packed Game Days
              </h3>
              <p className="text-muted-foreground">
                Hundreds of families fill the stands every game day, creating prime visibility 
                for your brand where it matters most—in the community.
              </p>
            </div>

            {/* Social Media Growth */}
            <div className="rounded-xl border border-white/10 bg-background p-8 text-center">
              <h3 className="mb-3 text-2xl font-bold text-white">
                Growing Social Reach
              </h3>
              <p className="text-muted-foreground">
                Our social media presence is expanding rapidly, connecting your brand 
                with parents, families, and community supporters across Moore County and beyond.
              </p>
            </div>

            {/* Community Visibility */}
            <div className="rounded-xl border border-white/10 bg-background p-8 text-center">
              <h3 className="mb-3 text-2xl font-bold text-white">
                Walking Billboards
              </h3>
              <p className="text-muted-foreground">
                Hundreds of kids running around Moore County in RiseUp shirts means 
                your brand gets seen everywhere—at schools, parks, and community events.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Table Section */}
      <section className="pt-8 pb-16 md:pt-12 md:pb-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold text-white md:text-4xl">
            Partnership Packages
          </h2>

          <PricingTable packages={packages || []} />
        </div>
      </section>

      {/* Interest Form Section */}
      <section id="interest-form" className="py-16 md:py-24">
        <div className="mx-auto max-w-xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              Express Your Interest
            </h2>
            <p className="mt-4 text-muted-foreground">
              Fill out the form below and a member of our team will reach out
              within 2-3 business days to discuss partnership opportunities and
              answer any questions.
            </p>
          </div>

          {/* Form Container */}
          <div className="mt-10 rounded-xl border border-white/10 bg-white/5 p-8">
            <InterestForm />
          </div>
        </div>
      </section>
    </>
  );
}
