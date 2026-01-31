# RiseUp Youth Football League Website

Modern website for RiseUp Youth Football League featuring an AI-powered CMS that enables non-technical staff to update content using natural language commands.

**Tech Stack:** Next.js 16, React 19, Supabase, Anthropic Claude, Stripe, Google Drive/Sheets

---

## Features

- 🏈 **Public Website**: Responsive pages for programs, about, contact, partners, donations
- 🤖 **AI-Powered CMS**: Update content via natural language chat (powered by Claude)
- ✏️ **Inline Editing**: Click-to-edit text and images with instant preview
- 💰 **Sponsor Management**: Invoice creation, automated upload workflow, partner display
- 💳 **Donations**: Integrated GiveButter widget
- 📊 **Marketing Dashboard**: Package tracking, invoice management, upload status
- 🔄 **Version Control**: Preview changes, rollback to previous versions
- ☁️ **Google Integration**: Drive storage for sponsor logos, Sheets for tracking

---

## Quick Start

### Prerequisites

- Node.js 20+ (recommended)
- Docker Desktop (for local Supabase)
- Google Cloud account (for sponsor management features)

### Installation

```bash
# Clone repository
git clone <your-repo-url>
cd riseup-website-frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your keys

# Start local Supabase
npx supabase start

# Run database migrations
npx supabase migration up

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the site.

---

## Environment Setup

### Required for Core Features

```bash
# Supabase (database & auth)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Anthropic AI (CMS chat)
ANTHROPIC_API_KEY=

# Resend (email notifications)
RESEND_API_KEY=
RESEND_FROM_EMAIL=
ADMIN_EMAIL=

# GiveButter (donations)
NEXT_PUBLIC_GIVEBUTTER_WIDGET_ID=
```

### Required for Sponsor Management (v1.1+)

```bash
# Stripe (invoicing)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

### Required for Automated Uploads (v1.2+)

```bash
# Google APIs (Drive & Sheets integration)
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
GOOGLE_DRIVE_ROOT_FOLDER_ID=
GOOGLE_SHEETS_SPREADSHEET_ID=
```

**Setup Guide:** See [`docs/GOOGLE_SETUP_GUIDE.md`](docs/GOOGLE_SETUP_GUIDE.md) for detailed Google Cloud configuration (15 minutes).

**Validation:** Run `npm run validate:google` to test Google integration.

---

## Database Migrations

Apply migrations to your local or remote database:

```bash
# Local development
npx supabase migration up

# Remote/production (requires linked project)
npx supabase db push
```

**Migrations:**
- `001_sponsors.sql` - Sponsor submission system
- `002_content_cms.sql` - AI CMS content management
- `003_images.sql` - Image uploads and storage
- `004_donation_flag.sql` - Donation tracking
- `005_invoicing.sql` - Sponsorship packages and invoices
- `006_sponsor_uploads.sql` - Upload tokens and benefits tracking

---

## NPM Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run validate:google  # Test Google Drive/Sheets integration
```

---

## Project Structure

```
src/
├── app/
│   ├── (admin)/          # Admin panel (protected routes)
│   │   ├── chat/         # AI CMS chat interface
│   │   ├── dashboard/    # Invoice & package management
│   │   └── sponsors/     # Sponsor approval
│   ├── (public)/         # Public pages
│   │   ├── page.tsx      # Homepage
│   │   ├── programs/     # Football programs
│   │   ├── about/        # About us
│   │   ├── partners/     # Sponsor logos
│   │   └── sponsor/      # Sponsorship info
│   ├── api/              # API routes (webhooks, AI chat)
│   └── upload/           # Public upload form
├── components/
│   ├── ui/               # Base UI components
│   ├── sections/         # Page sections
│   └── layout/           # Header, footer, nav
├── lib/
│   ├── actions/          # Server actions
│   ├── validations/      # Zod schemas
│   ├── google-drive.ts   # Drive integration
│   └── google-sheets.ts  # Sheets integration
├── scripts/              # Utility scripts
└── supabase/
    └── migrations/       # Database migrations
```

---

## Admin Panel

Access the admin panel at `/admin` (requires authentication).

**Features:**
- **Chat Interface** (`/admin/chat`): Update content via AI commands
- **Sponsor Management** (`/admin/sponsors`): Approve sponsor submissions
- **Package Management** (`/admin/dashboard/packages`): Create/edit sponsorship tiers
- **Invoice Management** (`/admin/dashboard/invoices`): Create invoices, track payments
- **Dashboard** (`/admin/dashboard`): Overview of packages, invoices, uploads

---

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Environment Variables for Production

Ensure all required environment variables are set:
- Supabase (production project)
- Anthropic API key
- Stripe (production keys)
- Google service account credentials
- Resend API key

---

## Documentation

- [Google Setup Guide](docs/GOOGLE_SETUP_GUIDE.md) - Service account configuration
- [Quick Start](QUICK_START.md) - Detailed setup instructions
- [Planning Documents](.planning/) - Phase-by-phase development plans

---

## Development Milestones

- ✅ **v1.0 MVP** (2026-01-18): Public website, AI CMS, basic sponsor portal
- ✅ **v1.1 Sponsorship Packages** (2026-01-21): Stripe invoicing, package tiers
- 🚧 **v1.2 Sponsor Management** (In Progress): Google Drive/Sheets automation

See [.planning/ROADMAP.md](.planning/ROADMAP.md) for detailed phase breakdown.

---

## Tech Stack Details

**Frontend:**
- Next.js 16 with React 19
- Tailwind CSS v4 (CSS-based config)
- TypeScript
- Framer Motion (animations)

**Backend:**
- Supabase (PostgreSQL + Auth + Storage)
- Anthropic Claude (AI chat)
- Stripe (payments)
- Google APIs (Drive + Sheets)
- Resend (email)

**Infrastructure:**
- Vercel (hosting)
- Docker (local development)

---

## Contributing

This is a private project for RiseUp Youth Football League. For internal development:

1. Create feature branch from `main`
2. Follow existing code patterns
3. Update planning documents if needed
4. Test thoroughly before merging
5. Deploy to Vercel preview for review

---

## Support

For questions or issues:
- Check [docs/](docs/) folder for guides
- Review [.planning/](.planning/) for design decisions
- Contact project maintainer

---

## License

Private - All Rights Reserved  
© 2026 RiseUp Youth Football League

---

*Built with ❤️ for empowering youth through sports*
