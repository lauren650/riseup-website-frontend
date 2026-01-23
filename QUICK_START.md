# 🚀 Payload CMS - Quick Start

## 3-Minute Setup

### 1️⃣ Add Environment Variables

Create/update `.env`:

```env
# Payload CMS
DATABASE_URL=your-postgres-connection-string
PAYLOAD_SECRET=$(openssl rand -base64 32)
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# Keep existing Supabase vars
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

### 2️⃣ Run Migration

```bash
npm run migrate
```

This copies all your data from Supabase → Payload.

### 3️⃣ Start Server

```bash
npm run dev
```

### 4️⃣ Access Admin

**http://localhost:3000/admin**

Create your admin account on first visit.

### 5️⃣ Test AI Chat

1. Login to `/admin/dashboard`
2. Click chat icon (bottom right)
3. Try: `"Change the hero headline to 'Test'"`

## ✅ Done!

Your AI chat now works with Payload CMS!

---

## 📚 Full Docs

- **INTEGRATION_COMPLETE.md** - Overview & architecture
- **PAYLOAD_MIGRATION.md** - Detailed guide
- **payload.config.ts** - Configuration

## 🎯 Key Commands

```bash
npm run dev              # Start dev server
npm run migrate          # Migrate from Supabase
npm run payload:generate # Generate TypeScript types
```

## 🔗 URLs

- **Admin Panel**: http://localhost:3000/admin
- **Admin Dashboard**: http://localhost:3000/admin/dashboard
- **API**: http://localhost:3000/api/payload/*

## 💬 AI Chat Commands

```
"Change the hero headline to [text]"
"Add an announcement about [topic]"
"Hide/show the [section name] section"
"What content can I edit?"
```

## 🎨 Your Branding

Payload admin uses your RiseUp colors:
- **Accent**: #b72031 (signature red)
- **Background**: #000000 (black)
- **Buttons**: Rounded pills

## 🐛 Quick Fixes

**Admin 404?**
```bash
# Restart server
npm run dev
```

**Migration failed?**
```bash
# Check env vars
echo $DATABASE_URL
```

**AI chat not saving?**
- Check Payload is running
- Verify DATABASE_URL is set
- Check browser console

---

**Status**: ✅ Integration complete - ready to migrate!
