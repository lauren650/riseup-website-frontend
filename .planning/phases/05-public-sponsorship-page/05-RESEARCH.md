# Phase 5: Public Sponsorship Page - Research

**Researched:** 2026-01-20
**Domain:** Public-facing form submission with email notifications, pricing table UI
**Confidence:** HIGH

## Summary

Phase 5 creates a public "Become a Sponsor" page accessible from the Partners page. The page displays sponsorship tiers in a horizontal pricing table format and includes an interest form for prospective sponsors. Per user decisions in CONTEXT.md, the form does NOT include tier selection - it is a general "express interest" submission. Confirmation is shown via modal, and both the prospect and admin receive email notifications.

The implementation follows established patterns already present in the codebase: `react-hook-form` with `zod` for validation, `useActionState` for server actions, Resend for transactional emails, and Framer Motion for modal animations. The sponsorship packages table created in Phase 4 provides tier data, though it lacks a benefits column - this will need to be addressed.

**Primary recommendation:** Extend the existing `sponsorship_packages` schema to include benefits/description data, then build the page using established patterns from `contact-form.tsx`, `sponsor-form.tsx`, and `mobile-nav.tsx` (AnimatePresence modal pattern).

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-hook-form | ^7.71.1 | Form state management | Already used in contact-form.tsx, sponsor-form.tsx |
| zod | ^4.3.5 | Schema validation | Already used for all form validation in project |
| @hookform/resolvers | ^5.2.2 | Zod integration with RHF | Already installed and used |
| resend | ^6.4.2 | Transactional email | Already used in sponsors.ts, contact.ts actions |
| framer-motion | ^12.26.2 | Modal animations | Already used in mobile-nav.tsx, chat-drawer.tsx |
| next-recaptcha-v3 | ^1.5.3 | Bot protection | Already used in contact-form.tsx |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @supabase/supabase-js | ^2.78.0 | Database queries | Fetching sponsorship packages for display |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Framer Motion modal | Dialog from shadcn/radix | Not installed; Framer already in use for this pattern |
| Server component fetch | Client-side SWR | SSR is preferred for SEO; packages are public, cacheable |

**Installation:**
No new packages needed. All dependencies are already installed.

## Architecture Patterns

### Recommended Project Structure
```
src/
  app/(public)/
    become-a-sponsor/
      page.tsx              # Server component - fetches packages, renders page
  components/
    sponsors/
      pricing-table.tsx     # Horizontal tier comparison table
      interest-form.tsx     # Sponsor interest form component
      confirmation-modal.tsx # Success modal with AnimatePresence
  lib/
    actions/
      sponsor-interest.ts   # Server action for form submission
    validations/
      sponsor-interest.ts   # Zod schema for interest form
```

### Pattern 1: Server Component Data Fetching
**What:** Fetch sponsorship packages at the page level as a Server Component
**When to use:** Public pages with cacheable, SEO-relevant data
**Example:**
```typescript
// Source: Existing pattern in src/app/(public)/partners/page.tsx
import { createClient } from "@/lib/supabase/server";

export default async function BecomeASponsorPage() {
  const supabase = await createClient();
  const { data: packages } = await supabase
    .from("sponsorship_packages")
    .select("*")
    .order("cost", { ascending: true });

  return (
    <>
      <PricingTable packages={packages ?? []} />
      <InterestForm />
    </>
  );
}
```

### Pattern 2: Server Action with useActionState
**What:** Form submission via server action with React 19's useActionState hook
**When to use:** Any form that needs server-side processing with loading/success states
**Example:**
```typescript
// Source: Existing pattern in src/components/sections/contact-form.tsx
"use client";

import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const [state, formAction, isPending] = useActionState<
  FormState | null,
  FormData
>(async (prevState, formData) => {
  // reCAPTCHA and server action
  return result;
}, null);

return <form action={formAction}>...</form>;
```

### Pattern 3: AnimatePresence Modal
**What:** Animated modal with entry/exit transitions
**When to use:** Confirmation dialogs, success messages
**Example:**
```typescript
// Source: Existing pattern in src/components/layout/mobile-nav.tsx
import { AnimatePresence, motion } from "framer-motion";

<AnimatePresence mode="wait">
  {isOpen && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Modal content */}
    </motion.div>
  )}
</AnimatePresence>
```

### Pattern 4: Dual Email Notification
**What:** Send confirmation to user AND notification to admin
**When to use:** Form submissions that require admin follow-up
**Example:**
```typescript
// Source: Existing pattern in src/lib/actions/sponsors.ts
// Send confirmation to prospect
await resend.emails.send({
  from: "RiseUp Website <onboarding@resend.dev>",
  to: data.email,
  subject: "Sponsor Interest Received - RiseUp Youth Football",
  html: `...`
});

// Send notification to admin
await resend.emails.send({
  from: "RiseUp Website <onboarding@resend.dev>",
  to: adminEmail,
  subject: `New Sponsor Interest: ${data.companyName}`,
  html: `...`,
  replyTo: data.email
});
```

### Anti-Patterns to Avoid
- **Client-side tier fetching:** Don't use useEffect to fetch packages; Server Components provide better SEO and performance
- **Inline server actions:** Don't define server actions inside Client Components; import from separate files
- **Blocking on email failure:** Don't fail form submission if email send fails; log and continue

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form validation | Custom validation logic | zod + @hookform/resolvers | Edge cases, type safety, error messages |
| Form state management | useState for each field | react-hook-form | Re-render optimization, touched/dirty states |
| Bot protection | Custom honeypot | next-recaptcha-v3 | Already configured, Google's ML detection |
| Email sending | nodemailer setup | Resend SDK | Already configured with API key |
| Modal animations | CSS transitions | framer-motion AnimatePresence | Exit animations require AnimatePresence |
| Scroll to element | Manual window.scrollTo | Element.scrollIntoView({ behavior: 'smooth' }) | Native API, no library needed |

**Key insight:** Every pattern needed for this phase already exists in the codebase. The task is assembly, not invention.

## Common Pitfalls

### Pitfall 1: Schema Mismatch for Benefits Display
**What goes wrong:** The `sponsorship_packages` table (Phase 4) only has `name`, `cost`, `closing_date`, `total_slots`, `available_slots` - no benefits/description column for the pricing table
**Why it happens:** Phase 4 focused on invoice foundation; display needs were Phase 5 scope
**How to avoid:** Create a migration to add `description` (TEXT) and `benefits` (TEXT[] or JSONB) columns to `sponsorship_packages`
**Warning signs:** Trying to render benefits and finding no data source

### Pitfall 2: Form Submission Without Modal Reset
**What goes wrong:** Modal shows success but form still has old data, or modal persists on page navigation
**Why it happens:** State management between form and modal not coordinated
**How to avoid:**
  - Reset form via `reset()` from useForm when action succeeds
  - Close modal on backdrop click and escape key
  - Clear modal state on successful close
**Warning signs:** User submits twice, sees stale data

### Pitfall 3: Missing reCAPTCHA on New Form
**What goes wrong:** Bot submissions flood the interest form
**Why it happens:** Forgetting to add reCAPTCHA integration to new forms
**How to avoid:** Copy the pattern from contact-form.tsx including:
  - `useReCaptcha` hook
  - Token generation before submission
  - Server-side verification in action
**Warning signs:** Spam submissions, no recaptchaToken in form data

### Pitfall 4: Email "From" Address in Sandbox Mode
**What goes wrong:** Emails fail to send or go to spam
**Why it happens:** Resend sandbox only allows sending from `onboarding@resend.dev` until domain verified
**How to avoid:** Keep using `from: "RiseUp Website <onboarding@resend.dev>"` pattern until production domain is verified
**Warning signs:** Email send errors in logs

### Pitfall 5: Pricing Table Mobile Overflow
**What goes wrong:** Horizontal table scrolls awkwardly or content truncates on mobile
**Why it happens:** Desktop-first design without responsive testing
**How to avoid:**
  - Use responsive grid that stacks on mobile: `grid md:grid-cols-4` (tiers become cards)
  - Or accept horizontal scroll with proper scroll hints
  - Test at 375px width (iPhone SE)
**Warning signs:** Horizontal scrollbar on mobile, truncated benefit text

## Code Examples

Verified patterns from official sources and existing codebase:

### Interest Form Validation Schema
```typescript
// Based on existing pattern in src/lib/validations/sponsor.ts
import { z } from "zod";

export const sponsorInterestSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  recaptchaToken: z.string().optional(),
});

export type SponsorInterestFormData = z.infer<typeof sponsorInterestSchema>;
```

### Server Action Pattern
```typescript
// Based on existing pattern in src/lib/actions/sponsors.ts
"use server";

import { Resend } from "resend";
import { sponsorInterestSchema, SponsorInterestFormData } from "@/lib/validations/sponsor-interest";

export interface SponsorInterestFormState {
  success: boolean;
  message: string;
  errors?: {
    name?: string[];
    email?: string[];
    phone?: string[];
    companyName?: string[];
  };
}

export async function submitSponsorInterest(
  prevState: SponsorInterestFormState | null,
  formData: FormData
): Promise<SponsorInterestFormState> {
  // Parse and validate
  // Verify reCAPTCHA
  // Send emails (prospect confirmation + admin notification)
  // Return success/error state
}
```

### Smooth Scroll to Form
```typescript
// CTA button handler
const scrollToForm = () => {
  document.getElementById("interest-form")?.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
};
```

### Responsive Pricing Table Approach
```typescript
// Option A: Grid that stacks (recommended for 4 tiers)
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
  {packages.map((pkg) => (
    <div key={pkg.id} className="rounded-xl border border-white/10 bg-background p-8">
      <h3 className="text-2xl font-bold text-white">{pkg.name}</h3>
      <p className="mt-2 text-3xl font-bold text-accent">
        ${(pkg.cost / 100).toLocaleString()}
      </p>
      {/* Benefits list */}
    </div>
  ))}
</div>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| useFormState from react-dom | useActionState from react | React 19 | Hook renamed; same functionality |
| action={} on form calls immediately | useActionState wraps for state management | React 19 | Better loading/error state access |
| getFormData in RSC | Standard FormData in Server Actions | Next.js 14+ | Simpler API |

**Deprecated/outdated:**
- `experimental_useFormState`: Renamed to `useActionState` in React 19
- `'use server'` at top of component files: Server actions should be in separate files or marked inline

## Open Questions

Things that couldn't be fully resolved:

1. **Benefits storage format**
   - What we know: Phase 4 schema lacks benefits column; seed data has descriptive names
   - What's unclear: Should benefits be TEXT (single description) or TEXT[]/JSONB (bullet list)?
   - Recommendation: Use TEXT[] for benefits list - matches the pricing table design showing checkmarks per benefit. Add migration in Phase 5.

2. **Closing date handling for display**
   - What we know: Some packages have closing_date (deadline), others are NULL (year-round)
   - What's unclear: Should the public page show deadlines? Filter out expired?
   - Recommendation: Show "Available until [date]" for dated packages, "Year-round" for NULL. Filter out packages where closing_date < today.

3. **Interest form data storage**
   - What we know: CONTEXT.md specifies modal confirmation and emails, but not database storage
   - What's unclear: Should interests be stored in a database table for admin review?
   - Recommendation: Do NOT store in database - this keeps Phase 5 simple. Admin gets email notification. Phase 6 creates invoices manually. Can add storage later if needed.

## Sources

### Primary (HIGH confidence)
- Existing codebase patterns:
  - `src/components/sections/contact-form.tsx` - useActionState + RHF pattern
  - `src/components/sponsors/sponsor-form.tsx` - full form with validation
  - `src/lib/actions/sponsors.ts` - dual email pattern (prospect + admin)
  - `src/lib/actions/contact.ts` - reCAPTCHA verification
  - `src/components/layout/mobile-nav.tsx` - AnimatePresence modal pattern
  - `src/components/donations/donation-modal.tsx` - modal structure

- Phase context:
  - `.planning/phases/05-public-sponsorship-page/05-CONTEXT.md` - user decisions (locked)
  - `supabase/migrations/005_invoicing.sql` - existing schema
  - `src/lib/supabase/types.ts` - TypeScript types

### Secondary (MEDIUM confidence)
- [Resend Next.js documentation](https://resend.com/docs/send-with-nextjs) - email sending patterns
- [Next.js Forms Guide](https://nextjs.org/docs/app/guides/forms) - server action best practices

### Tertiary (LOW confidence)
- General web search results for pricing table patterns - validated against existing codebase styling

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed and used in codebase
- Architecture: HIGH - All patterns already implemented in similar features
- Pitfalls: MEDIUM - Schema gap identified; mobile responsiveness based on general web knowledge

**Research date:** 2026-01-20
**Valid until:** 2026-02-20 (stable domain, established patterns)
