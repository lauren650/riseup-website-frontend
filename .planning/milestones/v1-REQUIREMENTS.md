# Requirements Archive: v1 MVP

**Archived:** 2026-01-18
**Status:** SHIPPED

This is the archived requirements specification for v1.
For current requirements, see `.planning/PROJECT.md` (requirements move to Validated section).

---

# Requirements: RiseUp Youth Football League Website

**Defined:** 2026-01-17
**Core Value:** Non-technical administrators can update website content instantly using natural language commands

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### AI-Powered CMS

- [x] **AI-01**: Admin can access chat interface in protected admin panel
- [x] **AI-02**: Admin can update text content via natural language commands
- [x] **AI-03**: Admin can manage announcement bar (add/remove/edit text)
- [x] **AI-04**: Admin can toggle section visibility via commands
- [x] **AI-05**: System shows preview of changes before publishing
- [x] **AI-06**: Admin can rollback to previous content (last 10 changes)
- [x] **AI-07**: System logs all changes with timestamp and user

### Public Pages

- [x] **PAGE-01**: Homepage displays video hero with auto-play (muted, looping)
- [x] **PAGE-02**: Homepage shows overlay text with CTA buttons
- [x] **PAGE-03**: Video falls back to static image on slow connections/mobile
- [x] **PAGE-04**: Flag Football page displays program details (ages, schedule, costs)
- [x] **PAGE-05**: Tackle Football page displays program details (ages, schedule, costs)
- [x] **PAGE-12**: Academies & Clinics page displays program details (ages, schedule, costs)
- [x] **PAGE-06**: Program pages include coach bios with photos
- [x] **PAGE-07**: Program pages include safety protocols section
- [x] **PAGE-08**: About Us page displays mission, leadership, history
- [x] **PAGE-09**: Contact page displays contact info and inquiry form
- [x] **PAGE-10**: Partners page displays sponsor logos with click-through links
- [x] **PAGE-11**: Navigation works across all pages with mobile hamburger menu

### Donations

- [x] **DON-01**: Ways to Give page embeds GiveButter donation form
- [x] **DON-02**: Page displays impact statements showing fund usage

### Sponsor Portal

- [x] **SPON-01**: Sponsor can submit form with company info and logo
- [x] **SPON-02**: System validates logo upload (type, size, auto-resize)
- [x] **SPON-03**: Admin receives notification of new sponsor submission
- [x] **SPON-04**: Admin can approve sponsor via admin panel
- [x] **SPON-05**: Approved sponsor automatically displays on Partners page

### Technical

- [x] **TECH-01**: Site is responsive (mobile-first, touch-friendly)
- [x] **TECH-02**: Pages load in under 3 seconds
- [x] **TECH-03**: Contact form includes spam protection (reCAPTCHA)
- [x] **TECH-04**: Admin panel is password-protected

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### AI CMS Enhancements

- **AI-08**: System shows confidence score for ambiguous commands
- **AI-09**: Interface suggests common command templates
- **AI-10**: Admin can upload/replace images via AI commands

### Sponsor Portal Enhancements

- **SPON-06**: System sends confirmation email to sponsor on submission
- **SPON-07**: System sends thank you email after approval

### Technical Enhancements

- **TECH-05**: WCAG 2.1 Level AA accessibility compliance
- **TECH-06**: SEO meta tags and descriptions on all pages
- **TECH-07**: Schema markup for local organization
- **TECH-08**: XML sitemap generation

### Additional Features

- **BLOG-01**: Blog/news section for game recaps
- **CAL-01**: Event calendar integration
- **PORT-01**: Player/parent portal with login

## Out of Scope

| Feature | Reason |
|---------|--------|
| Online registration | External custom system handles this; just link to it |
| Live streaming | Use YouTube/Vimeo embeds; hosting is expensive |
| Mobile app | Responsive web is sufficient for budget |
| Multi-language | English only; primary audience is English-speaking |
| E-commerce/merchandise | Not core to mission; add later if needed |
| Multi-tier sponsorship | Simple approval sufficient for launch |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AI-01 | Phase 3 | Complete |
| AI-02 | Phase 3 | Complete |
| AI-03 | Phase 3 | Complete |
| AI-04 | Phase 3 | Complete |
| AI-05 | Phase 3 | Complete |
| AI-06 | Phase 3 | Complete |
| AI-07 | Phase 3 | Complete |
| PAGE-01 | Phase 1 | Complete |
| PAGE-02 | Phase 1 | Complete |
| PAGE-03 | Phase 1 | Complete |
| PAGE-04 | Phase 1 | Complete |
| PAGE-05 | Phase 1 | Complete |
| PAGE-06 | Phase 1 | Complete |
| PAGE-07 | Phase 1 | Complete |
| PAGE-08 | Phase 1 | Complete |
| PAGE-09 | Phase 1 | Complete |
| PAGE-10 | Phase 1 | Complete |
| PAGE-11 | Phase 1 | Complete |
| PAGE-12 | Phase 1 | Complete |
| DON-01 | Phase 2 | Complete |
| DON-02 | Phase 2 | Complete |
| SPON-01 | Phase 2 | Complete |
| SPON-02 | Phase 2 | Complete |
| SPON-03 | Phase 2 | Complete |
| SPON-04 | Phase 2 | Complete |
| SPON-05 | Phase 2 | Complete |
| TECH-01 | Phase 1 | Complete |
| TECH-02 | Phase 1 | Complete |
| TECH-03 | Phase 1 | Complete |
| TECH-04 | Phase 1 | Complete |

**Coverage:**
- v1 requirements: 30 total
- Mapped to phases: 30
- Shipped: 30
- Unmapped: 0

---

## Milestone Summary

**Shipped:** 30 of 30 v1 requirements
**Adjusted:** None - all requirements implemented as specified
**Dropped:** None

---
*Archived: 2026-01-18 as part of v1 milestone completion*
