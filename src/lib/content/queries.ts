/**
 * Content query functions for fetching site content from database
 */

import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";
import type { AnnouncementBar, ChatMessage, ContentKey } from "@/types/content";

type AnnouncementBarRow = Tables<"announcement_bar">;
type ChatMessageRow = Tables<"chat_messages">;

/**
 * Default content fallbacks (matching current hardcoded values)
 */
export const DEFAULT_CONTENT: Record<ContentKey, string> = {
  "hero.headline": "BUILDING CHAMPIONS ON AND OFF THE FIELD",
  "hero.subtitle":
    "Youth football programs for ages 5-14. Building character, discipline, and teamwork through the game we love.",
  "hero.cta_primary": "Register Now",
  "hero.cta_secondary": "Learn More",
};

/**
 * Content descriptions for AI context
 */
export const CONTENT_DESCRIPTIONS: Record<
  ContentKey,
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
};

/**
 * Fetch content by key, with fallback to default
 */
export async function getContent(contentKey: ContentKey): Promise<string> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("site_content")
    .select("content")
    .eq("content_key", contentKey)
    .single();

  if (data?.content?.text) {
    return data.content.text as string;
  }

  return DEFAULT_CONTENT[contentKey] || "";
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
 * Get all editable content with current values
 */
export async function getAllEditableContent(): Promise<
  Array<{
    contentKey: ContentKey;
    description: string;
    currentValue: string;
    page: string;
    section: string;
  }>
> {
  const result = [];

  for (const [key, meta] of Object.entries(CONTENT_DESCRIPTIONS)) {
    const contentKey = key as ContentKey;
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
