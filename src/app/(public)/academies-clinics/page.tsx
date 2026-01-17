import type { Metadata } from "next";
import { ProgramPage } from "@/components/sections/program-page";

export const metadata: Metadata = {
  title: "Academies & Clinics | RiseUp Youth Football League",
  description:
    "Specialized football training for all ages and skill levels. QB academies, speed camps, and intensive skill clinics led by expert coaches.",
};

const academiesData = {
  title: "Academies & Clinics",
  subtitle: "Skills training for all ages and experience levels",
  heroImage: "/images/academies-hero.jpg",
  description:
    "Take your game to the next level with our specialized training programs. Whether you're looking to improve your quarterback mechanics, increase your speed, or prepare for the upcoming season, our academies and clinics provide focused, expert instruction in a small-group setting. Open to all players regardless of which league they play in.",
  ageGroups: [
    {
      name: "All Ages Welcome",
      ages: "Ages 5-18",
      description:
        "Players are grouped by skill level and experience, not just age. Everyone from beginners to advanced athletes will find the right fit.",
    },
    {
      name: "Skill-Based Grouping",
      ages: "Beginner to Advanced",
      description:
        "Initial assessment ensures players train with others at similar skill levels for optimal development and challenge.",
    },
    {
      name: "Position-Specific",
      ages: "Varies by Clinic",
      description:
        "Some clinics focus on specific positions (QB, WR, linemen) while others cover general skills applicable to all players.",
    },
  ],
  schedule: [
    {
      day: "QB Academy",
      time: "Sundays 10:00 AM - 12:00 PM",
      location: "RiseUp Indoor Facility",
    },
    {
      day: "Speed & Agility Camp",
      time: "Mondays & Wednesdays 6:00 PM - 7:30 PM",
      location: "RiseUp Sports Complex - Track",
    },
    {
      day: "Summer Intensive",
      time: "June 15-19, 9:00 AM - 3:00 PM Daily",
      location: "RiseUp Sports Complex - All Fields",
    },
    {
      day: "Pre-Season Camp",
      time: "August (Dates TBA)",
      location: "RiseUp Sports Complex",
    },
  ],
  costs: [
    {
      item: "QB Academy (8 weeks)",
      price: "$200",
      notes: "Includes video analysis and personalized feedback",
    },
    {
      item: "Speed & Agility Camp (6 weeks)",
      price: "$150",
      notes: "Timing equipment and progress tracking included",
    },
    {
      item: "Summer Intensive (1 week)",
      price: "$175",
      notes: "Full-day camp with lunch provided",
    },
    {
      item: "Drop-In Clinics",
      price: "$50",
      notes: "Single session, subject to availability",
    },
  ],
  coaches: [
    {
      name: "Coach Tyler Reed",
      role: "QB Academy Director",
      bio: "Division I quarterback and private QB coach for 12 years. Has trained multiple players who went on to college football.",
      imageUrl: "/images/coaches/coach-placeholder-1.jpg",
    },
    {
      name: "Coach Jasmine Brooks",
      role: "Speed & Conditioning Specialist",
      bio: "Former track & field athlete and certified speed coach. Combines latest training science with football-specific movements.",
      imageUrl: "/images/coaches/coach-placeholder-2.jpg",
    },
    {
      name: "Coach Marcus Johnson",
      role: "Wide Receiver Specialist",
      bio: "Former arena league WR with exceptional route-running expertise. Patient teacher who excels at developing young talent.",
      imageUrl: "/images/coaches/coach-placeholder-3.jpg",
    },
  ],
  // No safety protocols for academies - it's non-contact skills training
  ctaText: "View Upcoming Clinics",
  ctaLink: "#clinics", // Future calendar/registration link
};

export default function AcademiesClinicsPage() {
  return <ProgramPage {...academiesData} />;
}
