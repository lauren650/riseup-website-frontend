# Quick Start: Update Sponsor Packages

## For Production (If you have existing sponsors)

```bash
# Connect to your production database
supabase db push

# Or manually via Supabase dashboard:
# 1. Go to SQL Editor
# 2. Copy contents of supabase/migrations/008_update_sponsor_packages.sql
# 3. Execute
```

⚠️ **Important**: This will replace all package definitions but preserve existing sponsor signups.

---

## For Local Development

```bash
# Reset and rebuild database with new packages
supabase db reset

# Or run the complete setup
psql -h localhost -U postgres -d postgres -f COMPLETE_DATABASE_SETUP.sql
```

---

## Verify the Update

```bash
# Check packages in database
supabase db remote console

# Then run:
SELECT name, cost/100 as dollars, total_slots FROM sponsorship_packages ORDER BY cost DESC;
```

You should see **8 packages** ranging from $500 to $5,000.

---

## View on Website

Visit: `http://localhost:3000/become-a-partner`

Packages will display automatically, sorted by cost (lowest to highest).

---

## Files Changed

✅ `supabase/migrations/008_update_sponsor_packages.sql` - New migration
✅ `COMPLETE_DATABASE_SETUP.sql` - Updated seed data
✅ `SPONSOR_PACKAGE_UPDATE_README.md` - Detailed documentation
✅ `SPONSOR_PACKAGE_COMPARISON.md` - Visual comparison guide

---

## Need Help?

- See `SPONSOR_PACKAGE_UPDATE_README.md` for detailed instructions
- See `SPONSOR_PACKAGE_COMPARISON.md` for package details
- Check `/src/components/sponsors/pricing-table.tsx` for frontend code
