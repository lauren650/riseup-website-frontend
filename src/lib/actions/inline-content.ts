"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Result type for inline content save operations
 */
interface SaveResult {
  success: boolean;
  error?: string;
}

/**
 * Save inline text content to the database.
 * Creates the content record if it doesn't exist.
 *
 * @param contentKey - Unique identifier for the content (e.g., 'hero.headline')
 * @param text - The new text content
 * @param page - Optional page identifier for organization
 * @param section - Optional section identifier for organization
 */
export async function saveInlineText(
  contentKey: string,
  text: string,
  page?: string,
  section?: string
): Promise<SaveResult> {
  const supabase = await createClient();

  // Verify user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Upsert the content (insert or update on conflict)
    const { error } = await supabase.from("site_content").upsert(
      {
        content_key: contentKey,
        content_type: "text",
        content: { text },
        page: page || null,
        section: section || null,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "content_key",
      }
    );

    if (error) {
      console.error("Error saving inline text:", error);
      return { success: false, error: error.message };
    }

    // Revalidate all public pages that might show this content
    revalidatePath("/", "layout");

    return { success: true };
  } catch (err) {
    console.error("Error in saveInlineText:", err);
    return { success: false, error: "Failed to save content" };
  }
}

/**
 * Save inline image URL to the database.
 * Creates the content record if it doesn't exist.
 *
 * @param contentKey - Unique identifier for the image (e.g., 'hero.poster')
 * @param imageUrl - The URL of the uploaded image
 * @param alt - Alt text for the image
 * @param page - Optional page identifier for organization
 * @param section - Optional section identifier for organization
 */
export async function saveInlineImage(
  contentKey: string,
  imageUrl: string,
  alt?: string,
  page?: string,
  section?: string
): Promise<SaveResult> {
  const supabase = await createClient();

  // Verify user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Upsert the content (insert or update on conflict)
    const { error } = await supabase.from("site_content").upsert(
      {
        content_key: contentKey,
        content_type: "image",
        content: { url: imageUrl, alt: alt || "" },
        page: page || null,
        section: section || null,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "content_key",
      }
    );

    if (error) {
      console.error("Error saving inline image:", error);
      return { success: false, error: error.message };
    }

    // Revalidate all public pages that might show this content
    revalidatePath("/", "layout");

    return { success: true };
  } catch (err) {
    console.error("Error in saveInlineImage:", err);
    return { success: false, error: "Failed to save image" };
  }
}

/**
 * Save image position (x, y percentages) to the database.
 * Updates only the position in the existing content record.
 *
 * @param contentKey - Unique identifier for the image (e.g., 'programs.flag_football.image_1')
 * @param position - The position object with x and y percentages (0-100)
 */
export async function saveImagePosition(
  contentKey: string,
  position: { x: number; y: number }
): Promise<SaveResult> {
  const supabase = await createClient();

  // Verify user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // First, get the existing content to preserve other fields
    const { data: existing } = await supabase
      .from("site_content")
      .select("content")
      .eq("content_key", contentKey)
      .single();

    const existingContent = existing?.content || {};

    // Merge position with existing content
    const { error } = await supabase.from("site_content").upsert(
      {
        content_key: contentKey,
        content_type: "image",
        content: {
          ...existingContent,
          position: { x: position.x, y: position.y },
        },
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "content_key",
      }
    );

    if (error) {
      console.error("Error saving image position:", error);
      return { success: false, error: error.message };
    }

    // Revalidate all public pages that might show this content
    revalidatePath("/", "layout");

    return { success: true };
  } catch (err) {
    console.error("Error in saveImagePosition:", err);
    return { success: false, error: "Failed to save position" };
  }
}
