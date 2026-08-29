import Image from "next/image";
import Link from "next/link";
import type { Partner } from "@/lib/partners";

interface SponsorGridProps {
  partners: Partner[];
  compact?: boolean;
  centered?: boolean;
}

function getPartnerInitials(name: string): string {
  const parts = name
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) return "RP";
  return parts
    .slice(0, 3)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function SponsorGrid({
  partners,
  compact = false,
  centered = false,
}: SponsorGridProps) {
  if (partners.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
        <p className="text-muted-foreground">
          Partner profiles will appear here soon.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`${centered && !compact ? "md:mx-auto md:max-w-5xl" : ""} grid gap-6 ${compact ? "md:grid-cols-3 lg:grid-cols-4" : "md:grid-cols-2 lg:grid-cols-3"}`}
    >
      {partners.map((partner) => (
        <article
          key={partner.id}
          className={`rounded-xl border border-white/10 bg-background transition-colors hover:border-accent/50 ${
            compact ? "p-5" : "p-6"
          }`}
        >
          <div className={`mb-5 flex aspect-[5/3] items-center justify-center rounded-lg border border-white/20 ${
            partner.id === "twentyfore" ? "bg-black" : "bg-white"
          } ${
            compact ? "p-3" : "p-4"
          }`}>
            {partner.logoSrc ? (
              <div className="relative h-full w-full">
                <Image
                  src={partner.logoSrc}
                  alt={partner.logoAlt ?? `${partner.name} logo`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 80vw, (max-width: 1024px) 40vw, 30vw"
                  unoptimized={partner.logoSrc.startsWith("http")}
                />
              </div>
            ) : (
              <div className="flex w-full flex-col items-center justify-center gap-2 text-center">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-accent/50 bg-accent/15 text-lg font-bold tracking-wide text-white">
                  {getPartnerInitials(partner.name)}
                </span>
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Logo Pending
                </span>
              </div>
            )}
          </div>

          <h3 className={`${compact ? "text-lg" : "text-xl"} font-semibold text-white`}>
            {partner.name}
          </h3>
          {!compact && (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {partner.description}
            </p>
          )}
          <Link
            href={partner.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-5 inline-flex rounded-full border border-white text-white transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black ${
              compact ? "px-3 py-1.5 text-xs font-semibold" : "px-4 py-2 text-sm font-medium"
            }`}
          >
            {partner.websiteLabel ?? "Visit Website"}
          </Link>
          {partner.campaignUrl && partner.campaignLabel && !compact && (
            <Link
              href={partner.campaignUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-3 mt-5 inline-flex rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black"
            >
              {partner.campaignLabel}
            </Link>
          )}
        </article>
      ))}
    </div>
  );
}
