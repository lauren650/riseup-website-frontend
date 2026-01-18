# Phase 2: Interactive Features - Research

**Researched:** 2026-01-17
**Domain:** Donation integration (GiveButter), Sponsor submission workflow, File uploads (Supabase Storage), Admin dashboard
**Confidence:** HIGH

## Summary

This phase implements two distinct features: embedding a GiveButter donation form on the Ways to Give page, and building a sponsor self-service submission portal with admin approval workflow. The existing codebase already has Supabase client/server utilities, Resend email integration, and Zod validation patterns that can be extended.

GiveButter provides widget embeds via a simple script tag and custom HTML element - this works well with Next.js Script component. The sponsor workflow requires Supabase Storage for logo uploads, database tables for sponsor data, RLS policies for access control, and email notifications via Resend (already configured).

**Primary recommendation:** Use client-side uploads directly to Supabase Storage (no server action file handling needed), process images with Sharp before upload, and leverage the existing Resend integration for both sponsor confirmation and admin notification emails.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/supabase-js | ^2.78.0 | Storage uploads, database operations | Already installed, official Supabase client |
| @supabase/ssr | ^0.8.0 | Server-side auth, middleware | Already installed, handles cookie-based auth |
| sharp | ^0.33.x | Image resizing before upload | Industry standard, 4-5x faster than alternatives, used by Next.js internally |
| resend | ^6.4.2 | Email notifications | Already installed and configured in contact form |
| zod | ^4.3.5 | Form validation including file validation | Already installed, supports instanceof(File) validation |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @react-email/components | ^0.0.x | Email templates | For styled notification emails (optional, can use plain HTML) |
| react-hook-form | ^7.71.1 | Form handling | Already installed, use for sponsor submission form |
| @hookform/resolvers | ^5.2.2 | Zod integration with react-hook-form | Already installed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Sharp | Browser-side canvas resize | Sharp handles more formats, better quality, server-side security |
| Supabase Storage | Cloudinary/S3 | Supabase already set up, simpler single-vendor approach |
| Direct Resend API | Supabase Edge Function | Edge Function adds complexity; server action with Resend is simpler for this use case |

**Installation:**
```bash
npm install sharp
```

Note: Most required packages are already installed. Only `sharp` needs to be added for server-side image processing.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── (public)/
│   │   ├── ways-to-give/page.tsx     # GiveButter embed here
│   │   └── partners/page.tsx          # Dynamic sponsor logos
│   └── (admin)/
│       ├── layout.tsx                  # Auth-protected layout
│       └── dashboard/
│           ├── page.tsx                # Overview
│           └── sponsors/
│               ├── page.tsx            # Sponsor list/approval
│               └── [id]/page.tsx       # Edit individual sponsor
├── components/
│   ├── donations/
│   │   └── givebutter-widget.tsx       # GiveButter embed component
│   └── sponsors/
│       ├── sponsor-form.tsx            # Submission form
│       ├── logo-upload.tsx             # Client-side upload component
│       └── sponsor-grid.tsx            # Partners page grid
├── lib/
│   ├── actions/
│   │   └── sponsors.ts                 # Server actions for sponsors
│   ├── validations/
│   │   └── sponsor.ts                  # Zod schemas
│   └── supabase/
│       └── middleware.ts               # Auth middleware (new)
└── middleware.ts                        # Route protection
```

### Pattern 1: GiveButter Widget Integration
**What:** Embed third-party donation widget using Next.js Script component
**When to use:** For GiveButter or any external widget requiring script injection
**Example:**
```typescript
// Source: https://help.givebutter.com/en/articles/6464859
// src/components/donations/givebutter-widget.tsx
"use client";

import Script from "next/script";

interface GivebutterWidgetProps {
  widgetId: string;
  align?: "left" | "center" | "right";
}

export function GivebutterWidget({ widgetId, align = "center" }: GivebutterWidgetProps) {
  return (
    <>
      {/* GiveButter library script - load once */}
      <Script
        src="https://widgets.givebutter.com/latest.umd.cjs"
        strategy="afterInteractive"
      />

      {/* Widget element - height auto-adjusts during checkout */}
      <div style={{ minHeight: "500px" }}>
        <givebutter-widget id={widgetId} align={align}></givebutter-widget>
      </div>
    </>
  );
}

// TypeScript: Declare the custom element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "givebutter-widget": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          id: string;
          align?: string;
          account?: string;
        },
        HTMLElement
      >;
    }
  }
}
```

### Pattern 2: Client-Side File Upload to Supabase Storage
**What:** Upload files directly from browser to Supabase Storage
**When to use:** For file uploads under 50MB where user is authenticated or anonymous upload is allowed
**Example:**
```typescript
// Source: https://supalaunch.com/blog/file-upload-nextjs-supabase
// src/components/sponsors/logo-upload.tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];

export function LogoUpload({ onUploadComplete }: { onUploadComplete: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Client-side validation
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Please upload a PNG, JPG, SVG, or WebP image");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("File must be under 5MB");
      return;
    }

    setUploading(true);
    setError(null);

    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const { data, error: uploadError } = await supabase.storage
      .from("sponsor-logos")
      .upload(`pending/${fileName}`, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      setError(uploadError.message);
    } else {
      const { data: { publicUrl } } = supabase.storage
        .from("sponsor-logos")
        .getPublicUrl(data.path);
      onUploadComplete(publicUrl);
    }
    setUploading(false);
  };

  return (
    <div>
      <input
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        onChange={handleUpload}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
```

### Pattern 3: Server Action with Image Processing
**What:** Process uploaded image with Sharp before storing
**When to use:** When you need to resize/optimize images server-side
**Example:**
```typescript
// Source: https://sharp.pixelplumbing.com/api-resize/
// src/lib/actions/sponsors.ts
"use server";

import sharp from "sharp";
import { createClient } from "@/lib/supabase/server";

export async function processAndUploadLogo(formData: FormData) {
  const file = formData.get("logo") as File;
  if (!file) throw new Error("No file provided");

  const buffer = Buffer.from(await file.arrayBuffer());

  // Resize to max 400x400, maintain aspect ratio
  const processed = await sharp(buffer)
    .resize(400, 400, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 85 })
    .toBuffer();

  const supabase = await createClient();
  const fileName = `${Date.now()}.webp`;

  const { data, error } = await supabase.storage
    .from("sponsor-logos")
    .upload(`processed/${fileName}`, processed, {
      contentType: "image/webp",
      cacheControl: "31536000", // 1 year
    });

  if (error) throw error;
  return data.path;
}
```

### Pattern 4: Admin Route Protection with Middleware
**What:** Protect admin routes using Supabase auth middleware
**When to use:** For any authenticated-only sections
**Example:**
```typescript
// Source: https://supabase.com/docs/guides/auth/server-side/nextjs
// src/middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Use getUser(), not getSession()
  const { data: { user } } = await supabase.auth.getUser();

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith("/admin") && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

### Anti-Patterns to Avoid
- **Server action file uploads over 1MB:** Next.js server actions have a 1MB body limit by default. Use client-side uploads to Supabase Storage instead.
- **Using getSession() in middleware:** Always use getUser() for security - getSession() doesn't validate the JWT.
- **Fixed-height GiveButter containers:** The widget height changes during checkout. Use min-height with auto-grow.
- **Storing files in /public:** Use cloud storage (Supabase Storage) for user uploads, not filesystem.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image resizing | Canvas-based JS resize | Sharp | Handles more formats, better quality, faster, proper EXIF handling |
| File type validation | Manual mime-type checking | Zod with instanceof(File) + refine | Consistent with existing validation pattern |
| Email sending | SMTP client setup | Resend (already configured) | Already working in contact form |
| Auth middleware | Custom JWT parsing | @supabase/ssr createServerClient | Handles cookie refresh, session validation |
| Form state management | useState for every field | react-hook-form (already installed) | Already used in contact form, handles validation |

**Key insight:** The codebase already has patterns for forms (contact-form.tsx), validation (contact.ts), and email (contact.ts server action). Extend these patterns rather than creating new ones.

## Common Pitfalls

### Pitfall 1: GiveButter Widget Not Rendering
**What goes wrong:** Widget shows blank space or doesn't initialize after client-side navigation
**Why it happens:** Script loads but custom element isn't recognized by React hydration
**How to avoid:** Use "use client" directive, Script component with afterInteractive strategy, and declare the custom element type in TypeScript
**Warning signs:** Widget works on hard refresh but not on navigation

### Pitfall 2: Supabase Storage RLS Blocking Uploads
**What goes wrong:** "new row violates row-level security policy" error
**Why it happens:** RLS is enabled but no INSERT policy exists for the bucket
**How to avoid:** Create explicit RLS policies BEFORE attempting uploads:
```sql
-- Allow anyone to upload to pending folder (sponsor submissions)
CREATE POLICY "Anyone can upload pending logos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'sponsor-logos' AND (storage.foldername(name))[1] = 'pending');

-- Only admins can upload to approved folder
CREATE POLICY "Admins can upload approved logos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'sponsor-logos' AND (storage.foldername(name))[1] = 'approved' AND auth.role() = 'authenticated');
```
**Warning signs:** Upload works in dashboard but fails from app

### Pitfall 3: Server Action File Size Limit
**What goes wrong:** Large file uploads fail silently or with cryptic errors
**Why it happens:** Next.js server actions have 1MB default body limit
**How to avoid:** Upload directly to Supabase Storage from client, or use signed upload URLs for larger files
**Warning signs:** Small files work, larger files fail

### Pitfall 4: Sharp Not Working in Edge Runtime
**What goes wrong:** "Module not found" or binary errors
**Why it happens:** Sharp uses native binaries incompatible with Edge Runtime
**How to avoid:** Use Sharp only in Node.js runtime (server actions, API routes with `export const runtime = "nodejs"`)
**Warning signs:** Works in development, fails in Vercel Edge

### Pitfall 5: Email Notifications Not Sending
**What goes wrong:** Form submits successfully but no email arrives
**Why it happens:** Resend requires verified domain for production, or RESEND_API_KEY not set
**How to avoid:** Verify domain in Resend dashboard, ensure env vars are set in production
**Warning signs:** Works locally with console warning, fails silently in production

## Code Examples

Verified patterns from official sources:

### Zod Schema for File Validation
```typescript
// Source: https://www.codu.co/niall/validate-an-image-file-with-zod-jjhied8p
// src/lib/validations/sponsor.ts
import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];

export const sponsorSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  contactName: z.string().min(2, "Contact name required"),
  contactEmail: z.string().email("Valid email required"),
  contactPhone: z.string().min(10, "Valid phone number required"),
  websiteUrl: z.string().url("Valid website URL required"),
  description: z.string().max(500, "Description must be under 500 characters").optional(),
  logo: z
    .instanceof(File, { message: "Please upload a logo" })
    .refine((file) => file.size <= MAX_FILE_SIZE, "Logo must be under 5MB")
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only PNG, JPG, SVG, and WebP formats are supported"
    ),
});

export type SponsorFormData = z.infer<typeof sponsorSchema>;
```

### Server Action for Sponsor Submission
```typescript
// src/lib/actions/sponsors.ts
"use server";

import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { sponsorSchema } from "@/lib/validations/sponsor";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function submitSponsor(formData: FormData) {
  // Validate
  const rawData = {
    companyName: formData.get("companyName"),
    contactName: formData.get("contactName"),
    contactEmail: formData.get("contactEmail"),
    contactPhone: formData.get("contactPhone"),
    websiteUrl: formData.get("websiteUrl"),
    description: formData.get("description"),
    logo: formData.get("logo"),
  };

  const result = sponsorSchema.safeParse(rawData);
  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  const supabase = await createClient();

  // Insert sponsor record (logo URL already uploaded by client)
  const logoUrl = formData.get("logoUrl") as string;

  const { data: sponsor, error } = await supabase
    .from("sponsors")
    .insert({
      company_name: result.data.companyName,
      contact_name: result.data.contactName,
      contact_email: result.data.contactEmail,
      contact_phone: result.data.contactPhone,
      website_url: result.data.websiteUrl,
      description: result.data.description,
      logo_url: logoUrl,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    return { success: false, message: "Failed to submit. Please try again." };
  }

  // Send confirmation to sponsor
  await resend.emails.send({
    from: "RiseUp <noreply@riseupyouthfootball.com>",
    to: result.data.contactEmail,
    subject: "Sponsor Submission Received - RiseUp Youth Football",
    html: `
      <h2>Thank you for your sponsorship submission!</h2>
      <p>Hi ${result.data.contactName},</p>
      <p>We've received your submission for ${result.data.companyName}.
         Our team will review your submission and you'll see your logo
         on our Partners page shortly.</p>
    `,
  });

  // Send notification to admin
  await resend.emails.send({
    from: "RiseUp Website <noreply@riseupyouthfootball.com>",
    to: process.env.ADMIN_EMAIL!,
    subject: `New Sponsor Submission: ${result.data.companyName}`,
    html: `
      <h2>New Sponsor Submission</h2>
      <p><strong>Company:</strong> ${result.data.companyName}</p>
      <p><strong>Contact:</strong> ${result.data.contactName}</p>
      <p><strong>Email:</strong> ${result.data.contactEmail}</p>
      <p><strong>Phone:</strong> ${result.data.contactPhone}</p>
      <p><strong>Website:</strong> ${result.data.websiteUrl}</p>
      <p><a href="${process.env.NEXT_PUBLIC_URL}/admin/sponsors/${sponsor.id}">
        Review in Dashboard
      </a></p>
    `,
  });

  return { success: true, message: "Submission received! Check your email for confirmation." };
}
```

### Supabase Database Schema
```sql
-- Source: Based on CONTEXT.md requirements
-- Run in Supabase SQL Editor

-- Sponsors table
CREATE TABLE sponsors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  website_url TEXT NOT NULL,
  description TEXT,
  logo_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id)
);

-- RLS Policies
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (sponsor submission)
CREATE POLICY "Anyone can submit sponsor"
ON sponsors FOR INSERT
WITH CHECK (status = 'pending');

-- Anyone can view approved sponsors
CREATE POLICY "Anyone can view approved sponsors"
ON sponsors FOR SELECT
USING (status = 'approved');

-- Only authenticated users (admins) can view all and update
CREATE POLICY "Admins can view all sponsors"
ON sponsors FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can update sponsors"
ON sponsors FOR UPDATE
TO authenticated
USING (true);

-- Index for performance
CREATE INDEX idx_sponsors_status ON sponsors(status);
CREATE INDEX idx_sponsors_company_name ON sponsors(company_name);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| dangerouslySetInnerHTML for scripts | Next.js Script component | Next.js 11+ | Better loading strategies, cleaner code |
| Server-side file handling | Client-side upload to storage | 2023+ | Bypasses server action size limits |
| getSession() for auth | getUser() for auth | Supabase 2024 | JWT validation on server, security fix |
| Multer + Express for uploads | Supabase Storage direct | 2023+ | No file server needed, built-in CDN |

**Deprecated/outdated:**
- @supabase/auth-helpers-nextjs: Replaced by @supabase/ssr (already using correct one)
- Supabase gotrue-js direct usage: Use @supabase/supabase-js client instead

## Open Questions

Things that couldn't be fully resolved:

1. **GiveButter Widget ID Source**
   - What we know: Widget requires an ID from GiveButter dashboard
   - What's unclear: Whether client has GiveButter account set up
   - Recommendation: Placeholder ID in code, document where admin gets real ID

2. **Admin Authentication Method**
   - What we know: Supabase Auth works with middleware
   - What's unclear: How admins will be created (self-signup? manual?)
   - Recommendation: Start with manual user creation in Supabase dashboard, can add self-signup later

3. **Logo Uniform Sizing**
   - What we know: CONTEXT.md says "uniform size (cropped/padded to fit grid)"
   - What's unclear: Exact dimensions for the grid
   - Recommendation: Use CSS object-fit: contain within fixed-size container (e.g., 200x120px for 5:3 aspect ratio)

## Sources

### Primary (HIGH confidence)
- Supabase Docs - Storage Access Control: https://supabase.com/docs/guides/storage/security/access-control
- Supabase Docs - Server-Side Auth for Next.js: https://supabase.com/docs/guides/auth/server-side/nextjs
- GiveButter Help Center - Widgets: https://help.givebutter.com/en/articles/6464859-how-to-use-givebutter-widgets-on-your-website
- Sharp Documentation - Resize API: https://sharp.pixelplumbing.com/api-resize/

### Secondary (MEDIUM confidence)
- SupaLaunch Guide - File Upload with Next.js and Supabase: https://supalaunch.com/blog/file-upload-nextjs-supabase
- SupaLaunch Guide - Middleware Auth: https://supalaunch.com/blog/nextjs-middleware-supabase-auth
- Codu - Zod File Validation: https://www.codu.co/niall/validate-an-image-file-with-zod-jjhied8p

### Tertiary (LOW confidence)
- Various blog posts on Sharp + Next.js integration patterns
- Community discussions on GiveButter React integration

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All packages already in use or well-documented
- Architecture: HIGH - Patterns match existing codebase conventions
- GiveButter integration: MEDIUM - Official docs clear, but no React-specific examples
- Pitfalls: HIGH - Based on official documentation warnings

**Research date:** 2026-01-17
**Valid until:** 2026-02-17 (30 days - stable technologies)
