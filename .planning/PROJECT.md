# RiseUp Youth Football League Website

## What This Is

A modern website for RiseUp Youth Football League featuring an AI-powered CMS that allows non-technical staff to update content using natural language commands (e.g., "change the hero text to say 'Registration Now Open'"). The site serves parents seeking youth football programs, donors, and sponsors, with integrated GiveButter donations and a self-service sponsor portal.

## Core Value

Non-technical administrators can update website content instantly using natural language commands — no code, no training, no complex interfaces.

## Current State (v1 Shipped)

**Shipped:** 2026-01-18
**Codebase:** 8,043 LOC TypeScript, Next.js 16 + Supabase + Anthropic Claude
**Status:** Ready for production deployment and content population

**What's Working:**
- 8-page responsive public website with dark cinematic theme
- AI chat interface for natural language content editing
- Inline click-to-edit for text and images
- GiveButter donation integration
- Self-service sponsor portal with admin approval
- Preview and rollback workflow (keeps 10 versions)

**User Setup Required:**
- reCAPTCHA keys, Resend API key, GiveButter widget ID
- Supabase Storage buckets (sponsor-logos, site-images)
- Database migrations (001_sponsors.sql, 002_content_cms.sql, 003_images.sql)
- Admin user in Supabase Auth
- ANTHROPIC_API_KEY for AI chat

## Requirements

### Validated

- Chat interface in admin panel for natural language commands — v1
- Text content updates via natural language ("Change [field] to say [new text]") — v1
- Announcement bar management ("Add/remove announcement saying [text]") — v1
- Section visibility toggles ("Hide/show [section]") — v1
- Change history and rollback capability (last 10 changes) — v1
- Preview before publish confirmation step — v1
- Audit log with timestamp and user — v1
- Video hero section with auto-play (muted, looping), overlay text, CTAs — v1
- Mobile fallback to static image on slow connections — v1
- Flag Football program page with full details — v1
- Tackle Football program page with full details — v1
- Academies & Clinics program page with full details — v1
- About Us page (mission, leadership, history) — v1
- Contact page with inquiry form — v1
- Partners page with sponsor logos — v1
- GiveButter embedded donation form — v1
- Impact statements showing fund usage — v1
- Sponsor submission form with logo upload — v1
- File upload validation (type, size) — v1
- Admin notification on sponsor submission — v1
- Admin approval workflow — v1
- Automatic display on Partners after approval — v1
- Responsive mobile-first design — v1
- Page load under 3 seconds — v1
- Contact form spam protection (reCAPTCHA) — v1
- Protected admin panel — v1

### Active

(None — all v1 requirements shipped)

### Deferred to v2

- WCAG 2.1 Level AA accessibility compliance
- SEO meta tags and schema markup on all pages
- XML sitemap generation
- Lighthouse score > 90 optimization
- Sponsor confirmation/thank you email automation
- AI confidence scores for ambiguous commands
- Common command templates/suggestions
- Image upload via AI commands
- Player/parent portal with login
- Blog/news section
- Event calendar

### Out of Scope

- E-commerce/online registration — external system handles this, just link to it
- Live streaming/video hosting — use YouTube/Vimeo embeds
- Mobile app — responsive web is sufficient
- Multi-language support — English only at launch
- Advanced analytics dashboard — Google Analytics is sufficient
- Volunteer management — use external tools (SignUpGenius)

## Design Direction

**Reference:** anduril.com — dark, cinematic, tech-forward aesthetic

**Key Elements:**
- Full-screen video hero with minimal overlay text
- Three large program tiles below hero (Flag Football, Tackle Football, Academies & Clinics)
- Dark backgrounds with dramatic, high-contrast imagery
- Clean sans-serif typography (Inter), bold product/program names
- Minimal navigation: Logo left, nav center, CTA right
- Premium tech brand feel (not typical cheerful youth sports)

## Context

**Target Users:**
- "Engaged Parent" — busy working parents on mobile, need quick answers about registration and schedules
- "First-Time Youth Sports Parent" — research-heavy, needs safety info, comparing options
- "Potential Sponsor" — local business owners wanting simple self-service sponsorship
- "Community Donor" — wants transparency on fund usage, prefers online giving
- "RiseUp Administrator" — volunteer coach with no tech background, needs instant updates

**Business Goals (6 months):**
- 500+ monthly visitors
- 50+ new program enrollments via website
- $10,000+ in online donations
- 10+ new sponsor partnerships

## Constraints

- **Budget**: Under $5,000 — using free/freemium tiers (Vercel, Supabase, AI ~$50-100/month)
- **Tech Stack**: Next.js 16, TypeScript, Tailwind v4, Supabase, Anthropic Claude
- **Hosting**: Vercel (frontend), Supabase (backend)
- **External Dependencies**: GiveButter (donations), external registration system (links only)
- **No Payment Processing**: All payments handled by GiveButter or external systems

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js 16 + Supabase stack | SEO-friendly SSR, generous free tiers, easy AI integration | Good |
| Chat interface for AI CMS | Simpler than external tool, admin panel keeps everything in one place | Good |
| Manual sponsor approval | Prevents spam, admin clicks approval link vs fully automated | Good |
| Links to external registration | Specialized tools handle registration better, reduces scope | Good |
| GiveButter embed (not custom) | Handles PCI compliance, donor management, reduces risk | Good |
| Tailwind v4 CSS-based config | Latest version, @theme inline instead of config file | Good |
| React 19 useActionState | New pattern for server action forms, cleaner than useFormState | Good |
| Draft-based content workflow | AI tools create drafts, preview before publish | Good |
| Client-side Storage upload | Avoids server action 1MB body limit for images | Good |
| Inline editing + AI chat | Two content editing modes serve different user preferences | Good |

---
*Last updated: 2026-01-18 after v1 milestone*
