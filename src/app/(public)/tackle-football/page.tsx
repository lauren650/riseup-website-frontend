import type { Metadata } from 'next';
import Link from 'next/link';
import { SubNavigation } from '@/components/ui/sub-navigation';
import { ParentTestimonials } from '@/components/sections/parent-testimonials';
import { PhotoContentBlockEditable } from '@/components/sections/photo-content-block-editable';
import { QuickReference, Timeline } from '@/components/ui/quick-reference';
import { EditableHeroImage } from '@/components/sections/editable-hero-image';
import { EditableText } from '@/components/editable/editable-text';

const subNavItems = [
  { id: 'overview', label: 'Overview' },
  { id: 'registration', label: 'Registration' },
  { id: 'equipment', label: 'Equipment' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'parent-meetings', label: 'Parent Meetings' },
  { id: 'quick-reference', label: 'Quick Reference' },
];

const parentTestimonials = [
  {
    quote:
      'RiseUp has been transformative for our son. The coaches truly care about developing character alongside athletic skills.',
    parentName: 'Sarah Johnson',
    playerAge: '10-year-old',
    location: 'Moore County, NC',
  },
  {
    quote:
      'The safety protocols and professional equipment give me peace of mind. My daughter loves being part of this community.',
    parentName: 'Michael Chen',
    playerAge: '12-year-old',
    location: 'Southern Pines, NC',
  },
  {
    quote:
      'From day one, RiseUp made us feel like family. The organization and communication are outstanding.',
    parentName: 'Jessica Martinez',
    playerAge: '9-year-old',
    location: 'Moore County, NC',
  },
];

const keyDates = [
  {
    date: 'May 1, 2026',
    title: 'Last Day for Full Refund',
    description:
      'Full refund available (minus processing fees) if you need to withdraw before this date.',
    important: false,
  },
  {
    date: 'July 1, 2026',
    title: 'Sports Physical Deadline',
    description:
      'All physical exams must be uploaded by this date. Registration closes for 9-10 and 11-12 divisions.',
    important: true,
  },
  {
    date: 'July 15, 2026',
    title: 'Last Day for Partial Refund',
    description:
      'Partial refund available (minus processing and equipment fees) until this date.',
    important: false,
  },
  {
    date: 'July 29-31, 2026',
    title: 'Equipment Check-Out',
    description:
      'Team-by-team equipment distribution at RiseUp Storage. Check your team schedule.',
    important: true,
  },
  {
    date: 'August 1, 2026',
    title: 'Season Practices Begin',
    description:
      'First practice! Monday, Tuesday, Thursday 5:30-7:30 PM, Saturday 9 AM.',
    important: true,
  },
  {
    date: 'August 22, 2026',
    title: 'Season Jamboree',
    description: 'Scrimmage event to prepare teams before the regular season.',
    important: true,
  },
  {
    date: 'August 29, 2026',
    title: 'Game 1',
    description: 'First regular season game!',
    important: true,
  },
  {
    date: 'September 5, 2026',
    title: 'Labor Day - Off',
    description: 'No games scheduled. Enjoy the holiday!',
    important: false,
  },
  {
    date: 'Sept 12, 19, 26',
    title: 'Games 2-4',
    description: 'Regular season continues.',
    important: false,
  },
  {
    date: 'October 3, 10',
    title: 'Games 5-6',
    description: 'Final regular season games.',
    important: false,
  },
];

export const metadata: Metadata = {
  title: 'Tackle Football | RiseUp Youth Football League',
  description: 'RiseUp Moore youth tackle football program for ages 9-14. USA Football certified coaches, professional equipment provided, and character development focus.',
};

export default function TackleFootballPage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] overflow-hidden">
        <EditableHeroImage
          contentKey="tackle_football.hero"
          src="/images/tackle-football-hero.jpg"
          alt="RiseUp Tackle Football Players"
          page="tackle-football"
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
              contentKey="tackle.overview.title"
              as="span"
              page="tackle-football"
              section="overview"
            >
              2026 Season Overview
            </EditableText>
          </h2>

          {/* Two Column Layout */}
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Left Column: Program Information */}
            <div className="space-y-8">
              <div>
                <h3 className="mb-4 text-2xl font-bold text-white">
                  <EditableText
                    contentKey="tackle.overview.about_title"
                    as="span"
                    page="tackle-football"
                    section="overview"
                  >
                    About RiseUp Moore
                  </EditableText>
                </h3>
                <EditableText
                  contentKey="tackle.overview.description"
                  as="p"
                  className="text-lg leading-relaxed text-muted-foreground"
                  page="tackle-football"
                  section="overview"
                >
                  RiseUp Moore is a developmental youth tackle football league in
                  Moore County. Our program combines competitive play with character
                  development, safety-first protocols, and expert coaching.
                </EditableText>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <h3 className="mb-4 text-xl font-bold text-white">
                  USA Football Certified Program
                </h3>
                <div className="space-y-4 text-muted-foreground">
                  <EditableText
                    contentKey="tackle.overview.usa_football_p1"
                    as="p"
                    page="tackle-football"
                    section="overview"
                  >
                    Our program follows USA Football rules, regulations, and policies
                    for 2026, ensuring the highest standards of play and safety. All
                    coaches are certified in Heads Up Football techniques, emphasizing
                    proper form and player protection.
                  </EditableText>
                  <EditableText
                    contentKey="tackle.overview.usa_football_regulations"
                    as="p"
                    page="tackle-football"
                    section="overview"
                  >
                    2026 USA Football Regulations and RiseUp Tackle Football policies will be available not later than June 15th, 2026.
                  </EditableText>
                  <EditableText
                    contentKey="tackle.overview.usa_football_p2"
                    as="p"
                    page="tackle-football"
                    section="overview"
                  >
                    We believe in developing complete players—teaching not just
                    athletic skills, but leadership, teamwork, and resilience that
                    will serve them on and off the field.
                  </EditableText>
                </div>
              </div>
            </div>

            {/* Right Column: Age Divisions */}
            <div>
              <h3 className="mb-4 text-2xl font-bold text-white">
                <EditableText
                  contentKey="tackle.overview.age_divisions_title"
                  as="span"
                  page="tackle-football"
                  section="overview"
                >
                  Age Divisions
                </EditableText>
              </h3>
              <EditableText
                contentKey="tackle.overview.age_note"
                as="p"
                className="mb-3 text-sm text-muted-foreground"
                page="tackle-football"
                section="overview"
              >
                Age as of August 31, 2026
              </EditableText>
              <EditableText
                contentKey="tackle.overview.team_structure"
                as="p"
                className="mb-6 text-sm font-bold text-white"
                page="tackle-football"
                section="overview"
              >
                Each division will have 4 teams of 30 players. When a division reaches capacity, a waitlist will open.
              </EditableText>
              <div className="space-y-4">
                <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                  <h4 className="text-2xl font-bold text-accent">
                    <EditableText
                      contentKey="tackle.divisions.junior.ages"
                      as="span"
                      page="tackle-football"
                      section="overview"
                    >
                      9/10 years old
                    </EditableText>
                  </h4>
                  <EditableText
                    contentKey="tackle.divisions.junior.description"
                    as="p"
                    className="mt-2 text-sm text-muted-foreground"
                    page="tackle-football"
                    section="overview"
                  >
                    Introduction to tackle football with focus on fundamentals
                  </EditableText>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                  <h4 className="text-2xl font-bold text-accent">
                    <EditableText
                      contentKey="tackle.divisions.varsity.ages"
                      as="span"
                      page="tackle-football"
                      section="overview"
                    >
                      11/12 years old
                    </EditableText>
                  </h4>
                  <EditableText
                    contentKey="tackle.divisions.varsity.description"
                    as="p"
                    className="mt-2 text-sm text-muted-foreground"
                    page="tackle-football"
                    section="overview"
                  >
                    Advanced skills development and continued character building
                  </EditableText>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                  <h4 className="text-2xl font-bold text-accent">
                    <EditableText
                      contentKey="tackle.divisions.elite.ages"
                      as="span"
                      page="tackle-football"
                      section="overview"
                    >
                      13/14 years old
                    </EditableText>
                  </h4>
                  <EditableText
                    contentKey="tackle.divisions.elite.description"
                    as="p"
                    className="mt-2 text-sm text-muted-foreground"
                    page="tackle-football"
                    section="overview"
                  >
                    Competitive competition preparing for high school
                  </EditableText>
                </div>
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
              contentKey="tackle.registration.title"
              as="span"
              page="tackle-football"
              section="registration"
            >
              Registration Information
            </EditableText>
          </h2>

          <div className="mb-6 space-y-8">
            <div className="rounded-xl border border-white/10 bg-background p-6 md:p-8">
              <h3 className="mb-4 text-xl font-bold text-white">
                <EditableText
                  contentKey="tackle.registration.status_title"
                  as="span"
                  page="tackle-football"
                  section="registration"
                >
                  Registration Status
                </EditableText>
              </h3>
              
              <div className="mb-6 rounded-lg border border-accent/30 bg-accent/5 p-4">
                <EditableText
                  contentKey="tackle.registration.team_structure"
                  as="p"
                  className="text-sm font-bold text-white"
                  page="tackle-football"
                  section="registration"
                >
                  Each division will have 4 teams of 30 players. When a division reaches capacity, a waitlist will open.
                </EditableText>
              </div>
              
              <div className="space-y-4 text-muted-foreground">
                <EditableText
                  contentKey="tackle.registration.status_junior"
                  as="p"
                  page="tackle-football"
                  section="registration"
                >
                  <strong className="text-accent">9-10 Division:</strong>{' '}
                  Registration opens February 9, closed when full. If filled, there will be a waitlist.
                </EditableText>
                <EditableText
                  contentKey="tackle.registration.status_varsity"
                  as="p"
                  page="tackle-football"
                  section="registration"
                >
                  <strong className="text-accent">11-12 Division:</strong>{' '}
                  Registration opens February 9, closed when full. If filled, there will be a waitlist.
                </EditableText>
                <EditableText
                  contentKey="tackle.registration.status_elite"
                  as="p"
                  page="tackle-football"
                  section="registration"
                >
                  <strong className="text-accent">13-14 Division:</strong>{' '}
                  Registration opens February 9, closed when full. If filled, there will be a waitlist.
                </EditableText>
                
                <div className="mt-6 border-t border-white/10 pt-6">
                  <h4 className="mb-3 font-semibold text-white">
                    <EditableText
                      contentKey="tackle.registration.physical_title"
                      as="span"
                      page="tackle-football"
                      section="registration"
                    >
                      Sports Physical Requirement
                    </EditableText>
                  </h4>
                  <EditableText
                    contentKey="tackle.registration.physical_description"
                    as="p"
                    className="mb-4"
                    page="tackle-football"
                    section="registration"
                  >
                    All players must have a current sports physical on file by{' '}
                    <strong className="text-white">July 1, 2026</strong>.
                  </EditableText>
                  <a
                    href="https://www.nchsaa.org/wp-content/uploads/2023/09/2025-2026_PPE-English.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-opacity hover:bg-white/90"
                  >
                    <EditableText
                      contentKey="tackle.registration.physical_button"
                      as="span"
                      page="tackle-football"
                      section="registration"
                    >
                      Download Physical Form (NCHSAA)
                    </EditableText>
                  </a>
                </div>
              </div>
            </div>

            {/* Team Assignments */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 md:p-8">
              <h3 className="mb-2 text-xl font-bold text-white md:text-2xl">Team Assignments</h3>
              <p className="mb-6 text-base md:text-lg text-accent font-semibold">
                Teams will be assigned in June.
              </p>
            </div>

            <PhotoContentBlockEditable
              contentKey="tackle.registration.how_to_image"
              imageSrc="/images/registration-day.jpg"
              imageAlt="Families at registration"
              title="How to Register"
              imagePosition="right"
              page="tackle-football"
              section="registration"
              imageHeight="h-[400px] md:min-h-[500px]"
              rounded={false}
              wideImage={true}
            >
              <EditableText
                contentKey="tackle.registration.how_to_p1"
                as="p"
                page="tackle-football"
                section="registration"
              >
                Visit our RiseUp portal to complete your registration. You need a PDF or JPEG ready to upload during registration. You can get your player profile ready to go prior to registration day to simplify the process.
              </EditableText>
              <EditableText
                contentKey="tackle.registration.how_to_p2"
                as="p"
                page="tackle-football"
                section="registration"
              >
                You have until July 1, 2026 to upload a current sports physical and measurements. To edit
                your registration after submitting, visit the registration
                portal.
              </EditableText>
            </PhotoContentBlockEditable>

            <div
              id="scholarship"
              className="rounded-xl border border-accent/30 bg-accent/5 p-6 md:p-8"
            >
              <h3 className="mb-4 text-xl font-bold text-white">
                <EditableText
                  contentKey="tackle.registration.scholarship_title"
                  as="span"
                  page="tackle-football"
                  section="registration"
                >
                  Scholarship Opportunities
                </EditableText>
              </h3>
              <EditableText
                contentKey="tackle.registration.scholarship_intro"
                as="p"
                className="mb-4 text-muted-foreground"
                page="tackle-football"
                section="registration"
              >
                RiseUp is committed to making football accessible to all youth
                in our community. Financial assistance is available for families
                in need.
              </EditableText>
              <EditableText
                contentKey="tackle.registration.scholarship_contact"
                as="p"
                className="text-muted-foreground"
                page="tackle-football"
                section="registration"
              >
                For scholarship consideration, please email{' '}
                <a
                  href="mailto:admin@riseupmoore.com"
                  className="font-semibold text-accent underline hover:text-accent/80"
                >
                  admin@riseupmoore.com
                </a>{' '}
                <strong className="text-white">before completing registration</strong>.
              </EditableText>
            </div>

            <div className="rounded-xl border border-white/10 bg-background p-6 md:p-8">
              <h3 className="mb-4 text-xl font-bold text-white">
                <EditableText
                  contentKey="tackle.registration.refund_title"
                  as="span"
                  page="tackle-football"
                  section="registration"
                >
                  Refund Policy
                </EditableText>
              </h3>
              <div className="space-y-3 text-muted-foreground">
                <EditableText
                  contentKey="tackle.registration.refund_before_may"
                  as="p"
                  page="tackle-football"
                  section="registration"
                >
                  <strong className="text-white">Before May 1, 2026:</strong>{' '}
                  Full refund (minus processing fees)
                </EditableText>
                <EditableText
                  contentKey="tackle.registration.refund_may_july"
                  as="p"
                  page="tackle-football"
                  section="registration"
                >
                  <strong className="text-white">
                    May 1 - July 15, 2026:
                  </strong>{' '}
                  Partial refund (minus processing fees and equipment fees)
                </EditableText>
                <EditableText
                  contentKey="tackle.registration.refund_after_july"
                  as="p"
                  page="tackle-football"
                  section="registration"
                >
                  <strong className="text-white">After July 15, 2026:</strong>{' '}
                  No refunds available
                </EditableText>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Equipment Section */}
      <section id="equipment" className="pt-12 pb-16 md:pt-16 md:pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-8 text-center text-3xl font-bold text-white md:text-4xl">
            <EditableText
              contentKey="tackle.equipment.title"
              as="span"
              page="tackle-football"
              section="equipment"
            >
              Equipment Check-Out
            </EditableText>
          </h2>

          <div className="mb-12">
            <PhotoContentBlockEditable
              contentKey="tackle.equipment.provides_image"
              imageSrc="/images/equipment-fitting.jpg"
              imageAlt="Coach fitting helmet on player"
              title="What RiseUp Provides"
              imagePosition="left"
              page="tackle-football"
              section="equipment"
              imageHeight="h-[400px] md:min-h-[500px]"
              rounded={false}
              wideImage={true}
            >
              <EditableText
                contentKey="tackle.equipment.provides_intro"
                as="p"
                page="tackle-football"
                section="equipment"
              >
                Each player will receive professional-grade equipment at no
                additional cost:
              </EditableText>
              <ul className="list-inside list-disc space-y-2">
                <li>
                  <EditableText
                    contentKey="tackle.equipment.item_helmet"
                    as="span"
                    page="tackle-football"
                    section="equipment"
                  >
                    Helmet (properly fitted for safety)
                  </EditableText>
                </li>
                <li>
                  <EditableText
                    contentKey="tackle.equipment.item_pads"
                    as="span"
                    page="tackle-football"
                    section="equipment"
                  >
                    Shoulder Pads
                  </EditableText>
                </li>
                <li>
                  <EditableText
                    contentKey="tackle.equipment.item_pants"
                    as="span"
                    page="tackle-football"
                    section="equipment"
                  >
                    Integrated Pants
                  </EditableText>
                </li>
                <li>
                  <EditableText
                    contentKey="tackle.equipment.item_practice_jersey"
                    as="span"
                    page="tackle-football"
                    section="equipment"
                  >
                    Practice Jersey
                  </EditableText>
                </li>
                <li>
                  <EditableText
                    contentKey="tackle.equipment.item_game_jersey"
                    as="span"
                    page="tackle-football"
                    section="equipment"
                  >
                    Game Jersey (distributed by coaches)
                  </EditableText>
                </li>
              </ul>
            </PhotoContentBlockEditable>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-6 md:p-8 mb-12">
            <h3 className="mb-6 text-2xl font-bold text-white">
              <EditableText
                contentKey="tackle.equipment.schedule_title"
                as="span"
                page="tackle-football"
                section="equipment"
              >
                Equipment Check-Out Schedule
              </EditableText>
            </h3>
            <div className="mb-6 rounded-lg border border-accent/30 bg-accent/5 p-4">
              <EditableText
                contentKey="tackle.equipment.location_title"
                as="p"
                className="text-sm font-semibold text-accent"
                page="tackle-football"
                section="equipment"
              >
                📍 Location: RiseUp Equipment Storage Unit
              </EditableText>
              <EditableText
                contentKey="tackle.equipment.location_address"
                as="p"
                className="text-sm text-muted-foreground"
                page="tackle-football"
                section="equipment"
              >
                NC Self Storage, 209 Trimble Plant Road, Southern Pines
              </EditableText>
            </div>

            <EditableText
              contentKey="tackle.equipment.schedule_note"
              as="p"
              className="mb-8 text-muted-foreground"
              page="tackle-football"
              section="equipment"
            >
              This is a large-scale operation involving over 300 athletes. We
              cannot accommodate drop-in fittings outside scheduled times.{' '}
              <strong className="text-white">
                Please attend your team's assigned time slot.
              </strong>
            </EditableText>

            {/* July 29 */}
            <div className="mb-6">
              <h4 className="mb-3 text-lg font-bold text-accent">
                July 29, 2026
              </h4>
              <div className="grid gap-2 text-sm md:grid-cols-2">
                <div className="rounded border border-white/10 bg-background p-3">
                  <span className="font-semibold text-white">5:00 PM</span> - TBA
                </div>
                <div className="rounded border border-white/10 bg-background p-3">
                  <span className="font-semibold text-white">5:30 PM</span> - TBA
                </div>
                <div className="rounded border border-white/10 bg-background p-3">
                  <span className="font-semibold text-white">6:00 PM</span> - TBA
                </div>
                <div className="rounded border border-white/10 bg-background p-3">
                  <span className="font-semibold text-white">6:30 PM</span> - TBA
                </div>
                <div className="rounded border border-white/10 bg-background p-3">
                  <span className="font-semibold text-white">7:00 PM</span> - TBA
                </div>
              </div>
            </div>

            {/* July 30 */}
            <div className="mb-6">
              <h4 className="mb-3 text-lg font-bold text-accent">
                July 30, 2026
              </h4>
              <div className="grid gap-2 text-sm md:grid-cols-2">
                <div className="rounded border border-white/10 bg-background p-3">
                  <span className="font-semibold text-white">5:00 PM</span> - TBA
                </div>
                <div className="rounded border border-white/10 bg-background p-3">
                  <span className="font-semibold text-white">5:30 PM</span> - TBA
                </div>
                <div className="rounded border border-white/10 bg-background p-3">
                  <span className="font-semibold text-white">6:00 PM</span> - TBA
                </div>
                <div className="rounded border border-white/10 bg-background p-3">
                  <span className="font-semibold text-white">6:30 PM</span> - TBA
                </div>
                <div className="rounded border border-white/10 bg-background p-3">
                  <span className="font-semibold text-white">7:00 PM</span> - TBA
                </div>
              </div>
            </div>

            {/* July 31 */}
            <div className="mb-6">
              <h4 className="mb-3 text-lg font-bold text-accent">
                July 31, 2026
              </h4>
              <div className="grid gap-2 text-sm md:grid-cols-2">
                <div className="rounded border border-white/10 bg-background p-3">
                  <span className="font-semibold text-white">5:00 PM</span> - TBA
                </div>
                <div className="rounded border border-white/10 bg-background p-3">
                  <span className="font-semibold text-white">5:30 PM</span> - TBA
                </div>
                <div className="rounded border border-accent/30 bg-accent/5 p-3">
                  <span className="font-semibold text-accent">
                    6:00-7:00 PM
                  </span>{' '}
                  - Makeup Session
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-background p-4">
              <EditableText
                contentKey="tackle.equipment.cant_attend_title"
                as="p"
                className="mb-2 text-sm font-semibold text-white"
                page="tackle-football"
                section="equipment"
              >
                Can't attend your assigned time?
              </EditableText>
              <EditableText
                contentKey="tackle.equipment.cant_attend_p1"
                as="p"
                className="text-sm text-muted-foreground"
                page="tackle-football"
                section="equipment"
              >
                Please arrange for an adult friend, teammate's parent, coach, or
                neighbor to pick up your athlete's gear during your team's time
                or the official makeup session. Please do not show up at other
                team times, as it disrupts the process.
              </EditableText>
              <EditableText
                contentKey="tackle.equipment.cant_attend_p2"
                as="p"
                className="mt-3 text-sm text-muted-foreground"
                page="tackle-football"
                section="equipment"
              >
                If sizing adjustments are needed, your coach will arrange group
                swaps during the first two weeks of practice.
              </EditableText>
            </div>
          </div>

          <div>
            <QuickReference
              title="What Players Need to Bring"
              columns={2}
              items={[
                {
                  label: 'Cleats',
                  value: 'Football or soccer cleats (no metal spikes)',
                },
                {
                  label: 'Mouth Guard',
                  value: 'Required for all practices and games',
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
      </section>

      {/* Schedule Section */}
      <section id="schedule" className="bg-white/5 pt-12 pb-16 md:pt-16 md:pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-8 text-center text-3xl font-bold text-white md:text-4xl">
            <EditableText
              contentKey="tackle.schedule.title"
              as="span"
              page="tackle-football"
              section="schedule"
            >
              Practice Schedule
            </EditableText>
          </h2>

          <div className="mb-12">
            <PhotoContentBlockEditable
              contentKey="tackle.schedule.practice_image"
              imageSrc="/images/practice-action.jpg"
              imageAlt="Team practicing plays"
              title="Weekly Practice Schedule"
              imagePosition="right"
              page="tackle-football"
              section="schedule"
              imageHeight="h-[400px] md:min-h-[500px]"
              rounded={false}
              wideImage={true}
            >
              <EditableText
                contentKey="tackle.schedule.practice_start"
                as="p"
                className="mb-4"
                page="tackle-football"
                section="schedule"
              >
                Practices begin <strong className="text-white">August 1, 2026</strong>{' '}
                and run through the season.
              </EditableText>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-white/10 bg-background p-4">
                  <EditableText
                    contentKey="tackle.schedule.before_games_title"
                    as="p"
                    className="font-semibold text-accent"
                    page="tackle-football"
                    section="schedule"
                  >
                    Before Games Start (4 practices/week):
                  </EditableText>
                  <EditableText
                    contentKey="tackle.schedule.before_games_times"
                    as="p"
                    className="text-sm text-muted-foreground"
                    page="tackle-football"
                    section="schedule"
                  >
                    Monday, Tuesday, Thursday: 5:30-7:30 PM
                    <br />
                    Saturday: 9:00 AM
                  </EditableText>
                </div>
                <div className="rounded-lg border border-white/10 bg-background p-4">
                  <EditableText
                    contentKey="tackle.schedule.during_season_title"
                    as="p"
                    className="font-semibold text-accent"
                    page="tackle-football"
                    section="schedule"
                  >
                    During Season (3 practices/week):
                  </EditableText>
                  <EditableText
                    contentKey="tackle.schedule.during_season_times"
                    as="p"
                    className="text-sm text-muted-foreground"
                    page="tackle-football"
                    section="schedule"
                  >
                    Monday, Tuesday, Thursday: 5:30-7:30 PM
                    <br />
                    Saturday: Game Day
                  </EditableText>
                </div>
              </div>
            </PhotoContentBlockEditable>
          </div>

          <div className="mb-12">
            <h3 className="mb-6 text-center text-2xl font-bold text-white">
              <EditableText
                contentKey="tackle.schedule.key_dates_title"
                as="span"
                page="tackle-football"
                section="schedule"
              >
                Key Season Dates
              </EditableText>
            </h3>
            <div className="mx-auto max-w-3xl">
              <Timeline items={keyDates} />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-background p-6">
              <h3 className="mb-4 text-xl font-bold text-accent">
                <EditableText
                  contentKey="tackle.schedule.jamboree_date"
                  as="span"
                  page="tackle-football"
                  section="schedule"
                >
                  August 22, 2026
                </EditableText>
              </h3>
              <h4 className="mb-2 text-lg font-semibold text-white">
                <EditableText
                  contentKey="tackle.schedule.jamboree_title"
                  as="span"
                  page="tackle-football"
                  section="schedule"
                >
                  Season Jamboree
                </EditableText>
              </h4>
              <EditableText
                contentKey="tackle.schedule.jamboree_description"
                as="p"
                className="text-muted-foreground"
                page="tackle-football"
                section="schedule"
              >
                Pre-season scrimmage event where teams get game-day experience
                before the regular season kicks off.
              </EditableText>
            </div>
            <div className="rounded-xl border border-accent/30 bg-accent/5 p-6">
              <h3 className="mb-4 text-xl font-bold text-accent">
                <EditableText
                  contentKey="tackle.schedule.first_game_date"
                  as="span"
                  page="tackle-football"
                  section="schedule"
                >
                  August 29, 2026
                </EditableText>
              </h3>
              <h4 className="mb-2 text-lg font-semibold text-white">
                <EditableText
                  contentKey="tackle.schedule.first_game_title"
                  as="span"
                  page="tackle-football"
                  section="schedule"
                >
                  Game 1
                </EditableText>
              </h4>
              <EditableText
                contentKey="tackle.schedule.first_game_description"
                as="p"
                className="text-muted-foreground"
                page="tackle-football"
                section="schedule"
              >
                First regular season game! Games 2-6 will be played September 12, 19, 26; October 3, 10. Labor Day weekend is off.
              </EditableText>
            </div>
          </div>
        </div>
      </section>

      {/* Mandatory Parent Meetings */}
      <section id="parent-meetings" className="pt-12 pb-16 md:pt-16 md:pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-4 text-center text-3xl font-bold text-white md:text-4xl">
            <EditableText
              contentKey="tackle.parent_meetings.title"
              as="span"
              page="tackle-football"
              section="parent-meetings"
            >
              Mandatory Parent Meetings
            </EditableText>
          </h2>
          <EditableText
            contentKey="tackle.parent_meetings.description"
            as="p"
            className="mb-12 text-center text-lg text-muted-foreground"
            page="tackle-football"
            section="parent-meetings"
          >
            RiseUp President Andy Davis will meet with each team's parents at
            their practice locations.
            <br />
            <strong className="text-accent">
              This is a mandatory 30-minute meeting for every family.
            </strong>
          </EditableText>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <div className="mb-2 text-sm font-semibold text-accent">
                August 1
              </div>
              <div className="text-lg font-bold text-white">9:00 AM</div>
              <div className="mt-2 text-muted-foreground">
                Team TBA &amp; Team TBA
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <div className="mb-2 text-sm font-semibold text-accent">
                August 4
              </div>
              <div className="text-lg font-bold text-white">5:30 PM</div>
              <div className="mt-2 text-muted-foreground">
                Team TBA &amp; Team TBA
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <div className="mb-2 text-sm font-semibold text-accent">
                August 5
              </div>
              <div className="text-lg font-bold text-white">5:30 PM</div>
              <div className="mt-2 text-muted-foreground">
                Team TBA &amp; Team TBA
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <div className="mb-2 text-sm font-semibold text-accent">
                August 7
              </div>
              <div className="text-lg font-bold text-white">5:30 PM</div>
              <div className="mt-2 text-muted-foreground">
                Team TBA &amp; Team TBA
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <div className="mb-2 text-sm font-semibold text-accent">
                August 8
              </div>
              <div className="text-lg font-bold text-white">9:00 AM</div>
              <div className="mt-2 text-muted-foreground">
                Team TBA &amp; Team TBA
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <div className="mb-2 text-sm font-semibold text-accent">
                August 11
              </div>
              <div className="text-lg font-bold text-white">5:30 PM</div>
              <div className="mt-2 text-muted-foreground">
                Team TBA &amp; Team TBA
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="pt-12 pb-16 md:pt-16 md:pb-24">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            <EditableText
              contentKey="tackle.cta.title"
              as="span"
              page="tackle-football"
              section="cta"
            >
              Ready to Rise Up?
            </EditableText>
          </h2>
          <EditableText
            contentKey="tackle.cta.description"
            as="p"
            className="mb-8 text-lg text-muted-foreground"
            page="tackle-football"
            section="cta"
          >
            Join the RiseUp Moore family and give your athlete an unforgettable
            football experience.
          </EditableText>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              disabled
              className="inline-block rounded-full bg-accent/50 px-8 py-4 text-lg font-semibold text-white cursor-not-allowed opacity-50"
            >
              <EditableText
                contentKey="tackle.cta.register_button"
                as="span"
                page="tackle-football"
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
