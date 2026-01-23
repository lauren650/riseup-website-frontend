# Payload CMS Integration Guide

## 🎉 What's New

Your RiseUp website now uses **Payload CMS** as the content management system while **keeping your unique AI chat interface**! This gives you the best of both worlds:

- ✅ **Your AI Chat** - Still works exactly as before for natural language content editing
- ✅ **Payload Admin Panel** - Professional CMS interface at `/admin`
- ✅ **Better Content Management** - Rich text editing, media library, version control
- ✅ **Same Branding** - Custom RiseUp colors throughout the admin panel

## 🚀 Quick Start

### 1. Install Dependencies

Dependencies are already installed! If you need to reinstall:

```bash
npm install --legacy-peer-deps
```

### 2. Set Up Environment Variables

Add to your `.env` file:

```env
# Payload CMS
DATABASE_URL=postgresql://user:password@localhost:5432/database
PAYLOAD_SECRET=your-secret-key-here

# Existing Supabase vars (keep these for now)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

### 3. Run the Migration

Migrate your existing data from Supabase to Payload:

```bash
npx tsx scripts/migrate-supabase-to-payload.ts
```

This will copy all your:
- Site content
- Sponsors
- Sponsorship packages
- Section visibility settings
- Announcement bar
- Chat messages

### 4. Start the Development Server

```bash
npm run dev
```

### 5. Access the Admin Panel

Navigate to: **http://localhost:3000/admin**

First time? Create your admin account.

## 📚 How It Works

### AI Chat Interface (Unchanged!)

Your AI chat drawer still works exactly as before:

1. **Login** to `/admin/dashboard`
2. **Click the chat icon** (bottom right)
3. **Type natural language** commands like:
   - "Change the hero headline to 'Registration Now Open'"
   - "Add an announcement about summer camp"
   - "Hide the safety section"

The AI chat now saves to Payload instead of Supabase under the hood.

### Payload Admin Panel (New!)

A traditional CMS interface for non-technical users:

#### Collections (Database Tables)

1. **Site Content** - All editable text on your website
2. **Sponsors** - Sponsor submissions and management
3. **Sponsorship Packages** - Package tiers and pricing
4. **Section Visibility** - Show/hide page sections
5. **Media** - Uploaded images and videos
6. **Users** - Admin accounts
7. **Chat Messages** - AI chat history

#### Globals (Site-wide Settings)

1. **Announcement Bar** - Top banner message

### Inline Editing (Updated!)

Your inline `EditableText` components still work:

```tsx
<EditableText contentKey="hero.headline" page="homepage" section="hero">
  {content}
</EditableText>
```

Now saves directly to Payload CMS.

## 🎨 Custom Branding

The Payload admin panel uses your RiseUp brand colors:

- **Background**: Pure black (#000000)
- **Accent**: RiseUp red (#b72031)
- **Text**: High contrast white
- **Buttons**: Rounded pill shapes
- **Focus rings**: Red accent color

See: `src/styles/payload-admin.css`

## 📁 File Structure

```
/Users/laurenrothlisberger/RiseUp Website Fronend/
├── payload.config.ts                    # Payload configuration
├── src/
│   ├── app/
│   │   ├── (payload)/                   # Payload admin routes
│   │   │   └── admin/[[...segments]]/   # Admin panel pages
│   │   └── api/
│   │       └── payload/[...slug]/       # Payload API endpoints
│   ├── lib/
│   │   └── content/
│   │       └── payload-queries.ts       # Payload data layer
│   └── styles/
│       └── payload-admin.css            # Custom admin styling
├── scripts/
│   └── migrate-supabase-to-payload.ts   # Migration script
└── public/
    └── uploads/                          # Uploaded media files
```

## 🔄 Data Flow

### Before (Supabase)
```
AI Chat → Supabase → Frontend
```

### After (Payload)
```
AI Chat → Payload CMS → Frontend
         ↑
    Payload Admin Panel
```

## 🛠️ API Reference

### Payload Queries

All content operations now use Payload's Local API:

```typescript
import { getContent, saveInlineText, createDraft } from '@/lib/content/payload-queries'

// Get content
const headline = await getContent('hero.headline')

// Save content
await saveInlineText('hero.headline', 'New headline', 'homepage', 'hero')

// Create draft (for AI chat)
await createDraft('hero.headline', 'text', { text: 'New value' }, userId)
```

### Collections API

Access Payload collections directly:

```typescript
import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })

// Find content
const content = await payload.find({
  collection: 'site-content',
  where: {
    contentKey: { equals: 'hero.headline' }
  }
})

// Create content
await payload.create({
  collection: 'site-content',
  data: {
    contentKey: 'new.content',
    content: { text: 'Hello' },
    contentType: 'text'
  }
})
```

## 🔐 Authentication

**Hybrid approach:**
- **Payload** handles admin user accounts
- **Supabase** still used for public auth (donations, forms)

This maintains compatibility with your existing Supabase setup.

## 📊 Content Types

### Text Content

```json
{
  "contentKey": "hero.headline",
  "contentType": "text",
  "content": {
    "text": "BUILDING CHAMPIONS ON AND OFF THE FIELD"
  },
  "page": "homepage",
  "section": "hero"
}
```

### Image Content

```json
{
  "contentKey": "hero.image",
  "contentType": "image",
  "content": {
    "url": "/uploads/hero-image.jpg",
    "alt": "Football players training",
    "position": { "x": 50, "y": 50 }
  }
}
```

## 🎯 Best Practices

### 1. Use AI Chat for Quick Edits
- Great for text changes
- Fast and conversational
- Creates drafts automatically

### 2. Use Payload Admin for Complex Work
- Uploading images
- Managing sponsors
- Bulk operations
- Content organization

### 3. Version Control
- Payload automatically tracks all versions
- Rollback anytime from admin panel
- View change history

### 4. Media Management
- Upload directly to Payload
- Automatic image resizing (thumbnail, card, hero)
- Organized media library

## 🐛 Troubleshooting

### Migration Issues

**Problem**: Migration script fails

**Solution**:
```bash
# Check environment variables
echo $DATABASE_URL
echo $NEXT_PUBLIC_SUPABASE_URL

# Run migration with verbose logging
npx tsx scripts/migrate-supabase-to-payload.ts
```

### Admin Panel Not Loading

**Problem**: `/admin` shows 404

**Solution**:
1. Check Next.js is running: `npm run dev`
2. Verify `payload.config.ts` exists
3. Check console for errors

### AI Chat Not Saving

**Problem**: AI chat creates drafts but doesn't save

**Solution**:
1. Check Payload is configured: `DATABASE_URL` set
2. Verify Payload queries imported correctly
3. Check browser console for errors

## 📈 Performance

Payload CMS is optimized for Next.js:

- **Server-side**: Payload runs in API routes
- **Client-side**: Only UI loads, no heavy client bundle
- **Caching**: Next.js cache revalidation works seamlessly
- **Images**: Automatic optimization via Next.js Image

## 🚢 Deployment

### Environment Variables

Set on Vercel/your host:

```env
DATABASE_URL=postgresql://...
PAYLOAD_SECRET=random-secret-string
NEXT_PUBLIC_SERVER_URL=https://yourdomain.com
```

### Database

Payload requires PostgreSQL (you're already using it with Supabase).

### File Uploads

For production, configure Payload to use:
- **Vercel Blob Storage**
- **AWS S3**
- **Cloudinary**

See: https://payloadcms.com/docs/upload/overview

## 📖 Learn More

- **Payload Docs**: https://payloadcms.com/docs
- **Payload + Next.js**: https://payloadcms.com/docs/getting-started/installation#nextjs
- **Local API**: https://payloadcms.com/docs/local-api/overview

## 🎉 Success!

You now have:
- ✅ Professional CMS (Payload)
- ✅ AI-powered editing (Your custom chat)
- ✅ Beautiful admin panel (RiseUp branded)
- ✅ Better content management
- ✅ Version control & drafts
- ✅ Media library

**Questions?** Check the Payload docs or review the code in `src/lib/content/payload-queries.ts`
