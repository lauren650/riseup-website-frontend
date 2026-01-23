/**
 * Data Migration Script: Supabase → Payload CMS
 * 
 * This script migrates all existing data from Supabase to Payload CMS
 * Run with: tsx scripts/migrate-supabase-to-payload.ts
 * 
 * Prerequisites:
 * 1. Install tsx: npm install -D tsx
 * 2. Ensure DATABASE_URL is set in .env.local
 * 3. Ensure Supabase credentials are set in .env.local
 */

// Load environment variables from .env.local
import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { getPayload } from 'payload'
import config from '@payload-config'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface MigrationStats {
  siteContent: { migrated: number; skipped: number; errors: number }
  sponsors: { migrated: number; skipped: number; errors: number }
  packages: { migrated: number; skipped: number; errors: number }
  sectionVisibility: { migrated: number; skipped: number; errors: number }
  announcementBar: { migrated: number; skipped: number; errors: number }
  chatMessages: { migrated: number; skipped: number; errors: number }
}

async function migrateData() {
  console.log('🚀 Starting migration from Supabase to Payload CMS...\n')

  const stats: MigrationStats = {
    siteContent: { migrated: 0, skipped: 0, errors: 0 },
    sponsors: { migrated: 0, skipped: 0, errors: 0 },
    packages: { migrated: 0, skipped: 0, errors: 0 },
    sectionVisibility: { migrated: 0, skipped: 0, errors: 0 },
    announcementBar: { migrated: 0, skipped: 0, errors: 0 },
    chatMessages: { migrated: 0, skipped: 0, errors: 0 },
  }

  try {
    // Initialize Payload
    console.log('📦 Initializing Payload CMS...')
    const payload = await getPayload({ config })
    console.log('✅ Payload initialized\n')

    // ========================================================================
    // MIGRATE SITE CONTENT
    // ========================================================================
    console.log('📝 Migrating site content...')
    const { data: siteContent, error: siteContentError } = await supabase
      .from('site_content')
      .select('*')

    if (siteContentError) {
      console.error('❌ Error fetching site content:', siteContentError)
    } else if (siteContent) {
      for (const item of siteContent) {
        try {
          // Check if already exists
          const existing = await payload.find({
            collection: 'site-content',
            where: {
              contentKey: { equals: item.content_key },
            },
            limit: 1,
          })

          if (existing.docs.length > 0) {
            console.log(`  ⏭️  Skipping ${item.content_key} (already exists)`)
            stats.siteContent.skipped++
            continue
          }

          await payload.create({
            collection: 'site-content',
            data: {
              contentKey: item.content_key,
              page: item.page,
              section: item.section,
              contentType: item.content_type || 'text',
              content: item.content,
            },
          })

          console.log(`  ✅ Migrated: ${item.content_key}`)
          stats.siteContent.migrated++
        } catch (err) {
          console.error(`  ❌ Error migrating ${item.content_key}:`, err)
          stats.siteContent.errors++
        }
      }
    }
    console.log(`✅ Site content: ${stats.siteContent.migrated} migrated, ${stats.siteContent.skipped} skipped, ${stats.siteContent.errors} errors\n`)

    // ========================================================================
    // MIGRATE SPONSORS
    // ========================================================================
    console.log('🤝 Migrating sponsors...')
    const { data: sponsors, error: sponsorsError } = await supabase
      .from('sponsors')
      .select('*')

    if (sponsorsError) {
      console.error('❌ Error fetching sponsors:', sponsorsError)
    } else if (sponsors) {
      for (const sponsor of sponsors) {
        try {
          // Check if already exists
          const existing = await payload.find({
            collection: 'sponsors',
            where: {
              contact_email: { equals: sponsor.contact_email },
              company_name: { equals: sponsor.company_name },
            },
            limit: 1,
          })

          if (existing.docs.length > 0) {
            console.log(`  ⏭️  Skipping ${sponsor.company_name} (already exists)`)
            stats.sponsors.skipped++
            continue
          }

          // Note: logo_url needs to be uploaded to Payload media first
          // For now, we'll store it as a string reference
          await payload.create({
            collection: 'sponsors',
            data: {
              company_name: sponsor.company_name,
              contact_name: sponsor.contact_name,
              contact_email: sponsor.contact_email,
              contact_phone: sponsor.contact_phone,
              website_url: sponsor.website_url,
              description: sponsor.description,
              logo_url: sponsor.logo_url, // TODO: Upload to Payload media
              status: sponsor.status,
              approved_at: sponsor.approved_at,
              approved_by: sponsor.approved_by,
            },
          })

          console.log(`  ✅ Migrated: ${sponsor.company_name}`)
          stats.sponsors.migrated++
        } catch (err) {
          console.error(`  ❌ Error migrating ${sponsor.company_name}:`, err)
          stats.sponsors.errors++
        }
      }
    }
    console.log(`✅ Sponsors: ${stats.sponsors.migrated} migrated, ${stats.sponsors.skipped} skipped, ${stats.sponsors.errors} errors\n`)

    // ========================================================================
    // MIGRATE SPONSORSHIP PACKAGES
    // ========================================================================
    console.log('📦 Migrating sponsorship packages...')
    const { data: packages, error: packagesError } = await supabase
      .from('sponsorship_packages')
      .select('*')

    if (packagesError) {
      console.error('❌ Error fetching packages:', packagesError)
    } else if (packages) {
      for (const pkg of packages) {
        try {
          const existing = await payload.find({
            collection: 'sponsorship-packages',
            where: {
              name: { equals: pkg.name },
            },
            limit: 1,
          })

          if (existing.docs.length > 0) {
            console.log(`  ⏭️  Skipping ${pkg.name} (already exists)`)
            stats.packages.skipped++
            continue
          }

          await payload.create({
            collection: 'sponsorship-packages',
            data: {
              name: pkg.name,
              cost: pkg.cost,
              closing_date: pkg.closing_date,
              total_slots: pkg.total_slots,
              available_slots: pkg.available_slots,
              description: pkg.description,
              benefits: pkg.benefits?.map((b: string) => ({ benefit: b })) || [],
              display_on_website: true,
            },
          })

          console.log(`  ✅ Migrated: ${pkg.name}`)
          stats.packages.migrated++
        } catch (err) {
          console.error(`  ❌ Error migrating ${pkg.name}:`, err)
          stats.packages.errors++
        }
      }
    }
    console.log(`✅ Packages: ${stats.packages.migrated} migrated, ${stats.packages.skipped} skipped, ${stats.packages.errors} errors\n`)

    // ========================================================================
    // MIGRATE SECTION VISIBILITY
    // ========================================================================
    console.log('👁️  Migrating section visibility...')
    const { data: visibility, error: visibilityError } = await supabase
      .from('section_visibility')
      .select('*')

    if (visibilityError) {
      console.error('❌ Error fetching visibility:', visibilityError)
    } else if (visibility) {
      for (const item of visibility) {
        try {
          const existing = await payload.find({
            collection: 'section-visibility',
            where: {
              section_key: { equals: item.section_key },
            },
            limit: 1,
          })

          if (existing.docs.length > 0) {
            console.log(`  ⏭️  Skipping ${item.section_key} (already exists)`)
            stats.sectionVisibility.skipped++
            continue
          }

          await payload.create({
            collection: 'section-visibility',
            data: {
              section_key: item.section_key,
              is_visible: item.is_visible,
            },
          })

          console.log(`  ✅ Migrated: ${item.section_key}`)
          stats.sectionVisibility.migrated++
        } catch (err) {
          console.error(`  ❌ Error migrating ${item.section_key}:`, err)
          stats.sectionVisibility.errors++
        }
      }
    }
    console.log(`✅ Visibility: ${stats.sectionVisibility.migrated} migrated, ${stats.sectionVisibility.skipped} skipped, ${stats.sectionVisibility.errors} errors\n`)

    // ========================================================================
    // MIGRATE ANNOUNCEMENT BAR
    // ========================================================================
    console.log('📢 Migrating announcement bar...')
    const { data: announcements, error: announcementsError } = await supabase
      .from('announcement_bar')
      .select('*')
      .eq('is_active', true)
      .limit(1)
      .single()

    if (!announcementsError && announcements) {
      try {
        await payload.updateGlobal({
          slug: 'announcement-bar',
          data: {
            text: announcements.text,
            link_url: announcements.link_url,
            link_text: announcements.link_text,
            is_active: announcements.is_active,
          },
        })

        console.log('  ✅ Migrated active announcement')
        stats.announcementBar.migrated++
      } catch (err) {
        console.error('  ❌ Error migrating announcement:', err)
        stats.announcementBar.errors++
      }
    } else {
      console.log('  ℹ️  No active announcement to migrate')
    }
    console.log('')

    // ========================================================================
    // MIGRATE CHAT MESSAGES (Optional - might be a lot of data)
    // ========================================================================
    console.log('💬 Migrating chat messages (last 100)...')
    const { data: chatMessages, error: chatError } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (chatError) {
      console.error('❌ Error fetching chat messages:', chatError)
    } else if (chatMessages) {
      for (const msg of chatMessages) {
        try {
          await payload.create({
            collection: 'chat-messages',
            data: {
              user_id: msg.user_id,
              role: msg.role,
              content: msg.content,
              tool_calls: msg.tool_calls,
            },
          })

          stats.chatMessages.migrated++
        } catch (err) {
          console.error('  ❌ Error migrating chat message:', err)
          stats.chatMessages.errors++
        }
      }
    }
    console.log(`✅ Chat messages: ${stats.chatMessages.migrated} migrated\n`)

    // ========================================================================
    // SUMMARY
    // ========================================================================
    console.log('=' .repeat(60))
    console.log('📊 MIGRATION SUMMARY')
    console.log('=' .repeat(60))
    console.log(`Site Content:       ${stats.siteContent.migrated} migrated, ${stats.siteContent.errors} errors`)
    console.log(`Sponsors:           ${stats.sponsors.migrated} migrated, ${stats.sponsors.errors} errors`)
    console.log(`Packages:           ${stats.packages.migrated} migrated, ${stats.packages.errors} errors`)
    console.log(`Section Visibility: ${stats.sectionVisibility.migrated} migrated, ${stats.sectionVisibility.errors} errors`)
    console.log(`Announcement Bar:   ${stats.announcementBar.migrated} migrated, ${stats.announcementBar.errors} errors`)
    console.log(`Chat Messages:      ${stats.chatMessages.migrated} migrated, ${stats.chatMessages.errors} errors`)
    console.log('=' .repeat(60))

    const totalMigrated = 
      stats.siteContent.migrated + 
      stats.sponsors.migrated + 
      stats.packages.migrated + 
      stats.sectionVisibility.migrated + 
      stats.announcementBar.migrated +
      stats.chatMessages.migrated

    const totalErrors = 
      stats.siteContent.errors + 
      stats.sponsors.errors + 
      stats.packages.errors + 
      stats.sectionVisibility.errors + 
      stats.announcementBar.errors +
      stats.chatMessages.errors

    console.log(`\n✅ Migration complete! ${totalMigrated} items migrated successfully`)
    if (totalErrors > 0) {
      console.log(`⚠️  ${totalErrors} errors occurred during migration`)
    }
    console.log('\n📝 Next steps:')
    console.log('1. Review migrated data in Payload admin: http://localhost:3000/admin')
    console.log('2. Upload sponsor logos to Payload media library')
    console.log('3. Test the AI chat interface with Payload')
    console.log('4. Update frontend components to use Payload queries')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run migration
migrateData()
  .then(() => {
    console.log('\n✅ Migration script completed')
    process.exit(0)
  })
  .catch((err) => {
    console.error('\n❌ Migration script failed:', err)
    process.exit(1)
  })
