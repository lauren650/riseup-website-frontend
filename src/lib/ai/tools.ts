/**
 * AI Tool definitions for content operations
 */

import { tool } from "ai";
import { z } from "zod";
import { createDraft } from "@/lib/content/mutations";
import { getAllEditableContent, getContent } from "@/lib/content/queries";
import type { TextContentKey } from "@/types/content";

/**
 * Valid text content keys for the AI to edit
 */
const TEXT_CONTENT_KEYS = [
  "hero.headline",
  "hero.subtitle",
  "hero.cta_primary",
  "hero.cta_secondary",
  "programs.section_title",
] as const;

/**
 * Tool to update text content fields
 */
export const updateTextContentTool = tool({
  description:
    "Update a text content field on the website. Use this when the user wants to change text like headlines, subtitles, or button text.",
  inputSchema: z.object({
    contentKey: z
      .enum(TEXT_CONTENT_KEYS)
      .describe(
        "The content field to update. Options: hero.headline (main headline), hero.subtitle (subtitle text), hero.cta_primary (primary button), hero.cta_secondary (secondary button), programs.section_title (section title)"
      ),
    newText: z.string().describe("The new text content to set"),
  }),
  execute: async ({ contentKey, newText }) => {
    try {
      // Get current value for context
      const currentValue = await getContent(contentKey as TextContentKey);

      // Create draft for preview
      const draft = await createDraft(
        contentKey,
        "text",
        { text: newText, previousText: currentValue },
        ""
      );

      return {
        success: true,
        draftId: draft.id,
        previewUrl: `/admin/dashboard/preview?draft=${draft.id}`,
        message: `I've prepared to change "${contentKey}" from "${currentValue.substring(0, 50)}${currentValue.length > 50 ? "..." : ""}" to "${newText.substring(0, 50)}${newText.length > 50 ? "..." : ""}". Please review the preview and publish when ready.`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to prepare the change: ${error instanceof Error ? error.message : "Unknown error"}`,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

/**
 * Tool to manage the announcement bar
 */
export const updateAnnouncementBarTool = tool({
  description:
    "Add, update, or remove the announcement bar at the top of the website. The announcement bar appears above the navigation on all pages.",
  inputSchema: z.object({
    action: z
      .enum(["add", "update", "remove"])
      .describe(
        "The action to perform: add a new announcement, update existing, or remove it"
      ),
    text: z
      .string()
      .optional()
      .describe("The announcement text (required for add/update)"),
    linkUrl: z
      .string()
      .optional()
      .describe("Optional URL to link to when the announcement is clicked"),
    linkText: z
      .string()
      .optional()
      .describe(
        'Optional text for the link (e.g., "Learn more", "Register now")'
      ),
  }),
  execute: async ({ action, text, linkUrl, linkText }) => {
    try {
      // Validate text is provided for add/update
      if (action !== "remove" && !text) {
        return {
          success: false,
          message: "Please provide the announcement text.",
        };
      }

      const content: Record<string, unknown> = { action };
      if (text) content.text = text;
      if (linkUrl) content.linkUrl = linkUrl;
      if (linkText) content.linkText = linkText;

      const draft = await createDraft(
        "announcement_bar",
        "announcement",
        content,
        ""
      );

      const actionMessage =
        action === "remove"
          ? "remove the announcement bar"
          : `${action} the announcement bar with "${text?.substring(0, 50)}${(text?.length || 0) > 50 ? "..." : ""}"`;

      return {
        success: true,
        draftId: draft.id,
        previewUrl: `/admin/dashboard/preview?draft=${draft.id}`,
        message: `I've prepared to ${actionMessage}. Please review the preview to see how it will look.`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to prepare the announcement: ${error instanceof Error ? error.message : "Unknown error"}`,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

/**
 * Tool to toggle section visibility
 */
export const toggleSectionVisibilityTool = tool({
  description:
    "Show or hide a section on the website. Use this when the user wants to temporarily remove or restore a section.",
  inputSchema: z.object({
    sectionKey: z
      .string()
      .describe(
        "The section identifier (e.g., 'homepage.safety', 'flag-football.coaches')"
      ),
    visible: z
      .boolean()
      .describe(
        "Whether the section should be visible (true) or hidden (false)"
      ),
  }),
  execute: async ({ sectionKey, visible }) => {
    try {
      const draft = await createDraft(sectionKey, "visibility", { visible }, "");

      return {
        success: true,
        draftId: draft.id,
        previewUrl: `/admin/dashboard/preview?draft=${draft.id}`,
        message: `I've prepared to ${visible ? "show" : "hide"} the "${sectionKey}" section. Please review the preview.`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to prepare visibility change: ${error instanceof Error ? error.message : "Unknown error"}`,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

/**
 * Tool to list all editable content
 */
export const listEditableContentTool = tool({
  description:
    "List all content fields that can be edited on the website. Use this when the user asks what they can change or wants to see current content values.",
  inputSchema: z.object({}),
  execute: async () => {
    try {
      const content = await getAllEditableContent();

      const formattedList = content
        .map(
          (item) =>
            `- **${item.contentKey}**: ${item.description}\n  Current: "${item.currentValue.substring(0, 60)}${item.currentValue.length > 60 ? "..." : ""}"`
        )
        .join("\n");

      return {
        success: true,
        content,
        message: `Here's all the content you can edit:\n\n${formattedList}\n\nJust tell me which one you'd like to change and what the new text should be.`,
      };
    } catch (error) {
      return {
        success: false,
        content: [],
        message: `Unable to fetch content list: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },
});
