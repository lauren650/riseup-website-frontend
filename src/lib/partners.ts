export type Partner = {
  id: string;
  name: string;
  description: string;
  websiteUrl?: string;
  websiteLabel?: string;
  campaignUrl?: string;
  campaignLabel?: string;
  logoSrc?: string;
  logoAlt?: string;
  /** Tile behind the logo. Use "dark" for light-on-black artwork. */
  logoTile?: "light" | "dark";
  /** Render the partner name beside artwork that has no wordmark. */
  logoNameAlongside?: boolean;
  tier: "title" | "major" | "blue";
};

/**
 * Confirmed partners for the public Partners page.
 *
 * Update this list only with names Lauren/marketing have confirmed.
 * logoSrc must point at a file that exists under public/images/partners.
 * Omit logoSrc when no raster logo is available so the UI shows a
 * clearly marked "Logo pending" placeholder instead of a broken image.
 * Omit websiteUrl when no official URL has been provided — do not invent one.
 *
 * Marketing logo source folder:
 * https://drive.google.com/drive/folders/1G0Ujmm-0mmX6KEDZxPzJNKT9gw4zV0un?usp=sharing
 *
 * Drive extras still not on this page (need a decision):
 * - Tandler's (PDF only)
 */
export const partners: Partner[] = [
  {
    id: "addo-construction",
    name: "Addo Construction",
    description:
      "Title Sponsor helping power high-impact programs that build skills, confidence, and leadership for youth athletes.",
    websiteUrl: "https://www.instagram.com/addo_construction/",
    websiteLabel: "Follow on Instagram",
    logoSrc: "/images/partners/addo-construction.png",
    logoAlt: "Addo Construction logo",
    logoTile: "dark",
    tier: "title",
  },
  {
    id: "rhetson",
    name: "Rhetson",
    description:
      "Leading support for The Next Play Fund, expanding access and opportunity for athletes who need it most.",
    websiteUrl: "https://rhetson.com/",
    websiteLabel: "Visit Rhetson",
    logoSrc: "/images/partners/rhetson.png",
    logoAlt: "Rhetson logo",
    logoTile: "dark",
    campaignUrl:
      "https://givebutter.com/the-riseup-next-play-scholarship-fund-powered-by-rhetson-companies-inc-we0gdu",
    campaignLabel: "Support The Next Play Fund",
    tier: "major",
  },
  {
    id: "araya-outdoor-solutions",
    name: "Araya Outdoor Solutions",
    description:
      "Major partner helping RiseUp deliver consistent, community-centered youth football experiences.",
    websiteUrl: "https://arayaoutdoorsolutions.com/",
    logoSrc: "/images/partners/araya-outdoor-solutions.png",
    logoAlt: "Araya Outdoor Solutions logo",
    logoTile: "dark",
    tier: "major",
  },
  {
    id: "endurance-group",
    name: "Endurance Group",
    description: "Blue-level sponsor supporting program growth and operations.",
    websiteUrl: "https://www.endurancegroup.us/",
    logoSrc: "/images/partners/endurance-group.png",
    logoAlt: "Endurance Group logo",
    logoTile: "light",
    tier: "blue",
  },
  {
    id: "leigh-amigo",
    name: "Leigh Amigo",
    description: "Blue-level sponsor investing in local youth development.",
    websiteUrl: "https://www.facebook.com/leighamigorealtor/",
    logoSrc: "/images/partners/leigh-amigo.png",
    logoAlt: "Leigh Amigo / Leigh & Co of Foundry Group logo",
    logoTile: "light",
    tier: "blue",
  },
  {
    id: "veterans-guardian",
    name: "Veterans Guardian",
    description: "Blue-level sponsor backing scholarships and team resources.",
    websiteUrl: "https://vetsguardian.com/",
    logoSrc: "/images/partners/veterans-guardian.png",
    logoAlt: "Veterans Guardian logo",
    logoTile: "light",
    tier: "blue",
  },
  {
    id: "op-tech-solutions",
    name: "Op Tech Solutions",
    description: "Blue-level sponsor helping strengthen our community impact.",
    websiteUrl: "https://www.optechsolutions.us/",
    logoSrc: "/images/partners/op-tech-solutions.png",
    logoAlt: "Op Tech Solutions logo",
    logoTile: "dark",
    tier: "blue",
  },
  {
    id: "hyland-golf",
    name: "Hyland Golf",
    description: "Blue-level sponsor supporting athlete pathways on and off the field.",
    websiteUrl: "https://www.hylandgolfclub.com/",
    logoSrc: "/images/partners/hyland-golf.png",
    logoAlt: "Hyland Golf logo",
    logoTile: "dark",
    tier: "blue",
  },
  {
    id: "twentyfore",
    name: "TwentyFore",
    description: "Blue-level sponsor helping RiseUp create more opportunities for youth.",
    websiteUrl: "https://twentyfore.golf/",
    logoSrc: "/images/partners/twentyfore.png",
    logoAlt: "TwentyFore logo",
    logoTile: "dark",
    tier: "blue",
  },
  {
    id: "wendy-ehlers-epp",
    name: "Wendy Ehlers EPP",
    description: "Blue-level sponsor investing in local youth development.",
    logoSrc: "/images/partners/wendy-ehlers-epp.png",
    logoAlt: "Everything Pines Real Estate logo",
    logoTile: "light",
    tier: "blue",
  },
  {
    id: "murphy-insurance",
    name: "The Murphy Insurance Agency",
    description: "Blue-level sponsor supporting program growth and operations.",
    logoSrc: "/images/partners/murphy-insurance.jpg",
    logoAlt: "The Murphy Insurance Agency logo",
    logoTile: "light",
    tier: "blue",
  },
  {
    id: "first-health",
    name: "First Health",
    description: "Blue-level sponsor helping strengthen our community impact.",
    logoSrc: "/images/partners/first-health.png",
    logoAlt: "First Health logo",
    logoTile: "light",
    tier: "blue",
  },
  {
    id: "first-bank",
    name: "First Bank",
    description: "Blue-level sponsor supporting program growth and operations.",
    logoSrc: "/images/partners/first-bank.png",
    logoAlt: "First Bank logo",
    logoTile: "light",
    tier: "blue",
  },
  {
    id: "southern-pines-orthopedic",
    name: "Southern Pines Orthopedic Surgery Center",
    description: "Blue-level sponsor supporting athlete pathways on and off the field.",
    logoSrc: "/images/partners/southern-pines-orthopedic-surgery-center.png",
    logoAlt: "Southern Pines Orthopaedic Surgery Center logo",
    logoTile: "light",
    tier: "blue",
  },
  {
    id: "sykesscapes",
    name: "SykesScapes (Matt Sykes)",
    description: "Blue-level sponsor helping RiseUp create more opportunities for youth.",
    logoSrc: "/images/partners/sykesscapes.png",
    logoAlt: "SykesScapes logo",
    logoTile: "light",
    tier: "blue",
  },
  {
    id: "pinecoast-properties",
    name: "PineCoast Properties",
    description: "Blue-level sponsor investing in local youth development.",
    logoSrc: "/images/partners/pinecoast-properties.png",
    logoAlt: "PineCoast Properties logo",
    logoTile: "light",
    tier: "blue",
  },
  {
    id: "little-johns-port-a-johns",
    name: "Little John's Port-a Johns",
    description: "Blue-level sponsor supporting program growth and operations.",
    logoSrc: "/images/partners/little-johns-port-a-johns.png",
    logoAlt: "Little John's Port-a Johns illustration",
    logoTile: "light",
    logoNameAlongside: true,
    tier: "blue",
  },
  {
    id: "sports-performance",
    name: "Sports Performance",
    description: "Blue-level sponsor supporting athlete pathways on and off the field.",
    logoSrc: "/images/partners/sports-performance.png",
    logoAlt: "Sports Performance Chiropractic & Physiotherapy logo",
    logoTile: "dark",
    tier: "blue",
  },
  {
    id: "gracie-jiu-jitsu-pineland",
    name: "Gracie Jiu-Jitsu Pineland",
    description: "Blue-level sponsor helping strengthen our community impact.",
    logoSrc: "/images/partners/gracie-jiu-jitsu-pineland.png",
    logoAlt: "Gracie Jiu-Jitsu Pineland logo",
    logoTile: "light",
    tier: "blue",
  },
];
