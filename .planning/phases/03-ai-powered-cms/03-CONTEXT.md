# Phase 3: AI-Powered CMS - Context

**Gathered:** 2026-01-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Admin chat interface for natural language content editing. Admins can update text content, manage announcement bars, and toggle section visibility via conversational commands. Includes preview before publishing and version history with rollback. Image uploads and layout changes are out of scope.

</domain>

<decisions>
## Implementation Decisions

### Chat Interface
- Bottom drawer style, expands from bottom of admin panel (terminal-like)
- Persistent message history across sessions (stored in database)
- Conversational response style — full sentences, friendly tone
- First-time onboarding: show example commands on first visit, then hide

### Command Recognition
- When ambiguous, show numbered options ("I found 3 text sections. Which one?")
- Editable scope: text content + announcement bar + section visibility toggles
- When asked for something outside capabilities, explain limitations clearly
- Preview serves as confirmation — no separate "confirm" step needed

### Preview & Publishing
- Full page preview showing the entire page with change applied
- Changed element highlighted (border or glow) to draw attention
- Explicit Publish and Cancel buttons on preview
- After publishing: confirmation message in chat, stay in chat for next command

### History & Rollback
- Dedicated history page (not in chat)
- Minimal info per entry: date, time, brief description
- Preview-then-restore flow: see what it looked like, then confirm
- Keep last 10 versions, older ones deleted

### Claude's Discretion
- Exact drawer height and animation
- Highlight style for changed elements (border vs glow vs background)
- Chat message formatting and spacing
- How to handle rapid successive commands

</decisions>

<specifics>
## Specific Ideas

- Bottom drawer feels like a terminal/command line — fits the "type commands" mental model
- "I found 3 text sections. Which one?" with numbered choices for disambiguation
- Full page preview so admin sees exactly how the site will look

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-ai-powered-cms*
*Context gathered: 2026-01-18*
