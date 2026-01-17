import type { Metadata } from "next";
import { ProgramPage } from "@/components/sections/program-page";

export const metadata: Metadata = {
  title: "Flag Football | RiseUp Youth Football League",
  description:
    "Non-contact flag football for ages 5-8. Learn football fundamentals in a safe, fun environment with certified coaches.",
};

const flagFootballData = {
  title: "Flag Football",
  subtitle: "Non-contact football for ages 5-8",
  heroImage: "/images/flag-football-hero.jpg",
  description:
    "Flag football is the perfect introduction to the sport for young athletes. Our program focuses on teaching fundamental skills like catching, throwing, and teamwork in a safe, non-contact environment. Players develop coordination, build confidence, and most importantly, have fun while learning the game they'll love for years to come.",
  ageGroups: [
    {
      name: "Rookies",
      ages: "Ages 5-6",
      description:
        "Introduction to football basics. Focus on hand-eye coordination, basic rules, and team play in a supportive environment.",
    },
    {
      name: "All-Stars",
      ages: "Ages 7-8",
      description:
        "Building on fundamentals with more advanced plays and strategies. Players learn positions and develop game awareness.",
    },
  ],
  schedule: [
    {
      day: "Saturday",
      time: "9:00 AM - 10:30 AM",
      location: "RiseUp Sports Complex - Field 1",
    },
    {
      day: "Saturday",
      time: "10:30 AM - 12:00 PM",
      location: "RiseUp Sports Complex - Field 2",
    },
  ],
  costs: [
    {
      item: "Season Registration",
      price: "$150",
      notes: "Includes jersey and equipment",
    },
    {
      item: "Jersey Included",
      price: "FREE",
      notes: "Players keep their jersey at end of season",
    },
  ],
  coaches: [
    {
      name: "Coach Mike Thompson",
      role: "Head Flag Football Coach",
      bio: "Former college quarterback with 10+ years coaching youth football. Certified in youth athlete development and first aid.",
      imageUrl: "/images/coaches/coach-placeholder-1.jpg",
    },
    {
      name: "Coach Sarah Martinez",
      role: "Assistant Coach - Rookies",
      bio: "Elementary PE teacher and mom of two young players. Specializes in making learning fun for the youngest athletes.",
      imageUrl: "/images/coaches/coach-placeholder-2.jpg",
    },
    {
      name: "Coach David Chen",
      role: "Assistant Coach - All-Stars",
      bio: "High school football coach bringing his strategic expertise to help young players develop game awareness.",
      imageUrl: "/images/coaches/coach-placeholder-3.jpg",
    },
  ],
  safetyProtocols: [
    "No contact allowed - flag pulling only",
    "All coaches are background checked and certified",
    "Certified first aid staff on-site at all practices and games",
    "Age and size-appropriate groupings",
    "Hydration stations available throughout fields",
    "Weather monitoring and safety protocols in place",
  ],
  ctaText: "Register for Flag Football",
  ctaLink: "#register", // External registration link placeholder
};

export default function FlagFootballPage() {
  return <ProgramPage {...flagFootballData} />;
}
