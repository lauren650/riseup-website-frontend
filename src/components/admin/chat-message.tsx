"use client";

import { type UIMessage, isTextUIPart } from "ai";
import Link from "next/link";

interface ChatMessageProps {
  message: UIMessage;
}

// Type for tool result
interface ToolResult {
  success?: boolean;
  previewUrl?: string;
  message?: string;
  draftId?: string;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  // Get text content from message parts
  const textContent = message.parts
    .filter(isTextUIPart)
    .map((part) => part.text)
    .join("");

  // Get tool invocations with results - use type assertion since the exact types
  // vary between AI SDK versions
  const toolResults: ToolResult[] = [];
  for (const part of message.parts) {
    // Cast to any to check for tool result properties
    const anyPart = part as Record<string, unknown>;
    if (
      typeof anyPart.type === "string" &&
      anyPart.type.startsWith("tool-") &&
      (anyPart.state === "result" || anyPart.state === "output") &&
      anyPart.output &&
      typeof anyPart.output === "object"
    ) {
      const output = anyPart.output as ToolResult;
      if (output.previewUrl) {
        toolResults.push(output);
      }
    }
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-lg px-4 py-3 ${
          isUser
            ? "bg-[var(--accent)] text-white"
            : "bg-white/5 text-white border border-white/10"
        }`}
      >
        {/* Message content */}
        {textContent && (
          <div className="whitespace-pre-wrap text-sm">{textContent}</div>
        )}

        {/* Tool results with preview links */}
        {toolResults.length > 0 && (
          <div className="mt-3 space-y-2">
            {toolResults.map((result, index) => (
              <div key={index} className="flex items-center gap-2">
                <Link
                  href={result.previewUrl || "#"}
                  target="_blank"
                  className="inline-flex items-center gap-2 rounded-md bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--accent)]/80"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  Preview Changes
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
