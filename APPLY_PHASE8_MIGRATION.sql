-- ============================================================================
-- PHASE 8 MIGRATION - Run this in Supabase SQL Editor
-- ============================================================================
-- This migration adds the sponsor_uploads table and benefit flags
-- for the automated sponsor upload workflow (v1.2)

-- ============================================================================
-- ALTER SPONSORSHIP PACKAGES - ADD BENEFIT FLAGS
-- ============================================================================

ALTER TABLE sponsorship_packages
ADD COLUMN IF NOT EXISTS includes_website_benefit BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS includes_banner BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS includes_tshirt BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS includes_golf_sign BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS includes_game_day BOOLEAN DEFAULT false;

-- Update existing packages with appropriate benefits
UPDATE sponsorship_packages
SET 
  includes_website_benefit = true,
  includes_tshirt = true,
  includes_banner = true,
  includes_golf_sign = true
WHERE name = 'T-shirt (tackle & flag), website, banner, golf tournament sign';

UPDATE sponsorship_packages
SET includes_website_benefit = true
WHERE name = 'Website only logo';

UPDATE sponsorship_packages
SET includes_game_day = true
WHERE name = 'Game day package';

UPDATE sponsorship_packages
SET includes_tshirt = true
WHERE name = 'Rise Up Academy t-shirt';

-- ============================================================================
-- SPONSOR UPLOADS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS sponsor_uploads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  upload_token TEXT UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  package_id UUID REFERENCES sponsorship_packages(id) ON DELETE RESTRICT NOT NULL,
  
  -- Upload data
  logo_url TEXT,
  website_url TEXT,
  drive_folder_id TEXT NOT NULL,
  drive_file_id TEXT,
  sheets_row_index INTEGER,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  uploaded_at TIMESTAMPTZ,
  
  -- Token security
  token_expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT token_not_expired CHECK (token_expires_at > created_at)
);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

ALTER TABLE sponsor_uploads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view upload by token" ON sponsor_uploads;
CREATE POLICY "Anyone can view upload by token"
ON sponsor_uploads FOR SELECT
USING (
  upload_token IS NOT NULL 
  AND status = 'pending' 
  AND token_expires_at > NOW()
);

DROP POLICY IF EXISTS "Anyone can update upload by valid token" ON sponsor_uploads;
CREATE POLICY "Anyone can update upload by valid token"
ON sponsor_uploads FOR UPDATE
USING (
  upload_token IS NOT NULL 
  AND status = 'pending' 
  AND token_expires_at > NOW()
);

DROP POLICY IF EXISTS "Authenticated users can view all uploads" ON sponsor_uploads;
CREATE POLICY "Authenticated users can view all uploads"
ON sponsor_uploads FOR SELECT
TO authenticated
USING (true);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_sponsor_uploads_token
ON sponsor_uploads(upload_token);

CREATE INDEX IF NOT EXISTS idx_sponsor_uploads_invoice_id
ON sponsor_uploads(invoice_id);

CREATE INDEX IF NOT EXISTS idx_sponsor_uploads_status
ON sponsor_uploads(status);

CREATE INDEX IF NOT EXISTS idx_sponsor_uploads_package_id
ON sponsor_uploads(package_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER update_sponsor_uploads_updated_at
  BEFORE UPDATE ON sponsor_uploads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check that everything was created successfully
DO $$ 
BEGIN
  RAISE NOTICE 'Migration complete! Tables and policies created.';
  RAISE NOTICE 'sponsor_uploads table exists: %', 
    (SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sponsor_uploads'));
  RAISE NOTICE 'Package benefit columns added: %',
    (SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sponsorship_packages' AND column_name = 'includes_website_benefit'));
END $$;
