# Phase 3: AI-Powered CMS - Research

**Researched:** 2026-01-18
**Domain:** AI-powered content management with natural language interface
**Confidence:** HIGH

## Summary

This phase implements a natural language content management system using the Vercel AI SDK with either OpenAI or Anthropic Claude as the AI provider. The architecture uses tool calling to map natural language commands to database operations, with full-page preview before publishing and a versioning system using Supabase triggers for audit/rollback.

The current website has all content hardcoded in React components (hero text, about page content, program details). This requires migrating to a database-driven content model where AI can update fields. The AI will use structured tool calling to understand commands like "change the hero text to X" and map them to specific database operations.

**Primary recommendation:** Use Vercel AI SDK 6+ with Anthropic Claude (or OpenAI GPT-4) for tool calling, store editable content in a Supabase `site_content` table with JSONB fields, implement preview via re-rendering with draft content, and use PostgreSQL triggers for version history.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `ai` | ^6.0.0 | Vercel AI SDK core for streamText, tool calling | Official Next.js AI integration, unified provider API |
| `@ai-sdk/react` | ^6.0.0 | useChat hook for chat UI | Handles streaming, tool calls, approval flow |
| `@ai-sdk/anthropic` | ^6.0.0 | Anthropic Claude provider | Best tool calling accuracy, prompt caching for cost |
| `@ai-sdk/openai` | ^6.0.0 | OpenAI provider (alternative) | Widely used, good function calling |
| `zod` | ^4.3.5 | Schema validation for tool inputs | Already in project, type-safe tool definitions |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@supabase/supabase-js` | ^2.78.0 | Database operations | Already installed, content CRUD |
| `framer-motion` | ^12.26.2 | Chat drawer animation | Already installed, bottom drawer UX |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Anthropic Claude | OpenAI GPT-4 | OpenAI has auto prompt caching; Claude has 90% cost reduction with explicit caching |
| Vercel AI SDK | Direct API calls | Direct calls require manual streaming, tool handling; SDK abstracts this |
| JSONB content | Separate columns | JSONB allows flexible content structure; columns require migrations for new fields |

**Installation:**
```bash
npm install ai @ai-sdk/react @ai-sdk/anthropic
# or for OpenAI:
npm install ai @ai-sdk/react @ai-sdk/openai
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── admin/
│   │   ├── dashboard/
│   │   │   ├── chat/           # AI chat interface (new)
│   │   │   │   └── page.tsx
│   │   │   ├── history/        # Version history page (new)
│   │   │   │   └── page.tsx
│   │   │   └── preview/        # Full page preview (new)
│   │   │       └── page.tsx
│   │   └── api/
│   │       └── chat/
│   │           └── route.ts    # AI chat endpoint
├── components/
│   ├── admin/
│   │   ├── chat-drawer.tsx     # Bottom drawer chat UI
│   │   ├── chat-message.tsx    # Message rendering
│   │   └── preview-overlay.tsx # Preview with publish/cancel
│   └── content/
│       └── editable-content.tsx # Content that reads from DB
├── lib/
│   ├── ai/
│   │   ├── tools.ts            # Tool definitions (Zod schemas)
│   │   ├── prompts.ts          # System prompts
│   │   └── content-operations.ts # DB operations for AI
│   └── content/
│       ├── queries.ts          # Content fetching
│       └── mutations.ts        # Content updating
└── types/
    └── content.ts              # Content type definitions
```

### Pattern 1: Tool-Based Content Operations
**What:** Define discrete tools the AI can call to modify content
**When to use:** All AI content editing operations
**Example:**
```typescript
// Source: https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling
import { z } from 'zod';
import { tool } from 'ai';

export const updateTextContentTool = tool({
  description: 'Update a text content field on the website. Use this when the user wants to change text like hero headlines, descriptions, or other text content.',
  inputSchema: z.object({
    contentKey: z.string().describe('The unique key identifying the content field, e.g., "hero.headline", "about.mission"'),
    newText: z.string().describe('The new text content to set'),
  }),
  needsApproval: true, // Requires preview confirmation
  execute: async ({ contentKey, newText }) => {
    // Create draft content for preview
    const draft = await createDraftContent(contentKey, newText);
    return {
      success: true,
      draftId: draft.id,
      previewUrl: `/admin/dashboard/preview?draft=${draft.id}`,
      message: `I've prepared the change. Please review the preview to see how it will look.`
    };
  },
});

export const toggleSectionVisibilityTool = tool({
  description: 'Show or hide a section on the website',
  inputSchema: z.object({
    sectionKey: z.string().describe('The section identifier, e.g., "announcement_bar", "safety_section"'),
    visible: z.boolean().describe('Whether the section should be visible'),
  }),
  needsApproval: true,
  execute: async ({ sectionKey, visible }) => {
    const draft = await createDraftVisibility(sectionKey, visible);
    return {
      success: true,
      draftId: draft.id,
      previewUrl: `/admin/dashboard/preview?draft=${draft.id}`,
      message: `I've prepared to ${visible ? 'show' : 'hide'} the ${sectionKey}. Please review the preview.`
    };
  },
});

export const updateAnnouncementBarTool = tool({
  description: 'Add, update, or remove the announcement bar at the top of the website',
  inputSchema: z.object({
    action: z.enum(['add', 'update', 'remove']).describe('The action to perform'),
    text: z.string().optional().describe('The announcement text (required for add/update)'),
    linkUrl: z.string().optional().describe('Optional link URL for the announcement'),
    linkText: z.string().optional().describe('Optional link text (e.g., "Learn more")'),
  }),
  needsApproval: true,
  execute: async ({ action, text, linkUrl, linkText }) => {
    const draft = await createDraftAnnouncement(action, text, linkUrl, linkText);
    return {
      success: true,
      draftId: draft.id,
      previewUrl: `/admin/dashboard/preview?draft=${draft.id}`,
      message: action === 'remove'
        ? 'I\'ve prepared to remove the announcement bar. Please review the preview.'
        : `I've prepared the announcement bar. Please review the preview.`
    };
  },
});
```

### Pattern 2: Streaming Chat with Tool Execution
**What:** Server-side route handler with streaming and tool calling
**When to use:** The /api/chat endpoint
**Example:**
```typescript
// Source: https://ai-sdk.dev/docs/getting-started/nextjs-app-router
// app/admin/api/chat/route.ts
import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { createClient } from '@/lib/supabase/server';
import {
  updateTextContentTool,
  toggleSectionVisibilityTool,
  updateAnnouncementBarTool,
  listEditableContentTool
} from '@/lib/ai/tools';
import { SYSTEM_PROMPT } from '@/lib/ai/prompts';

export async function POST(req: Request) {
  // Verify admin authentication
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: anthropic('claude-sonnet-4-20250514'),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    tools: {
      updateTextContent: updateTextContentTool,
      toggleSectionVisibility: toggleSectionVisibilityTool,
      updateAnnouncementBar: updateAnnouncementBarTool,
      listEditableContent: listEditableContentTool,
    },
    providerOptions: {
      anthropic: {
        // Enable prompt caching for system prompt (saves 90% on repeated calls)
        cacheControl: { type: 'ephemeral' },
      },
    },
  });

  return result.toUIMessageStreamResponse();
}
```

### Pattern 3: Chat UI with useChat Hook
**What:** Client-side chat interface using AI SDK hooks
**When to use:** The chat drawer component
**Example:**
```typescript
// Source: https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-tool-usage
'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function ChatDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [input, setInput] = useState('');

  const { messages, sendMessage, addToolApprovalResponse } = useChat({
    api: '/admin/api/chat',
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
  });

  // Check first visit for onboarding
  useEffect(() => {
    const visited = localStorage.getItem('cms-chat-visited');
    if (visited) setIsFirstVisit(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage({ text: input });
    setInput('');
    if (isFirstVisit) {
      localStorage.setItem('cms-chat-visited', 'true');
      setIsFirstVisit(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: '50vh' }}
          exit={{ height: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-black/95 border-t border-white/10"
        >
          {/* Chat messages */}
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isFirstVisit && messages.length === 0 && (
                <div className="text-muted-foreground">
                  <p className="font-medium text-white mb-2">Welcome! Here are some things you can do:</p>
                  <ul className="space-y-1 text-sm">
                    <li>"Change the hero text to say Registration Now Open"</li>
                    <li>"Add an announcement bar about summer camp"</li>
                    <li>"Hide the safety section on the flag football page"</li>
                  </ul>
                </div>
              )}
              {messages.map(message => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onApprove={(approvalId) => addToolApprovalResponse({ id: approvalId, approved: true })}
                  onDeny={(approvalId) => addToolApprovalResponse({ id: approvalId, approved: false })}
                />
              ))}
            </div>
            {/* Input form */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a command..."
                className="w-full bg-white/5 rounded-lg px-4 py-3 text-white"
              />
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Pattern 4: Database-Driven Content Model
**What:** Store editable content in Supabase with versioning
**When to use:** All site content that admins should be able to edit
**Example:**
```sql
-- Content storage table
CREATE TABLE site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_key TEXT UNIQUE NOT NULL,  -- e.g., 'hero.headline', 'about.mission'
  content_type TEXT NOT NULL,        -- 'text', 'announcement', 'visibility'
  content JSONB NOT NULL,            -- Flexible content storage
  page TEXT,                         -- Which page this belongs to
  section TEXT,                      -- Which section within page
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Draft content for preview
CREATE TABLE content_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_key TEXT NOT NULL,
  content JSONB NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 hour'
);

-- Version history with trigger
CREATE TABLE content_versions (
  id BIGSERIAL PRIMARY KEY,
  content_key TEXT NOT NULL,
  content JSONB NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  change_description TEXT
);

-- Trigger to auto-version on updates
CREATE OR REPLACE FUNCTION version_content()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO content_versions (content_key, content, changed_by, change_description)
  VALUES (
    OLD.content_key,
    OLD.content,
    COALESCE((auth.jwt() ->> 'sub')::uuid, NULL),
    'Auto-versioned on update'
  );

  -- Keep only last 10 versions per content_key
  DELETE FROM content_versions
  WHERE id IN (
    SELECT id FROM content_versions
    WHERE content_key = OLD.content_key
    ORDER BY changed_at DESC
    OFFSET 10
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER content_version_trigger
BEFORE UPDATE ON site_content
FOR EACH ROW
EXECUTE FUNCTION version_content();

-- Announcement bar table
CREATE TABLE announcement_bar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  link_url TEXT,
  link_text TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Section visibility toggles
CREATE TABLE section_visibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT UNIQUE NOT NULL,  -- e.g., 'homepage.safety', 'flag-football.coaches'
  is_visible BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat message history for persistence
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  role TEXT NOT NULL,  -- 'user' or 'assistant'
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient content lookup
CREATE INDEX idx_site_content_key ON site_content(content_key);
CREATE INDEX idx_content_versions_key ON content_versions(content_key, changed_at DESC);
CREATE INDEX idx_chat_messages_user ON chat_messages(user_id, created_at DESC);
```

### Pattern 5: Preview with Draft Content
**What:** Render full page with proposed changes highlighted
**When to use:** Before publishing any content change
**Example:**
```typescript
// app/admin/dashboard/preview/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function PreviewPage({
  searchParams,
}: {
  searchParams: { draft: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/admin/login');

  // Fetch draft
  const { data: draft } = await supabase
    .from('content_drafts')
    .select('*')
    .eq('id', searchParams.draft)
    .single();

  if (!draft) redirect('/admin/dashboard');

  // Fetch current content merged with draft
  const { data: currentContent } = await supabase
    .from('site_content')
    .select('*')
    .eq('content_key', draft.content_key)
    .single();

  return (
    <div className="relative">
      {/* Preview overlay with publish/cancel */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-black px-4 py-2 flex items-center justify-between">
        <span className="font-medium">Preview Mode - Changes not yet published</span>
        <div className="flex gap-2">
          <form action={publishDraft}>
            <input type="hidden" name="draftId" value={draft.id} />
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-1 rounded font-medium hover:bg-green-700"
            >
              Publish
            </button>
          </form>
          <form action={cancelDraft}>
            <input type="hidden" name="draftId" value={draft.id} />
            <button
              type="submit"
              className="bg-white/20 px-4 py-1 rounded font-medium hover:bg-white/30"
            >
              Cancel
            </button>
          </form>
        </div>
      </div>

      {/* Render page with draft content, highlight changed element */}
      <PreviewRenderer
        draft={draft}
        currentContent={currentContent}
        highlightChanges={true}
      />
    </div>
  );
}
```

### Anti-Patterns to Avoid
- **Hand-rolling streaming:** Use AI SDK's built-in streaming; manual SSE handling is error-prone
- **Storing AI responses in component state only:** Persist chat history to database for continuity
- **Direct content modification without preview:** Always create drafts first, require explicit publish
- **Unbounded version history:** Limit to last 10 versions as specified; use database trigger to auto-prune
- **Ambiguous tool schemas:** Be extremely specific in tool descriptions to reduce AI misinterpretation

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Streaming AI responses | Manual SSE/fetch streaming | AI SDK `streamText` + `useChat` | Handles reconnection, parsing, provider differences |
| Tool calling with approval | Custom function matching | AI SDK tool system with `needsApproval` | Built-in approval flow, type safety |
| Chat state management | Custom React state | AI SDK `useChat` hook | Handles messages, streaming, tool results |
| Content versioning | Manual version tracking | PostgreSQL trigger + `supa_audit` pattern | Automatic, reliable, no missed versions |
| Prompt caching | Custom caching layer | Provider-native caching (Anthropic/OpenAI) | 90% cost reduction, handled at API level |
| Natural language parsing | Regex/keyword matching | LLM tool calling | Handles variations, context, ambiguity |

**Key insight:** The AI SDK exists specifically to solve the complexity of building AI chat interfaces. Manual implementations miss edge cases around streaming, reconnection, provider differences, and tool execution flows.

## Common Pitfalls

### Pitfall 1: Content Key Collision
**What goes wrong:** AI generates content keys that don't match existing content structure
**Why it happens:** Inconsistent naming between components and database
**How to avoid:** Define explicit content key enum/type, include in system prompt
**Warning signs:** AI says "content updated" but nothing changes on site

### Pitfall 2: Preview URL Exposure
**What goes wrong:** Draft previews accessible without authentication
**Why it happens:** Forgetting to protect preview routes
**How to avoid:** Apply same auth middleware to preview routes; drafts expire after 1 hour
**Warning signs:** Users reporting seeing unpublished content

### Pitfall 3: Concurrent Edit Conflicts
**What goes wrong:** Two admins edit same content, one overwrites the other
**Why it happens:** No optimistic locking or conflict detection
**How to avoid:** Include `updated_at` in draft creation, check before publish
**Warning signs:** Admins complaining changes disappeared

### Pitfall 4: AI Hallucinating Content Keys
**What goes wrong:** AI invents content keys that don't exist
**Why it happens:** System prompt doesn't enumerate valid keys
**How to avoid:** Provide `listEditableContent` tool, include valid keys in system prompt
**Warning signs:** Tool execution succeeds but returns "content not found"

### Pitfall 5: Runaway API Costs
**What goes wrong:** High OpenAI/Anthropic bills from repeated system prompts
**Why it happens:** Not using prompt caching, verbose system prompts
**How to avoid:** Use Anthropic prompt caching (90% savings) or OpenAI auto-caching; keep system prompt stable
**Warning signs:** Bills exceeding $100/month on low usage

### Pitfall 6: Lost Chat Context
**What goes wrong:** Admin returns to chat, previous conversation gone
**Why it happens:** Only storing messages in component state
**How to avoid:** Persist to `chat_messages` table, load on mount
**Warning signs:** Admins re-explaining context repeatedly

## Code Examples

Verified patterns from official sources:

### System Prompt for Content Management
```typescript
// Source: Best practices from OpenAI function calling docs
export const SYSTEM_PROMPT = `You are a helpful assistant for the RiseUp Youth Football League website.
You help administrators update website content using natural language commands.

## What You Can Do
- Update text content (headlines, descriptions, paragraphs)
- Manage the announcement bar (add, update, remove)
- Toggle section visibility (show/hide sections)

## Available Content Keys
The following content can be edited:
- hero.headline: The main headline on the homepage
- hero.subtitle: The subtitle text below the headline
- hero.cta_text: The primary button text
- about.mission: The mission statement paragraphs
- about.story: The organization's story paragraphs
- announcement_bar: The announcement at the top of the site

## How You Work
1. When asked to make a change, use the appropriate tool
2. The tool creates a draft for preview
3. Tell the user to review the preview
4. Wait for them to publish or cancel

## Guidelines
- Be conversational and friendly
- If a request is ambiguous, ask clarifying questions with numbered options
- If asked to do something outside your capabilities, explain what you can do instead
- After a change is published, confirm it and ask if there's anything else

## Example Interactions
User: "Change the homepage headline"
You: "I'd be happy to help! What would you like the new headline to say?"

User: "Update it to say Registration Now Open"
You: [calls updateTextContent tool with hero.headline]
"I've prepared the change. Please review the preview to see how 'Registration Now Open' will look on the homepage. Click Publish to make it live or Cancel to discard."`;
```

### Content Fetching with Fallbacks
```typescript
// Source: Supabase docs pattern
// lib/content/queries.ts
import { createClient } from '@/lib/supabase/server';

// Default content when database hasn't been seeded
const DEFAULT_CONTENT: Record<string, string> = {
  'hero.headline': 'BUILDING CHAMPIONS ON AND OFF THE FIELD',
  'hero.subtitle': 'Youth football programs for ages 5-14.',
  'hero.cta_text': 'Register Now',
  // ... more defaults
};

export async function getContent(contentKey: string): Promise<string> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('site_content')
    .select('content')
    .eq('content_key', contentKey)
    .single();

  if (data?.content?.text) {
    return data.content.text;
  }

  return DEFAULT_CONTENT[contentKey] || '';
}

export async function getSectionVisibility(sectionKey: string): Promise<boolean> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('section_visibility')
    .select('is_visible')
    .eq('section_key', sectionKey)
    .single();

  return data?.is_visible ?? true; // Default to visible
}
```

### Version History and Rollback
```typescript
// lib/content/mutations.ts
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function rollbackToVersion(versionId: number) {
  const supabase = await createClient();

  // Fetch the version to restore
  const { data: version } = await supabase
    .from('content_versions')
    .select('*')
    .eq('id', versionId)
    .single();

  if (!version) throw new Error('Version not found');

  // Update current content (trigger will auto-version the current state)
  const { error } = await supabase
    .from('site_content')
    .update({
      content: version.content,
      updated_at: new Date().toISOString(),
    })
    .eq('content_key', version.content_key);

  if (error) throw error;

  // Revalidate affected pages
  revalidatePath('/');
  revalidatePath('/about');
  // ... etc

  return { success: true };
}

export async function getVersionHistory(contentKey: string, limit = 10) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('content_versions')
    .select('id, content, changed_at, change_description')
    .eq('content_key', contentKey)
    .order('changed_at', { ascending: false })
    .limit(limit);

  return data || [];
}
```

### Disambiguation Response Pattern
```typescript
// When AI finds multiple matches
// lib/ai/tools.ts
export const findContentTool = tool({
  description: 'Find content matching a description when user request is ambiguous',
  inputSchema: z.object({
    searchTerm: z.string().describe('What the user is looking for'),
  }),
  execute: async ({ searchTerm }) => {
    const supabase = await createClient();

    const { data } = await supabase
      .from('site_content')
      .select('content_key, content')
      .textSearch('content_key', searchTerm, { type: 'websearch' });

    if (!data || data.length === 0) {
      return { found: false, message: 'No matching content found' };
    }

    if (data.length === 1) {
      return { found: true, contentKey: data[0].content_key };
    }

    // Multiple matches - return numbered list for disambiguation
    const options = data.map((item, i) =>
      `${i + 1}. ${item.content_key}: "${item.content.text?.substring(0, 50)}..."`
    ).join('\n');

    return {
      found: true,
      ambiguous: true,
      message: `I found ${data.length} matching items:\n${options}\n\nWhich one would you like to update?`,
      options: data.map(d => d.content_key),
    };
  },
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Custom streaming with SSE | AI SDK streamText | 2024-2025 | Unified API across providers |
| JSON mode for structured output | Tool calling with Zod schemas | 2024 | Type safety, better accuracy |
| Manual function matching | LLM tool calling | 2023-2024 | Handles natural language variations |
| Response-based confirmation | needsApproval tool flag | AI SDK 6 (late 2025) | Built-in approval workflow |
| Separate chat persistence | useChat with persistence option | AI SDK 5+ | Simplified state management |
| No prompt caching | Provider-native caching | 2024 | 90% cost reduction possible |

**Deprecated/outdated:**
- Using `generateText` without tools for command parsing - use tool calling instead
- Manual SSE streaming implementation - use AI SDK
- Storing versions in same table with `is_current` flag - use separate versions table with trigger

## Open Questions

Things that couldn't be fully resolved:

1. **Exact content migration approach**
   - What we know: Current content is hardcoded in TSX files
   - What's unclear: Best approach to seed database from existing content
   - Recommendation: Create migration script that extracts current values, seed on first deploy

2. **Multi-page preview**
   - What we know: Some content appears on multiple pages (e.g., announcement bar)
   - What's unclear: Whether to preview all affected pages or just primary
   - Recommendation: Preview primary affected page, mention in confirmation that change affects multiple pages

3. **Rate limiting AI calls**
   - What we know: Need to control costs
   - What's unclear: Exact rate limits to implement
   - Recommendation: Start with 100 messages/day per admin, adjust based on actual usage

## Sources

### Primary (HIGH confidence)
- [Vercel AI SDK Documentation](https://ai-sdk.dev/docs/introduction) - Core architecture, useChat, streamText
- [AI SDK Tool Calling](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling) - Tool definitions with Zod
- [AI SDK Chatbot Tool Usage](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-tool-usage) - useChat with tools, approval flow
- [AI SDK Anthropic Provider](https://ai-sdk.dev/providers/ai-sdk-providers/anthropic) - Anthropic-specific features, caching
- [Supabase Postgres Triggers](https://supabase.com/docs/guides/database/postgres/triggers) - Trigger-based versioning
- [Supabase supa_audit](https://supabase.com/blog/postgres-audit) - Official auditing pattern

### Secondary (MEDIUM confidence)
- [OpenAI Function Calling Best Practices](https://platform.openai.com/docs/guides/function-calling) - Schema design guidance
- [Anthropic Prompt Caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) - Cost optimization
- [OpenAI Prompt Caching](https://platform.openai.com/docs/guides/prompt-caching) - Auto-caching details

### Tertiary (LOW confidence)
- Various Medium articles on CMS patterns - General architecture ideas
- WebSearch results on preview patterns - Iframe vs component approaches

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - AI SDK is well-documented, actively maintained by Vercel
- Architecture: HIGH - Follows official patterns from AI SDK docs
- Database schema: MEDIUM - Custom design based on Supabase patterns, may need iteration
- Pitfalls: HIGH - Based on real issues documented in community discussions

**Research date:** 2026-01-18
**Valid until:** 60 days (AI SDK is relatively stable, providers update frequently)
