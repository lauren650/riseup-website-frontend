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
};

/**
 * Default image content fallbacks
 */
export const DEFAULT_IMAGE_CONTENT: Record<ImageContentKey, ImageContent> = {
  "hero.poster": {
    url: "/images/hero-poster.jpg",
    alt: "Youth football players on the field",
  },
  "programs.flag_football.image": {
    url: "/images/flag-football.jpg",
    alt: "Flag football program",
  },
  "programs.tackle_football.image": {
    url: "/images/tackle-football.jpg",
    alt: "Tackle football program",
  },
  "programs.academies.image": {
    url: "/images/academies-clinics.jpg",
    alt: "Academies and clinics program",
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
};

/**
 * Image content descriptions for AI context
 */
export const IMAGE_CONTENT_DESCRIPTIONS: Record<
  ImageContentKey,
  { description: string; page: string; section: string }
> = {
  "hero.poster": {
    description: "Hero background poster image",
    page: "Homepage",
    section: "Hero",
  },
  "programs.flag_football.image": {
    description: "Flag football program tile image",
    page: "Homepage",
    section: "Programs",
  },
  "programs.tackle_football.image": {
    description: "Tackle football program tile image",
    page: "Homepage",
    section: "Programs",
  },
  "programs.academies.image": {
    description: "Academies & clinics program tile image",
    page: "Homepage",
    section: "Programs",
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
