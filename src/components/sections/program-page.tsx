import Link from "next/link";
import { CoachBio } from "./coach-bio";
import { SafetySection } from "./safety-section";
import { cn } from "@/lib/utils";

export interface AgeGroup {
  name: string;
  ages: string;
  description: string;
}

export interface ScheduleItem {
  day: string;
  time: string;
  location: string;
}

export interface CostItem {
  item: string;
  price: string;
  notes?: string;
}

export interface Coach {
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
}

export interface ProgramPageProps {
  title: string;
  subtitle: string;
  heroImage: string;
  description: string;
  ageGroups: AgeGroup[];
  schedule: ScheduleItem[];
  costs: CostItem[];
  coaches: Coach[];
  safetyProtocols?: string[];
  ctaText: string;
  ctaLink: string;
}

export function ProgramPage({
  title,
  subtitle,
  heroImage,
  description,
  ageGroups,
  schedule,
  costs,
  coaches,
  safetyProtocols,
  ctaText,
  ctaLink,
}: ProgramPageProps) {
  return (
    <main>
      {/* Hero Section */}
      <section
        className="relative flex h-[40vh] min-h-[300px] items-end justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="relative z-10 pb-12 text-center">
          <h1 className="text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground md:text-xl">
            {subtitle}
          </p>
        </div>
      </section>

      {/* Description Section */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-lg leading-relaxed text-muted-foreground md:text-xl">
            {description}
          </p>
        </div>
      </section>

      {/* Age Groups Section */}
      <section className="bg-white/5 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold text-white md:text-4xl">
            Age Groups
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ageGroups.map((group, index) => (
              <div
                key={index}
                className="rounded-xl border border-white/10 bg-background p-6"
              >
                <h3 className="text-xl font-bold text-white">{group.name}</h3>
                <p className="mt-1 text-accent">{group.ages}</p>
                <p className="mt-3 text-muted-foreground">{group.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold text-white md:text-4xl">
            Schedule
          </h2>
          <div className="overflow-hidden rounded-xl border border-white/10">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Day
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Time
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Location
                  </th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((item, index) => (
                  <tr
                    key={index}
                    className={cn(
                      "border-b border-white/10 last:border-0",
                      index % 2 === 1 && "bg-white/5"
                    )}
                  >
                    <td className="px-6 py-4 text-muted-foreground">
                      {item.day}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {item.time}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {item.location}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Costs Section */}
      <section className="bg-white/5 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold text-white md:text-4xl">
            Pricing
          </h2>
          <div className="grid gap-4">
            {costs.map((cost, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-background p-6"
              >
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {cost.item}
                  </h3>
                  {cost.notes && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {cost.notes}
                    </p>
                  )}
                </div>
                <span className="text-2xl font-bold text-accent">
                  {cost.price}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coaches Section */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold text-white md:text-4xl">
            Meet Our Coaches
          </h2>
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            {coaches.map((coach, index) => (
              <CoachBio
                key={index}
                name={coach.name}
                role={coach.role}
                bio={coach.bio}
                imageUrl={coach.imageUrl}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Safety Section (if protocols provided) */}
      {safetyProtocols && safetyProtocols.length > 0 && (
        <SafetySection protocols={safetyProtocols} />
      )}

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Ready to Join?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Take the first step toward an amazing football experience.
          </p>
          <Link
            href={ctaLink}
            className="mt-8 inline-block rounded-full bg-accent px-8 py-4 text-lg font-semibold text-white transition-opacity hover:opacity-90"
          >
            {ctaText}
          </Link>
        </div>
      </section>
    </main>
  );
}
