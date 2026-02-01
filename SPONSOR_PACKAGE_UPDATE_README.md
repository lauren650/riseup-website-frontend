# Sponsor Package Update - February 2026

## Overview

The sponsorship packages have been updated to reflect the 2026 fundraising plan. This includes new package tiers, updated pricing, and enhanced benefits.

## What Changed

### New Packages (8 total):

1. **RiseUp Champion Sponsor** - $5,000
   - 4 available slots
   - Includes golf tournament team + longest drive contest sponsorship
   
2. **Jamboree Presenting Sponsor** - $5,000
   - 1 exclusive slot
   - Presenting sponsor title for season jamboree
   
3. **Girls Flag Championship Title Sponsor** - $5,000
   - 1 exclusive slot
   - Exclusive naming rights for championship event
   
4. **Blue Level Sponsor** - $3,500
   - 12 available slots
   - Premium visibility package
   
5. **Red Level Sponsor** - $1,000
   - 8 available slots
   - T-shirt + website placement
   
6. **Digital Supporter Sponsor** - $600
   - 18 available slots
   - Year-round, can be prorated
   
7. **Game Day Sponsor** - $750
   - 13 available slots
   - Game day brand exposure
   
8. **Academy Sponsor** - $500
   - 18 available slots
   - Closes February 18, 2026

### Total Internal Cost: $109,550

All sponsors receive social media shout-outs when they sign up (Brittany creates template posts).

## How to Apply This Update

### Option 1: Run the Migration (Recommended for Production)

If you have an existing database with sponsors already signed up:

```bash
# This will add new packages without deleting existing sponsor data
psql -U your_username -d your_database -f supabase/migrations/008_update_sponsor_packages.sql
```

⚠️ **Warning**: This migration uses `TRUNCATE TABLE sponsorship_packages CASCADE`, which will:
- Delete all existing package definitions
- **Preserve existing sponsor signups** (they reference package IDs)
- You may need to manually reassign sponsors to new packages if IDs change

### Option 2: Fresh Setup (Development/Testing)

If you're starting fresh or in development:

```bash
# Run the complete database setup
psql -U your_username -d your_database -f COMPLETE_DATABASE_SETUP.sql
```

This will create all tables and seed with the updated sponsorship packages.

### Option 3: Manual Update via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase/migrations/008_update_sponsor_packages.sql`
4. Execute the query

## Verifying the Update

After applying the migration, verify the packages were created:

```sql
SELECT 
  name, 
  cost / 100 as cost_dollars, 
  total_slots, 
  available_slots,
  closing_date
FROM sponsorship_packages
ORDER BY cost DESC;
```

You should see 8 packages with costs ranging from $500 to $5,000.

## Package Availability on Website

The updated packages will automatically appear on the **Become a Partner** page (`/become-a-partner`) sorted by cost (lowest to highest).

- Packages with `closing_date` in the past will be automatically hidden
- "Digital Supporter Sponsor" has `closing_date = NULL` (year-round availability)
- All other packages close **July 31, 2026**
- Academy Sponsor closes **February 18, 2026**

## Rollback (If Needed)

If you need to rollback to the previous packages:

```bash
# Restore the old 4-package setup
psql -U your_username -d your_database -f supabase/migrations/005_invoicing.sql
psql -U your_username -d your_database -f supabase/migrations/006_package_display.sql
```

## Notes for Admins

- When a sponsor signs up, their record is saved in the `sponsors` table with a reference to the package ID
- The `available_slots` will automatically decrement when sponsors are approved
- You can manually adjust slot availability in the Supabase dashboard if needed
- Each package can be customized further via the admin dashboard (if that feature exists)

## Questions?

Contact the development team or refer to:
- `/src/components/sponsors/pricing-table.tsx` - Frontend display component
- `/src/app/(public)/become-a-partner/page.tsx` - Partnership page
- `/supabase/migrations/` - All database migrations
