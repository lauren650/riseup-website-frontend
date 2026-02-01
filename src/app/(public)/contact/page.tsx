import { Metadata } from "next";
import { ReCaptchaProvider } from "next-recaptcha-v3";
import { ContactForm } from "@/components/sections/contact-form";

export const metadata: Metadata = {
  title: "Contact Us | RiseUp Youth Football League",
  description:
    "Get in touch with RiseUp Youth Football League. Contact us about registration, partnerships, volunteering, or any questions about our programs.",
};

function ContactPageContent() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative flex h-[40vh] min-h-[300px] items-end justify-center bg-gradient-to-br from-accent/20 to-transparent">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="relative z-10 pb-12 text-center">
          <h1 className="text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            Contact Us
          </h1>
          <p className="mt-4 text-lg text-muted-foreground md:text-xl">
            We&apos;d love to hear from you
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-xl px-6">
          <h2 className="mb-6 text-center text-2xl font-bold text-white">
            Send Us a Message
          </h2>
          <ContactForm />
        </div>
      </section>
    </>
  );
}

export default function ContactPage() {
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  // Wrap in ReCaptchaProvider if site key is configured
  if (recaptchaSiteKey) {
    return (
      <ReCaptchaProvider reCaptchaKey={recaptchaSiteKey}>
        <ContactPageContent />
      </ReCaptchaProvider>
    );
  }

  // Render without reCAPTCHA for development
  return <ContactPageContent />;
}
