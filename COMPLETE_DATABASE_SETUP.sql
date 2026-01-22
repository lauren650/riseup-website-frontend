-- ============================================================================
-- COMPLETE DATABASE SETUP - RiseUp Website
-- ============================================================================
-- This script runs ALL migrations (001-006) in order to set up a fresh database
-- Safe to run on existing database (uses IF NOT EXISTS and DROP IF EXISTS)
-- ============================================================================

-- ============================================================================
-- MIGRATION 001: SPONSORS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS sponsors (
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

ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit sponsor" ON sponsors;
DROP POLICY IF EXISTS "Anyone can view approved sponsors" ON sponsors;
DROP POLICY IF EXISTS "Admins can view all sponsors" ON sponsors;
DROP POLICY IF EXISTS "Admins can update sponsors" ON sponsors;

CREATE POLICY "Anyone can submit sponsor"
ON sponsors FOR INSERT
WITH CHECK (status = 'pending');

CREATE POLICY "Anyone can view approved sponsors"
ON sponsors FOR SELECT
USING (status = 'approved');

CREATE POLICY "Admins can view all sponsors"
ON sponsors FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can update sponsors"
ON sponsors FOR UPDATE
TO authenticated
USING (true);

CREATE INDEX IF NOT EXISTS idx_sponsors_status ON sponsors(status);
CREATE INDEX IF NOT EXISTS idx_sponsors_company_name ON sponsors(company_name);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_sponsors_updated_at ON sponsors;
CREATE TRIGGER update_sponsors_updated_at
  BEFORE UPDATE ON sponsors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MIGRATION 002: CONTENT CMS
-- ============================================================================

CREATE TABLE IF NOT EXISTS site_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_key TEXT UNIQUE NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'text',
  content JSONB NOT NULL,
  page TEXT,
  section TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_key TEXT NOT NULL,
  draft_type TEXT NOT NULL,
  content JSONB NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 hour'
);

CREATE TABLE IF NOT EXISTS content_versions (
  id BIGSERIAL PRIMARY KEY,
  content_key TEXT NOT NULL,
  content JSONB NOT NULL,
  changed_by UUID,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  change_description TEXT
);

-- Trigger function for auto-versioning
CREATE OR REPLACE FUNCTION version_content()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO content_versions (content_key, content, changed_by, change_description)
  VALUES (
    OLD.content_key,
    OLD.content,
    auth.uid(),
    'Auto-versioned on update'
  );

  -- Keep only last 10 versions per content_key
  DELETE FROM content_versions
  WHERE id IN (
    SELECT id FROM content_versions
    WHERE content_key = OLD.content_key
    ORDER BY changed_at DESC
    OFFSET 10
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS content_version_trigger ON site_content;
CREATE TRIGGER content_version_trigger
BEFORE UPDATE ON site_content
FOR EACH ROW
EXECUTE FUNCTION version_content();

CREATE TABLE IF NOT EXISTS announcement_bar (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  link_url TEXT,
  link_text TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS section_visibility (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT UNIQUE NOT NULL,
  is_visible BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  tool_calls JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_site_content_key ON site_content(content_key);
CREATE INDEX IF NOT EXISTS idx_content_versions_key ON content_versions(content_key, changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user ON chat_messages(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_drafts_expires ON content_drafts(expires_at);

-- RLS policies
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_bar ENABLE ROW LEVEL SECURITY;
ALTER TABLE section_visibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read site_content" ON site_content;
DROP POLICY IF EXISTS "Public can read announcement_bar" ON announcement_bar;
DROP POLICY IF EXISTS "Public can read section_visibility" ON section_visibility;
DROP POLICY IF EXISTS "Authenticated can all site_content" ON site_content;
DROP POLICY IF EXISTS "Authenticated can all content_drafts" ON content_drafts;
DROP POLICY IF EXISTS "Authenticated can all content_versions" ON content_versions;
DROP POLICY IF EXISTS "Authenticated can all announcement_bar" ON announcement_bar;
DROP POLICY IF EXISTS "Authenticated can all section_visibility" ON section_visibility;
DROP POLICY IF EXISTS "Users can access own chat_messages" ON chat_messages;

CREATE POLICY "Public can read site_content" ON site_content FOR SELECT USING (true);
CREATE POLICY "Public can read announcement_bar" ON announcement_bar FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read section_visibility" ON section_visibility FOR SELECT USING (true);

CREATE POLICY "Authenticated can all site_content" ON site_content FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can all content_drafts" ON content_drafts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can all content_versions" ON content_versions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can all announcement_bar" ON announcement_bar FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can all section_visibility" ON section_visibility FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Users can access own chat_messages" ON chat_messages FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- MIGRATION 003: IMAGE CONTENT ENTRIES
-- ============================================================================
-- (No table creation - just inserts into site_content, handled at end)

-- ============================================================================
-- MIGRATION 004: DONATION FLAG IMAGE
-- ============================================================================
-- (No table creation - just inserts into site_content, handled at end)

-- ============================================================================
-- MIGRATION 005: INVOICING & SPONSORSHIP PACKAGES
-- ============================================================================

CREATE TABLE IF NOT EXISTS sponsorship_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  cost INTEGER NOT NULL CHECK (cost > 0),
  closing_date DATE,
  total_slots INTEGER NOT NULL CHECK (total_slots > 0),
  available_slots INTEGER NOT NULL CHECK (available_slots >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT available_slots_not_exceed_total CHECK (available_slots <= total_slots)
);

CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_invoice_id TEXT UNIQUE NOT NULL,
  package_id UUID REFERENCES sponsorship_packages(id) ON DELETE RESTRICT,
  package_name TEXT NOT NULL,
  package_cost INTEGER NOT NULL CHECK (package_cost > 0),
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  finalized_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  voided_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  payload JSONB NOT NULL
);

ALTER TABLE sponsorship_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view sponsorship packages" ON sponsorship_packages;
DROP POLICY IF EXISTS "Authenticated users can insert packages" ON sponsorship_packages;
DROP POLICY IF EXISTS "Authenticated users can update packages" ON sponsorship_packages;
DROP POLICY IF EXISTS "Authenticated users can delete packages" ON sponsorship_packages;

CREATE POLICY "Anyone can view sponsorship packages"
ON sponsorship_packages FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert packages"
ON sponsorship_packages FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update packages"
ON sponsorship_packages FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete packages"
ON sponsorship_packages FOR DELETE
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated users can view invoices" ON invoices;
DROP POLICY IF EXISTS "Authenticated users can create invoices" ON invoices;
DROP POLICY IF EXISTS "Authenticated users can update invoices" ON invoices;

CREATE POLICY "Authenticated users can view invoices"
ON invoices FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create invoices"
ON invoices FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update invoices"
ON invoices FOR UPDATE
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated users can view webhook events" ON webhook_events;

CREATE POLICY "Authenticated users can view webhook events"
ON webhook_events FOR SELECT
TO authenticated
USING (true);

CREATE INDEX IF NOT EXISTS idx_sponsorship_packages_closing_date
ON sponsorship_packages(closing_date);

CREATE INDEX IF NOT EXISTS idx_invoices_stripe_invoice_id
ON invoices(stripe_invoice_id);

CREATE INDEX IF NOT EXISTS idx_invoices_status
ON invoices(status);

CREATE INDEX IF NOT EXISTS idx_invoices_package_id
ON invoices(package_id);

CREATE INDEX IF NOT EXISTS idx_invoices_customer_email
ON invoices(customer_email);

CREATE INDEX IF NOT EXISTS idx_webhook_events_stripe_event_id
ON webhook_events(stripe_event_id);

CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type
ON webhook_events(event_type);

CREATE OR REPLACE FUNCTION decrement_package_slots(package_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  new_slot_count INTEGER;
BEGIN
  UPDATE sponsorship_packages
  SET available_slots = available_slots - 1
  WHERE id = package_uuid AND available_slots > 0
  RETURNING available_slots INTO new_slot_count;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No available slots for package %', package_uuid;
  END IF;

  RETURN new_slot_count;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_sponsorship_packages_updated_at ON sponsorship_packages;
CREATE TRIGGER update_sponsorship_packages_updated_at
  BEFORE UPDATE ON sponsorship_packages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MIGRATION 006: PACKAGE DISPLAY FIELDS
-- ============================================================================
-- Add description and benefits columns to sponsorship_packages

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='sponsorship_packages' AND column_name='description'
    ) THEN
        ALTER TABLE sponsorship_packages ADD COLUMN description TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='sponsorship_packages' AND column_name='benefits'
    ) THEN
        ALTER TABLE sponsorship_packages ADD COLUMN benefits TEXT[];
    END IF;
END $$;

-- ============================================================================
-- SEED DATA: SITE CONTENT (Migrations 002, 003, 004)
-- ============================================================================

-- From migration 002 - Hero section
INSERT INTO site_content (content_key, content_type, content, page, section) VALUES
  ('hero.headline', 'text', '{"text": "Join the movement."}', 'homepage', 'hero'),
  ('hero.subtitle', 'text', '{"text": "Youth football programs for ages 5-14. Building character, discipline, and teamwork through the game we love."}', 'homepage', 'hero'),
  ('hero.cta_primary', 'text', '{"text": "Register Now"}', 'homepage', 'hero'),
  ('hero.cta_secondary', 'text', '{"text": "Learn More"}', 'homepage', 'hero')
ON CONFLICT (content_key) DO UPDATE SET
  content = EXCLUDED.content,
  content_type = EXCLUDED.content_type,
  page = EXCLUDED.page,
  section = EXCLUDED.section,
  updated_at = NOW();

-- From migration 003 - Hero media
INSERT INTO site_content (content_key, content_type, content, page, section) VALUES
  ('hero.poster', 'image', '{"url": "/images/hero-poster.jpg", "alt": "Youth football players on the field"}', 'homepage', 'hero'),
  ('hero.video', 'video', '{"url": "/videos/hero.mp4", "type": "video/mp4"}', 'homepage', 'hero')
ON CONFLICT (content_key) DO NOTHING;

-- From migration 003 - Programs section
INSERT INTO site_content (content_key, content_type, content, page, section) VALUES
  ('programs.section_title', 'text', '{"text": "Our Programs"}', 'homepage', 'programs')
ON CONFLICT (content_key) DO NOTHING;

INSERT INTO site_content (content_key, content_type, content, page, section) VALUES
  ('programs.flag_football.image', 'image', '{"url": "/images/flag-football.jpg", "alt": "Flag football program"}', 'homepage', 'programs'),
  ('programs.tackle_football.image', 'image', '{"url": "/images/tackle-football.jpg", "alt": "Tackle football program"}', 'homepage', 'programs'),
  ('programs.academies.image', 'image', '{"url": "/images/academies-clinics.jpg", "alt": "Academies and clinics program"}', 'homepage', 'programs')
ON CONFLICT (content_key) DO NOTHING;

-- From migration 004 - Donation section flag
INSERT INTO site_content (content_key, content_type, content, page, section) VALUES
  ('donation.flag_background', 'image', '{"url": "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=1920&q=80", "alt": "American flag background"}', 'homepage', 'donation')
ON CONFLICT (content_key) DO NOTHING;

-- ============================================================================
-- SEED DATA: SPONSORSHIP PACKAGES (Migration 005 + 006)
-- ============================================================================

INSERT INTO sponsorship_packages (name, cost, closing_date, total_slots, available_slots, description, benefits) VALUES
  ('T-shirt (tackle & flag), website, banner, golf tournament sign', 
   350000, 
   '2026-07-31', 
   18, 
   18,
   'Premium visibility across all programs', 
   ARRAY[
     'Logo on tackle & flag t-shirts',
     'Website logo placement',
     'Banner at all games',
     'Golf tournament sign'
   ]),
  ('Website only logo', 
   60000, 
   NULL, 
   15, 
   15,
   'Digital presence for your brand', 
   ARRAY[
     'Logo on website sponsors section',
     'Link to your website'
   ]),
  ('Game day package', 
   75000, 
   '2026-07-31', 
   13, 
   13,
   'Game day brand exposure', 
   ARRAY[
     'Banner display at games',
     'PA announcements',
     'Social media mentions'
   ]),
  ('Rise Up Academy t-shirt', 
   50000, 
   '2026-02-18', 
   18, 
   18,
   'Support youth development', 
   ARRAY[
     'Logo on Rise Up Academy t-shirts',
     'Certificate of appreciation'
   ])
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
    result_text TEXT := '';
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'DATABASE SETUP COMPLETE';
    RAISE NOTICE '============================================';
    
    EXECUTE 'SELECT COUNT(*) FROM sponsors' INTO result_text;
    RAISE NOTICE 'sponsors: % rows', result_text;
    
    EXECUTE 'SELECT COUNT(*) FROM site_content' INTO result_text;
    RAISE NOTICE 'site_content: % rows', result_text;
    
    EXECUTE 'SELECT COUNT(*) FROM content_drafts' INTO result_text;
    RAISE NOTICE 'content_drafts: % rows', result_text;
    
    EXECUTE 'SELECT COUNT(*) FROM content_versions' INTO result_text;
    RAISE NOTICE 'content_versions: % rows', result_text;
    
    EXECUTE 'SELECT COUNT(*) FROM announcement_bar' INTO result_text;
    RAISE NOTICE 'announcement_bar: % rows', result_text;
    
    EXECUTE 'SELECT COUNT(*) FROM section_visibility' INTO result_text;
    RAISE NOTICE 'section_visibility: % rows', result_text;
    
    EXECUTE 'SELECT COUNT(*) FROM chat_messages' INTO result_text;
    RAISE NOTICE 'chat_messages: % rows', result_text;
    
    EXECUTE 'SELECT COUNT(*) FROM sponsorship_packages' INTO result_text;
    RAISE NOTICE 'sponsorship_packages: % rows', result_text;
    
    EXECUTE 'SELECT COUNT(*) FROM invoices' INTO result_text;
    RAISE NOTICE 'invoices: % rows', result_text;
    
    EXECUTE 'SELECT COUNT(*) FROM webhook_events' INTO result_text;
    RAISE NOTICE 'webhook_events: % rows', result_text;
    
    RAISE NOTICE '============================================';
    RAISE NOTICE 'All tables created successfully!';
    RAISE NOTICE '4 sponsorship packages with descriptions and benefits';
    RAISE NOTICE '12 site content entries (hero, programs, donation)';
    RAISE NOTICE '============================================';
END $$;

SELECT 
    'Setup complete! Check the messages above for table counts.' as status,
    'You can now test your app at http://localhost:3000' as next_step;
