/**
 * Content types for AI-powered CMS
 */

/**
 * Valid text content keys that can be edited
 */
export type TextContentKey =
  | "hero.headline"
  | "hero.subtitle"
  | "hero.cta_primary"
  | "hero.cta_secondary"
  | "programs.section_title"
  | "impact.title"
  | "impact.stat_1_value"
  | "impact.stat_1_label"
  | "impact.stat_2_value"
  | "impact.stat_2_label"
  | "impact.stat_3_value"
  | "impact.stat_3_label"
  | "impact.stat_4_value"
  | "impact.stat_4_label"
  | "impact.testimonial_quote"
  | "impact.testimonial_author"
  | "impact.testimonial_role";

/**
 * Valid image content keys that can be edited
 */
export type ImageContentKey =
  | "hero.poster"
  | "hero.video"
  | "header.logo"
  | "scroll_reveal.earth_background"
  | "programs.flag_football.image_1"
  | "programs.flag_football.image_2"
  | "programs.flag_football.image_3"
  | "programs.tackle_football.image_1"
  | "programs.tackle_football.image_2"
  | "programs.tackle_football.image_3"
  | "programs.academies.image_1"
  | "programs.academies.image_2"
  | "programs.academies.image_3"
  | "tackle_football.hero"
  | "donation.flag_background";

/**
 * All valid content keys (text or image)
 */
export type ContentKey = TextContentKey | ImageContentKey;

/**
 * Image content structure
 */
export interface ImageContent {
  url: string;
  alt: string;
  position?: { x: number; y: number };
}

/**
 * Site content record from database
 */
export interface SiteContent {
  id: string;
  content_key: ContentKey;
  content_type: string;
  content: {
    text?: string;
    url?: string;
    alt?: string;
    [key: string]: unknown;
  };
  page: string | null;
  section: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Content draft for preview before publishing
 */
export interface ContentDraft {
  id: string;
  content_key: string;
  draft_type: "text" | "announcement" | "visibility";
  content: {
    text?: string;
    action?: "add" | "update" | "remove";
    linkUrl?: string;
    linkText?: string;
    visible?: boolean;
    [key: string]: unknown;
  };
  created_by: string | null;
  created_at: string;
  expires_at: string;
}

/**
 * Announcement bar configuration
 */
export interface AnnouncementBar {
  id: string;
  text: string;
  link_url: string | null;
  link_text: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Section visibility toggle
 */
export interface SectionVisibility {
  id: string;
  section_key: string;
  is_visible: boolean;
  updated_at: string;
}

/**
 * Chat message from history
 */
export interface ChatMessage {
  id: string;
  user_id: string | null;
  role: "user" | "assistant";
  content: string;
  tool_calls: unknown | null;
  created_at: string;
}

/**
 * Tool result returned from AI tools
 */
export interface ToolResult {
  success: boolean;
  draftId?: string;
  previewUrl?: string;
  message: string;
  error?: string;
}

/**
 * Content list item for listEditableContent tool
 */
export interface EditableContentItem {
  contentKey: TextContentKey;
  description: string;
  currentValue: string;
  page: string;
  section: string;
}
