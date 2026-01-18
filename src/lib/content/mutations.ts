/**
 * Content mutation functions for updating site content
 */

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Tables } from "@/lib/supabase/types";

type ContentDraftRow = Tables<"content_drafts">;

/**
 * Create a content draft for preview
 */
export async function createDraft(
  contentKey: string,
  draftType: string,
  content: Record<string, unknown>,
  userId: string
): Promise<{ id: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("content_drafts")
    .insert({
      content_key: contentKey,
      draft_type: draftType,
      content,
      created_by: userId || null,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to create draft: ${error.message}`);
  }

  return { id: data.id };
}

/**
 * Publish a draft - copy to site_content and delete draft
 */
export async function publishDraft(draftId: string): Promise<void> {
  const supabase = await createClient();

  // Fetch the draft
  const { data: draft, error: fetchError } = await supabase
    .from("content_drafts")
    .select("*")
    .eq("id", draftId)
    .single();

  if (fetchError || !draft) {
    throw new Error("Draft not found");
  }

  const draftData = draft as ContentDraftRow;

  // Handle different draft types
  if (draftData.draft_type === "text") {
    // Upsert to site_content
    const { error: upsertError } = await supabase.from("site_content").upsert(
      {
        content_key: draftData.content_key,
        content_type: "text",
        content: draftData.content,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "content_key" }
    );

    if (upsertError) {
      throw new Error(`Failed to publish content: ${upsertError.message}`);
    }
  } else if (draftData.draft_type === "announcement") {
    const contentObj = draftData.content as Record<string, unknown>;
    const action = contentObj?.action as string;

    if (action === "remove") {
      // Deactivate all announcements
      await supabase
        .from("announcement_bar")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("is_active", true);
    } else {
      // Deactivate existing and insert new
      await supabase
        .from("announcement_bar")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("is_active", true);

      const { error: insertError } = await supabase
        .from("announcement_bar")
        .insert({
          text: contentObj.text as string,
          link_url: (contentObj.linkUrl as string) || null,
          link_text: (contentObj.linkText as string) || null,
          is_active: true,
        });

      if (insertError) {
        throw new Error(
          `Failed to publish announcement: ${insertError.message}`
        );
      }
    }
  } else if (draftData.draft_type === "visibility") {
    const contentObj = draftData.content as Record<string, unknown>;
    const { error: upsertError } = await supabase
      .from("section_visibility")
      .upsert(
        {
          section_key: draftData.content_key,
          is_visible: contentObj.visible as boolean,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "section_key" }
      );

    if (upsertError) {
      throw new Error(`Failed to update visibility: ${upsertError.message}`);
    }
  }

  // Delete the draft
  await supabase.from("content_drafts").delete().eq("id", draftId);

  // Revalidate affected pages
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/programs");
}

/**
 * Cancel a draft - just delete it
 */
export async function cancelDraft(draftId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("content_drafts")
    .delete()
    .eq("id", draftId);

  if (error) {
    throw new Error(`Failed to cancel draft: ${error.message}`);
  }
}

/**
 * Create an announcement bar draft
 */
export async function updateAnnouncementBar(
  action: "add" | "update" | "remove",
  data?: { text?: string; linkUrl?: string; linkText?: string },
  userId?: string
): Promise<{ draftId: string }> {
  const supabase = await createClient();

  const content: Record<string, unknown> = { action };

  if (action !== "remove" && data) {
    content.text = data.text;
    if (data.linkUrl) content.linkUrl = data.linkUrl;
    if (data.linkText) content.linkText = data.linkText;
  }

  const { data: draft, error } = await supabase
    .from("content_drafts")
    .insert({
      content_key: "announcement_bar",
      draft_type: "announcement",
      content,
      created_by: userId || null,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to create announcement draft: ${error.message}`);
  }

  return { draftId: draft.id };
}

/**
 * Create a section visibility draft
 */
export async function toggleSectionVisibility(
  sectionKey: string,
  visible: boolean,
  userId?: string
): Promise<{ draftId: string }> {
  const supabase = await createClient();

  const { data: draft, error } = await supabase
    .from("content_drafts")
    .insert({
      content_key: sectionKey,
      draft_type: "visibility",
      content: { visible },
      created_by: userId || null,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to create visibility draft: ${error.message}`);
  }

  return { draftId: draft.id };
}

/**
 * Save a chat message to history
 */
export async function saveChatMessage(
  userId: string,
  role: "user" | "assistant",
  content: string,
  toolCalls?: unknown
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from("chat_messages").insert({
    user_id: userId,
    role,
    content,
    tool_calls: toolCalls || null,
  });

  if (error) {
    console.error("Failed to save chat message:", error);
    // Don't throw - chat history is not critical
  }
}

/**
 * Get a draft by ID
 */
export async function getDraft(
  draftId: string
): Promise<ContentDraftRow | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("content_drafts")
    .select("*")
    .eq("id", draftId)
    .single();

  if (error) {
    return null;
  }

  return data as ContentDraftRow;
}
