/**
 * Content query functions for fetching site content from database
 */

import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";
import type {
  AnnouncementBar,
  ChatMessage,
  TextContentKey,
  ImageContentKey,
  ImageContent,
} from "@/types/content";

type AnnouncementBarRow = Tables<"announcement_bar">;
type ChatMessageRow = Tables<"chat_messages">;

/**
 * Default text content fallbacks (matching current hardcoded values)
 */
export const DEFAULT_TEXT_CONTENT: Record<TextContentKey, string> = {
  "hero.headline": "BUILDING CHAMPIONS ON AND OFF THE FIELD",
  "hero.subtitle":
    "Youth football programs for ages 5-14. Building character, discipline, and teamwork through the game we love.",
  "hero.cta_primary": "Register Now",
  "hero.cta_secondary": "Learn More",
  "programs.section_title": "Our Programs",
  "impact.title": "THE RISEUP EFFECT",
  "impact.stat_1_value": "500+",
  "impact.stat_1_label": "Athletes Trained",
  "impact.stat_2_value": "24",
  "impact.stat_2_label": "Teams Strong",
  "impact.stat_3_value": "95%",
  "impact.stat_3_label": "Return Rate",
  "impact.stat_4_value": "1,000+",
  "impact.stat_4_label": "Hours Coached",
  "impact.testimonial_quote": "RiseUp taught my son that failure is just another rep. He's a different kid now.",
  "impact.testimonial_author": "Sarah M.",
  "impact.testimonial_role": "Flag Football Parent",
};

/**
 * Default image content fallbacks
 */
export const DEFAULT_IMAGE_CONTENT: Record<ImageContentKey, ImageContent> = {
  "hero.poster": {
    url: "/images/hero-poster.jpg",
    alt: "Youth football players on the field",
  },
  "hero.video": {
    url: "/videos/hero.mp4",
    alt: "Hero background video",
  },
  "header.logo": {
    url: "/images/logo.png",
    alt: "RiseUp Youth Football logo",
  },
  "scroll_reveal.earth_background": {
    url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80",
    alt: "Earth horizon from space",
  },
  "programs.flag_football.image_1": {
    url: "",
    alt: "Flag football program image 1",
  },
  "programs.flag_football.image_2": {
    url: "",
    alt: "Flag football program image 2",
  },
  "programs.flag_football.image_3": {
    url: "",
    alt: "Flag football program image 3",
  },
  "programs.tackle_football.image_1": {
    url: "",
    alt: "Tackle football program image 1",
  },
  "programs.tackle_football.image_2": {
    url: "",
    alt: "Tackle football program image 2",
  },
  "programs.tackle_football.image_3": {
    url: "",
    alt: "Tackle football program image 3",
  },
  "programs.academies.image_1": {
    url: "",
    alt: "Academies and clinics program image 1",
  },
  "programs.academies.image_2": {
    url: "",
    alt: "Academies and clinics program image 2",
  },
  "programs.academies.image_3": {
    url: "",
    alt: "Academies and clinics program image 3",
  },
  "tackle_football.hero": {
    url: "/images/tackle-football-hero.jpg",
    alt: "RiseUp Tackle Football Players",
  },
  "donation.flag_background": {
    url: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=1920&q=80",
    alt: "American flag background",
  },
};

// Legacy alias for backwards compatibility
export const DEFAULT_CONTENT = DEFAULT_TEXT_CONTENT;

/**
 * Text content descriptions for AI context
 */
export const TEXT_CONTENT_DESCRIPTIONS: Record<
  TextContentKey,
  { description: string; page: string; section: string }
> = {
  "hero.headline": {
    description: "Main headline on the homepage",
    page: "Homepage",
    section: "Hero",
  },
  "hero.subtitle": {
    description: "Subtitle text below the main headline",
    page: "Homepage",
    section: "Hero",
  },
  "hero.cta_primary": {
    description: "Primary call-to-action button text",
    page: "Homepage",
    section: "Hero",
  },
  "hero.cta_secondary": {
    description: "Secondary call-to-action button text",
    page: "Homepage",
    section: "Hero",
  },
  "programs.section_title": {
    description: "Section title for programs grid",
    page: "Homepage",
    section: "Programs",
  },
  "impact.title": {
    description: "Impact section main title",
    page: "Homepage",
    section: "Impact",
  },
  "impact.stat_1_value": {
    description: "First stat number (e.g., 500+)",
    page: "Homepage",
    section: "Impact",
  },
  "impact.stat_1_label": {
    description: "First stat label (e.g., Athletes Trained)",
    page: "Homepage",
    section: "Impact",
  },
  "impact.stat_2_value": {
    description: "Second stat number (e.g., 12)",
    page: "Homepage",
    section: "Impact",
  },
  "impact.stat_2_label": {
    description: "Second stat label (e.g., Seasons Strong)",
    page: "Homepage",
    section: "Impact",
  },
  "impact.stat_3_value": {
    description: "Third stat number (e.g., 95%)",
    page: "Homepage",
    section: "Impact",
  },
  "impact.stat_3_label": {
    description: "Third stat label (e.g., Return Rate)",
    page: "Homepage",
    section: "Impact",
  },
  "impact.stat_4_value": {
    description: "Fourth stat number (e.g., 1,000+)",
    page: "Homepage",
    section: "Impact",
  },
  "impact.stat_4_label": {
    description: "Fourth stat label (e.g., Hours Coached)",
    page: "Homepage",
    section: "Impact",
  },
  "impact.testimonial_quote": {
    description: "Featured testimonial quote",
    page: "Homepage",
    section: "Impact",
  },
  "impact.testimonial_author": {
    description: "Testimonial author name",
    page: "Homepage",
    section: "Impact",
  },
  "impact.testimonial_role": {
    description: "Testimonial author role/title",
    page: "Homepage",
    section: "Impact",
  },
};

/**
 * Image content descriptions for AI context
 */
export const IMAGE_CONTENT_DESCRIPTIONS: Record<
  ImageContentKey,
  { description: string; page: string; section: string }
> = {
  "hero.poster": {
    description: "Hero background poster image (fallback when video doesn't play)",
    page: "Homepage",
    section: "Hero",
  },
  "hero.video": {
    description: "Hero background video (plays on desktop)",
    page: "Homepage",
    section: "Hero",
  },
  "header.logo": {
    description: "Site logo displayed in the navigation header",
    page: "All pages",
    section: "Header",
  },
  "scroll_reveal.earth_background": {
    description: "Earth from space background image for scroll reveal section",
    page: "Homepage",
    section: "Scroll Reveal",
  },
  "programs.flag_football.image_1": {
    description: "Flag football program tile image (slot 1)",
    page: "Homepage",
    section: "Programs",
  },
  "programs.flag_football.image_2": {
    description: "Flag football program tile image (slot 2)",
    page: "Homepage",
    section: "Programs",
  },
  "programs.flag_football.image_3": {
    description: "Flag football program tile image (slot 3)",
    page: "Homepage",
    section: "Programs",
  },
  "programs.tackle_football.image_1": {
    description: "Tackle football program tile image (slot 1)",
    page: "Homepage",
    section: "Programs",
  },
  "programs.tackle_football.image_2": {
    description: "Tackle football program tile image (slot 2)",
    page: "Homepage",
    section: "Programs",
  },
  "programs.tackle_football.image_3": {
    description: "Tackle football program tile image (slot 3)",
    page: "Homepage",
    section: "Programs",
  },
  "programs.academies.image_1": {
    description: "Academies & clinics program tile image (slot 1)",
    page: "Homepage",
    section: "Programs",
  },
  "programs.academies.image_2": {
    description: "Academies & clinics program tile image (slot 2)",
    page: "Homepage",
    section: "Programs",
  },
  "programs.academies.image_3": {
    description: "Academies & clinics program tile image (slot 3)",
    page: "Homepage",
    section: "Programs",
  },
  "tackle_football.hero": {
    description: "Hero banner image for tackle football page",
    page: "Tackle Football",
    section: "Hero",
  },
  "donation.flag_background": {
    description: "Faded flag background image for donation section",
    page: "Homepage",
    section: "Donation",
  },
};

// Legacy alias for backwards compatibility
export const CONTENT_DESCRIPTIONS = TEXT_CONTENT_DESCRIPTIONS;

/**
 * Fetch text content by key, with fallback to default
 */
export async function getContent(contentKey: TextContentKey): Promise<string> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("site_content")
    .select("content")
    .eq("content_key", contentKey)
    .single();

  if (data?.content?.text) {
    return data.content.text as string;
  }

  return DEFAULT_TEXT_CONTENT[contentKey] || "";
}

/**
 * Fetch image content by key, with fallback to default
 */
export async function getImageContent(
  contentKey: ImageContentKey
): Promise<ImageContent> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("site_content")
    .select("content")
    .eq("content_key", contentKey)
    .single();

  if (data?.content?.url) {
    return {
      url: data.content.url as string,
      alt: (data.content.alt as string) || DEFAULT_IMAGE_CONTENT[contentKey].alt,
      position: data.content.position as { x: number; y: number } | undefined,
    };
  }

  return DEFAULT_IMAGE_CONTENT[contentKey];
}

/**
 * Fetch all content for a page
 */
export async function getPageContent(
  page: string
): Promise<Record<string, string>> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("site_content")
    .select("content_key, content")
    .eq("page", page);

  const content: Record<string, string> = {};

  if (data) {
    for (const item of data) {
      content[item.content_key] = (item.content?.text as string) || "";
    }
  }

  // Fill in defaults for missing keys
  for (const [key, defaultValue] of Object.entries(DEFAULT_CONTENT)) {
    if (!content[key]) {
      content[key] = defaultValue;
    }
  }

  return content;
}

/**
 * Get section visibility status
 */
export async function getSectionVisibility(
  sectionKey: string
): Promise<boolean> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("section_visibility")
    .select("is_visible")
    .eq("section_key", sectionKey)
    .single();

  // Default to visible if not in database
  return data?.is_visible ?? true;
}

/**
 * Get active announcement bar
 */
export async function getAnnouncementBar(): Promise<AnnouncementBar | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("announcement_bar")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  const row = data as AnnouncementBarRow;
  return {
    id: row.id,
    text: row.text,
    link_url: row.link_url,
    link_text: row.link_text,
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Get chat message history for a user
 */
export async function getChatHistory(
  userId: string,
  limit: number = 50
): Promise<ChatMessage[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (!data) {
    return [];
  }

  return (data as ChatMessageRow[]).map((row) => ({
    id: row.id,
    user_id: row.user_id,
    role: row.role,
    content: row.content,
    tool_calls: row.tool_calls,
    created_at: row.created_at,
  }));
}

/**
 * Get all editable text content with current values
 */
export async function getAllEditableContent(): Promise<
  Array<{
    contentKey: TextContentKey;
    description: string;
    currentValue: string;
    page: string;
    section: string;
  }>
> {
  const result = [];

  for (const [key, meta] of Object.entries(TEXT_CONTENT_DESCRIPTIONS)) {
    const contentKey = key as TextContentKey;
    const currentValue = await getContent(contentKey);

    result.push({
      contentKey,
      description: meta.description,
      currentValue,
      page: meta.page,
      section: meta.section,
    });
  }

  return result;
}
