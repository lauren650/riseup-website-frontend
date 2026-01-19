-- Add donation section flag background image
-- Migration: 004_donation_flag.sql
-- Purpose: Add flag background image entry for donation section

INSERT INTO site_content (content_key, content_type, content, page, section) VALUES
  ('donation.flag_background', 'image', '{"url": "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=1920&q=80", "alt": "American flag background"}', 'homepage', 'donation')
ON CONFLICT (content_key) DO NOTHING;
