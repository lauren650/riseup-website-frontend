export type Partner = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  websiteLabel?: string;
  campaignUrl?: string;
  campaignLabel?: string;
  logoSrc?: string;
  logoAlt?: string;
  tier: "title" | "major" | "blue";
};

/**
 * Update this list with real partner details as they are confirmed.
 * - logoSrc can be a local image path (public/images/...) or a full URL.
 * - Marketing logo source folder:
 *   https://drive.google.com/drive/folders/1G0Ujmm-0mmX6KEDZxPzJNKT9gw4zV0un?usp=sharing
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
    tier: "major",
  },
  {
    id: "endurance-group",
    name: "Endurance Group",
    description: "Blue-level sponsor supporting program growth and operations.",
    websiteUrl: "https://www.endurancegroup.us/",
    logoSrc: "/images/partners/endurance-group.png",
    logoAlt: "Endurance Group logo",
    tier: "blue",
  },
  {
    id: "leigh-amigo",
    name: "Leigh Amigo",
    description: "Blue-level sponsor investing in local youth development.",
    websiteUrl: "https://www.facebook.com/leighamigorealtor/",
    logoSrc: "/images/partners/leigh-amigo.png",
    logoAlt: "Leigh Amigo logo",
    tier: "blue",
  },
  {
    id: "veterans-guardian",
    name: "Veterans Guardian",
    description: "Blue-level sponsor backing scholarships and team resources.",
    websiteUrl: "https://vetsguardian.com/",
    logoSrc: "/images/partners/Veterans Guardian.png",
    logoAlt: "Veterans Guardian logo",
    tier: "blue",
  },
  {
    id: "op-tech-solutions",
    name: "Op Tech Solutions",
    description: "Blue-level sponsor helping strengthen our community impact.",
    websiteUrl: "https://www.optechsolutions.us/",
    logoSrc: "/images/partners/ots.png",
    logoAlt: "Op Tech Solutions logo",
    tier: "blue",
  },
  {
    id: "hyland-golf",
    name: "Hyland Golf",
    description: "Blue-level sponsor supporting athlete pathways on and off the field.",
    websiteUrl: "https://www.hylandgolfclub.com/",
    logoSrc: "/images/partners/new hyland flag logo.png",
    logoAlt: "Hyland Golf logo",
    tier: "blue",
  },
  {
    id: "twentyfore",
    name: "TwentyFore",
    description: "Blue-level sponsor helping RiseUp create more opportunities for youth.",
    websiteUrl: "https://twentyfore.golf/",
    logoSrc: "/images/partners/twentyfore.png",
    logoAlt: "TwentyFore logo",
    tier: "blue",
  },
];
