import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PricingTable } from "@/components/sponsors/pricing-table";
import { InterestForm } from "@/components/sponsors/interest-form";
import { ScrollToFormButton } from "./scroll-to-form-button";

export const metadata: Metadata = {
  title: "Become a Sponsor | RiseUp Youth Football League",
  description:
    "Support youth athletics by becoming a sponsor. View sponsorship packages and express your interest.",
};

export default async function BecomeASponsorPage() {
  const supabase = await createClient();
  const { data: packages } = await supabase
    .from("sponsorship_packages")
    .select("*")
    .order("cost", { ascending: true });

  return (
    <>
      {/* Opening Section */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            Become a Sponsor
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground md:text-xl">
            Partner with RiseUp Youth Football League and make a lasting impact
            in our community. Your sponsorship helps provide equipment,
            scholarships, and programs that benefit hundreds of young athletes
            each year.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground md:text-xl">
            As a sponsor, you&apos;ll gain visibility within our community while
            supporting the development of youth athletics. Every sponsorship
            directly contributes to making football accessible to all children,
            regardless of their background.
          </p>
        </div>
      </section>

      {/* Pricing Table Section */}
      <section className="bg-white/5 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold text-white md:text-4xl">
            Sponsorship Packages
          </h2>

          <PricingTable packages={packages || []} />

          {/* CTA Button */}
          <div className="mt-12 text-center">
            <ScrollToFormButton />
          </div>
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
              within 2-3 business days to discuss sponsorship opportunities and
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
