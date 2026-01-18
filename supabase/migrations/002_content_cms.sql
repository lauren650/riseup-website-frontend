-- AI-Powered CMS Database Schema
-- Migration: 002_content_cms.sql
-- Purpose: Store editable content, announcements, visibility toggles, and chat history

-- Site content storage (text fields, descriptions, etc.)
CREATE TABLE site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_key TEXT UNIQUE NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'text',
  content JSONB NOT NULL,
  page TEXT,
  section TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content drafts for preview before publishing
CREATE TABLE content_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_key TEXT NOT NULL,
  draft_type TEXT NOT NULL,
  content JSONB NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 hour'
);

-- Version history (auto-populated by trigger)
CREATE TABLE content_versions (
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

CREATE TRIGGER content_version_trigger
BEFORE UPDATE ON site_content
FOR EACH ROW
EXECUTE FUNCTION version_content();

-- Announcement bar
CREATE TABLE announcement_bar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  link_url TEXT,
  link_text TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Section visibility toggles
CREATE TABLE section_visibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT UNIQUE NOT NULL,
  is_visible BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat message history
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  tool_calls JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_site_content_key ON site_content(content_key);
CREATE INDEX idx_content_versions_key ON content_versions(content_key, changed_at DESC);
CREATE INDEX idx_chat_messages_user ON chat_messages(user_id, created_at DESC);
CREATE INDEX idx_content_drafts_expires ON content_drafts(expires_at);

-- Seed initial editable content from current hardcoded values
INSERT INTO site_content (content_key, content_type, content, page, section) VALUES
  ('hero.headline', 'text', '{"text": "BUILDING CHAMPIONS ON AND OFF THE FIELD"}', 'homepage', 'hero'),
  ('hero.subtitle', 'text', '{"text": "Youth football programs for ages 5-14. Building character, discipline, and teamwork through the game we love."}', 'homepage', 'hero'),
  ('hero.cta_primary', 'text', '{"text": "Register Now"}', 'homepage', 'hero'),
  ('hero.cta_secondary', 'text', '{"text": "Learn More"}', 'homepage', 'hero');

-- RLS policies
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_bar ENABLE ROW LEVEL SECURITY;
ALTER TABLE section_visibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Public can read published content
CREATE POLICY "Public can read site_content" ON site_content FOR SELECT USING (true);
CREATE POLICY "Public can read announcement_bar" ON announcement_bar FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read section_visibility" ON section_visibility FOR SELECT USING (true);

-- Authenticated users can modify (admin check in application layer)
CREATE POLICY "Authenticated can all site_content" ON site_content FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can all content_drafts" ON content_drafts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can all content_versions" ON content_versions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can all announcement_bar" ON announcement_bar FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can all section_visibility" ON section_visibility FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Users can access own chat_messages" ON chat_messages FOR ALL USING (auth.uid() = user_id);
