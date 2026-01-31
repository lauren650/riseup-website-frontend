import type { Metadata } from "next";
import { SubNavigation } from "@/components/ui/sub-navigation";
import { EditableHeroImage } from "@/components/sections/editable-hero-image";
import { EditableText } from "@/components/editable/editable-text";
import { QuickReference } from "@/components/ui/quick-reference";
import { EditableButton } from "@/components/ui/editable-button";

export const metadata: Metadata = {
  title: "Academies & Clinics | RiseUp Youth Football League",
  description:
    "Specialized football training for all ages and skill levels. Winter clinic, tackle academy, and girls flag academy.",
};

const subNavItems = [
  { id: 'clinic', label: 'RiseUp Clinic' },
  { id: 'tackle-academy', label: 'RiseUp Tackle Academy' },
  { id: 'girls-flag-academy', label: 'RiseUp Girls Flag Academy' },
];

export default function AcademiesClinicsPage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] overflow-hidden">
        <EditableHeroImage
          contentKey="academies_clinics.hero"
          src="/images/academies-hero.jpg"
          alt="RiseUp Academies & Clinics"
          page="academies-clinics"
          section="hero"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80 pointer-events-none" />
      </section>

      {/* Sub Navigation */}
      <SubNavigation 
        items={subNavItems} 
        showRegisterButton={false}
      />

      {/* RiseUp Clinic Section */}
      <section id="clinic" className="pt-12 pb-16 md:pt-16 md:pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-8 text-center text-3xl font-bold text-white md:text-4xl">
            <EditableText
              contentKey="academies.clinic.title"
              as="span"
              page="academies-clinics"
              section="clinic"
            >
              RiseUp Winter Youth Sports Clinic
            </EditableText>
          </h2>

          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 mb-12">
            <div className="space-y-6">
              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <h3 className="mb-4 text-xl font-bold text-accent">Event Details</h3>
                <div className="space-y-3 text-muted-foreground">
                  <EditableText
                    contentKey="academies.clinic.when"
                    as="p"
                    page="academies-clinics"
                    section="clinic"
                  >
                    <strong className="text-white">When:</strong> Monday, February 16, 2026 (President's Day)
                    <br />
                    9:00 AM to Noon
                  </EditableText>
                  <EditableText
                    contentKey="academies.clinic.where"
                    as="p"
                    page="academies-clinics"
                    section="clinic"
                  >
                    <strong className="text-white">Where:</strong> Union Pines High School Stadium & Practice Fields
                  </EditableText>
                  <EditableText
                    contentKey="academies.clinic.who"
                    as="p"
                    page="academies-clinics"
                    section="clinic"
                  >
                    <strong className="text-white">Who:</strong> Open to all boys and girls in grades K-8
                  </EditableText>
                  <EditableText
                    contentKey="academies.clinic.cost"
                    as="p"
                    page="academies-clinics"
                    section="clinic"
                  >
                    <strong className="text-white">Cost:</strong> $50 per participant
                    <br />
                    <span className="text-sm">*Payment plans, scholarships, and sibling discounts available!</span>
                  </EditableText>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-xl border border-accent/30 bg-accent/5 p-6">
                <h3 className="mb-4 text-xl font-bold text-white">What We'll Cover</h3>
                <EditableText
                  contentKey="academies.clinic.description"
                  as="p"
                  className="text-muted-foreground mb-4"
                  page="academies-clinics"
                  section="clinic"
                >
                  Building core skills like speed, agility, and overall athletic fundamentals—skills that benefit all young athletes, regardless of sport!
                </EditableText>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-accent mr-2">•</span>
                    <span>Speed and acceleration training</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent mr-2">•</span>
                    <span>Agility drills and footwork</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent mr-2">•</span>
                    <span>Athletic fundamentals for all sports</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent mr-2">•</span>
                    <span>Fun competitive games</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-accent/30 bg-accent/5 p-6 max-w-3xl mx-auto text-center">
            <h3 className="mb-3 text-xl font-bold text-white">Early Bird Special!</h3>
            <EditableText
              contentKey="academies.clinic.early_bird"
              as="p"
              className="text-muted-foreground"
              page="academies-clinics"
              section="clinic"
            >
              Sign up by <strong className="text-white">January 30th</strong> to guarantee your athlete receives a participant shirt and personalized name badge!
            </EditableText>
          </div>

          {/* Clinic Registration Button */}
          <div className="mt-8 text-center">
            <EditableButton
              textKey="academies.clinic.register_button"
              urlKey="academies.clinic.register_url"
              defaultText="Register for Winter Clinic"
              defaultUrl="https://example.com/clinic-registration"
              page="academies-clinics"
              section="clinic"
            />
          </div>
        </div>
      </section>

      {/* RiseUp Tackle Academy Section */}
      <section id="tackle-academy" className="bg-white/5 pt-12 pb-16 md:pt-16 md:pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-8 text-center text-3xl font-bold text-white md:text-4xl">
            <EditableText
              contentKey="academies.tackle.title"
              as="span"
              page="academies-clinics"
              section="tackle-academy"
            >
              RiseUp Tackle Football Academy
            </EditableText>
          </h2>

          <div className="mb-8 max-w-4xl mx-auto">
            <EditableText
              contentKey="academies.tackle.intro"
              as="p"
              className="text-lg leading-relaxed text-muted-foreground text-center mb-6"
              page="academies-clinics"
              section="tackle-academy"
            >
              Is your child interested in taking their spring football skills to the next level? <strong className="text-white">We are thrilled to present the 2026 RiseUp Football Training Academy!</strong> Our program offers encouraging yet intense sessions focused on football conditioning, character and team development, and football mechanics.
            </EditableText>
            <EditableText
              contentKey="academies.tackle.mission"
              as="p"
              className="text-lg leading-relaxed text-muted-foreground text-center"
              page="academies-clinics"
              section="tackle-academy"
            >
              At RiseUp, our mission is to instill the essential qualities of mind, heart, spirit, confidence, mental toughness, and leadership – preparing young athletes for success both on and off the field. Players will be grouped by position to receive specialized coaching in offensive and defensive skills, maximizing their development in just five months of off-season training.
            </EditableText>
          </div>

          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 mb-12">
            <div className="space-y-6">
              <div className="rounded-xl border border-white/10 bg-background p-6">
                <h3 className="mb-4 text-xl font-bold text-accent">Program Details</h3>
                <div className="space-y-3 text-muted-foreground">
                  <EditableText
                    contentKey="academies.tackle.coach"
                    as="p"
                    page="academies-clinics"
                    section="tackle-academy"
                  >
                    <strong className="text-white">Head Coach:</strong> Chris Metzger
                  </EditableText>
                  <EditableText
                    contentKey="academies.tackle.when"
                    as="p"
                    page="academies-clinics"
                    section="tackle-academy"
                  >
                    <strong className="text-white">When:</strong> Mondays & Wednesdays, 4:00-5:00 PM
                    <br />
                    Throughout March, April, May, June, and July
                  </EditableText>
                  <EditableText
                    contentKey="academies.tackle.where"
                    as="p"
                    page="academies-clinics"
                    section="tackle-academy"
                  >
                    <strong className="text-white">Where:</strong> Rassie Wicker Park Turf Field
                  </EditableText>
                  <EditableText
                    contentKey="academies.tackle.who"
                    as="p"
                    page="academies-clinics"
                    section="tackle-academy"
                  >
                    <strong className="text-white">Who:</strong> Tackle Football Players
                  </EditableText>
                  <EditableText
                    contentKey="academies.tackle.cost"
                    as="p"
                    page="academies-clinics"
                    section="tackle-academy"
                  >
                    <strong className="text-white">Cost:</strong> $155 per participant, per month
                    <br />
                    <span className="text-sm">8 sessions a month - registration available on a monthly basis</span>
                  </EditableText>
                </div>
              </div>

              <div className="rounded-xl border border-accent/30 bg-accent/5 p-6">
                <h3 className="mb-4 text-xl font-bold text-white">What You Will Learn</h3>
                <EditableText
                  contentKey="academies.tackle.learn_intro"
                  as="p"
                  className="text-muted-foreground mb-4"
                  page="academies-clinics"
                  section="tackle-academy"
                >
                  This Academy will focus on the full fundamentals of football:
                </EditableText>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-accent mr-2">•</span>
                    <span>Footwork & Technique</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent mr-2">•</span>
                    <span>Blocking</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent mr-2">•</span>
                    <span>Non-contact Tackling</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent mr-2">•</span>
                    <span>Offense, Defense, and Special Teams</span>
                  </li>
                </ul>
                <EditableText
                  contentKey="academies.tackle.learn_growth"
                  as="p"
                  className="text-muted-foreground mt-4"
                  page="academies-clinics"
                  section="tackle-academy"
                >
                  Each athlete will grow in their knowledge of the game and raise their football IQ. They will learn the full rules, terminology, and basic structure of the game.
                </EditableText>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <h3 className="mb-4 text-xl font-bold text-white">Program Notes</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <EditableText
                    contentKey="academies.tackle.note_arrival"
                    as="p"
                    page="academies-clinics"
                    section="tackle-academy"
                  >
                    <strong className="text-white">Arrival:</strong> Arriving just a little before 4:00 pm would be helpful to make sure we get the full work with our coaches.
                  </EditableText>
                  <EditableText
                    contentKey="academies.tackle.note_cleats"
                    as="p"
                    page="academies-clinics"
                    section="tackle-academy"
                  >
                    <strong className="text-white">Cleats:</strong> Encouraged if you have them. If you don't own cleats, or if your child has grown out of their last pair, athletic/running shoes (sneakers, tennis shoes) are perfectly acceptable.
                  </EditableText>
                  <EditableText
                    contentKey="academies.tackle.note_football"
                    as="p"
                    page="academies-clinics"
                    section="tackle-academy"
                  >
                    <strong className="text-white">Football (Required):</strong> We ask each athlete to bring their own football (age appropriately sized).
                    <br />
                    • Tackle: Junior Size for 9-12, Youth Size for ages 12-14, Official size for 14+
                  </EditableText>
                  <EditableText
                    contentKey="academies.tackle.note_water"
                    as="p"
                    page="academies-clinics"
                    section="tackle-academy"
                  >
                    <strong className="text-white">Water & Labels:</strong> Please bring a water bottle and be sure to label it along with any layers of clothing, personal items, etc. so we can always try to reunite them should your athlete leave something behind.
                  </EditableText>
                  <EditableText
                    contentKey="academies.tackle.note_weather"
                    as="p"
                    page="academies-clinics"
                    section="tackle-academy"
                  >
                    <strong className="text-white">Weather:</strong> If we have to cancel or reschedule due to weather, we will send you a text message and email as soon as we can definitively make this decision through League Apps. Make ups will be scheduled around the availability of the fields (determined by Pinehurst Parks and Rec.)
                  </EditableText>
                </div>
              </div>

              <div className="rounded-xl border border-accent/30 bg-accent/5 p-6">
                <h3 className="mb-4 text-xl font-bold text-white">Character Development</h3>
                <EditableText
                  contentKey="academies.tackle.character"
                  as="p"
                  className="text-muted-foreground"
                  page="academies-clinics"
                  section="tackle-academy"
                >
                  Most importantly, our athletes will build character through targeted themes and messages to build and improve effective habits for success.
                </EditableText>
              </div>
            </div>
          </div>

          {/* Tackle Academy Registration Button */}
          <div className="mt-8 text-center">
            <EditableButton
              textKey="academies.tackle.register_button"
              urlKey="academies.tackle.register_url"
              defaultText="Register for Tackle Academy"
              defaultUrl="https://example.com/tackle-academy-registration"
              page="academies-clinics"
              section="tackle-academy"
            />
          </div>
        </div>
      </section>

      {/* RiseUp Girls Flag Academy Section */}
      <section id="girls-flag-academy" className="pt-12 pb-16 md:pt-16 md:pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-8 text-center text-3xl font-bold text-white md:text-4xl">
            <EditableText
              contentKey="academies.flag.title"
              as="span"
              page="academies-clinics"
              section="girls-flag-academy"
            >
              RiseUp Girls Flag Football Academy
            </EditableText>
          </h2>

          <div className="mb-8 max-w-4xl mx-auto">
            <EditableText
              contentKey="academies.flag.intro"
              as="p"
              className="text-lg leading-relaxed text-muted-foreground text-center mb-6"
              page="academies-clinics"
              section="girls-flag-academy"
            >
              Is your child interested in taking their spring football skills to the next level? <strong className="text-white">We are thrilled to present the 2026 RiseUp Football Training Academy!</strong> Our program offers encouraging yet intense sessions focused on football conditioning, character and team development, and football mechanics. Groups will be split into the athletes working on girls flag football and those working on tackle football.
            </EditableText>
            <EditableText
              contentKey="academies.flag.mission"
              as="p"
              className="text-lg leading-relaxed text-muted-foreground text-center"
              page="academies-clinics"
              section="girls-flag-academy"
            >
              At RiseUp, our mission is to instill the essential qualities of mind, heart, spirit, confidence, mental toughness, and leadership – preparing young athletes for success both on and off the field. Players will be grouped by position to receive specialized coaching in offensive and defensive skills, maximizing their development in just five months of off-season training.
            </EditableText>
          </div>

          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 mb-12">
            <div className="space-y-6">
              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <h3 className="mb-4 text-xl font-bold text-accent">Program Details</h3>
                <div className="space-y-3 text-muted-foreground">
                  <EditableText
                    contentKey="academies.flag.coach"
                    as="p"
                    page="academies-clinics"
                    section="girls-flag-academy"
                  >
                    <strong className="text-white">Head Coach:</strong> Chris Metzger
                  </EditableText>
                  <EditableText
                    contentKey="academies.flag.when"
                    as="p"
                    page="academies-clinics"
                    section="girls-flag-academy"
                  >
                    <strong className="text-white">When:</strong> Mondays & Wednesdays, 4:00-5:00 PM
                    <br />
                    Throughout March, April, May, June, and July
                  </EditableText>
                  <EditableText
                    contentKey="academies.flag.where"
                    as="p"
                    page="academies-clinics"
                    section="girls-flag-academy"
                  >
                    <strong className="text-white">Where:</strong> Rassie Wicker Park Turf Field
                  </EditableText>
                  <EditableText
                    contentKey="academies.flag.who"
                    as="p"
                    page="academies-clinics"
                    section="girls-flag-academy"
                  >
                    <strong className="text-white">Who:</strong> Girls Flag Grades 3-12 (for the 2026-27 school year)
                  </EditableText>
                  <EditableText
                    contentKey="academies.flag.cost"
                    as="p"
                    page="academies-clinics"
                    section="girls-flag-academy"
                  >
                    <strong className="text-white">Cost:</strong> $155 per participant, per month
                    <br />
                    <span className="text-sm">8 sessions a month - registration available on a monthly basis</span>
                  </EditableText>
                </div>
              </div>

              <div className="rounded-xl border border-accent/30 bg-accent/5 p-6">
                <h3 className="mb-4 text-xl font-bold text-white">What You Will Learn</h3>
                <EditableText
                  contentKey="academies.flag.learn_intro"
                  as="p"
                  className="text-muted-foreground mb-4"
                  page="academies-clinics"
                  section="girls-flag-academy"
                >
                  This Academy will focus on the full fundamentals of football:
                </EditableText>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-accent mr-2">•</span>
                    <span>Footwork & Technique</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent mr-2">•</span>
                    <span>Blocking</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent mr-2">•</span>
                    <span>Non-contact Tackling</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent mr-2">•</span>
                    <span>Offense, Defense, and Special Teams</span>
                  </li>
                </ul>
                <EditableText
                  contentKey="academies.flag.learn_growth"
                  as="p"
                  className="text-muted-foreground mt-4"
                  page="academies-clinics"
                  section="girls-flag-academy"
                >
                  Each athlete will grow in their knowledge of the game and raise their football IQ. They will learn the full rules, terminology, and basic structure of the game.
                </EditableText>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-xl border border-white/10 bg-background p-6">
                <h3 className="mb-4 text-xl font-bold text-white">Program Notes</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <EditableText
                    contentKey="academies.flag.note_arrival"
                    as="p"
                    page="academies-clinics"
                    section="girls-flag-academy"
                  >
                    <strong className="text-white">Arrival:</strong> Arriving just a little before 4:00 pm would be helpful to make sure we get the full work with our coaches.
                  </EditableText>
                  <EditableText
                    contentKey="academies.flag.note_cleats"
                    as="p"
                    page="academies-clinics"
                    section="girls-flag-academy"
                  >
                    <strong className="text-white">Cleats:</strong> Encouraged if you have them. If you don't own cleats, or if your child has grown out of their last pair, athletic/running shoes (sneakers, tennis shoes) are perfectly acceptable.
                  </EditableText>
                  <EditableText
                    contentKey="academies.flag.note_football"
                    as="p"
                    page="academies-clinics"
                    section="girls-flag-academy"
                  >
                    <strong className="text-white">Football (Required):</strong> We ask each athlete to bring their own football (age appropriately sized).
                    <br />
                    • Girls Flag: Pee Wee for Elementary (3-5 grade), Junior Size for Middle and High (6-12 grade)
                  </EditableText>
                  <EditableText
                    contentKey="academies.flag.note_water"
                    as="p"
                    page="academies-clinics"
                    section="girls-flag-academy"
                  >
                    <strong className="text-white">Water & Labels:</strong> Please bring a water bottle and be sure to label it along with any layers of clothing, personal items, etc. so we can always try to reunite them should your athlete leave something behind.
                  </EditableText>
                  <EditableText
                    contentKey="academies.flag.note_weather"
                    as="p"
                    page="academies-clinics"
                    section="girls-flag-academy"
                  >
                    <strong className="text-white">Weather:</strong> If we have to cancel or reschedule due to weather, we will send you a text message and email as soon as we can definitively make this decision through League Apps. Make ups will be scheduled around the availability of the fields (determined by Pinehurst Parks and Rec.)
                  </EditableText>
                </div>
              </div>

              <div className="rounded-xl border border-accent/30 bg-accent/5 p-6">
                <h3 className="mb-4 text-xl font-bold text-white">Character Development</h3>
                <EditableText
                  contentKey="academies.flag.character"
                  as="p"
                  className="text-muted-foreground"
                  page="academies-clinics"
                  section="girls-flag-academy"
                >
                  Most importantly, our athletes will build character through targeted themes and messages to build and improve effective habits for success.
                </EditableText>
              </div>
            </div>
          </div>

          {/* Girls Flag Academy Registration Button */}
          <div className="mt-8 text-center">
            <EditableButton
              textKey="academies.flag.register_button"
              urlKey="academies.flag.register_url"
              defaultText="Register for Girls Flag Academy"
              defaultUrl="https://example.com/girls-flag-academy-registration"
              page="academies-clinics"
              section="girls-flag-academy"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
