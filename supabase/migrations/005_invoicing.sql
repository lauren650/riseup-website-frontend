-- Migration: 005_invoicing
-- Description: Create tables for sponsorship packages, invoices, and webhook event tracking
-- Created: 2026-01-20

-- ============================================================================
-- SPONSORSHIP PACKAGES TABLE
-- ============================================================================
-- Stores sponsorship package definitions with slot tracking.
-- Packages have optional closing dates (NULL = year-round availability).

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

-- ============================================================================
-- INVOICES TABLE
-- ============================================================================
-- Tracks Stripe invoices with snapshots of package details at creation time.
-- Status matches Stripe invoice lifecycle.

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

-- ============================================================================
-- WEBHOOK EVENTS TABLE
-- ============================================================================
-- Idempotency table to prevent duplicate webhook processing.
-- stripe_event_id is the unique key from Stripe's event object.

CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  payload JSONB NOT NULL
);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Sponsorship Packages: Public read, authenticated write
ALTER TABLE sponsorship_packages ENABLE ROW LEVEL SECURITY;

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

-- Invoices: Authenticated can SELECT/INSERT/UPDATE (no DELETE - void instead)
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

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

-- Webhook Events: Authenticated can SELECT, service_role can INSERT
-- Note: Webhook endpoint uses service_role key for inserts
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view webhook events"
ON webhook_events FOR SELECT
TO authenticated
USING (true);

-- Service role bypasses RLS, so no explicit INSERT policy needed for webhooks

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Sponsorship Packages
CREATE INDEX IF NOT EXISTS idx_sponsorship_packages_closing_date
ON sponsorship_packages(closing_date);

-- Invoices
CREATE INDEX IF NOT EXISTS idx_invoices_stripe_invoice_id
ON invoices(stripe_invoice_id);

CREATE INDEX IF NOT EXISTS idx_invoices_status
ON invoices(status);

CREATE INDEX IF NOT EXISTS idx_invoices_package_id
ON invoices(package_id);

CREATE INDEX IF NOT EXISTS idx_invoices_customer_email
ON invoices(customer_email);

-- Webhook Events
CREATE INDEX IF NOT EXISTS idx_webhook_events_stripe_event_id
ON webhook_events(stripe_event_id);

CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type
ON webhook_events(event_type);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Atomic slot decrement function
-- Returns new available_slots count, raises exception if no slots available
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

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Reuse existing update_updated_at_column() function from 001_sponsors.sql
CREATE TRIGGER update_sponsorship_packages_updated_at
  BEFORE UPDATE ON sponsorship_packages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA
-- ============================================================================
-- Initial sponsorship packages based on current RiseUp offerings

INSERT INTO sponsorship_packages (name, cost, closing_date, total_slots, available_slots) VALUES
  ('T-shirt (tackle & flag), website, banner, golf tournament sign', 350000, '2026-07-31', 18, 18),
  ('Website only logo', 60000, NULL, 15, 15),
  ('Game day package', 75000, '2026-07-31', 13, 13),
  ('Rise Up Academy t-shirt', 50000, '2026-02-18', 18, 18);
