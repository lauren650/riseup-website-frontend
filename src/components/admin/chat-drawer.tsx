"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatMessage } from "./chat-message";

const EXAMPLE_COMMANDS = [
  'Change the hero headline to "Registration Now Open"',
  "Add an announcement about summer camp registration",
  "What content can I edit?",
];

export function ChatDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Create a memoized transport with custom API endpoint
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/admin/api/chat",
      }),
    []
  );

  const { messages, sendMessage, status, error } = useChat({
    transport,
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Check first visit for onboarding
  useEffect(() => {
    const visited = localStorage.getItem("cms-chat-visited");
    if (visited) setIsFirstVisit(false);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const message = inputValue;
    setInputValue("");

    await sendMessage({ text: message });

    if (isFirstVisit) {
      localStorage.setItem("cms-chat-visited", "true");
      setIsFirstVisit(false);
    }
  };

  const handleExampleClick = async (command: string) => {
    if (isLoading) return;

    await sendMessage({ text: command });

    if (isFirstVisit) {
      localStorage.setItem("cms-chat-visited", "true");
      setIsFirstVisit(false);
    }
  };

  return (
    <>
      {/* Toggle Button - only show when drawer is closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
          aria-label="Open content editor"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </button>
      )}

      {/* Chat Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "50vh", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-black/95 backdrop-blur-xl"
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm font-medium text-white">
                    Content Editor
                  </span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-muted-foreground transition-colors hover:text-white"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* First visit onboarding */}
                {isFirstVisit && messages.length === 0 && (
                  <div className="text-muted-foreground">
                    <p className="mb-3 font-medium text-white">
                      Welcome to the Content Editor
                    </p>
                    <p className="mb-4 text-sm">
                      Use natural language to update your website content. Try
                      one of these examples:
                    </p>
                    <div className="space-y-2">
                      {EXAMPLE_COMMANDS.map((command, index) => (
                        <button
                          key={index}
                          onClick={() => handleExampleClick(command)}
                          disabled={isLoading}
                          className="block w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-left text-sm text-white transition-colors hover:bg-white/10 disabled:opacity-50"
                        >
                          &quot;{command}&quot;
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Messages */}
                {messages.map((message: UIMessage) => (
                  <ChatMessage key={message.id} message={message} />
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-3 text-white/60">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-white/40 [animation-delay:-0.3s]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-white/40 [animation-delay:-0.15s]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-white/40" />
                      </div>
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                )}

                {/* Error message */}
                {error && (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error.message || "Something went wrong. Please try again."}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <form
                onSubmit={onSubmit}
                className="border-t border-white/10 p-4"
              >
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type a command... (e.g., 'Change the hero headline')"
                    disabled={isLoading}
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-muted-foreground focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !inputValue.trim()}
                    className="rounded-lg bg-[var(--accent)] px-6 py-3 font-medium text-white transition-colors hover:bg-[var(--accent)]/80 disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
