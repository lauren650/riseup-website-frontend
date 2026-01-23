import type { Metadata } from 'next';
import { SubNavigation } from '@/components/ui/sub-navigation';
import { ParentTestimonials } from '@/components/sections/parent-testimonials';
import { PhotoContentBlockEditable } from '@/components/sections/photo-content-block-editable';
import { QuickReference } from '@/components/ui/quick-reference';
import { EditableHeroImage } from '@/components/sections/editable-hero-image';
import { EditableText } from '@/components/editable/editable-text';

const subNavItems = [
  { id: 'overview', label: 'Overview' },
  { id: 'details', label: 'Event Details' },
  { id: 'what-to-bring', label: 'What to Bring' },
];

const parentTestimonials = [
  {
    quote:
      'The winter clinic was such a great way to keep our kids active and engaged during the off-season. My son loved it!',
    parentName: 'Rachel Johnson',
    playerAge: '8-year-old',
    location: 'Moore County, NC',
  },
  {
    quote:
      'What a fantastic event! The coaches were amazing and my daughter learned so much about speed and agility.',
    parentName: 'Mark Peterson',
    playerAge: '11-year-old',
    location: 'Southern Pines, NC',
  },
  {
    quote:
      'The clinic is perfect for trying out multiple sports. My kids had a blast and came home exhausted in the best way!',
    parentName: 'Lisa Martinez',
    playerAge: '9-year-old twins',
    location: 'Moore County, NC',
  },
];

export const metadata: Metadata = {
  title: 'Winter Youth Sports Clinic | RiseUp Youth Football League',
  description: '3rd Annual Winter Youth Sports Clinic - February 16, 2026. Speed, agility, and athletic fundamentals training for grades K-8. Union Pines High School.',
};

export default function WinterClinicPage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] overflow-hidden">
        <EditableHeroImage
          contentKey="winter_clinic.hero"
          src="/images/clinic-hero.jpg"
          alt="RiseUp Winter Sports Clinic"
          page="winter-clinic"
          section="hero"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80 pointer-events-none" />
      </section>

      {/* Sub Navigation */}
      <SubNavigation 
        items={subNavItems} 
        showRegisterButton={true}
      />

      {/* Overview Section */}
      <section id="overview" className="pt-12 pb-16 md:pt-16 md:pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold text-white md:text-4xl">
            <EditableText
              contentKey="clinic.overview.title"
              as="span"
              page="winter-clinic"
              section="overview"
            >
              2026 Winter Youth Sports Clinic
            </EditableText>
          </h2>

          {/* Two Column Layout */}
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Left Column: Program Information */}
            <div className="space-y-8">
              <div>
                <h3 className="mb-4 text-2xl font-bold text-white">
                  <EditableText
                    contentKey="clinic.overview.welcome_title"
                    as="span"
                    page="winter-clinic"
                    section="overview"
                  >
                    President's Day Clinic
                  </EditableText>
                </h3>
                <EditableText
                  contentKey="clinic.overview.intro"
                  as="p"
                  className="text-lg leading-relaxed text-muted-foreground mb-4"
                  page="winter-clinic"
                  section="overview"
                >
                  Our 3rd annual Winter Youth Sports Clinic Registration will be held <strong className="text-white">Monday, February 16th, 2026 (President's Day!)</strong>
                </EditableText>
                <EditableText
                  contentKey="clinic.overview.description"
                  as="p"
                  className="text-lg leading-relaxed text-muted-foreground"
                  page="winter-clinic"
                  section="overview"
                >
                  This clinic is designed for boy and girl athletes in grades K-8 and will focus on building core skills like speed, agility, and overall athletic fundamentals—skills that will benefit all young athletes, regardless of sport!
                </EditableText>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <h3 className="mb-4 text-xl font-bold text-white">
                  Supporting Our Community
                </h3>
                <EditableText
                  contentKey="clinic.overview.fundraising"
                  as="p"
                  className="text-muted-foreground"
                  page="winter-clinic"
                  section="overview"
                >
                  This clinic also serves as a fundraising effort to provide for our 2026 season— by participating, you'll not only help grow local sports but also have a fun and productive morning!
                </EditableText>
              </div>
            </div>

            {/* Right Column: Key Information */}
            <div>
              <h3 className="mb-4 text-2xl font-bold text-white">
                <EditableText
                  contentKey="clinic.overview.quick_info_title"
                  as="span"
                  page="winter-clinic"
                  section="overview"
                >
                  Quick Information
                </EditableText>
              </h3>
              <div className="space-y-4">
                <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                  <h4 className="text-lg font-bold text-accent mb-2">Who</h4>
                  <EditableText
                    contentKey="clinic.details.who"
                    as="p"
                    className="text-muted-foreground"
                    page="winter-clinic"
                    section="overview"
                  >
                    Open to all boys and girls in grades K-8
                  </EditableText>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                  <h4 className="text-lg font-bold text-accent mb-2">When</h4>
                  <EditableText
                    contentKey="clinic.details.when"
                    as="p"
                    className="text-muted-foreground"
                    page="winter-clinic"
                    section="overview"
                  >
                    Monday, February 16, 2026
                    <br />
                    9:00 AM to Noon
                  </EditableText>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                  <h4 className="text-lg font-bold text-accent mb-2">Where</h4>
                  <EditableText
                    contentKey="clinic.details.where"
                    as="p"
                    className="text-muted-foreground"
                    page="winter-clinic"
                    section="overview"
                  >
                    Union Pines High School Stadium & Practice Fields
                  </EditableText>
                </div>
                <div className="rounded-xl border border-accent/30 bg-accent/5 p-6">
                  <h4 className="text-lg font-bold text-accent mb-2">Cost</h4>
                  <EditableText
                    contentKey="clinic.details.cost"
                    as="p"
                    className="text-white font-semibold text-xl"
                    page="winter-clinic"
                    section="overview"
                  >
                    $50 per participant
                  </EditableText>
                  <EditableText
                    contentKey="clinic.details.cost_note"
                    as="p"
                    className="text-sm text-muted-foreground mt-2"
                    page="winter-clinic"
                    section="overview"
                  >
                    *Payment plan options, scholarships and sibling discounts are available!
                  </EditableText>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 rounded-xl border border-accent/30 bg-accent/5 p-6 md:p-8 max-w-3xl mx-auto">
            <h3 className="mb-4 text-xl font-bold text-white text-center">
              Early Bird Special
            </h3>
            <EditableText
              contentKey="clinic.overview.early_bird"
              as="p"
              className="text-center text-lg text-muted-foreground"
              page="winter-clinic"
              section="overview"
            >
              Sign up by <strong className="text-white">January 30th</strong> to guarantee your athlete receives a participant shirt and personalized name badge!
            </EditableText>
          </div>
        </div>
      </section>

      {/* Event Details Section */}
      <section id="details" className="bg-white/5 pt-12 pb-16 md:pt-16 md:pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-8 text-center text-3xl font-bold text-white md:text-4xl">
            <EditableText
              contentKey="clinic.details.title"
              as="span"
              page="winter-clinic"
              section="details"
            >
              Event Schedule
            </EditableText>
          </h2>

          <div className="mb-12 max-w-3xl mx-auto">
            <div className="rounded-xl border border-white/10 bg-background p-6 md:p-8">
              <div className="mb-6 rounded-lg border border-accent/30 bg-accent/5 p-4">
                <div className="text-center">
                  <div className="text-sm font-semibold text-accent mb-2">📅 Monday, February 16, 2026</div>
                  <div className="text-3xl font-bold text-white">9:00 AM - 12:00 PM</div>
                  <EditableText
                    contentKey="clinic.details.subtitle"
                    as="p"
                    className="text-sm text-muted-foreground mt-2"
                    page="winter-clinic"
                    section="details"
                  >
                    President's Day Holiday
                  </EditableText>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl font-bold text-accent min-w-[80px]">9:00 AM</div>
                    <div>
                      <div className="font-semibold text-white">Check-In & Welcome</div>
                      <EditableText
                        contentKey="clinic.schedule.checkin"
                        as="p"
                        className="text-sm text-muted-foreground mt-1"
                        page="winter-clinic"
                        section="details"
                      >
                        Athletes check in, receive name badges, and group assignments
                      </EditableText>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl font-bold text-accent min-w-[80px]">9:30 AM</div>
                    <div>
                      <div className="font-semibold text-white">Station Rotations Begin</div>
                      <EditableText
                        contentKey="clinic.schedule.stations"
                        as="p"
                        className="text-sm text-muted-foreground mt-1"
                        page="winter-clinic"
                        section="details"
                      >
                        Speed drills, agility courses, footwork training, and fundamentals
                      </EditableText>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl font-bold text-accent min-w-[80px]">10:45 AM</div>
                    <div>
                      <div className="font-semibold text-white">Water Break</div>
                      <EditableText
                        contentKey="clinic.schedule.water"
                        as="p"
                        className="text-sm text-muted-foreground mt-1"
                        page="winter-clinic"
                        section="details"
                      >
                        Hydration and rest before final session
                      </EditableText>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl font-bold text-accent min-w-[80px]">11:00 AM</div>
                    <div>
                      <div className="font-semibold text-white">Team Games & Competition</div>
                      <EditableText
                        contentKey="clinic.schedule.games"
                        as="p"
                        className="text-sm text-muted-foreground mt-1"
                        page="winter-clinic"
                        section="details"
                      >
                        Fun competitive games applying skills learned
                      </EditableText>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl font-bold text-accent min-w-[80px]">12:00 PM</div>
                    <div>
                      <div className="font-semibold text-white">Closing & Pick-Up</div>
                      <EditableText
                        contentKey="clinic.schedule.closing"
                        as="p"
                        className="text-sm text-muted-foreground mt-1"
                        page="winter-clinic"
                        section="details"
                      >
                        Awards, thank you, and parent pick-up
                      </EditableText>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-lg border border-white/10 bg-background p-4">
                <div className="text-sm font-semibold text-accent mb-2">📍 Location</div>
                <EditableText
                  contentKey="clinic.details.location_full"
                  as="p"
                  className="text-white"
                  page="winter-clinic"
                  section="details"
                >
                  Union Pines High School Stadium & Practice Fields
                  <br />
                  <span className="text-muted-foreground text-sm">Check-in at main stadium entrance</span>
                </EditableText>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            <div className="rounded-xl border border-white/10 bg-background p-6">
              <h3 className="mb-3 text-lg font-bold text-accent">Speed Training</h3>
              <EditableText
                contentKey="clinic.focus.speed"
                as="p"
                className="text-sm text-muted-foreground"
                page="winter-clinic"
                section="details"
              >
                Learn proper running form and acceleration techniques
              </EditableText>
            </div>
            <div className="rounded-xl border border-white/10 bg-background p-6">
              <h3 className="mb-3 text-lg font-bold text-accent">Agility Drills</h3>
              <EditableText
                contentKey="clinic.focus.agility"
                as="p"
                className="text-sm text-muted-foreground"
                page="winter-clinic"
                section="details"
              >
                Cone drills, ladder work, and change-of-direction training
              </EditableText>
            </div>
            <div className="rounded-xl border border-white/10 bg-background p-6">
              <h3 className="mb-3 text-lg font-bold text-accent">Athletic Fundamentals</h3>
              <EditableText
                contentKey="clinic.focus.fundamentals"
                as="p"
                className="text-sm text-muted-foreground"
                page="winter-clinic"
                section="details"
              >
                Core skills that translate across all sports
              </EditableText>
            </div>
          </div>
        </div>
      </section>

      {/* What to Bring Section */}
      <section id="what-to-bring" className="pt-12 pb-16 md:pt-16 md:pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-8 text-center text-3xl font-bold text-white md:text-4xl">
            <EditableText
              contentKey="clinic.bring.title"
              as="span"
              page="winter-clinic"
              section="bring"
            >
              What to Bring
            </EditableText>
          </h2>

          <div className="max-w-4xl mx-auto">
            <QuickReference
              title="Athlete Checklist"
              columns={2}
              items={[
                {
                  label: 'Athletic Shoes',
                  value: 'Comfortable running shoes or cleats',
                },
                {
                  label: 'Water Bottle (Labeled)',
                  value: 'Hydration is critical for 3 hours of activity',
                },
                {
                  label: 'Athletic Clothing',
                  value: 'Comfortable workout clothes appropriate for weather',
                },
                {
                  label: 'Sunscreen',
                  value: 'We\'ll be outside - sun protection recommended',
                },
              ]}
            />

            <div className="mt-8 space-y-6">
              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <h3 className="mb-3 text-lg font-bold text-white">Weather Considerations</h3>
                <EditableText
                  contentKey="clinic.bring.weather"
                  as="p"
                  className="text-muted-foreground"
                  page="winter-clinic"
                  section="bring"
                >
                  February weather can be unpredictable! We recommend layering clothing so athletes can adjust as they warm up. A light jacket or sweatshirt is a good idea for the morning start.
                </EditableText>
              </div>

              <div className="rounded-xl border border-accent/30 bg-accent/5 p-6">
                <h3 className="mb-3 text-lg font-bold text-white">Early Registration Benefits</h3>
                <div className="space-y-2 text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <span className="text-accent font-bold">✓</span>
                    <EditableText
                      contentKey="clinic.bring.benefit_1"
                      as="p"
                      page="winter-clinic"
                      section="bring"
                    >
                      Personalized name badge for your athlete
                    </EditableText>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-accent font-bold">✓</span>
                    <EditableText
                      contentKey="clinic.bring.benefit_2"
                      as="p"
                      page="winter-clinic"
                      section="bring"
                    >
                      Participant t-shirt included
                    </EditableText>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-accent font-bold">✓</span>
                    <EditableText
                      contentKey="clinic.bring.benefit_3"
                      as="p"
                      page="winter-clinic"
                      section="bring"
                    >
                      Guaranteed spot in preferred age group
                    </EditableText>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-accent/30">
                  <EditableText
                    contentKey="clinic.bring.deadline_reminder"
                    as="p"
                    className="text-center text-white font-semibold"
                    page="winter-clinic"
                    section="bring"
                  >
                    Register by January 30th to receive these benefits!
                  </EditableText>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-background p-6">
                <h3 className="mb-3 text-lg font-bold text-white">Financial Assistance Available</h3>
                <EditableText
                  contentKey="clinic.bring.assistance"
                  as="p"
                  className="text-muted-foreground"
                  page="winter-clinic"
                  section="bring"
                >
                  Payment plan options, scholarships, and sibling discounts are available! We want every young athlete to have the opportunity to participate. Contact us at{' '}
                  <a href="mailto:admin@riseupmoore.com" className="font-semibold text-accent underline hover:text-accent/80">
                    admin@riseupmoore.com
                  </a>{' '}
                  for more information.
                </EditableText>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-white/5 pt-12 pb-16 md:pt-16 md:pb-24">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            <EditableText
              contentKey="clinic.cta.title"
              as="span"
              page="winter-clinic"
              section="cta"
            >
              Join Us This February!
            </EditableText>
          </h2>
          <EditableText
            contentKey="clinic.cta.description"
            as="p"
            className="mb-8 text-lg text-muted-foreground"
            page="winter-clinic"
            section="cta"
          >
            Make President's Day 2026 a memorable and productive morning for your young athlete.
          </EditableText>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#"
              className="inline-block rounded-full bg-accent px-8 py-4 text-lg font-semibold text-white transition-opacity hover:opacity-90"
            >
              <EditableText
                contentKey="clinic.cta.register_button"
                as="span"
                page="winter-clinic"
                section="cta"
              >
                Register Now
              </EditableText>
            </a>
          </div>
        </div>
      </section>

      {/* Parent Testimonials */}
      <ParentTestimonials testimonials={parentTestimonials} />
    </main>
  );
}
