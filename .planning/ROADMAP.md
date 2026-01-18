# Roadmap: RiseUp Youth Football League Website

## Overview

This roadmap delivers a modern youth football league website with an AI-powered CMS in three phases. Phase 1 establishes the Next.js/Supabase foundation and all public-facing pages. Phase 2 adds interactive features: donation integration and the self-service sponsor portal. Phase 3 builds the differentiating AI CMS that enables non-technical admins to update content via natural language commands.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Foundation & Public Pages** - Project setup, all public pages, responsive design
- [x] **Phase 2: Interactive Features** - Donation integration, sponsor portal with approval workflow
- [ ] **Phase 3: AI-Powered CMS** - Natural language content management system

## Phase Details

### Phase 1: Foundation & Public Pages
**Goal**: Visitors can browse a complete, responsive public website with all core content
**Depends on**: Nothing (first phase)
**Requirements**: PAGE-01, PAGE-02, PAGE-03, PAGE-04, PAGE-05, PAGE-06, PAGE-07, PAGE-08, PAGE-09, PAGE-10, PAGE-11, PAGE-12, TECH-01, TECH-02, TECH-03, TECH-04
**Success Criteria** (what must be TRUE):
  1. Visitor can navigate to all pages (Homepage, Flag Football, Tackle Football, Academies & Clinics, About Us, Contact, Partners, Ways to Give) via desktop and mobile menu
  2. Homepage video plays automatically (muted, looping) on desktop; mobile/slow connections see static image fallback
  3. Program pages display complete information: age requirements, schedules, costs, coach bios with photos, and safety protocols
  4. Contact form submits successfully with spam protection and admin receives the inquiry
  5. Site loads in under 3 seconds and displays correctly on mobile devices
**Plans**: 3 plans (2 waves)

Plans:
- [x] 01-01-PLAN.md — Project scaffolding (Next.js 15, TypeScript, Tailwind dark theme, Supabase clients, Vercel config)
- [x] 01-02-PLAN.md — Homepage and navigation (video hero with mobile fallback, program tiles, responsive nav with mobile menu)
- [x] 01-03-PLAN.md — Content pages (program pages with template, About, Contact form with reCAPTCHA, Partners/Ways to Give placeholders)

**Wave Structure:**
| Wave | Plans | Can Run Parallel |
|------|-------|------------------|
| 1 | 01-01 | Foundation must complete first |
| 2 | 01-02, 01-03 | Yes - homepage and content pages are independent |

### Phase 2: Interactive Features
**Goal**: Sponsors can self-submit and donors can contribute via embedded GiveButter form
**Depends on**: Phase 1
**Requirements**: DON-01, DON-02, SPON-01, SPON-02, SPON-03, SPON-04, SPON-05
**Success Criteria** (what must be TRUE):
  1. Visitor can complete a donation via the embedded GiveButter form on Ways to Give page
  2. Potential sponsor can submit company info and logo via self-service form
  3. Admin receives notification when new sponsor submits and can approve/reject via admin panel
  4. Approved sponsor logo automatically appears on Partners page with click-through link
**Plans**: 3 plans (2 waves)

Plans:
- [x] 02-01-PLAN.md — Donation integration (GiveButter widget component, embed on Ways to Give page)
- [x] 02-02-PLAN.md — Sponsor submission infrastructure (database schema, storage, validation, form, email notifications)
- [x] 02-03-PLAN.md — Admin dashboard (auth middleware, login, sponsor approval, dynamic Partners page)

**Wave Structure:**
| Wave | Plans | Can Run Parallel |
|------|-------|------------------|
| 1 | 02-01, 02-02 | Yes - donation and sponsor infrastructure are independent |
| 2 | 02-03 | Depends on 02-02 (needs sponsors table and server actions) |

### Phase 3: AI-Powered CMS
**Goal**: Non-technical administrators can update website content instantly using natural language commands
**Depends on**: Phase 2
**Requirements**: AI-01, AI-02, AI-03, AI-04, AI-05, AI-06, AI-07
**Success Criteria** (what must be TRUE):
  1. Admin can log into protected admin panel and access chat interface
  2. Admin can update any text content by typing natural language commands (e.g., "Change the hero text to say Registration Now Open")
  3. Admin can manage announcement bar (add, edit, remove) and toggle section visibility via commands
  4. System shows preview of changes before publishing and admin can confirm or cancel
  5. Admin can view change history and rollback to any of the last 10 versions
**Plans**: 2 plans

Plans:
- [ ] 03-01: Admin panel and AI chat interface (auth, chat UI, command parsing)
- [ ] 03-02: Content management features (preview, rollback, audit log)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Public Pages | 3/3 | Complete | 2026-01-17 |
| 2. Interactive Features | 3/3 | Complete | 2026-01-18 |
| 3. AI-Powered CMS | 0/2 | Not started | - |

---
*Roadmap created: 2026-01-17*
*Phase 1 planned: 2026-01-17*
*Phase 2 planned: 2026-01-17*
*Depth: Quick (3-5 phases)*
*Coverage: 30/30 v1 requirements mapped*
