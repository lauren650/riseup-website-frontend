-- Migration: 006_sponsor_uploads
-- Description: Create sponsor_uploads table and add benefit flags to sponsorship_packages
-- Created: 2026-01-24

-- ============================================================================
-- ALTER SPONSORSHIP PACKAGES - ADD BENEFIT FLAGS
-- ============================================================================
-- Add flexible benefit tracking to packages (checkbox system)

ALTER TABLE sponsorship_packages
ADD COLUMN IF NOT EXISTS includes_website_benefit BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS includes_banner BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS includes_tshirt BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS includes_golf_sign BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS includes_game_day BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS description TEXT;

-- Update existing seed data with appropriate benefits
UPDATE sponsorship_packages
SET 
  includes_website_benefit = true,
  includes_tshirt = true,
  includes_banner = true,
  includes_golf_sign = true,
  description = 'Complete package with maximum visibility across all RiseUp events and platforms'
WHERE name = 'T-shirt (tackle & flag), website, banner, golf tournament sign';

UPDATE sponsorship_packages
SET 
  includes_website_benefit = true,
  description = 'Your logo displayed on our Partners page with link to your website'
WHERE name = 'Website only logo';

UPDATE sponsorship_packages
SET 
  includes_game_day = true,
  description = 'Prominent presence at game day events with booth space'
WHERE name = 'Game day package';

UPDATE sponsorship_packages
SET 
  includes_tshirt = true,
  description = 'Your logo featured on Rise Up Academy training shirts'
WHERE name = 'Rise Up Academy t-shirt';

-- ============================================================================
-- SPONSOR UPLOADS TABLE
-- ============================================================================
-- Tracks upload tokens, status, and links uploads to invoices

CREATE TABLE IF NOT EXISTS sponsor_uploads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  upload_token TEXT UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  package_id UUID REFERENCES sponsorship_packages(id) ON DELETE RESTRICT NOT NULL,
  
  -- Upload data
  logo_url TEXT, -- Supabase Storage URL (cached from Drive)
  website_url TEXT,
  drive_folder_id TEXT NOT NULL, -- Created on invoice payment
  drive_file_id TEXT, -- Populated after upload
  sheets_row_index INTEGER, -- Row number in Google Sheets (for updates)
  
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

-- Public can SELECT by valid token (for upload form access)
CREATE POLICY "Anyone can view upload by token"
ON sponsor_uploads FOR SELECT
USING (
  upload_token IS NOT NULL 
  AND status = 'pending' 
  AND token_expires_at > NOW()
);

-- Public can UPDATE by valid token (for upload form submission)
CREATE POLICY "Anyone can update upload by valid token"
ON sponsor_uploads FOR UPDATE
USING (
  upload_token IS NOT NULL 
  AND status = 'pending' 
  AND token_expires_at > NOW()
);

-- Authenticated users (admins) can view all
CREATE POLICY "Authenticated users can view all uploads"
ON sponsor_uploads FOR SELECT
TO authenticated
USING (true);

-- Service role can INSERT (created by webhook after payment)
-- Note: Service role bypasses RLS, so no explicit policy needed

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Upload token lookup (primary access pattern for public form)
CREATE INDEX IF NOT EXISTS idx_sponsor_uploads_token
ON sponsor_uploads(upload_token);

-- Invoice relationship
CREATE INDEX IF NOT EXISTS idx_sponsor_uploads_invoice_id
ON sponsor_uploads(invoice_id);

-- Status filtering (dashboard queries)
CREATE INDEX IF NOT EXISTS idx_sponsor_uploads_status
ON sponsor_uploads(status);

-- Package relationship
CREATE INDEX IF NOT EXISTS idx_sponsor_uploads_package_id
ON sponsor_uploads(package_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Reuse existing update_updated_at_column() function
CREATE TRIGGER update_sponsor_uploads_updated_at
  BEFORE UPDATE ON sponsor_uploads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE sponsor_uploads IS 'Tracks sponsor upload workflow after invoice payment. Each paid invoice generates one upload token.';
COMMENT ON COLUMN sponsor_uploads.upload_token IS 'Secure UUID for public upload form access (90-day expiration)';
COMMENT ON COLUMN sponsor_uploads.drive_folder_id IS 'Google Drive folder ID created on invoice payment';
COMMENT ON COLUMN sponsor_uploads.logo_url IS 'Supabase Storage URL - cached copy of logo from Drive for fast public access';
COMMENT ON COLUMN sponsor_uploads.sheets_row_index IS 'Row number in Google Sheets for efficient updates';
