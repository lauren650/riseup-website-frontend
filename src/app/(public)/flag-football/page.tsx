import type { Metadata } from 'next';
import Link from 'next/link';
import { SubNavigation } from '@/components/ui/sub-navigation';
import { ParentTestimonials } from '@/components/sections/parent-testimonials';
import { PhotoContentBlockEditable } from '@/components/sections/photo-content-block-editable';
import { QuickReference, Timeline } from '@/components/ui/quick-reference';
import { EditableHeroImage } from '@/components/sections/editable-hero-image';
import { EditableText } from '@/components/editable/editable-text';
import { REGISTER_ENDZONE_URL } from '@/lib/site-config';
import {
  GIRLS_FLAG_EMAIL,
  getFlagRegistrationPhase,
} from '@/lib/flag-football-registration';

const subNavItems = [
  { id: 'overview', label: 'Overview' },
  { id: 'registration', label: 'Registration' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'equipment', label: "What's Included" },
  { id: 'get-involved', label: 'Get Involved' },
];

const flagKeyDates = [
  {
    date: 'June 8, 2026',
    title: 'Registration Opens',
    description:
      'Register through Endzone. Divisions close when capacity is reached (180 players league-wide).',
    important: true,
  },
  {
    date: 'September 1, 2026',
    title: 'Registration Hard Close',
    description:
      'Last day to register. Waitlist is determined at this date.',
    important: true,
  },
  {
    date: 'September 2026',
    title: 'Field Locations Announced',
    description:
      'Final practice and game field assignments in Moore County, NC.',
    important: true,
  },
  {
    date: 'Week of October 5, 2026',
    title: 'First Practice',
    description:
      'Practice days and times shared with teams. Full game schedules distributed.',
    important: true,
  },
  {
    date: 'Saturday, October 24, 2026',
    title: 'Games Begin',
    description: 'Saturday game days through the season.',
    important: true,
  },
  {
    date: 'Saturday, November 21, 2026',
    title: 'Final Game Day',
    description: 'Last game of the 2026 season.',
    important: true,
  },
];

const endzoneLinkClassName =
  'font-semibold text-accent underline decoration-accent/40 underline-offset-2 transition-colors hover:text-accent/80 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black rounded-sm';

const parentTestimonials = [
  {
    quote:
      'We love RiseUp. This league is something special, we hope as it grows, it continues to feel as safe and fun as it has been. We recommend it to everyone we know in the area!',
    parentName: 'RiseUp Parent',
  },
  {
    quote:
      'Overall experience was great, and we highly recommended to all of our friends and family. We are thankful that we were able to participate and we look forward to doing it again next year.',
    parentName: 'RiseUp Parent',
  },
  {
    quote:
      'This is the best run, most communicative, and most enriching youth sports program we have been a part of. This includes baseball, softball, hockey, gymnastics, martial arts, and figure skating.',
    parentName: 'RiseUp Parent',
  },
  {
    quote:
      "We are so impressed with this league, and incredibly thankful for the time and effort you've all put into it. Fully believe you are changing Moore County youth through football.",
    parentName: 'RiseUp Parent',
  },
  {
    quote:
      'We thought it was amazing and are so thankful for this community and league.',
    parentName: 'RiseUp Parent',
  },
  {
    quote:
      "We have participated with all Rise up activities since the start and will continue to with all of our children. It's an amazing organization and we will continue to recommend to our friends and family.",
    parentName: 'RiseUp Parent',
  },
];

export const metadata: Metadata = {
  title: 'Girls Flag Football | RiseUp Youth Football League',
  description:
    'RiseUp Moore Girls Flag Football — NFL FLAG aligned, grades 1-8 in Moore County, NC. Registration June 8–September 1, 2026. Fall season October–November 2026.',
};

function FlagRegisterButton({ className }: { className?: string }) {
  const phase = getFlagRegistrationPhase();

  if (phase === 'before') {
    return (
      <span
        className={
          className ??
          'inline-flex items-center rounded-full bg-accent px-8 py-4 text-lg font-semibold text-white'
        }
      >
        Registration Opens June 8, 2026
      </span>
    );
  }

  if (phase === 'open') {
    return (
      <a
        href={REGISTER_ENDZONE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={
          className ??
          'inline-flex items-center rounded-full bg-accent px-8 py-4 text-lg font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black'
        }
      >
        Register Now
      </a>
    );
  }

  return (
    <span
      className={
        className ??
        'inline-flex items-center rounded-full border border-white/20 bg-white/5 px-8 py-4 text-lg font-semibold text-muted-foreground'
      }
    >
      Registration Closed
    </span>
  );
}

export default function FlagFootballPage() {
  const registrationPhase = getFlagRegistrationPhase();
  const showLiveRegister = registrationPhase === 'open';

  return (
    <main>
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[calc(500px+7rem)] md:min-h-[500px] overflow-hidden pt-[7rem] md:pt-0">
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
        showRegisterButton={showLiveRegister}
        registerLink={REGISTER_ENDZONE_URL}
        registerLabel="Register"
      />

      {/* Overview Section */}
      <section id="overview" className="pt-12 pb-16 md:pt-16 md:pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-8 text-center text-3xl font-bold text-white md:text-4xl">
            <EditableText
              contentKey="flag.overview.title"
              as="span"
              page="flag-football"
              section="overview"
            >
              RiseUp Moore Girls Flag Football 2026 Season
            </EditableText>
          </h2>

          <div className="mb-12 rounded-xl border border-accent/30 bg-accent/5 p-6 md:p-8">
            <h3 className="mb-4 text-center text-xl font-bold text-white md:text-2xl">
              <EditableText
                contentKey="flag.overview.at_a_glance_title"
                as="span"
                page="flag-football"
                section="overview"
              >
                2026 Season at a Glance
              </EditableText>
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-white/10 bg-background p-4 text-center">
                <p className="mb-1 text-sm font-semibold text-accent">Registration</p>
                <EditableText
                  contentKey="flag.overview.at_a_glance_registration"
                  as="p"
                  className="text-sm font-semibold text-white"
                  page="flag-football"
                  section="overview"
                >
                  June 8 – September 1, 2026
                </EditableText>
              </div>
              <div className="rounded-lg border border-white/10 bg-background p-4 text-center">
                <p className="mb-1 text-sm font-semibold text-accent">Fall Season</p>
                <EditableText
                  contentKey="flag.overview.at_a_glance_season"
                  as="p"
                  className="text-sm font-semibold text-white"
                  page="flag-football"
                  section="overview"
                >
                  Practices week of Oct 5 · Games Oct 24 – Nov 21
                </EditableText>
              </div>
              <div className="rounded-lg border border-white/10 bg-background p-4 text-center">
                <p className="mb-1 text-sm font-semibold text-accent">League Capacity</p>
                <EditableText
                  contentKey="flag.overview.at_a_glance_capacity"
                  as="p"
                  className="text-sm font-semibold text-white"
                  page="flag-football"
                  section="overview"
                >
                  180 players maximum
                </EditableText>
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
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
                  RiseUp Moore Girls Flag Football is officially aligned with the{' '}
                  <a
                    href="https://nflflag.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-accent underline hover:text-accent/80"
                  >
                    NFL FLAG program
                  </a>
                  {' '}
                  — the fastest-growing youth sport in America. Our 2026 fall season brings
                  energy, excitement, and empowerment to girls across Moore County in a fun,
                  supportive environment built on confidence, competition, and community.
                </EditableText>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <h3 className="mb-4 text-xl font-bold text-white">NFL FLAG Certified Program</h3>
                <div className="space-y-4 text-muted-foreground">
                  <EditableText
                    contentKey="flag.overview.nfl_flag_p1"
                    as="p"
                    page="flag-football"
                    section="overview"
                  >
                    Our program follows NFL FLAG standards for development and play. All coaches
                    are certified and focused on creating a positive, empowering environment for
                    female athletes.
                  </EditableText>
                  <EditableText
                    contentKey="flag.overview.nfl_flag_p2"
                    as="p"
                    page="flag-football"
                    section="overview"
                  >
                    We develop complete athletes — teaching football skills alongside leadership,
                    teamwork, and resilience on and off the field.
                  </EditableText>
                </div>
              </div>
            </div>

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
                All girls in grades 1-8 are welcome. Divisions close when capacity is reached.
              </EditableText>
              <div className="space-y-4">
                <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                  <h4 className="text-2xl font-bold text-accent">
                    <EditableText
                      contentKey="flag.divisions.minis.title"
                      as="span"
                      page="flag-football"
                      section="overview"
                    >
                      Minis Division
                    </EditableText>
                  </h4>
                  <EditableText
                    contentKey="flag.divisions.minis.grades"
                    as="p"
                    className="mt-2 text-sm font-semibold text-white"
                    page="flag-football"
                    section="overview"
                  >
                    1st–2nd Grade
                  </EditableText>
                  <EditableText
                    contentKey="flag.divisions.minis.capacity"
                    as="p"
                    className="mt-2 text-sm text-muted-foreground"
                    page="flag-football"
                    section="overview"
                  >
                    4 teams · 40 players maximum
                  </EditableText>
                  <EditableText
                    contentKey="flag.divisions.minis.description"
                    as="p"
                    className="mt-2 text-sm text-muted-foreground"
                    page="flag-football"
                    section="overview"
                  >
                    One practice and one game per week — introduction to flag football
                  </EditableText>
                </div>
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
                    3rd–5th Grade
                  </EditableText>
                  <EditableText
                    contentKey="flag.divisions.elementary.capacity"
                    as="p"
                    className="mt-2 text-sm text-muted-foreground"
                    page="flag-football"
                    section="overview"
                  >
                    6 teams · 60 players maximum
                  </EditableText>
                  <EditableText
                    contentKey="flag.divisions.elementary.description"
                    as="p"
                    className="mt-2 text-sm text-muted-foreground"
                    page="flag-football"
                    section="overview"
                  >
                    Fundamentals and fun with growing competitive play
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
                    6th–8th Grade
                  </EditableText>
                  <EditableText
                    contentKey="flag.divisions.middle.capacity"
                    as="p"
                    className="mt-2 text-sm text-muted-foreground"
                    page="flag-football"
                    section="overview"
                  >
                    6 teams · 60 players maximum
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
                <div className="rounded-xl border border-accent/30 bg-accent/5 p-6">
                  <EditableText
                    contentKey="flag.divisions.league_total"
                    as="p"
                    className="text-center text-sm font-semibold text-white"
                    page="flag-football"
                    section="overview"
                  >
                    <span className="text-accent">League total:</span> 180 players maximum across
                    all divisions
                  </EditableText>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 mb-16">
            <PhotoContentBlockEditable
              contentKey="flag.overview.action_image"
              imageSrc="/images/girls-flag-action.jpg"
              imageAlt="Girls playing flag football"
              title="Empowering Girls Through Football"
              imagePosition="right"
              page="flag-football"
              section="overview"
              imageHeight="h-[400px] md:min-h-[500px]"
              rounded={false}
              wideImage={true}
            >
              <EditableText
                contentKey="flag.overview.action_p1"
                as="p"
                page="flag-football"
                section="overview"
              >
                Our Girls Flag Football program creates a supportive environment where young
                athletes develop skills, build confidence, and discover their love for the game.
              </EditableText>
              <EditableText
                contentKey="flag.overview.action_p2"
                as="p"
                page="flag-football"
                section="overview"
              >
                With certified coaches and positive development at the center, every player
                shines on the field while learning teamwork, perseverance, and leadership.
              </EditableText>
            </PhotoContentBlockEditable>
          </div>

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

          <div className="mb-12">
            <PhotoContentBlockEditable
              contentKey="flag.registration.image"
              imageSrc="/images/girls-flag-registration.jpg"
              imageAlt="Girls registering for flag football"
              title="Join Our Team"
              imagePosition="left"
              page="flag-football"
              section="registration"
              imageHeight="h-[400px] md:min-h-[450px]"
              rounded={false}
              wideImage={false}
            >
              <EditableText
                contentKey="flag.registration.image_p1"
                as="p"
                page="flag-football"
                section="registration"
              >
                Registration opens <strong className="text-white">June 8, 2026</strong> and closes{' '}
                <strong className="text-white">September 1, 2026</strong> (hard close). We welcome
                all skill levels from beginners to experienced players in grades 1-8.
              </EditableText>
              <EditableText
                contentKey="flag.registration.image_p2"
                as="p"
                page="flag-football"
                section="registration"
              >
                Full game schedules are shared during the first week of practice. Questions? Email{' '}
                <a
                  href={`mailto:${GIRLS_FLAG_EMAIL}`}
                  className="font-semibold text-accent underline hover:text-accent/80"
                >
                  {GIRLS_FLAG_EMAIL}
                </a>
                .
              </EditableText>
            </PhotoContentBlockEditable>
          </div>

          <div className="mb-6 space-y-8">
            <div className="rounded-xl border border-accent/30 bg-accent/5 p-6 md:p-8">
              <h3 className="mb-4 text-xl font-bold text-white">
                <EditableText
                  contentKey="flag.registration.window_title"
                  as="span"
                  page="flag-football"
                  section="registration"
                >
                  Registration Window
                </EditableText>
              </h3>
              <div className="mb-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-white/10 bg-background p-4">
                  <p className="mb-1 text-sm font-semibold text-accent">Opens</p>
                  <EditableText
                    contentKey="flag.registration.opens_date"
                    as="p"
                    className="text-lg font-semibold text-white"
                    page="flag-football"
                    section="registration"
                  >
                    June 8, 2026
                  </EditableText>
                </div>
                <div className="rounded-lg border border-white/10 bg-background p-4">
                  <p className="mb-1 text-sm font-semibold text-accent">Hard Close</p>
                  <EditableText
                    contentKey="flag.registration.closes_date"
                    as="p"
                    className="text-lg font-semibold text-white"
                    page="flag-football"
                    section="registration"
                  >
                    September 1, 2026
                  </EditableText>
                </div>
              </div>
              <EditableText
                contentKey="flag.registration.waitlist_note"
                as="p"
                className="mb-6 text-muted-foreground"
                page="flag-football"
                section="registration"
              >
                Waitlist is determined at the September 1 hard close. Divisions may fill before
                that date — register early to secure your spot.
              </EditableText>
              <div className="mb-6">
                <h4 className="mb-3 font-semibold text-white">Division Capacity</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <strong className="text-accent">Minis (1st–2nd):</strong> 4 teams, 40 players
                    max
                  </li>
                  <li>
                    <strong className="text-accent">Elementary (3rd–5th):</strong> 6 teams, 60
                    players max
                  </li>
                  <li>
                    <strong className="text-accent">Middle School (6th–8th):</strong> 6 teams, 60
                    players max
                  </li>
                  <li>
                    <strong className="text-white">League total:</strong> 180 players maximum
                  </li>
                </ul>
              </div>
              <div className="flex flex-wrap gap-4">
                <FlagRegisterButton />
                {registrationPhase === 'closed' && (
                  <a
                    href={`mailto:${GIRLS_FLAG_EMAIL}`}
                    className="inline-flex items-center rounded-full border border-white px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black"
                  >
                    Contact About Waitlist
                  </a>
                )}
              </div>
              {showLiveRegister && (
                <p className="mt-4 text-sm text-muted-foreground">
                  Register through our{' '}
                  <Link
                    href={REGISTER_ENDZONE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={endzoneLinkClassName}
                  >
                    Endzone portal
                  </Link>
                  .
                </p>
              )}
            </div>

            <div className="rounded-xl border border-white/10 bg-background p-6 md:p-8">
              <h3 className="mb-4 text-xl font-bold text-white">
                <EditableText
                  contentKey="flag.registration.after_register_title"
                  as="span"
                  page="flag-football"
                  section="registration"
                >
                  After You Register
                </EditableText>
              </h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start">
                  <span className="mr-3 text-accent">•</span>
                  <EditableText
                    contentKey="flag.registration.after_schedules"
                    as="span"
                    page="flag-football"
                    section="registration"
                  >
                    Full game schedules shared during the first week of practice
                  </EditableText>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-accent">•</span>
                  <EditableText
                    contentKey="flag.registration.after_nfl_store"
                    as="span"
                    page="flag-football"
                    section="registration"
                  >
                    NFL Store items ordered during registration are distributed the first week of
                    practice
                  </EditableText>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-accent">•</span>
                  <EditableText
                    contentKey="flag.registration.after_fields"
                    as="span"
                    page="flag-football"
                    section="registration"
                  >
                    Practice and game field locations in Moore County announced in September
                  </EditableText>
                </li>
              </ul>
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
                RiseUp is committed to making flag football accessible to all girls in our
                community. Financial assistance is available for families in need.
              </EditableText>
              <EditableText
                contentKey="flag.registration.scholarship_contact"
                as="p"
                className="text-muted-foreground"
                page="flag-football"
                section="registration"
              >
                For scholarship consideration, email{' '}
                <a
                  href={`mailto:${GIRLS_FLAG_EMAIL}`}
                  className="font-semibold text-accent underline hover:text-accent/80"
                >
                  {GIRLS_FLAG_EMAIL}
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

          <div className="mb-12">
            <QuickReference
              title="Key Dates"
              subtitle="2026 Girls Flag Football Season"
              subtitleAccent
              columns={2}
              items={[
                {
                  label: 'First Practice',
                  value: 'Week of October 5, 2026',
                  highlight: true,
                },
                {
                  label: 'Games Begin',
                  value: 'Saturday, October 24, 2026',
                  highlight: true,
                },
                {
                  label: 'Final Game Day',
                  value: 'Saturday, November 21, 2026',
                  highlight: true,
                },
                {
                  label: 'Game Days',
                  value: 'Saturdays during the season',
                },
              ]}
            />
          </div>

          <div className="mb-12">
            <h3 className="mb-6 text-center text-2xl font-bold text-white">
              <EditableText
                contentKey="flag.schedule.key_dates_title"
                as="span"
                page="flag-football"
                section="schedule"
              >
                Season Timeline
              </EditableText>
            </h3>
            <div className="mx-auto max-w-3xl">
              <Timeline items={flagKeyDates} />
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
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
              <EditableText
                contentKey="flag.schedule.season_dates"
                as="p"
                className="mb-4 text-lg text-white"
                page="flag-football"
                section="schedule"
              >
                Practices begin the week of October 5, 2026. Games run Saturdays from October 24
                through November 21, 2026.
              </EditableText>
              <EditableText
                contentKey="flag.schedule.season_description"
                as="p"
                className="text-sm text-muted-foreground"
                page="flag-football"
                section="schedule"
              >
                Practice days and times are shared with teams during the first week of practice.
                Full game schedules are distributed at that time as well.
              </EditableText>
            </div>

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
              <EditableText
                contentKey="flag.schedule.location_name"
                as="p"
                className="mb-4 text-lg font-semibold text-accent"
                page="flag-football"
                section="schedule"
              >
                Moore County, NC
              </EditableText>
              <EditableText
                contentKey="flag.schedule.location_description"
                as="p"
                className="text-muted-foreground"
                page="flag-football"
                section="schedule"
              >
                Practices and games take place at locations throughout Moore County. Final field
                assignments will be announced in September 2026.
              </EditableText>
            </div>
          </div>

          <div className="mt-12 rounded-xl border border-accent/30 bg-accent/5 p-6 md:p-8 text-center">
            <h3 className="mb-2 text-xl font-bold text-white">Questions?</h3>
            <EditableText
              contentKey="flag.contact.prompt"
              as="p"
              className="mb-4 text-muted-foreground"
              page="flag-football"
              section="schedule"
            >
              Contact us anytime about the Girls Flag program.
            </EditableText>
            <a
              href={`mailto:${GIRLS_FLAG_EMAIL}`}
              className="inline-flex items-center rounded-full bg-accent px-8 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black"
            >
              {GIRLS_FLAG_EMAIL}
            </a>
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
              What&apos;s Included
            </EditableText>
          </h2>

          <div className="mb-12">
            <PhotoContentBlockEditable
              contentKey="flag.equipment.featured_image"
              imageSrc="/images/girls-flag-equipment.jpg"
              imageAlt="Girls with NFL FLAG jerseys and equipment"
              title="Official NFL FLAG Gear"
              imagePosition="right"
              page="flag-football"
              section="equipment"
              imageHeight="h-[400px] md:min-h-[450px]"
              rounded={false}
              wideImage={false}
            >
              <EditableText
                contentKey="flag.equipment.featured_p1"
                as="p"
                page="flag-football"
                section="equipment"
              >
                Every player receives official NFL FLAG gear, including a jersey and flag belt.
                Our equipment meets the highest standards for quality and safety.
              </EditableText>
              <EditableText
                contentKey="flag.equipment.featured_p2"
                as="p"
                page="flag-football"
                section="equipment"
              >
                Players represent RiseUp Moore with pride in their official uniforms on the field.
              </EditableText>
            </PhotoContentBlockEditable>
          </div>

          <div className="mb-8 rounded-xl border border-accent/30 bg-accent/5 p-6 md:p-8">
            <h3 className="mb-3 text-lg font-bold text-white">
              <EditableText
                contentKey="flag.equipment.nfl_store_title"
                as="span"
                page="flag-football"
                section="equipment"
              >
                NFL Store Add-Ons
              </EditableText>
            </h3>
            <EditableText
              contentKey="flag.equipment.nfl_store_description"
              as="p"
              className="text-muted-foreground"
              page="flag-football"
              section="equipment"
            >
              Optional NFL Store items ordered during registration are distributed during the
              first week of practice — separate from the standard jersey and belt included with
              registration.
            </EditableText>
          </div>

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

          <div className="mb-12">
            <PhotoContentBlockEditable
              contentKey="flag.getinvolved.community_image"
              imageSrc="/images/girls-flag-community.jpg"
              imageAlt="Coaches and volunteers with girls flag football team"
              title="Build Our Community"
              imagePosition="left"
              page="flag-football"
              section="get-involved"
              imageHeight="h-[400px] md:min-h-[450px]"
              rounded={false}
              wideImage={false}
            >
              <EditableText
                contentKey="flag.getinvolved.community_p1"
                as="p"
                page="flag-football"
                section="get-involved"
              >
                Our program thrives because of dedicated coaches, volunteers, and sponsors who
                believe in empowering young female athletes.
              </EditableText>
              <EditableText
                contentKey="flag.getinvolved.community_p2"
                as="p"
                page="flag-football"
                section="get-involved"
              >
                Whether you want to coach, volunteer, or support us as a sponsor, you can make a
                lasting impact on girls in our community.
              </EditableText>
            </PhotoContentBlockEditable>
          </div>

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
                We&apos;re always looking for passionate adults to help lead. No experience
                necessary — just a positive attitude and desire to empower young athletes!
              </EditableText>
              <a
                href={`mailto:${GIRLS_FLAG_EMAIL}`}
                className="inline-block rounded-full border border-white px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black"
              >
                Email {GIRLS_FLAG_EMAIL}
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
                Partner with us to support girls in sports and get your brand in front of local
                families. Help us build a stronger community through athletics!
              </EditableText>
              <Link
                href="/become-a-sponsor"
                className="inline-block rounded-full border border-white px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black"
              >
                Become a Sponsor
              </Link>
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
            Join the RiseUp Moore Girls Flag Football League — registration June 8 through
            September 1, 2026.
          </EditableText>
          <div className="flex flex-wrap justify-center gap-4">
            <FlagRegisterButton />
            <a
              href={`mailto:${GIRLS_FLAG_EMAIL}`}
              className="inline-flex items-center rounded-full border border-white px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>

      <ParentTestimonials testimonials={parentTestimonials} />
    </main>
  );
}
