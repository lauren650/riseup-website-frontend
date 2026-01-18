/**
 * AI Chat API Route for content management
 */

import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { createClient } from "@/lib/supabase/server";
import { SYSTEM_PROMPT } from "@/lib/ai/prompts";
import {
  updateTextContentTool,
  updateAnnouncementBarTool,
  toggleSectionVisibilityTool,
  listEditableContentTool,
} from "@/lib/ai/tools";

export async function POST(req: Request) {
  // Verify admin authentication
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Check if ANTHROPIC_API_KEY is configured
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({
        error: "AI service not configured",
        message:
          "Please set the ANTHROPIC_API_KEY environment variable to enable AI chat.",
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const { messages } = await req.json();

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: SYSTEM_PROMPT,
    messages,
    tools: {
      updateTextContent: updateTextContentTool,
      updateAnnouncementBar: updateAnnouncementBarTool,
      toggleSectionVisibility: toggleSectionVisibilityTool,
      listEditableContent: listEditableContentTool,
    },
  });

  return result.toUIMessageStreamResponse();
}
