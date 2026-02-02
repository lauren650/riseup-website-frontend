import { Metadata } from "next";
import { LeadershipGrid, Leader } from "@/components/sections/leadership-grid";

export const metadata: Metadata = {
  title: "About Us | RiseUp Youth Football League",
  description:
    "Learn about RiseUp Youth Football League's mission to develop youth through the game of football. Meet our leadership team and discover our story.",
};

const leaders: Leader[] = [
  {
    name: "Michael Thompson",
    title: "Executive Director",
    bio: "Former NFL player with 15 years of youth coaching experience. Passionate about developing character through sports.",
    imageUrl: "/images/leadership/executive-director.jpg",
  },
  {
    name: "Sarah Martinez",
    title: "Board President",
    bio: "Community leader and parent advocate. Dedicated to creating opportunities for youth in underserved communities.",
    imageUrl: "/images/leadership/board-president.jpg",
  },
  {
    name: "Coach David Williams",
    title: "Head Coach & Program Director",
    bio: "USA Football certified with 20+ years experience. Specializes in youth development and safety protocols.",
    imageUrl: "/images/leadership/head-coach.jpg",
  },
];

const riseUpWay = [
  {
    letter: "R",
    title: "Resilience",
    description:
      "Learning resilience through overcoming challenges in the face of adversity.",
  },
  {
    letter: "I",
    title: "Integrity",
    description:
      "Practicing integrity by focusing on character and moral responsibility.",
  },
  {
    letter: "S",
    title: "Social Intelligence",
    description:
      "Developing social intelligence by adapting and integrating as part of a team.",
  },
  {
    letter: "E",
    title: "Emotional Regulation",
    description:
      "Driving emotional regulation by requiring appropriate behaviors and responses in context of the environment.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative flex h-[40vh] min-h-[300px] items-end justify-center bg-gradient-to-br from-accent/20 to-transparent">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="relative z-10 pb-12 text-center">
          <h1 className="text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            About RiseUp
          </h1>
          <p className="mt-4 text-lg text-muted-foreground md:text-xl">
            Building champions on and off the field since 2015
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-8 text-center text-3xl font-bold text-white md:text-4xl">
            Our Mission
          </h2>
          <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
            <p>
              At RiseUp Youth Football League, we believe that football is more than
              just a game. It&apos;s a powerful tool for developing character, discipline,
              and teamwork in young athletes. Our mission is to provide a safe,
              supportive environment where every child can discover their potential.
            </p>
            <p>
              We are committed to teaching the fundamentals of football while
              instilling values that extend far beyond the field. Through quality
              coaching, positive mentorship, and community support, we help young
              athletes become confident, resilient individuals.
            </p>
            <p>
              Every player who joins RiseUp becomes part of a family dedicated to
              their growth as both athletes and people. We measure our success not
              just in wins and losses, but in the lasting impact we have on the
              lives of our players.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="bg-white/5 py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-8 text-center text-3xl font-bold text-white md:text-4xl">
            Our Story
          </h2>
          <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
            <p>
              RiseUp Youth Football League was founded in 2015 by a group of
              parents and former players who saw a need for accessible, high-quality
              youth football programs in our community. What started with 40 players
              and a dream has grown into a thriving organization serving over 500
              young athletes each year.
            </p>
            <p>
              Over the years, we&apos;ve expanded from flag football to include tackle
              programs, specialized academies, and summer clinics. Our alumni have
              gone on to play at the high school, college, and even professional
              levels—but more importantly, they&apos;ve become leaders in their
              communities.
            </p>
            <p>
              Today, RiseUp continues to grow and evolve, but our core commitment
              remains unchanged: every child deserves the opportunity to learn,
              compete, and succeed in a positive environment.
            </p>
          </div>
        </div>
      </section>

      {/* The Rise Up Way Section */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-4 text-center text-3xl font-bold text-white md:text-4xl">
            The Rise Up Way
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-muted-foreground">
            Our core values define who we are and how we develop young athletes into leaders.
          </p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {riseUpWay.map((value, index) => (
              <div
                key={index}
                className="group rounded-xl border border-white/10 bg-white/5 p-6 text-center transition-all duration-300 hover:border-accent/50 hover:bg-white/10"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent text-3xl font-bold text-white">
                  {value.letter}
                </div>
                <h3 className="text-xl font-bold text-white">
                  {value.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="bg-white/5 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold text-white md:text-4xl">
            Our Leadership
          </h2>
          <LeadershipGrid leaders={leaders} />
        </div>
      </section>
    </>
  );
}
