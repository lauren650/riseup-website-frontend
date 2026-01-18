-- Migration: 001_sponsors
-- Description: Create sponsors table and storage policies for sponsor submission system
-- Created: 2026-01-18

-- ============================================================================
-- SPONSORS TABLE
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

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a sponsor (insert with pending status)
CREATE POLICY "Anyone can submit sponsor"
ON sponsors FOR INSERT
WITH CHECK (status = 'pending');

-- Anyone can view approved sponsors (public partners page)
CREATE POLICY "Anyone can view approved sponsors"
ON sponsors FOR SELECT
USING (status = 'approved');

-- Authenticated users (admins) can view all sponsors
CREATE POLICY "Admins can view all sponsors"
ON sponsors FOR SELECT
TO authenticated
USING (true);

-- Authenticated users (admins) can update sponsors (approve/reject)
CREATE POLICY "Admins can update sponsors"
ON sponsors FOR UPDATE
TO authenticated
USING (true);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_sponsors_status ON sponsors(status);
CREATE INDEX IF NOT EXISTS idx_sponsors_company_name ON sponsors(company_name);

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to sponsors table
CREATE TRIGGER update_sponsors_updated_at
  BEFORE UPDATE ON sponsors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STORAGE BUCKET POLICIES
-- Note: The storage bucket 'sponsor-logos' must be created manually in
-- Supabase Dashboard -> Storage -> Create new bucket (Name: sponsor-logos, Public: Yes)
-- These policies are applied after the bucket exists.
-- ============================================================================

-- Allow anyone to upload to pending/ folder (sponsor submissions)
CREATE POLICY "Anyone can upload pending logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'sponsor-logos'
  AND (storage.foldername(name))[1] = 'pending'
);

-- Only authenticated users can upload to approved/ folder
CREATE POLICY "Admins can upload approved logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'sponsor-logos'
  AND (storage.foldername(name))[1] = 'approved'
);

-- Anyone can read sponsor logos (public bucket)
CREATE POLICY "Anyone can read sponsor logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'sponsor-logos');

-- Authenticated users can update/delete any sponsor logo
CREATE POLICY "Admins can manage sponsor logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'sponsor-logos');

CREATE POLICY "Admins can delete sponsor logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'sponsor-logos');
