-- Migration: 010_invoices_note
-- Description: Add optional note to invoices
-- Created: 2026-02

ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS note TEXT;

COMMENT ON COLUMN invoices.note IS 'Optional admin note for this invoice';
