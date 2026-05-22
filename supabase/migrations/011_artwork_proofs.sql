-- Migration: 011_artwork_proofs
-- Description: Create artwork_proofs and artwork_proof_approvals for partner artwork review
-- Created: 2026-02

-- ============================================================================
-- ARTWORK_PROOFS TABLE
-- ============================================================================
-- One row per proof (e.g. t-shirt mockup). Admin creates and sends to partners.

CREATE TABLE IF NOT EXISTS artwork_proofs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  approval_due_at TIMESTAMPTZ NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ARTWORK_PROOF_APPROVALS TABLE
-- ============================================================================
-- One row per partner per proof. Links partner (via sponsor_upload) to proof.

CREATE TABLE IF NOT EXISTS artwork_proof_approvals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artwork_proof_id UUID REFERENCES artwork_proofs(id) ON DELETE CASCADE NOT NULL,
  sponsor_upload_id UUID REFERENCES sponsor_uploads(id) ON DELETE CASCADE NOT NULL,
  approval_token TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'changes_requested')),
  responded_at TIMESTAMPTZ,
  approval_due_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

ALTER TABLE artwork_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE artwork_proof_approvals ENABLE ROW LEVEL SECURITY;

-- artwork_proofs: Authenticated users (admins) can manage
CREATE POLICY "Authenticated users can view artwork_proofs"
ON artwork_proofs FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert artwork_proofs"
ON artwork_proofs FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update artwork_proofs"
ON artwork_proofs FOR UPDATE TO authenticated USING (true);

-- artwork_proof_approvals: Authenticated can manage; public can view/update by token
CREATE POLICY "Authenticated users can view artwork_proof_approvals"
ON artwork_proof_approvals FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert artwork_proof_approvals"
ON artwork_proof_approvals FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update artwork_proof_approvals"
ON artwork_proof_approvals FOR UPDATE TO authenticated USING (true);

-- Public can SELECT their approval by token (for /approve-artwork/[token] page)
CREATE POLICY "Public can view approval by token"
ON artwork_proof_approvals FOR SELECT TO anon
USING (approval_token IS NOT NULL);

-- Public can UPDATE their approval by token (only when pending and not expired)
-- Note: anon can only set status to approved/changes_requested
CREATE POLICY "Public can update approval by token when pending"
ON artwork_proof_approvals FOR UPDATE TO anon
USING (
  approval_token IS NOT NULL
  AND status = 'pending'
  AND approval_due_at > NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_artwork_proofs_created_at
ON artwork_proofs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_artwork_proof_approvals_proof_id
ON artwork_proof_approvals(artwork_proof_id);

CREATE INDEX IF NOT EXISTS idx_artwork_proof_approvals_token
ON artwork_proof_approvals(approval_token);

CREATE INDEX IF NOT EXISTS idx_artwork_proof_approvals_status
ON artwork_proof_approvals(status);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER update_artwork_proofs_updated_at
  BEFORE UPDATE ON artwork_proofs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artwork_proof_approvals_updated_at
  BEFORE UPDATE ON artwork_proof_approvals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE artwork_proofs IS 'Artwork proofs (e.g. t-shirt mockups) sent to partners for approval';
COMMENT ON TABLE artwork_proof_approvals IS 'Per-partner approval records; one row per partner per proof';
COMMENT ON COLUMN artwork_proof_approvals.approval_token IS 'Unique token for public approval link (e.g. /approve-artwork/[token])';
