/**
 * AI Chat API Route for content management
 */

import { streamText } from "ai";
import type { ModelMessage } from "@ai-sdk/provider-utils";
import { anthropic } from "@ai-sdk/anthropic";
import { createClient } from "@/lib/supabase/server";
import { SYSTEM_PROMPT } from "@/lib/ai/prompts";
import {
  updateTextContentTool,
  updateAnnouncementBarTool,
  toggleSectionVisibilityTool,
  listEditableContentTool,
} from "@/lib/ai/tools";

// Convert UI messages to ModelMessage format for streamText
function convertToModelMessages(messages: unknown[]): ModelMessage[] {
  const result: ModelMessage[] = [];

  for (const msg of messages) {
    const m = msg as { role: string; content?: string; parts?: { type: string; text?: string }[] };

    // Extract text content from parts if present (UI message format)
    let content = m.content || "";
    if (m.parts && Array.isArray(m.parts)) {
      const textPart = m.parts.find((p) => p.type === "text");
      if (textPart && textPart.text) {
        content = textPart.text;
      }
    }

    // Skip messages with empty content (e.g., tool-only assistant messages)
    if (!content.trim()) {
      continue;
    }

    result.push({
      role: m.role as "user" | "assistant",
      content,
    });
  }

  return result;
}

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

  // Convert UI messages to ModelMessage format
  const modelMessages = convertToModelMessages(messages);

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: SYSTEM_PROMPT,
    messages: modelMessages,
    tools: {
      updateTextContent: updateTextContentTool,
      updateAnnouncementBar: updateAnnouncementBarTool,
      toggleSectionVisibility: toggleSectionVisibilityTool,
      listEditableContent: listEditableContentTool,
    },
  });

  return result.toUIMessageStreamResponse();
}
