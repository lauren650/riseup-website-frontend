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
