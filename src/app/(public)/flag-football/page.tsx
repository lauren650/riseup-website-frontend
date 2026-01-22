import type { Metadata } from 'next';
import Link from 'next/link';
import { SubNavigation } from '@/components/ui/sub-navigation';
import { ParentTestimonials } from '@/components/sections/parent-testimonials';
import { PhotoContentBlockEditable } from '@/components/sections/photo-content-block-editable';
import { QuickReference } from '@/components/ui/quick-reference';
import { EditableHeroImage } from '@/components/sections/editable-hero-image';
import { EditableText } from '@/components/editable/editable-text';

const subNavItems = [
  { id: 'overview', label: 'Overview' },
  { id: 'registration', label: 'Registration' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'equipment', label: 'What\'s Included' },
  { id: 'get-involved', label: 'Get Involved' },
];

const parentTestimonials = [
  {
    quote:
      'My daughter loves being part of the RiseUp Girls Flag Football team. The coaches are so supportive and focused on building confidence!',
    parentName: 'Jennifer Williams',
    playerAge: '11-year-old',
    location: 'Moore County, NC',
  },
  {
    quote:
      'Flag football has been perfect for teaching teamwork and leadership. She looks forward to every practice!',
    parentName: 'David Patterson',
    playerAge: '13-year-old',
    location: 'Whispering Pines, NC',
  },
  {
    quote:
      'The NFL FLAG program is top-notch. My daughter has grown so much in confidence and athletic ability.',
    parentName: 'Maria Rodriguez',
    playerAge: '9-year-old',
    location: 'Southern Pines, NC',
  },
];

export const metadata: Metadata = {
  title: 'Girls Flag Football | RiseUp Youth Football League',
  description: 'RiseUp Moore Girls Flag Football League aligned with NFL FLAG. Non-contact, high-action football for girls grades 3-12 in Moore County, NC.',
};

export default function FlagFootballPage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] overflow-hidden">
        <EditableHeroImage
          contentKey="flag_football.hero"
          src="/images/flag-football-hero.jpg"
          alt="RiseUp Girls Flag Football Players"
          page="flag-football"
          section="hero"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80 pointer-events-none" />
      </section>

      {/* Sub Navigation */}
      <SubNavigation 
        items={subNavItems} 
        showRegisterButton={false}
      />

      {/* Overview Section */}
      <section id="overview" className="pt-12 pb-16 md:pt-16 md:pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold text-white md:text-4xl">
            <EditableText
              contentKey="flag.overview.title"
              as="span"
              page="flag-football"
              section="overview"
            >
              RiseUp Moore Girls Flag Football 2025 Season
            </EditableText>
          </h2>

          {/* Two Column Layout */}
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Left Column: Program Information */}
            <div className="space-y-8">
              <div>
                <h3 className="mb-4 text-2xl font-bold text-white">
                  <EditableText
                    contentKey="flag.overview.about_title"
                    as="span"
                    page="flag-football"
                    section="overview"
                  >
                    About Our Girls Flag Football League
                  </EditableText>
                </h3>
                <EditableText
                  contentKey="flag.overview.description"
                  as="p"
                  className="text-lg leading-relaxed text-muted-foreground"
                  page="flag-football"
                  section="overview"
                >
                  We're proud to announce the launch of our Girls Flag Football League, officially aligned with the NFL FLAG program — the fastest-growing youth sport in America! This season, we're bringing the energy, excitement, and empowerment of flag football to girls across Moore County! Our league is designed to build confidence, competition, and community — all in a fun, supportive environment.
                </EditableText>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <h3 className="mb-4 text-xl font-bold text-white">
                  NFL FLAG Certified Program
                </h3>
                <div className="space-y-4 text-muted-foreground">
                  <EditableText
                    contentKey="flag.overview.nfl_flag_p1"
                    as="p"
                    page="flag-football"
                    section="overview"
                  >
                    Our program is officially aligned with the NFL FLAG program, following their standards for development and play. All coaches are certified and focused on creating a positive, empowering environment for female athletes.
                  </EditableText>
                  <EditableText
                    contentKey="flag.overview.nfl_flag_p2"
                    as="p"
                    page="flag-football"
                    section="overview"
                  >
                    We believe in developing complete athletes—teaching not just football skills, but leadership, teamwork, and resilience that will serve them on and off the field.
                  </EditableText>
                </div>
              </div>
            </div>

            {/* Right Column: Age Divisions */}
            <div>
              <h3 className="mb-4 text-2xl font-bold text-white">
                <EditableText
                  contentKey="flag.overview.age_divisions_title"
                  as="span"
                  page="flag-football"
                  section="overview"
                >
                  Who Can Play?
                </EditableText>
              </h3>
              <EditableText
                contentKey="flag.overview.age_note"
                as="p"
                className="mb-6 text-sm text-muted-foreground"
                page="flag-football"
                section="overview"
              >
                All girls in grades 3-12 are welcome to join!
              </EditableText>
              <div className="space-y-4">
                <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                  <h4 className="text-2xl font-bold text-accent">
                    <EditableText
                      contentKey="flag.divisions.elementary.grades"
                      as="span"
                      page="flag-football"
                      section="overview"
                    >
                      Elementary Division
                    </EditableText>
                  </h4>
                  <EditableText
                    contentKey="flag.divisions.elementary.ages"
                    as="p"
                    className="mt-2 text-sm font-semibold text-white"
                    page="flag-football"
                    section="overview"
                  >
                    3rd-5th Grade
                  </EditableText>
                  <EditableText
                    contentKey="flag.divisions.elementary.description"
                    as="p"
                    className="mt-2 text-sm text-muted-foreground"
                    page="flag-football"
                    section="overview"
                  >
                    Introduction to flag football with focus on fundamentals and fun
                  </EditableText>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                  <h4 className="text-2xl font-bold text-accent">
                    <EditableText
                      contentKey="flag.divisions.middle.grades"
                      as="span"
                      page="flag-football"
                      section="overview"
                    >
                      Middle School Division
                    </EditableText>
                  </h4>
                  <EditableText
                    contentKey="flag.divisions.middle.ages"
                    as="p"
                    className="mt-2 text-sm font-semibold text-white"
                    page="flag-football"
                    section="overview"
                  >
                    6th-8th Grade
                  </EditableText>
                  <EditableText
                    contentKey="flag.divisions.middle.description"
                    as="p"
                    className="mt-2 text-sm text-muted-foreground"
                    page="flag-football"
                    section="overview"
                  >
                    Advanced skills development and competitive play
                  </EditableText>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                  <h4 className="text-2xl font-bold text-accent">
                    <EditableText
                      contentKey="flag.divisions.high.grades"
                      as="span"
                      page="flag-football"
                      section="overview"
                    >
                      High School Division
                    </EditableText>
                  </h4>
                  <EditableText
                    contentKey="flag.divisions.high.ages"
                    as="p"
                    className="mt-2 text-sm font-semibold text-white"
                    page="flag-football"
                    section="overview"
                  >
                    9th-12th Grade
                  </EditableText>
                  <EditableText
                    contentKey="flag.divisions.high.description"
                    as="p"
                    className="mt-2 text-sm text-muted-foreground"
                    page="flag-football"
                    section="overview"
                  >
                    Elite-level competition and leadership opportunities
                  </EditableText>
                </div>
              </div>
            </div>
          </div>

          {/* Why Girls Flag Section */}
          <div className="mt-16">
            <h3 className="mb-8 text-center text-2xl font-bold text-white md:text-3xl">
              <EditableText
                contentKey="flag.overview.why_title"
                as="span"
                page="flag-football"
                section="overview"
              >
                Why Girls Flag Football?
              </EditableText>
            </h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-white/10 bg-background p-6">
                <h4 className="mb-3 text-lg font-bold text-accent">Non-Contact & High-Action</h4>
                <EditableText
                  contentKey="flag.overview.why_noncontact"
                  as="p"
                  className="text-sm text-muted-foreground"
                  page="flag-football"
                  section="overview"
                >
                  All the excitement of football without tackles or collisions
                </EditableText>
              </div>
              <div className="rounded-xl border border-white/10 bg-background p-6">
                <h4 className="mb-3 text-lg font-bold text-accent">Teamwork & Leadership</h4>
                <EditableText
                  contentKey="flag.overview.why_teamwork"
                  as="p"
                  className="text-sm text-muted-foreground"
                  page="flag-football"
                  section="overview"
                >
                  Teaches teamwork, leadership, and discipline in a supportive environment
                </EditableText>
              </div>
              <div className="rounded-xl border border-white/10 bg-background p-6">
                <h4 className="mb-3 text-lg font-bold text-accent">Athletic Development</h4>
                <EditableText
                  contentKey="flag.overview.why_athletic"
                  as="p"
                  className="text-sm text-muted-foreground"
                  page="flag-football"
                  section="overview"
                >
                  Builds speed, agility, coordination, and football IQ
                </EditableText>
              </div>
              <div className="rounded-xl border border-white/10 bg-background p-6">
                <h4 className="mb-3 text-lg font-bold text-accent">Empowering Community</h4>
                <EditableText
                  contentKey="flag.overview.why_community"
                  as="p"
                  className="text-sm text-muted-foreground"
                  page="flag-football"
                  section="overview"
                >
                  Empowering space for girls to compete, have fun, and build confidence
                </EditableText>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Section */}
      <section id="registration" className="bg-white/5 pt-12 pb-16 md:pt-16 md:pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-8 text-center text-3xl font-bold text-white md:text-4xl">
            <EditableText
              contentKey="flag.registration.title"
              as="span"
              page="flag-football"
              section="registration"
            >
              Registration Information
            </EditableText>
          </h2>

          <div className="mb-6 space-y-8">
            <div className="rounded-xl border border-accent/30 bg-accent/5 p-6 md:p-8">
              <h3 className="mb-4 text-2xl font-bold text-white text-center">
                <EditableText
                  contentKey="flag.registration.deadline_title"
                  as="span"
                  page="flag-football"
                  section="registration"
                >
                  REGISTER NOW! LAST DAY FOR REGISTRATION IS AUGUST 31st!
                </EditableText>
              </h3>
            </div>

            <div className="rounded-xl border border-white/10 bg-background p-6 md:p-8">
              <h3 className="mb-4 text-xl font-bold text-white">
                <EditableText
                  contentKey="flag.registration.jersey_title"
                  as="span"
                  page="flag-football"
                  section="registration"
                >
                  Important: Jersey Sizing
                </EditableText>
              </h3>
              <div className="space-y-4 text-muted-foreground">
                <EditableText
                  contentKey="flag.registration.jersey_warning"
                  as="p"
                  page="flag-football"
                  section="registration"
                >
                  <strong className="text-accent">Please see NFL Sizing Guide below to properly select your jersey size!</strong> Jersey sizes cannot be changed once the registration is submitted.
                </EditableText>
                <EditableText
                  contentKey="flag.registration.jersey_note"
                  as="p"
                  className="text-sm"
                  page="flag-football"
                  section="registration"
                >
                  *There are no Adult Small jerseys, you may consider Youth X-Large as an alternative*
                </EditableText>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-background p-6 md:p-8">
              <h3 className="mb-4 text-xl font-bold text-white">
                <EditableText
                  contentKey="flag.registration.refund_title"
                  as="span"
                  page="flag-football"
                  section="registration"
                >
                  Refund Policy
                </EditableText>
              </h3>
              <EditableText
                contentKey="flag.registration.refund_policy"
                as="p"
                className="text-muted-foreground"
                page="flag-football"
                section="registration"
              >
                <strong className="text-white">All registration fees are non-refundable, without exception.</strong> This policy is in place due to our contractual obligations with the NFL, which require full payment for each participant upon registration.
              </EditableText>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-6 md:p-8">
              <h3 className="mb-4 text-xl font-bold text-white">
                <EditableText
                  contentKey="flag.registration.optional_title"
                  as="span"
                  page="flag-football"
                  section="registration"
                >
                  Additional Purchases
                </EditableText>
              </h3>
              <EditableText
                contentKey="flag.registration.optional_description"
                as="p"
                className="text-muted-foreground"
                page="flag-football"
                section="registration"
              >
                Please note that any additional purchases made during registration are optional and will be shipped in a bulk team order at the start of the season.
              </EditableText>
            </div>

            <div
              id="scholarship"
              className="rounded-xl border border-accent/30 bg-accent/5 p-6 md:p-8"
            >
              <h3 className="mb-4 text-xl font-bold text-white">
                <EditableText
                  contentKey="flag.registration.scholarship_title"
                  as="span"
                  page="flag-football"
                  section="registration"
                >
                  Scholarship Opportunities
                </EditableText>
              </h3>
              <EditableText
                contentKey="flag.registration.scholarship_intro"
                as="p"
                className="mb-4 text-muted-foreground"
                page="flag-football"
                section="registration"
              >
                RiseUp is committed to making flag football accessible to all girls
                in our community. Financial assistance is available for families
                in need.
              </EditableText>
              <EditableText
                contentKey="flag.registration.scholarship_contact"
                as="p"
                className="text-muted-foreground"
                page="flag-football"
                section="registration"
              >
                For scholarship consideration, please email{' '}
                <a
                  href="mailto:girlsflag@riseupmoore.com"
                  className="font-semibold text-accent underline hover:text-accent/80"
                >
                  girlsflag@riseupmoore.com
                </a>{' '}
                <strong className="text-white">before completing registration</strong>.
              </EditableText>
            </div>
          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section id="schedule" className="pt-12 pb-16 md:pt-16 md:pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-8 text-center text-3xl font-bold text-white md:text-4xl">
            <EditableText
              contentKey="flag.schedule.title"
              as="span"
              page="flag-football"
              section="schedule"
            >
              Season Schedule
            </EditableText>
          </h2>

          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Season Dates */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 md:p-8">
              <h3 className="mb-6 text-2xl font-bold text-white">
                <EditableText
                  contentKey="flag.schedule.season_title"
                  as="span"
                  page="flag-football"
                  section="schedule"
                >
                  Season Details
                </EditableText>
              </h3>
              <div className="space-y-6">
                <div>
                  <div className="mb-2 text-sm font-semibold text-accent">
                    Season Kickoff
                  </div>
                  <EditableText
                    contentKey="flag.schedule.kickoff_date"
                    as="p"
                    className="text-lg text-white"
                    page="flag-football"
                    section="schedule"
                  >
                    October 1, 2025
                  </EditableText>
                  <EditableText
                    contentKey="flag.schedule.kickoff_description"
                    as="p"
                    className="text-sm text-muted-foreground"
                    page="flag-football"
                    section="schedule"
                  >
                    2 practices per week (Thursday evenings and Saturday mornings)
                  </EditableText>
                </div>
                <div>
                  <div className="mb-2 text-sm font-semibold text-accent">
                    Game Dates
                  </div>
                  <EditableText
                    contentKey="flag.schedule.game_dates"
                    as="p"
                    className="text-lg text-white"
                    page="flag-football"
                    section="schedule"
                  >
                    November 1, 8, 15, 22
                  </EditableText>
                  <EditableText
                    contentKey="flag.schedule.game_description"
                    as="p"
                    className="text-sm text-muted-foreground"
                    page="flag-football"
                    section="schedule"
                  >
                    Four exciting game days throughout November
                  </EditableText>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="rounded-xl border border-white/10 bg-background p-6 md:p-8">
              <h3 className="mb-6 text-2xl font-bold text-white">
                <EditableText
                  contentKey="flag.schedule.location_title"
                  as="span"
                  page="flag-football"
                  section="schedule"
                >
                  Location
                </EditableText>
              </h3>
              <div className="mb-4">
                <EditableText
                  contentKey="flag.schedule.location_name"
                  as="p"
                  className="text-lg font-semibold text-accent"
                  page="flag-football"
                  section="schedule"
                >
                  Sandhills Classical Christian School
                </EditableText>
                <EditableText
                  contentKey="flag.schedule.location_address"
                  as="p"
                  className="text-muted-foreground"
                  page="flag-football"
                  section="schedule"
                >
                  1487 Rays Bridge Road
                  <br />
                  Whispering Pines, NC 28327
                </EditableText>
              </div>
              <div className="mt-6">
                <a
                  href="https://maps.google.com/?q=1487+Rays+Bridge+Road,+Whispering+Pines,+NC+28327"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-full border border-white px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Get Directions
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <section id="equipment" className="bg-white/5 pt-12 pb-16 md:pt-16 md:pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-8 text-center text-3xl font-bold text-white md:text-4xl">
            <EditableText
              contentKey="flag.equipment.title"
              as="span"
              page="flag-football"
              section="equipment"
            >
              What's Included
            </EditableText>
          </h2>

          <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
            <div className="rounded-xl border border-white/10 bg-background p-6 md:p-8">
              <h3 className="mb-6 text-xl font-bold text-white">
                <EditableText
                  contentKey="flag.equipment.included_title"
                  as="span"
                  page="flag-football"
                  section="equipment"
                >
                  Each Player Receives:
                </EditableText>
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="mr-3 text-accent">✓</span>
                  <EditableText
                    contentKey="flag.equipment.item_jersey"
                    as="span"
                    className="text-muted-foreground"
                    page="flag-football"
                    section="equipment"
                  >
                    Official NFL FLAG jersey
                  </EditableText>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-accent">✓</span>
                  <EditableText
                    contentKey="flag.equipment.item_belt"
                    as="span"
                    className="text-muted-foreground"
                    page="flag-football"
                    section="equipment"
                  >
                    NFL FLAG belt with flags
                  </EditableText>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-accent">✓</span>
                  <EditableText
                    contentKey="flag.equipment.item_coaching"
                    as="span"
                    className="text-muted-foreground"
                    page="flag-football"
                    section="equipment"
                  >
                    Certified coaches focused on development & positivity
                  </EditableText>
                </li>
              </ul>
            </div>

            <div>
              <QuickReference
                title="What Players Need to Bring"
                columns={1}
                items={[
                  {
                    label: 'Cleats',
                    value: 'Football or soccer cleats (no metal spikes)',
                  },
                  {
                    label: 'Mouth Guard',
                    value: 'Recommended for safety',
                  },
                  {
                    label: 'Water Bottle',
                    value: 'Staying hydrated is critical',
                  },
                  {
                    label: 'Athletic Clothing',
                    value: 'Comfortable workout clothes for practice',
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Get Involved Section */}
      <section id="get-involved" className="pt-12 pb-16 md:pt-16 md:pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-8 text-center text-3xl font-bold text-white md:text-4xl">
            <EditableText
              contentKey="flag.getinvolved.title"
              as="span"
              page="flag-football"
              section="get-involved"
            >
              How to Get Involved
            </EditableText>
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 md:p-8">
              <h3 className="mb-4 text-2xl font-bold text-accent">
                <EditableText
                  contentKey="flag.getinvolved.coaches_title"
                  as="span"
                  page="flag-football"
                  section="get-involved"
                >
                  Coaches & Volunteers
                </EditableText>
              </h3>
              <EditableText
                contentKey="flag.getinvolved.coaches_description"
                as="p"
                className="mb-6 text-muted-foreground"
                page="flag-football"
                section="get-involved"
              >
                We're always looking for passionate adults to help lead. No experience necessary — just a positive attitude and desire to empower young athletes!
              </EditableText>
              <a
                href="mailto:girlsflag@riseupmoore.com?subject=Volunteer%20Interest"
                className="inline-block rounded-full border border-white px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Email girlsflag@riseupmoore.com
              </a>
            </div>

            <div className="rounded-xl border border-white/10 bg-background p-6 md:p-8">
              <h3 className="mb-4 text-2xl font-bold text-accent">
                <EditableText
                  contentKey="flag.getinvolved.sponsors_title"
                  as="span"
                  page="flag-football"
                  section="get-involved"
                >
                  Sponsors
                </EditableText>
              </h3>
              <EditableText
                contentKey="flag.getinvolved.sponsors_description"
                as="p"
                className="mb-6 text-muted-foreground"
                page="flag-football"
                section="get-involved"
              >
                Partner with us to support girls in sports and get your brand in front of local families. Help us build a stronger community through athletics!
              </EditableText>
              <a
                href="mailto:girlsflag@riseupmoore.com?subject=Sponsorship%20Interest"
                className="inline-block rounded-full border border-white px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Email girlsflag@riseupmoore.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="pt-12 pb-16 md:pt-16 md:pb-24">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            <EditableText
              contentKey="flag.cta.title"
              as="span"
              page="flag-football"
              section="cta"
            >
              Ready to Rise Up?
            </EditableText>
          </h2>
          <EditableText
            contentKey="flag.cta.description"
            as="p"
            className="mb-8 text-lg text-muted-foreground"
            page="flag-football"
            section="cta"
          >
            Join the RiseUp Moore Girls Flag Football League and be part of the fastest-growing youth sport in America!
          </EditableText>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              disabled
              className="inline-block rounded-full bg-accent/50 px-8 py-4 text-lg font-semibold text-white cursor-not-allowed opacity-50"
            >
              <EditableText
                contentKey="flag.cta.register_button"
                as="span"
                page="flag-football"
                section="cta"
              >
                Register Now
              </EditableText>
            </button>
          </div>
        </div>
      </section>

      {/* Parent Testimonials */}
      <ParentTestimonials testimonials={parentTestimonials} />
    </main>
  );
}
