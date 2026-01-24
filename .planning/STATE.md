# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-23)

**Core value:** Non-technical administrators can update website content instantly using natural language commands
**Current focus:** v1.2 Sponsor Management Redesign

## Current Position

Phase: 8 of 13 (Database & Core Services)
Plan: —
Status: Ready to plan
Last activity: 2026-01-23 — Roadmap created for v1.2

## Milestone Summary

**v1 MVP shipped:** 2026-01-18
- 3 phases, 9 plans, 116 minutes total execution
- 8,043 LOC TypeScript
- 122 files created/modified
- 30/30 requirements satisfied

**v1.1 Sponsorship Packages:** Partial (phases 4-5 complete, 6-7 superseded by v1.2)
- Phase 4: Foundation & Schema - COMPLETE
- Phase 5: Public Sponsorship Page - COMPLETE
- Phases 6-7 replaced by v1.2 redesign

**v1.2 Sponsor Management Redesign:** Starting
- Requirements definition in progress

See: .planning/MILESTONES.md

## Archives

- .planning/milestones/v1-ROADMAP.md — Full phase details
- .planning/milestones/v1-REQUIREMENTS.md — All v1 requirements
- .planning/milestones/v1-MILESTONE-AUDIT.md — Verification report

## Accumulated Context

### Key Decisions (v1)

Decisions logged in PROJECT.md Key Decisions table. Key technical choices:
- Next.js 16 + Supabase stack (SEO-friendly SSR, generous free tiers)
- Chat interface for AI CMS (simpler than external tool)
- GiveButter embed for donations (handles PCI compliance)
- Stripe for sponsor invoicing (v1.1)

### v1.1 Architecture Notes

From research (SUMMARY.md):
- Webhook-only database updates to prevent race conditions
- Idempotency guards required (webhook_events table) - IMPLEMENTED
- Stripe SDK v20.2.0 is only new dependency needed - INSTALLED
- Next.js 16 native req.text() eliminates need for micro package - USED

### Phase 4 Decisions

- Stripe API version 2025-12-15.clover (SDK default)
- RLS: public read for packages, authenticated write for invoices
- Webhook idempotency via pre-processing check of webhook_events table

### Phase 5 Decisions

- reCAPTCHA graceful degradation (skip if not configured)
- Email failures do not fail form submission
- Sponsor interest form uses dual email pattern (prospect + admin)

### Tech Debt (minor)

- Duplicate admin routes (src/app/admin/ and src/app/(admin)/) — Next.js 16 route group workaround
- Node.js version warning (18 vs 20) — environment issue, not code issue

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-01-23
Stopped at: Starting v1.2 milestone
Resume file: None
Next step: Define requirements
