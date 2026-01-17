# RiseUp Youth Football League Website

## What This Is

A modern website for RiseUp Youth Football League featuring an AI-powered CMS that allows non-technical staff to update content using natural language commands (e.g., "change the hero text to say 'Registration Now Open'"). The site serves parents seeking youth football programs, donors, and sponsors, with integrated GiveButter donations and a self-service sponsor portal.

## Core Value

Non-technical administrators can update website content instantly using natural language commands — no code, no training, no complex interfaces.

## Requirements

### Validated

(None yet — ship to validate)

### Active

**AI-Powered CMS Agent**
- [ ] Chat interface in admin panel for natural language commands
- [ ] Support for text content updates ("Change [field] to say [new text]")
- [ ] Announcement bar management ("Add/remove announcement saying [text]")
- [ ] Section visibility toggles ("Hide/show [section]")
- [ ] Change history and rollback capability (last 10 changes)
- [ ] Preview before publish confirmation step
- [ ] Audit log with timestamp and user

**Public Website - Core Pages**
- [ ] Video hero section with auto-play (muted, looping), overlay text, CTAs
- [ ] Mobile fallback to static image on slow connections
- [ ] Flag Football program page (age requirements, schedule, costs, coach bios, safety info)
- [ ] Tackle Football program page (age requirements, schedule, costs, coach bios, safety info)
- [ ] Academies & Clinics program page (age requirements, schedule, costs, coach bios)
- [ ] About Us page (mission, leadership bios, history, photo gallery)
- [ ] Contact page with inquiry form and contact info
- [ ] Partners page displaying sponsor logos with click-through links

**Donation Integration**
- [ ] GiveButter embedded donation form on "Ways to Give" page
- [ ] Impact statements showing fund usage

**Self-Service Sponsor Portal**
- [ ] Sponsor submission form (company name, contact, logo upload, website URL)
- [ ] File upload with validation (.png/.jpg/.svg, max 2MB, auto-resize)
- [ ] Admin notification and approval workflow
- [ ] Automatic display on Partners page after approval
- [ ] Confirmation and thank you email automation

**Technical Foundation**
- [ ] Responsive design (mobile-first, 60%+ mobile traffic expected)
- [ ] SEO foundation (meta tags, schema markup, sitemap)
- [ ] Page load < 3 seconds, Lighthouse score > 90
- [ ] WCAG 2.1 Level AA accessibility
- [ ] Contact form with spam protection (reCAPTCHA)

### Out of Scope

- E-commerce/online registration — external system handles this, just link to it
- Live streaming/video hosting — use YouTube/Vimeo embeds
- Mobile app — responsive web is sufficient
- Multi-language support — English only at launch
- Advanced analytics dashboard — Google Analytics is sufficient
- Player/parent portal with login — Phase 2
- Blog/news section — Phase 2
- Event calendar — Phase 2 (can embed Google Calendar as stopgap)
- Volunteer management — use external tools (SignUpGenius)
- Multi-tier sponsorship system — simple approval sufficient for launch

## Design Direction

**Reference:** anduril.com — dark, cinematic, tech-forward aesthetic

**Key Elements:**
- Full-screen video hero with minimal overlay text
- Three large program tiles below hero (Flag Football, Tackle Football, Academies & Clinics)
- Dark backgrounds with dramatic, high-contrast imagery
- Clean sans-serif typography, bold product/program names
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

**Content Status:**
- Most text, images, and video content is ready
- Registration links to external custom system (no API integration needed)

## Constraints

- **Budget**: Under $5,000 — must use free/freemium tiers aggressively
- **Timeline**: 1-2 months (ASAP) — aggressive, requires focused scope
- **Tech Stack**: Next.js 14+, TypeScript, Tailwind CSS, Supabase (database, auth, file storage)
- **Hosting**: Vercel (frontend), Supabase (backend)
- **AI API**: OpenAI GPT-4 or Anthropic Claude — budget ~$50-100/month, need caching
- **External Dependencies**: GiveButter (donations), external registration system (links only)
- **No Payment Processing**: All payments handled by GiveButter or external systems

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js + Supabase stack | SEO-friendly SSR, generous free tiers, easy AI integration | — Pending |
| Chat interface for AI CMS | Simpler than external tool, admin panel keeps everything in one place | — Pending |
| Manual sponsor approval | Prevents spam, admin clicks approval link vs fully automated | — Pending |
| Links to external registration | Specialized tools handle registration better, reduces scope | — Pending |
| GiveButter embed (not custom) | Handles PCI compliance, donor management, reduces risk | — Pending |

---
*Last updated: 2026-01-17 after adding design direction and third program*
