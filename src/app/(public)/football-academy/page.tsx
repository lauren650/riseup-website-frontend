import type { Metadata } from 'next';
import { SubNavigation } from '@/components/ui/sub-navigation';
import { ParentTestimonials } from '@/components/sections/parent-testimonials';
import { PhotoContentBlockEditable } from '@/components/sections/photo-content-block-editable';
import { QuickReference } from '@/components/ui/quick-reference';
import { EditableHeroImage } from '@/components/sections/editable-hero-image';
import { EditableText } from '@/components/editable/editable-text';

const subNavItems = [
  { id: 'overview', label: 'Overview' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'what-you-learn', label: 'What You\'ll Learn' },
  { id: 'program-notes', label: 'Program Notes' },
];

const parentTestimonials = [
  {
    quote:
      'My son has grown as a person and as an athlete and the positive, dedicated and passionate leadership of these coaches was a game changer! Top notch experience.',
    parentName: 'RiseUp Parent',
  },
  {
    quote:
      'We LOVED Rise Up and cannot wait for next year. The coaches were excellent and kind. They were very good with the children.',
    parentName: 'RiseUp Parent',
  },
  {
    quote:
      'We have participated with all Rise up activities since the start and will continue to with all of our children. It\'s an amazing organization.',
    parentName: 'RiseUp Parent',
  },
  {
    quote:
      'This is the best run, most communicative, and most enriching youth sports program we have been a part of.',
    parentName: 'RiseUp Parent',
  },
  {
    quote:
      'Sports are about team work, resilience, respect, giving back, and being the best version of yourself on and off the field. RiseUp is truly an example to follow.',
    parentName: 'RiseUp Parent',
  },
];

export const metadata: Metadata = {
  title: 'RiseUp Football Academy | RiseUp Youth Football League',
  description: '2026 RiseUp Football Training Academy - Off-season football training for tackle and girls flag athletes. July sessions at Rassie Wicker Park Turf Field.',
};

export default function FootballAcademyPage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[calc(500px+7rem)] md:min-h-[500px] overflow-hidden pt-[7rem] md:pt-0">
        <EditableHeroImage
          contentKey="football_academy.hero"
          src="/images/academy-hero.jpg"
          alt="RiseUp Football Academy Training"
          page="football-academy"
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
              contentKey="academy.overview.title"
              as="span"
              page="football-academy"
              section="overview"
            >
              RiseUp Football Academy
            </EditableText>
          </h2>

          {/* Two Column Layout */}
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Left Column: Program Information */}
            <div className="space-y-8">
              <div>
                <h3 className="mb-4 text-2xl font-bold text-white">
                  <EditableText
                    contentKey="academy.overview.welcome_title"
                    as="span"
                    page="football-academy"
                    section="overview"
                  >
                    Summer Training
                  </EditableText>
                </h3>
                <EditableText
                  contentKey="academy.overview.intro"
                  as="p"
                  className="text-lg leading-relaxed text-muted-foreground mb-4"
                  page="football-academy"
                  section="overview"
                >
                  Is your child interested in taking their football skills to the next level? <strong className="text-white">We are thrilled to present the 2026 RiseUp Football Training Academy!</strong> Our program offers encouraging yet intense sessions focused on football conditioning, character and team development, and football mechanics.
                </EditableText>
                <EditableText
                  contentKey="academy.overview.groups"
                  as="p"
                  className="text-lg leading-relaxed text-muted-foreground"
                  page="football-academy"
                  section="overview"
                >
                  Groups will be split into athletes working on girls flag football and those working on tackle football.
                </EditableText>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <h3 className="mb-4 text-xl font-bold text-white">
                  Our Mission
                </h3>
                <EditableText
                  contentKey="academy.overview.mission_p1"
                  as="p"
                  className="text-muted-foreground mb-4"
                  page="football-academy"
                  section="overview"
                >
                  At RiseUp, our mission is to instill the essential qualities of mind, heart, spirit, confidence, mental toughness, and leadership – preparing young athletes for success both on and off the field.
                </EditableText>
                <EditableText
                  contentKey="academy.overview.mission_p2"
                  as="p"
                  className="text-muted-foreground"
                  page="football-academy"
                  section="overview"
                >
                  Players will be grouped by position to receive specialized coaching in offensive and defensive skills, maximizing their development across four summer training sessions in July.
                </EditableText>
              </div>
            </div>

            {/* Right Column: Program Details */}
            <div>
              <h3 className="mb-4 text-2xl font-bold text-white">
                <EditableText
                  contentKey="academy.overview.details_title"
                  as="span"
                  page="football-academy"
                  section="overview"
                >
                  Program Details
                </EditableText>
              </h3>
              <div className="space-y-4">
                <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                  <h4 className="text-lg font-bold text-accent mb-2">Head Coach</h4>
                  <EditableText
                    contentKey="academy.details.coach"
                    as="p"
                    className="text-muted-foreground"
                    page="football-academy"
                    section="overview"
                  >
                    Chris Metzger
                  </EditableText>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                  <h4 className="text-lg font-bold text-accent mb-2">Who</h4>
                  <EditableText
                    contentKey="academy.details.who"
                    as="p"
                    className="text-muted-foreground"
                    page="football-academy"
                    section="overview"
                  >
                    <strong className="text-white">Tackle:</strong> Ages 9-14 (as of August 31, 2026)
                    <br />
                    <strong className="text-white">Girls Flag:</strong> Grades 3-12 (for the 2026-27 school year)
                  </EditableText>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                  <h4 className="text-lg font-bold text-accent mb-2">When</h4>
                  <EditableText
                    contentKey="academy.details.when"
                    as="p"
                    className="text-muted-foreground"
                    page="football-academy"
                    section="overview"
                  >
                    July 6 & 8, 4:00–5:00 PM
                    <br />
                    July 13 & 15, 3:00–4:00 PM
                  </EditableText>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                  <h4 className="text-lg font-bold text-accent mb-2">Where</h4>
                  <EditableText
                    contentKey="academy.details.where"
                    as="p"
                    className="text-muted-foreground"
                    page="football-academy"
                    section="overview"
                  >
                    Rassie Wicker Park Turf Field
                  </EditableText>
                </div>
                <div className="rounded-xl border border-accent/30 bg-accent/5 p-6">
                  <h4 className="text-lg font-bold text-accent mb-2">Cost</h4>
                  <EditableText
                    contentKey="academy.details.cost"
                    as="p"
                    className="text-white font-semibold"
                    page="football-academy"
                    section="overview"
                  >
                    $75 per participant
                  </EditableText>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section id="schedule" className="bg-white/5 pt-12 pb-16 md:pt-16 md:pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-8 text-center text-3xl font-bold text-white md:text-4xl">
            <EditableText
              contentKey="academy.schedule.title"
              as="span"
              page="football-academy"
              section="schedule"
            >
              Training Schedule
            </EditableText>
          </h2>

          <div className="mb-12 max-w-3xl mx-auto">
            <div className="rounded-xl border border-white/10 bg-background p-6 md:p-8">
              <div className="grid gap-4">
                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-lg font-bold text-accent">July 6 & 8</div>
                      <div className="text-sm text-muted-foreground mt-1">Monday & Wednesday</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">4:00–5:00 PM</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-lg font-bold text-accent">July 13 & 15</div>
                      <div className="text-sm text-muted-foreground mt-1">Monday & Wednesday</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">3:00–4:00 PM</div>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
                  <div className="text-sm font-semibold text-accent mb-2">📍 Location</div>
                  <EditableText
                    contentKey="academy.schedule.location"
                    as="p"
                    className="text-white"
                    page="football-academy"
                    section="schedule"
                  >
                    Rassie Wicker Park Turf Field
                  </EditableText>
                </div>

                <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
                  <div className="text-sm font-semibold text-accent mb-2">Cost</div>
                  <EditableText
                    contentKey="academy.schedule.cost"
                    as="p"
                    className="text-white font-semibold"
                    page="football-academy"
                    section="schedule"
                  >
                    $75 per participant
                  </EditableText>
                </div>

                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <EditableText
                    contentKey="academy.schedule.note"
                    as="p"
                    className="text-sm text-muted-foreground"
                    page="football-academy"
                    section="schedule"
                  >
                    <strong className="text-white">Arriving a few minutes before your session start time</strong> (4:00 PM or 3:00 PM) helps us get the full workout with our coaches.
                  </EditableText>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-accent/30 bg-accent/5 p-6 md:p-8 max-w-3xl mx-auto">
            <h3 className="mb-4 text-xl font-bold text-white">
              Weather Cancellations
            </h3>
            <EditableText
              contentKey="academy.schedule.weather"
              as="p"
              className="text-muted-foreground"
              page="football-academy"
              section="schedule"
            >
              If we have to cancel or reschedule due to weather, we will send you a text message and email as soon as we can definitively make this decision through League Apps. Make ups will be scheduled around the availability of the fields (determined by Pinehurst Parks and Rec.)
            </EditableText>
          </div>
        </div>
      </section>

      {/* What You'll Learn Section */}
      <section id="what-you-learn" className="pt-12 pb-16 md:pt-16 md:pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-8 text-center text-3xl font-bold text-white md:text-4xl">
            <EditableText
              contentKey="academy.learn.title"
              as="span"
              page="football-academy"
              section="learn"
            >
              What You Will Learn
            </EditableText>
          </h2>

          <div className="mb-12 max-w-4xl mx-auto">
            <EditableText
              contentKey="academy.learn.intro"
              as="p"
              className="text-lg text-center text-muted-foreground mb-8"
              page="football-academy"
              section="learn"
            >
              This Academy will focus on the full fundamentals of football:
            </EditableText>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-xl font-bold text-accent mb-3">Technical Skills</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-accent mr-2">•</span>
                    <EditableText
                      contentKey="academy.learn.skill_1"
                      as="span"
                      page="football-academy"
                      section="learn"
                    >
                      Footwork and Technique
                    </EditableText>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent mr-2">•</span>
                    <EditableText
                      contentKey="academy.learn.skill_2"
                      as="span"
                      page="football-academy"
                      section="learn"
                    >
                      Blocking Fundamentals
                    </EditableText>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent mr-2">•</span>
                    <EditableText
                      contentKey="academy.learn.skill_3"
                      as="span"
                      page="football-academy"
                      section="learn"
                    >
                      Non-contact Tackling
                    </EditableText>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent mr-2">•</span>
                    <EditableText
                      contentKey="academy.learn.skill_4"
                      as="span"
                      page="football-academy"
                      section="learn"
                    >
                      Offensive Strategies
                    </EditableText>
                  </li>
                </ul>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-xl font-bold text-accent mb-3">Game Understanding</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-accent mr-2">•</span>
                    <EditableText
                      contentKey="academy.learn.game_1"
                      as="span"
                      page="football-academy"
                      section="learn"
                    >
                      Defensive Strategies
                    </EditableText>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent mr-2">•</span>
                    <EditableText
                      contentKey="academy.learn.game_2"
                      as="span"
                      page="football-academy"
                      section="learn"
                    >
                      Special Teams
                    </EditableText>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent mr-2">•</span>
                    <EditableText
                      contentKey="academy.learn.game_3"
                      as="span"
                      page="football-academy"
                      section="learn"
                    >
                      Rules and Terminology
                    </EditableText>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent mr-2">•</span>
                    <EditableText
                      contentKey="academy.learn.game_4"
                      as="span"
                      page="football-academy"
                      section="learn"
                    >
                      Raise Football IQ
                    </EditableText>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-accent/30 bg-accent/5 p-6">
              <h3 className="text-xl font-bold text-white mb-3">Character Development</h3>
              <EditableText
                contentKey="academy.learn.character"
                as="p"
                className="text-muted-foreground"
                page="football-academy"
                section="learn"
              >
                Most importantly, our athletes will build character through targeted themes and messages to build and improve effective habits for success both on and off the field.
              </EditableText>
            </div>
          </div>
        </div>
      </section>

      {/* Program Notes Section */}
      <section id="program-notes" className="bg-white/5 pt-12 pb-16 md:pt-16 md:pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-8 text-center text-3xl font-bold text-white md:text-4xl">
            <EditableText
              contentKey="academy.notes.title"
              as="span"
              page="football-academy"
              section="notes"
            >
              Program Notes
            </EditableText>
          </h2>

          <div className="max-w-4xl mx-auto">
            <QuickReference
              title="What Athletes Need to Bring"
              columns={2}
              items={[
                {
                  label: 'Football (Age-Appropriate)',
                  value: 'Tackle: Junior (9-12), Youth (12-14), Official (14+). Flag: Pee Wee (Grades 3-5), Junior (Grades 6-12)',
                },
                {
                  label: 'Cleats or Athletic Shoes',
                  value: 'Cleats encouraged if available, sneakers perfectly acceptable',
                },
                {
                  label: 'Water Bottle (Labeled)',
                  value: 'Staying hydrated is essential',
                },
                {
                  label: 'All Personal Items Labeled',
                  value: 'Label clothing layers and belongings so we can reunite them with you',
                },
              ]}
            />

            <div className="mt-8 space-y-6">
              <div className="rounded-xl border border-white/10 bg-background p-6">
                <h3 className="mb-3 text-lg font-bold text-white">Football Size Guide</h3>
                <div className="space-y-3 text-muted-foreground">
                  <div>
                    <EditableText
                      contentKey="academy.notes.football_tackle_title"
                      as="p"
                      className="font-semibold text-accent"
                      page="football-academy"
                      section="notes"
                    >
                      Tackle Athletes:
                    </EditableText>
                    <EditableText
                      contentKey="academy.notes.football_tackle"
                      as="p"
                      className="text-sm"
                      page="football-academy"
                      section="notes"
                    >
                      Junior Size for ages 9-12, Youth Size for ages 12-14, Official size for 14+
                    </EditableText>
                  </div>
                  <div>
                    <EditableText
                      contentKey="academy.notes.football_flag_title"
                      as="p"
                      className="font-semibold text-accent"
                      page="football-academy"
                      section="notes"
                    >
                      Girls Flag Athletes:
                    </EditableText>
                    <EditableText
                      contentKey="academy.notes.football_flag"
                      as="p"
                      className="text-sm"
                      page="football-academy"
                      section="notes"
                    >
                      Pee Wee for Elementary (grades 3-5), Junior Size for Middle and High School (grades 6-12)
                    </EditableText>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <h3 className="mb-3 text-lg font-bold text-white">Additional Notes</h3>
                <div className="space-y-3 text-muted-foreground">
                  <EditableText
                    contentKey="academy.notes.cleats"
                    as="p"
                    page="football-academy"
                    section="notes"
                  >
                    <strong className="text-white">Cleats:</strong> Encouraged if you have them. If you don't own cleats, or if your child has grown out of their last pair (and likely will grow into a new size before fall), athletic/running shoes (sneakers, tennis shoes) are perfectly acceptable.
                  </EditableText>
                  <EditableText
                    contentKey="academy.notes.arrival"
                    as="p"
                    page="football-academy"
                    section="notes"
                  >
                    <strong className="text-white">Arrival Time:</strong> Please arrive a few minutes before your session start time (4:00 PM or 3:00 PM) to ensure we maximize coaching time.
                  </EditableText>
                  <EditableText
                    contentKey="academy.notes.labeling"
                    as="p"
                    page="football-academy"
                    section="notes"
                  >
                    <strong className="text-white">Label Everything:</strong> Please label water bottles, clothing layers, and all personal items so we can reunite them with your athlete if left behind.
                  </EditableText>
                </div>
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
              contentKey="academy.cta.title"
              as="span"
              page="football-academy"
              section="cta"
            >
              Ready to Elevate Your Game?
            </EditableText>
          </h2>
          <EditableText
            contentKey="academy.cta.description"
            as="p"
            className="mb-8 text-lg text-muted-foreground"
            page="football-academy"
            section="cta"
          >
            Join the RiseUp Football Academy and take your skills to the next level this summer.
          </EditableText>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#"
              className="inline-block rounded-full bg-accent px-8 py-4 text-lg font-semibold text-white transition-opacity hover:opacity-90"
            >
              <EditableText
                contentKey="academy.cta.register_button"
                as="span"
                page="football-academy"
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
