# Phase 1: Foundation & Public Pages - Research

**Researched:** 2026-01-17
**Domain:** Next.js 14+ public website with dark theme, video hero, Supabase CMS backend
**Confidence:** HIGH

## Summary

Phase 1 requires building a modern, responsive Next.js website with a dark, cinematic aesthetic inspired by anduril.com. The research confirms that Next.js 14/15 App Router with TypeScript, Tailwind CSS, and Supabase provides a robust stack for this use case. Key technical challenges include: implementing autoplay video hero with mobile fallback, establishing a dark-first design system, structuring Supabase for future AI-CMS integration, and ensuring sub-3-second load times.

The standard approach uses the App Router's file-based routing with route groups for organization, the `dark:` variant in Tailwind with class-based toggling, self-hosted video with poster fallback for hero sections, and Server Actions with reCAPTCHA v3 for the contact form. Supabase should use a hybrid schema with relational tables for structured content and JSONB columns for flexible section content to support the Phase 3 AI CMS.

**Primary recommendation:** Use Next.js 15 App Router with a dark-first Tailwind theme, self-hosted video (or Vercel Blob) with poster image fallback, and a Supabase schema designed for CMS-managed content from day one.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15.x | React framework with App Router | Official Vercel stack, SSR/SSG, file-based routing |
| TypeScript | 5.x | Type safety | Catches errors at build time, better IDE support |
| Tailwind CSS | 4.x | Utility-first styling | Rapid development, built-in dark mode, small bundle |
| Supabase | Latest | Database, auth, storage | PostgreSQL, generous free tier, Row Level Security |
| Vercel | - | Hosting | Optimized for Next.js, global CDN, automatic deploys |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Framer Motion | 12.x | Animations | Navigation transitions, scroll effects, hover states |
| React Hook Form | 7.x | Form state management | Contact form, any user input |
| Zod | 3.x | Schema validation | Client + server validation, type inference |
| @hookform/resolvers | 3.x | Zod + RHF bridge | Connecting Zod schemas to React Hook Form |
| Resend | 3.x | Email delivery | Contact form notifications (free tier: 100/day) |
| next-recaptcha-v3 | 1.x | Spam protection | Contact form reCAPTCHA integration |
| clsx | 2.x | Conditional classes | Cleaner Tailwind class composition |
| tailwind-merge | 2.x | Class conflict resolution | Merging Tailwind classes safely |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Framer Motion | CSS animations | Less code but harder for complex sequences |
| Resend | Nodemailer | More control but requires SMTP setup |
| next-recaptcha-v3 | Manual implementation | Library handles script loading, reduces boilerplate |
| Vercel Blob (video) | Supabase Storage | Vercel Blob has better CDN integration for Vercel hosting |

**Installation:**
```bash
# Core (if not using create-next-app)
npm install next@latest react@latest react-dom@latest typescript @types/node @types/react @types/react-dom

# Styling & Animation
npm install tailwindcss@latest framer-motion clsx tailwind-merge

# Forms & Validation
npm install react-hook-form zod @hookform/resolvers

# Backend & Email
npm install @supabase/supabase-js @supabase/ssr resend

# Spam Protection
npm install next-recaptcha-v3
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/                         # App Router (routes only)
│   ├── (public)/                # Route group for public pages
│   │   ├── layout.tsx           # Public layout (nav, footer)
│   │   ├── page.tsx             # Homepage
│   │   ├── flag-football/
│   │   │   └── page.tsx
│   │   ├── tackle-football/
│   │   │   └── page.tsx
│   │   ├── academies-clinics/
│   │   │   └── page.tsx
│   │   ├── about/
│   │   │   └── page.tsx
│   │   ├── contact/
│   │   │   └── page.tsx
│   │   ├── partners/
│   │   │   └── page.tsx
│   │   └── ways-to-give/
│   │       └── page.tsx
│   ├── api/                     # API routes (if needed beyond Server Actions)
│   │   └── contact/
│   │       └── route.ts
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Global styles + Tailwind imports
│   └── not-found.tsx            # 404 page
├── components/
│   ├── ui/                      # Reusable UI primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── video-hero.tsx
│   ├── layout/                  # Layout components
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   ├── mobile-nav.tsx
│   │   └── nav-link.tsx
│   └── sections/                # Page section components
│       ├── hero-section.tsx
│       ├── program-tiles.tsx
│       ├── coach-bio.tsx
│       └── contact-form.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts            # Browser client
│   │   ├── server.ts            # Server client
│   │   └── types.ts             # Generated types
│   ├── actions/                 # Server Actions
│   │   └── contact.ts
│   └── utils.ts                 # cn() and other utilities
├── hooks/                       # Custom React hooks
│   └── use-media-query.ts
├── types/                       # TypeScript types
│   └── index.ts
└── styles/                      # Additional style files (if needed)
    └── fonts.ts                 # Font configuration
```

### Pattern 1: Dark-First Tailwind Theme
**What:** Configure Tailwind for dark theme as the default, with light mode available
**When to use:** Sites like anduril.com that are dark by default
**Example:**
```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Anduril-inspired palette
        background: '#000000',
        foreground: '#ffffff',
        muted: '#f1f0ea',
        accent: '#dff140',        // Lime green accent
        'muted-foreground': 'rgba(255, 255, 255, 0.6)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
```

```css
/* globals.css */
@import "tailwindcss";

/* Dark theme as default - no class needed */
:root {
  --background: 0 0% 0%;
  --foreground: 0 0% 100%;
  --muted: 45 25% 93%;
  --accent: 68 100% 63%;
}

body {
  @apply bg-background text-foreground;
  font-feature-settings: "rlig" 1, "calt" 1;
}
```

### Pattern 2: Video Hero with Poster Fallback
**What:** Autoplay video on capable devices, static image on mobile/slow connections
**When to use:** Hero sections needing high visual impact without sacrificing performance
**Example:**
```typescript
// components/ui/video-hero.tsx
'use client'

import { useState, useRef, useEffect } from 'react'

interface VideoHeroProps {
  videoSrc: string
  posterSrc: string
  children: React.ReactNode
}

export function VideoHero({ videoSrc, posterSrc, children }: VideoHeroProps) {
  const [canPlayVideo, setCanPlayVideo] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // Check if device is mobile or has slow connection
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    const connection = (navigator as any).connection
    const isSlowConnection = connection?.effectiveType === '2g' ||
                            connection?.effectiveType === 'slow-2g' ||
                            connection?.saveData === true

    if (!isMobile && !isSlowConnection) {
      setCanPlayVideo(true)
    }
  }, [])

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Poster Image (always rendered, video overlays when ready) */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${posterSrc})` }}
      />

      {/* Video (only on desktop with good connection) */}
      {canPlayVideo && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onLoadedData={() => setIsLoaded(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center">
        {children}
      </div>
    </section>
  )
}
```

### Pattern 3: Server Actions with Form Validation
**What:** Handle form submission server-side with Zod validation and email sending
**When to use:** Contact forms, any server mutations
**Example:**
```typescript
// lib/actions/contact.ts
'use server'

import { z } from 'zod'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  recaptchaToken: z.string(),
})

type ContactFormState = {
  success: boolean
  message: string
  errors?: Record<string, string[]>
}

export async function submitContactForm(
  prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  // Validate form data
  const validatedFields = contactSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    message: formData.get('message'),
    recaptchaToken: formData.get('recaptchaToken'),
  })

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Validation failed',
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  // Verify reCAPTCHA
  const recaptchaResponse = await fetch(
    'https://www.google.com/recaptcha/api/siteverify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${validatedFields.data.recaptchaToken}`,
    }
  )
  const recaptchaResult = await recaptchaResponse.json()

  if (!recaptchaResult.success || recaptchaResult.score < 0.5) {
    return {
      success: false,
      message: 'reCAPTCHA verification failed. Please try again.',
    }
  }

  // Send email
  try {
    await resend.emails.send({
      from: 'RiseUp Website <noreply@yourdomain.com>',
      to: [process.env.CONTACT_EMAIL!],
      subject: `New Contact Form Submission from ${validatedFields.data.name}`,
      text: `
Name: ${validatedFields.data.name}
Email: ${validatedFields.data.email}
Phone: ${validatedFields.data.phone || 'Not provided'}

Message:
${validatedFields.data.message}
      `,
    })

    return {
      success: true,
      message: 'Thank you! We\'ll be in touch soon.',
    }
  } catch (error) {
    console.error('Failed to send email:', error)
    return {
      success: false,
      message: 'Failed to send message. Please try again later.',
    }
  }
}
```

### Pattern 4: Responsive Navigation with Framer Motion
**What:** Desktop nav with centered links, mobile hamburger with animated overlay
**When to use:** All sites needing responsive navigation
**Example:**
```typescript
// components/layout/header.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'

const navLinks = [
  { href: '/flag-football', label: 'Flag Football' },
  { href: '/tackle-football', label: 'Tackle Football' },
  { href: '/academies-clinics', label: 'Academies & Clinics' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="fixed top-0 z-50 w-full">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-white">
          RiseUp
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm text-white/60 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <Link
          href="/ways-to-give"
          className="hidden rounded-full bg-accent px-6 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90 md:block"
        >
          Donate
        </Link>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative z-50 h-10 w-10 md:hidden"
          aria-label="Toggle menu"
        >
          <span className={`hamburger-line ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
          <span className={`hamburger-line ${isOpen ? 'opacity-0' : ''}`} />
          <span className={`hamburger-line ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black"
          >
            <motion.ul
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ delay: 0.1 }}
              className="flex h-full flex-col items-center justify-center gap-8"
            >
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-3xl font-medium text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
```

### Anti-Patterns to Avoid
- **Mixing page logic with components:** Keep `page.tsx` files thin, delegate to components
- **Giant utils.ts files:** Break utilities into logical groups (`lib/utils/cn.ts`, `lib/utils/format.ts`)
- **Putting everything in app/:** Use `components/`, `lib/`, `hooks/` outside app directory
- **Forgetting 'use client':** Framer Motion, React Hook Form require client components
- **Autoplay without muted:** Video won't autoplay in browsers without `muted` attribute

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form validation | Custom regex checks | Zod schemas | Type inference, reusable, client+server |
| Form state | useState for every field | React Hook Form | Performance, validation integration |
| Class merging | Template literals | clsx + tailwind-merge | Handles conflicts, cleaner syntax |
| Spam protection | Honeypot fields alone | reCAPTCHA v3 | Score-based, invisible, proven |
| Email sending | Raw SMTP | Resend | Free tier, React templates, reliability |
| Animation | CSS @keyframes | Framer Motion | Gesture support, exit animations, layout |
| Image optimization | Manual resizing | next/image | Automatic WebP, srcset, lazy loading |

**Key insight:** Every hand-rolled solution creates maintenance burden. Use battle-tested libraries that handle edge cases you haven't thought of yet.

## Common Pitfalls

### Pitfall 1: Video Not Autoplaying on iOS
**What goes wrong:** Video works on desktop but shows poster on iOS
**Why it happens:** iOS requires `playsInline` attribute for inline video playback
**How to avoid:** Always include all three: `autoPlay muted playsInline`
**Warning signs:** QA reports video works on Android but not iPhone

### Pitfall 2: Flash of Unstyled Content (FOUC) with Dark Theme
**What goes wrong:** Brief white flash before dark theme loads
**Why it happens:** CSS loads after HTML renders
**How to avoid:** Add inline script in `<head>` to set dark class before paint
**Warning signs:** White flash on page load/refresh

```typescript
// app/layout.tsx - Add script to prevent FOUC
<head>
  <script dangerouslySetInnerHTML={{
    __html: `
      document.documentElement.classList.add('dark');
    `
  }} />
</head>
```

### Pitfall 3: Framer Motion in Server Components
**What goes wrong:** Build error or hydration mismatch
**Why it happens:** Framer Motion requires client-side JavaScript
**How to avoid:** Always add `'use client'` to components using Framer Motion
**Warning signs:** "Cannot read property 'motion'" or hydration errors

### Pitfall 4: Large Video Files Blocking Page Load
**What goes wrong:** Page takes 10+ seconds to become interactive
**Why it happens:** Video preload blocks rendering
**How to avoid:** Use `preload="metadata"` or `preload="none"`, rely on poster
**Warning signs:** Lighthouse reports high Time to Interactive

### Pitfall 5: reCAPTCHA Token Expiration
**What goes wrong:** Form submission fails with "invalid token"
**Why it happens:** reCAPTCHA tokens expire after 2 minutes
**How to avoid:** Generate token on form submit, not on page load
**Warning signs:** Forms fail after user takes time filling them out

### Pitfall 6: Supabase Client in Server Components
**What goes wrong:** Data not fetching or auth issues
**Why it happens:** Using browser client in server context
**How to avoid:** Use `@supabase/ssr` with separate server/client clients
**Warning signs:** "localStorage is not defined" errors

## Code Examples

Verified patterns from official sources:

### Supabase Server Client Setup
```typescript
// lib/supabase/server.ts
// Source: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from Server Component - ignore
          }
        },
      },
    }
  )
}
```

### Next.js Image with Responsive Sizing
```typescript
// Source: https://nextjs.org/docs/app/api-reference/components/image
import Image from 'next/image'

export function CoachBio({ name, role, imageSrc, bio }: CoachBioProps) {
  return (
    <div className="flex flex-col items-center gap-4 md:flex-row md:items-start">
      <Image
        src={imageSrc}
        alt={`${name}, ${role}`}
        width={200}
        height={200}
        sizes="(max-width: 768px) 100vw, 200px"
        className="rounded-full object-cover"
        priority={false}
      />
      <div>
        <h3 className="text-xl font-bold text-white">{name}</h3>
        <p className="text-sm text-accent">{role}</p>
        <p className="mt-2 text-white/60">{bio}</p>
      </div>
    </div>
  )
}
```

### Tailwind cn() Utility
```typescript
// lib/utils.ts
// Standard pattern for Tailwind class merging
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Usage:
// cn('px-4 py-2', isActive && 'bg-accent', className)
```

## Supabase Schema for CMS-Ready Content

Design the schema now to support Phase 3 AI CMS:

```sql
-- Pages table (stores page-level metadata)
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  meta_description TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Content sections table (flexible content blocks)
CREATE TABLE content_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL, -- 'hero', 'text_block', 'program_info', 'coach_grid', etc.
  content JSONB NOT NULL,     -- Flexible content structure per section type
  position INTEGER NOT NULL,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Site settings (global content like nav, footer, announcements)
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Contact submissions
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  is_read BOOLEAN DEFAULT false
);

-- Coaches (structured for program pages)
CREATE TABLE coaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  programs TEXT[], -- ['flag', 'tackle', 'academies']
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- Partners/Sponsors (for Phase 2, but create now)
CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  website_url TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

-- Public read policies (Phase 1 - no auth needed for public content)
CREATE POLICY "Public can read published pages"
  ON pages FOR SELECT
  USING (is_published = true);

CREATE POLICY "Public can read visible sections"
  ON content_sections FOR SELECT
  USING (is_visible = true);

CREATE POLICY "Public can read site settings"
  ON site_settings FOR SELECT
  TO anon USING (true);

CREATE POLICY "Public can read active coaches"
  ON coaches FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can read approved partners"
  ON partners FOR SELECT
  USING (is_approved = true);

-- Public insert for contact form
CREATE POLICY "Public can submit contact form"
  ON contact_submissions FOR INSERT
  TO anon WITH CHECK (true);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages Router | App Router | Next.js 13 (2023) | New file conventions, Server Components default |
| getServerSideProps | Server Components + Server Actions | Next.js 14 (2024) | Simpler data fetching, less boilerplate |
| API routes for forms | Server Actions | Next.js 14 (2024) | Direct function calls, no API layer needed |
| framer-motion import | motion/react import | Framer Motion 12 (2024) | Required for React 19/Next.js 15 compatibility |
| darkMode: 'media' | darkMode: 'class' with @custom-variant | Tailwind v4 (2024) | More control, better SSR support |
| createClient() | createServerClient() / createBrowserClient() | Supabase SSR | Proper cookie handling for Next.js |

**Deprecated/outdated:**
- `getStaticProps`, `getServerSideProps` - Use Server Components instead
- `pages/` directory - Use `app/` with App Router
- `import { motion } from 'framer-motion'` - Use `from 'motion/react'` for Next.js 15
- Supabase `createClient` from `@supabase/supabase-js` in server contexts - Use `@supabase/ssr`

## Open Questions

Things that couldn't be fully resolved:

1. **Video hosting decision: Vercel Blob vs. Supabase Storage**
   - What we know: Vercel Blob has better CDN for Vercel hosting; Supabase Storage is included in existing stack
   - What's unclear: Actual performance difference for 15-30 second hero videos
   - Recommendation: Start with Supabase Storage (simpler), migrate to Vercel Blob if performance issues arise

2. **Font selection for Anduril-like aesthetic**
   - What we know: Anduril uses HelveticaNowDisplay (licensed) and Elios
   - What's unclear: Budget for font licensing
   - Recommendation: Use Inter (free, similar geometric sans-serif) via next/font, consider upgrading later

3. **Exact color palette**
   - What we know: Anduril uses #000, #fff, #f1f0ea, #dff140
   - What's unclear: Client preference for exact palette
   - Recommendation: Use Anduril palette as starting point, adjust based on brand guidelines

## Sources

### Primary (HIGH confidence)
- [Next.js Official Docs - Project Structure](https://nextjs.org/docs/app/getting-started/project-structure) - File conventions, routing
- [Next.js Official Docs - Videos Guide](https://nextjs.org/docs/app/guides/videos) - Video implementation patterns
- [Tailwind CSS Official Docs - Dark Mode](https://tailwindcss.com/docs/dark-mode) - Dark theme configuration
- [Supabase Official Docs - Next.js Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs) - Setup, client creation
- [Resend Official Docs - Next.js](https://resend.com/docs/send-with-nextjs) - Email integration

### Secondary (MEDIUM confidence)
- [Anduril.com](https://www.anduril.com) - Design analysis via WebFetch
- [Medium - React Hook Form + Zod + Server Actions](https://medium.com/@techwithtwin/handling-forms-in-next-js-with-react-hook-form-zod-and-server-actions) - Form patterns
- [Build with Matija - reCAPTCHA v3 + Next.js 15](https://www.buildwithmatija.com/blog/recaptcha-v3-nextjs-guide) - reCAPTCHA implementation
- [Motion.dev](https://motion.dev/docs/react) - Framer Motion React docs

### Tertiary (LOW confidence)
- Various Medium/DEV.to articles for community patterns - verify before implementing

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official docs confirm all choices
- Architecture: HIGH - Next.js official docs + community consensus
- Dark theme: HIGH - Tailwind official docs + anduril.com analysis
- Video hero: MEDIUM - Patterns confirmed but mobile detection heuristics vary
- Supabase schema: MEDIUM - Based on CMS patterns, not project-specific validation
- Pitfalls: HIGH - Well-documented issues with known solutions

**Research date:** 2026-01-17
**Valid until:** 2026-02-17 (30 days - stable stack, slow-moving ecosystem)
