-- Image Content Migration
-- Migration: 003_images.sql
-- Purpose: Add image content entries to site_content table and set up site-images storage bucket

-- Add image content entries for hero section
INSERT INTO site_content (content_key, content_type, content, page, section) VALUES
  ('hero.poster', 'image', '{"url": "/images/hero-poster.jpg", "alt": "Youth football players on the field"}', 'homepage', 'hero'),
  ('hero.video', 'video', '{"url": "/videos/hero.mp4", "type": "video/mp4"}', 'homepage', 'hero')
ON CONFLICT (content_key) DO NOTHING;

-- Add program tile image entries
INSERT INTO site_content (content_key, content_type, content, page, section) VALUES
  ('programs.flag_football.image', 'image', '{"url": "/images/flag-football.jpg", "alt": "Flag football program"}', 'homepage', 'programs'),
  ('programs.tackle_football.image', 'image', '{"url": "/images/tackle-football.jpg", "alt": "Tackle football program"}', 'homepage', 'programs'),
  ('programs.academies.image', 'image', '{"url": "/images/academies-clinics.jpg", "alt": "Academies and clinics program"}', 'homepage', 'programs')
ON CONFLICT (content_key) DO NOTHING;

-- Note: The site-images bucket must be created manually in Supabase Dashboard:
-- 1. Go to Storage in your Supabase Dashboard
-- 2. Click "New bucket"
-- 3. Name it "site-images"
-- 4. Set it to public (for serving images)
-- 5. Configure allowed file types: image/jpeg, image/png, image/webp, image/gif
-- 6. Set max file size (recommended: 5MB)

-- Policy for site-images bucket (run in SQL editor after creating bucket):
-- CREATE POLICY "Public read access" ON storage.objects FOR SELECT USING (bucket_id = 'site-images');
-- CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'site-images' AND auth.role() = 'authenticated');
-- CREATE POLICY "Authenticated users can update" ON storage.objects FOR UPDATE USING (bucket_id = 'site-images' AND auth.role() = 'authenticated');
-- CREATE POLICY "Authenticated users can delete" ON storage.objects FOR DELETE USING (bucket_id = 'site-images' AND auth.role() = 'authenticated');
