-- Sponsor Interest Submissions
-- Stores form submissions from potential partners

CREATE TABLE IF NOT EXISTS sponsor_interest (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    company_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'closed')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    contacted_at TIMESTAMPTZ,
    contacted_by UUID REFERENCES auth.users(id)
);

-- Index for querying by status
CREATE INDEX idx_sponsor_interest_status ON sponsor_interest(status);

-- Index for querying by creation date
CREATE INDEX idx_sponsor_interest_created_at ON sponsor_interest(created_at DESC);

-- Enable RLS
ALTER TABLE sponsor_interest ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert (for form submissions)
CREATE POLICY "Anyone can submit interest" ON sponsor_interest
    FOR INSERT
    WITH CHECK (true);

-- Only authenticated users can view submissions
CREATE POLICY "Authenticated users can view interest" ON sponsor_interest
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Only authenticated users can update submissions
CREATE POLICY "Authenticated users can update interest" ON sponsor_interest
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Trigger to update updated_at on changes
CREATE OR REPLACE FUNCTION update_sponsor_interest_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_sponsor_interest_updated_at
    BEFORE UPDATE ON sponsor_interest
    FOR EACH ROW
    EXECUTE FUNCTION update_sponsor_interest_updated_at();

-- Comment for documentation
COMMENT ON TABLE sponsor_interest IS 'Stores partnership interest form submissions from potential sponsors';
COMMENT ON COLUMN sponsor_interest.status IS 'Submission status: new, contacted, converted (became sponsor), closed (not interested)';
