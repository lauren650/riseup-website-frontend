import type { Metadata } from "next";
import { ProgramPage } from "@/components/sections/program-page";

export const metadata: Metadata = {
  title: "Tackle Football | RiseUp Youth Football League",
  description:
    "Traditional tackle football for ages 9-14. USA Football certified program with comprehensive safety protocols and elite coaching.",
};

const tackleFootballData = {
  title: "Tackle Football",
  subtitle: "Traditional football for ages 9-14",
  heroImage: "/images/tackle-football-hero.jpg",
  description:
    "Our tackle football program provides a comprehensive football experience for athletes ready to take their game to the next level. With USA Football certified coaches and industry-leading safety protocols, we develop well-rounded players who understand the game while prioritizing player health and safety above all else. Players learn proper technique, team strategy, and the values of discipline and sportsmanship.",
  ageGroups: [
    {
      name: "JV Division",
      ages: "Ages 9-10",
      description:
        "Introduction to tackle football with emphasis on proper technique and fundamentals. Smaller field and modified rules for safety.",
    },
    {
      name: "Varsity Division",
      ages: "Ages 11-12",
      description:
        "Full tackle football experience with advanced playbooks and position-specific training. Competitive league play.",
    },
    {
      name: "Elite Division",
      ages: "Ages 13-14",
      description:
        "High-level competition preparing players for high school football. Advanced schemes and intensive skill development.",
    },
  ],
  schedule: [
    {
      day: "Tuesday",
      time: "5:00 PM - 7:00 PM",
      location: "RiseUp Sports Complex - Main Field",
    },
    {
      day: "Thursday",
      time: "5:00 PM - 7:00 PM",
      location: "RiseUp Sports Complex - Main Field",
    },
    {
      day: "Saturday",
      time: "1:00 PM - 5:00 PM",
      location: "RiseUp Sports Complex - Game Day",
    },
  ],
  costs: [
    {
      item: "Season Registration",
      price: "$200",
      notes: "Includes jersey and league fees",
    },
    {
      item: "Equipment Rental",
      price: "$50",
      notes: "Helmet, shoulder pads, and pants",
    },
    {
      item: "Equipment Purchase (Optional)",
      price: "$150+",
      notes: "Own your gear - ask about financing options",
    },
  ],
  coaches: [
    {
      name: "Coach Robert Williams",
      role: "Head Coach - Tackle Program",
      bio: "Former NFL practice squad player with 15 years of coaching experience. USA Football Master Trainer certified.",
      imageUrl: "/images/coaches/coach-placeholder-1.jpg",
    },
    {
      name: "Coach James Patterson",
      role: "Defensive Coordinator",
      bio: "High school defensive coordinator for 8 years. Specializes in teaching proper tackling technique and defensive schemes.",
      imageUrl: "/images/coaches/coach-placeholder-2.jpg",
    },
    {
      name: "Coach Maria Gonzales",
      role: "Strength & Conditioning",
      bio: "Certified athletic trainer and strength coach. Focuses on injury prevention and age-appropriate conditioning.",
      imageUrl: "/images/coaches/coach-placeholder-3.jpg",
    },
  ],
  safetyProtocols: [
    "USA Football Heads Up certified coaching staff",
    "Professional helmet fitting for every player",
    "Comprehensive concussion protocol with baseline testing",
    "Certified athletic trainer at all practices and games",
    "Heat and hydration monitoring system",
    "Limited contact practices per USA Football guidelines",
    "Emergency action plan at all facilities",
    "Parent education on signs of injury",
  ],
  ctaText: "Register for Tackle Football",
  ctaLink: "#register", // External registration link placeholder
};

export default function TackleFootballPage() {
  return <ProgramPage {...tackleFootballData} />;
}
