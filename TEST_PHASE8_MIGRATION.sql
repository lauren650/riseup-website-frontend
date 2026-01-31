-- Quick test to verify Phase 8 migration is applied
-- Run this in Supabase SQL Editor

-- Test 1: Check if sponsor_uploads table exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'sponsor_uploads'
) AS sponsor_uploads_exists;

-- Test 2: Check if package benefit columns exist
SELECT EXISTS (
  SELECT 1 FROM information_schema.columns 
  WHERE table_name = 'sponsorship_packages' 
  AND column_name = 'includes_website_benefit'
) AS benefit_columns_exist;

-- Test 3: View sponsorship packages with benefits
SELECT 
  name,
  cost / 100 as price_dollars,
  includes_website_benefit,
  includes_banner,
  includes_tshirt,
  includes_golf_sign,
  includes_game_day,
  description
FROM sponsorship_packages
ORDER BY cost DESC;

-- Test 4: Check sponsor_uploads table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'sponsor_uploads'
ORDER BY ordinal_position;
