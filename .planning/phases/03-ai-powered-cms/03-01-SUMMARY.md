---
phase: 03-ai-powered-cms
plan: 01
subsystem: ai, database
tags: [ai-sdk, anthropic, claude, supabase, chat, streaming, tools]

# Dependency graph
requires:
  - phase: 02-interactive-features
    provides: Admin authentication and dashboard infrastructure
provides:
  - Database schema for content, drafts, versions, announcements, chat history
  - AI SDK integration with Anthropic Claude
  - Tool definitions for content operations
  - Streaming chat API endpoint
  - Chat drawer UI component
affects: [03-02-ai-content-updates]

# Tech tracking
tech-stack:
  added: [ai, @ai-sdk/react, @ai-sdk/anthropic]
  patterns: [AI tool calling with Zod schemas, DefaultChatTransport, UIMessage streaming]

key-files:
  created:
    - supabase/migrations/002_content_cms.sql
    - src/lib/ai/tools.ts
    - src/lib/ai/prompts.ts
    - src/lib/content/queries.ts
    - src/lib/content/mutations.ts
    - src/app/admin/api/chat/route.ts
    - src/components/admin/chat-drawer.tsx
    - src/components/admin/chat-message.tsx
    - src/types/content.ts
  modified:
    - package.json
    - src/lib/supabase/types.ts
    - src/app/admin/layout.tsx
    - .env.local.example

key-decisions:
  - "AI SDK v6 uses inputSchema for tool parameters, not parameters"
  - "AI SDK v6 uses DefaultChatTransport for custom API endpoint"
  - "AI SDK v6 uses sendMessage({text}) not handleSubmit"
  - "Tool execute functions return draft IDs and preview URLs"

patterns-established:
  - "Tool pattern: Return {success, draftId, previewUrl, message} from tool execute"
  - "Chat pattern: DefaultChatTransport({api}) for custom endpoint"
  - "Content pattern: createDraft -> preview -> publishDraft workflow"

# Metrics
duration: 11min
completed: 2026-01-18
---

# Phase 3 Plan 1: AI Content Infrastructure Summary

**AI SDK v6 integration with streaming chat, Anthropic Claude tools, and draft-based content editing workflow**

## Performance

- **Duration:** 11 min
- **Started:** 2026-01-18T14:42:38Z
- **Completed:** 2026-01-18T14:53:17Z
- **Tasks:** 3
- **Files modified:** 13

## Accomplishments
- Database schema for AI CMS with versioning triggers and RLS policies
- AI tool definitions for text content, announcement bar, and section visibility
- Streaming chat API endpoint with Anthropic Claude Sonnet
- Bottom drawer chat UI with onboarding examples and message display

## Task Commits

Each task was committed atomically:

1. **Task 1: Database schema and AI SDK setup** - `a6fc92b` (feat)
2. **Task 2: AI tools and content operations** - `4e43386` (feat)
3. **Task 3: Chat API route and UI components** - `03a816f` (feat)

## Files Created/Modified

**Created:**
- `supabase/migrations/002_content_cms.sql` - CMS tables: site_content, content_drafts, content_versions, announcement_bar, section_visibility, chat_messages
- `src/lib/ai/tools.ts` - Tool definitions: updateTextContent, updateAnnouncementBar, toggleSectionVisibility, listEditableContent
- `src/lib/ai/prompts.ts` - SYSTEM_PROMPT for content management AI
- `src/lib/content/queries.ts` - Content fetching functions with fallbacks
- `src/lib/content/mutations.ts` - Draft creation, publishing, and cancellation
- `src/app/admin/api/chat/route.ts` - Streaming chat endpoint with tool calling
- `src/components/admin/chat-drawer.tsx` - Bottom drawer chat UI with animation
- `src/components/admin/chat-message.tsx` - Message rendering with tool result links
- `src/types/content.ts` - TypeScript types for content operations

**Modified:**
- `package.json` - Added ai, @ai-sdk/react, @ai-sdk/anthropic
- `src/lib/supabase/types.ts` - Added types for all CMS tables
- `src/app/admin/layout.tsx` - Added ChatDrawer component
- `.env.local.example` - Added ANTHROPIC_API_KEY

## Decisions Made

- **AI SDK v6 API changes:** Used `inputSchema` instead of `parameters` for tool definitions, `sendMessage({text})` instead of legacy `handleSubmit`, `DefaultChatTransport` for custom API endpoint, `toUIMessageStreamResponse()` for streaming
- **Tool design:** All content-modifying tools create drafts and return preview URLs rather than applying changes directly - this enables the preview-before-publish workflow specified in CONTEXT.md
- **Chat transport:** Used DefaultChatTransport with custom API path instead of trying to configure Chat class directly

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] AI SDK v6 API differences**
- **Found during:** Task 3 (Chat API route and UI components)
- **Issue:** AI SDK v6 has different API than research doc (parameters -> inputSchema, handleSubmit -> sendMessage, api option -> transport)
- **Fix:** Updated tools to use `inputSchema`, chat drawer to use `DefaultChatTransport({api})` and `sendMessage({text})`, route to use `toUIMessageStreamResponse()`
- **Files modified:** src/lib/ai/tools.ts, src/components/admin/chat-drawer.tsx, src/app/admin/api/chat/route.ts
- **Verification:** TypeScript compiles without errors
- **Committed in:** 03a816f (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** API updates required for AI SDK v6 compatibility. Same functionality achieved with correct API.

## Issues Encountered

- AI SDK v6 types and API surface differ significantly from documentation in 03-RESEARCH.md (which was based on earlier versions). Required careful examination of actual installed package types to determine correct usage.

## User Setup Required

**External services require manual configuration:**

1. **Anthropic API Key**
   - Get from: https://console.anthropic.com/settings/keys
   - Add to .env.local: `ANTHROPIC_API_KEY=your_key`

2. **Database Migration**
   - Run `supabase/migrations/002_content_cms.sql` in Supabase SQL Editor

3. **Verification**
   - Navigate to /admin/dashboard
   - Click chat button (bottom right)
   - Type "What can I edit?"
   - Should receive AI response listing editable content

## Next Phase Readiness

**Ready for Plan 02 (Preview and Publish):**
- Draft creation infrastructure in place
- Tools return preview URLs pointing to `/admin/dashboard/preview?draft={id}`
- Preview page needs to be created to render drafts
- Publish/cancel actions need server actions

**Blockers:**
- None - all Plan 01 deliverables complete

---
*Phase: 03-ai-powered-cms*
*Completed: 2026-01-18*
