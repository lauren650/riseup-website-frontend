import type { Metadata } from 'next';
import Link from 'next/link';
import { SubNavigation } from '@/components/ui/sub-navigation';
import { EditableHeroImage } from '@/components/sections/editable-hero-image';
import { EditableText } from '@/components/editable/editable-text';
import { GivebutterWidget } from '@/components/donations/givebutter-widget';
import {
  GOLF_TOURNAMENT_GIVEBUTTER_WIDGET_ID,
  GOLF_TOURNAMENT_REGISTER_URL,
} from '@/lib/site-config';

const subNavItems = [
  { id: 'about-riseup', label: 'About RiseUp' },
  { id: 'tournament', label: 'Tournament Details' },
  { id: 'register', label: 'Sign Up' },
];

export const metadata: Metadata = {
  title: 'Annual Golf Tournament | RiseUp Youth Football League',
  description:
    'Join RiseUp for our annual charity golf tournament in Moore County. Support youth football while enjoying a great day on the course.',
};

export default function GolfTournamentPage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[calc(500px+7rem)] md:min-h-[500px] overflow-hidden pt-[7rem] md:pt-0">
        <EditableHeroImage
          contentKey="golf_tournament.hero"
          src="/images/partners-hero.jpg"
          alt="RiseUp Annual Golf Tournament"
          page="golf-tournament"
          section="hero"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 z-10 pb-12 text-center px-6">
          <h1 className="text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            <EditableText
              contentKey="golf.hero.title"
              as="span"
              page="golf-tournament"
              section="hero"
            >
              RiseUp Annual Golf Tournament
            </EditableText>
          </h1>
          <EditableText
            contentKey="golf.hero.subtitle"
            as="p"
            className="mt-4 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto"
            page="golf-tournament"
            section="hero"
          >
            Tee off with us for a day of golf, community, and impact—supporting youth athletics across Moore County.
          </EditableText>
        </div>
      </section>

      <SubNavigation
        items={subNavItems}
        showRegisterButton
        registerLink={GOLF_TOURNAMENT_REGISTER_URL}
        registerLabel="Register for Tournament"
      />

      {/* About RiseUp */}
      <section id="about-riseup" className="pt-12 pb-16 md:pt-16 md:pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-8 text-center text-3xl font-bold text-white md:text-4xl">
            <EditableText
              contentKey="golf.about.title"
              as="span"
              page="golf-tournament"
              section="about"
            >
              About RiseUp
            </EditableText>
          </h2>

          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 max-w-6xl mx-auto">
            <div className="space-y-6">
              <EditableText
                contentKey="golf.about.mission_1"
                as="p"
                className="text-lg leading-relaxed text-muted-foreground"
                page="golf-tournament"
                section="about"
              >
                RiseUp Youth Football League empowers young athletes in Moore County through
                quality football programs, positive coaching, and a community that believes every
                child deserves the chance to learn, compete, and grow—on and off the field.
              </EditableText>
              <EditableText
                contentKey="golf.about.mission_2"
                as="p"
                className="text-lg leading-relaxed text-muted-foreground"
                page="golf-tournament"
                section="about"
              >
                From girls flag and tackle football to academies and clinics, we serve hundreds of
                families each season. Our programs focus on skill development, character, and
                teamwork while keeping participation accessible through scholarships and payment
                plans.
              </EditableText>
            </div>

            <div className="space-y-6">
              <div className="rounded-xl border border-accent/30 bg-accent/5 p-6">
                <h3 className="mb-3 text-xl font-bold text-white">
                  Why We Host This Tournament
                </h3>
                <EditableText
                  contentKey="golf.about.fundraiser"
                  as="p"
                  className="text-muted-foreground"
                  page="golf-tournament"
                  section="about"
                >
                  Our annual golf tournament is one of our biggest community fundraisers of the
                  year. Proceeds help fund equipment, field costs, scholarships, and program
                  operations—so more kids can rise up through football.
                </EditableText>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-center">
                  <div className="text-2xl font-bold text-accent">500+</div>
                  <p className="mt-1 text-sm text-muted-foreground">Athletes each season</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-center">
                  <div className="text-2xl font-bold text-accent">501(c)(3)</div>
                  <p className="mt-1 text-sm text-muted-foreground">Nonprofit organization</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-center">
                  <div className="text-2xl font-bold text-accent">Moore Co.</div>
                  <p className="mt-1 text-sm text-muted-foreground">Community rooted</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tournament Details */}
      <section id="tournament" className="bg-white/5 pt-12 pb-16 md:pt-16 md:pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-4 text-center text-3xl font-bold text-white md:text-4xl">
            <EditableText
              contentKey="golf.tournament.title"
              as="span"
              page="golf-tournament"
              section="tournament"
            >
              2026 Tournament Details
            </EditableText>
          </h2>
          <EditableText
            contentKey="golf.tournament.intro"
            as="p"
            className="mx-auto mb-12 max-w-3xl text-center text-lg text-muted-foreground"
            page="golf-tournament"
            section="tournament"
          >
            Grab your foursome and join us for a scramble-format tournament—great golf, great
            people, and a great cause.
          </EditableText>

          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 max-w-6xl mx-auto mb-12">
            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-background p-6">
                <h4 className="text-lg font-bold text-accent mb-2">When</h4>
                <EditableText
                  contentKey="golf.tournament.when"
                  as="p"
                  className="text-muted-foreground"
                  page="golf-tournament"
                  section="tournament"
                >
                  Saturday, [Date TBD], 2026
                  <br />
                  Check in at 7:30 AM with start time at 9:00 AM
                </EditableText>
              </div>
              <div className="rounded-xl border border-white/10 bg-background p-6">
                <h4 className="text-lg font-bold text-accent mb-2">Where</h4>
                <EditableText
                  contentKey="golf.tournament.where"
                  as="p"
                  className="text-muted-foreground"
                  page="golf-tournament"
                  section="tournament"
                >
                  [Course Name TBD]
                  <br />
                  <span className="text-sm">Moore County, NC</span>
                </EditableText>
              </div>
              <div className="rounded-xl border border-accent/30 bg-accent/5 p-6">
                <h4 className="text-lg font-bold text-accent mb-2">Format</h4>
                <EditableText
                  contentKey="golf.tournament.format"
                  as="p"
                  className="text-muted-foreground"
                  page="golf-tournament"
                  section="tournament"
                >
                  Four-person scramble • 18 holes • Prizes for top teams and longest drive
                </EditableText>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <h3 className="mb-4 text-xl font-bold text-white">What&apos;s Included</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-accent font-bold">✓</span>
                    <EditableText
                      contentKey="golf.tournament.include_1"
                      as="span"
                      page="golf-tournament"
                      section="tournament"
                    >
                      18 holes of golf with cart
                    </EditableText>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent font-bold">✓</span>
                    <EditableText
                      contentKey="golf.tournament.include_2"
                      as="span"
                      page="golf-tournament"
                      section="tournament"
                    >
                      On-course refreshments
                    </EditableText>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent font-bold">✓</span>
                    <EditableText
                      contentKey="golf.tournament.include_3"
                      as="span"
                      page="golf-tournament"
                      section="tournament"
                    >
                      Awards and prizes
                    </EditableText>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent font-bold">✓</span>
                    <EditableText
                      contentKey="golf.tournament.include_4"
                      as="span"
                      page="golf-tournament"
                      section="tournament"
                    >
                      Post-round celebration (details announced closer to event)
                    </EditableText>
                  </li>
                </ul>
              </div>

              <div className="rounded-xl border border-white/10 bg-background p-6">
                <h3 className="mb-3 text-lg font-bold text-white">Team Registration</h3>
                <EditableText
                  contentKey="golf.tournament.team_note"
                  as="p"
                  className="text-muted-foreground"
                  page="golf-tournament"
                  section="tournament"
                >
                  Teams are registered as foursomes. You may register a full team or join as an
                  individual and we will place you on a team when space allows.
                </EditableText>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-background p-6 md:p-8 max-w-3xl mx-auto">
            <h3 className="mb-4 text-xl font-bold text-white text-center">Sample Day Schedule</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="text-lg font-bold text-accent min-w-[100px]">7:30 AM</div>
                <EditableText
                  contentKey="golf.tournament.schedule_checkin"
                  as="p"
                  className="text-sm text-muted-foreground"
                  page="golf-tournament"
                  section="tournament"
                >
                  Check in — breakfast and warm-up on the range
                </EditableText>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="text-lg font-bold text-accent min-w-[100px]">9:00 AM</div>
                <EditableText
                  contentKey="golf.tournament.schedule_round"
                  as="p"
                  className="text-sm text-muted-foreground"
                  page="golf-tournament"
                  section="tournament"
                >
                  Shotgun start — 18-hole scramble with on-course contests
                </EditableText>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-accent/30 bg-accent/5 p-4">
                <div className="text-lg font-bold text-accent min-w-[100px]">After</div>
                <EditableText
                  contentKey="golf.tournament.schedule_awards"
                  as="p"
                  className="text-sm text-muted-foreground"
                  page="golf-tournament"
                  section="tournament"
                >
                  Awards, recognition, and celebration with fellow players and sponsors
                </EditableText>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sign Up */}
      <section id="register" className="pt-12 pb-16 md:pt-16 md:pb-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            <EditableText
              contentKey="golf.register.title"
              as="span"
              page="golf-tournament"
              section="register"
            >
              Sign Up Today
            </EditableText>
          </h2>
          <EditableText
            contentKey="golf.register.description"
            as="p"
            className="mb-8 text-lg text-muted-foreground"
            page="golf-tournament"
            section="register"
          >
            Reserve your team&apos;s spot for the 2026 RiseUp Golf Tournament. Space is limited—
            register early to secure your tee time.
          </EditableText>

          <div className="rounded-xl border border-white/10 bg-white/5 p-8 md:p-10">
            <GivebutterWidget
              widgetId={GOLF_TOURNAMENT_GIVEBUTTER_WIDGET_ID}
              align="center"
              loadingLabel="Loading tournament registration…"
            />

            <p className="mt-8 text-sm text-muted-foreground">
              Interested in sponsoring a hole or the longest drive contest?{' '}
              <Link href="/become-a-partner" className="font-semibold text-accent hover:opacity-90">
                View partnership opportunities
              </Link>{' '}
              or{' '}
              <Link href="/contact" className="font-semibold text-accent hover:opacity-90">
                contact us
              </Link>{' '}
              with questions.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
