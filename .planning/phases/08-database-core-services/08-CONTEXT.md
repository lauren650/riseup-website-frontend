# Phase 8 Context: Database & Core Services

**Created:** 2026-01-23
**Phase Goal:** Google Drive/Sheets integration foundation and database schema ready

---

## What This Phase Delivers

Phase 8 establishes the infrastructure foundation for v1.2's automated sponsor workflow:

1. **Database Schema**: `sponsor_uploads` table + flexible package benefits system
2. **Google Drive Client**: Folder creation, file uploads, organized by package type
3. **Google Sheets Client**: Spreadsheet creation, row append/update for tracking
4. **Setup Validation**: Automated testing script for configuration verification
5. **Documentation**: Complete service account setup guide

---

## Key Decisions

### Architecture Decisions

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Service Account (not OAuth) | Automated workflows need unattended access | Simpler auth, no user interaction |
| Package benefits as boolean flags | Flexible checkbox system for admin UI | Easy to add new benefits without schema changes |
| Cached logos in Supabase Storage | Don't hit Drive API on every page load | Fast public Partners page, Drive as backup |
| Google Sheets for tracking | Marketing team needs spreadsheet view | Familiar tool, no custom reporting UI needed |
| Deprecate old sponsors table | v1.2 introduces new invoice-based workflow | Keep for historical data, new sponsors use invoices |
| 90-day upload token expiration | Balance security with sponsor convenience | Enough time for busy sponsors, not open-ended |

### Technical Decisions

| Decision | Rationale |
|----------|-----------|
| `googleapis` package | Official Google APIs Node.js client, well-maintained |
| Crypto-secure UUID tokens | `crypto.randomUUID()` for upload form security |
| Drive folder naming: `{Company} - {Invoice ID}` | Unique, sortable, maps to database |
| Sheets row index stored in database | Fast updates without searching every time |
| Package folders auto-created | No manual folder management needed |
| Graceful API failures | Sheets update failure doesn't break invoice creation |

---

## Database Schema

### New Table: sponsor_uploads

```sql
sponsor_uploads
├── id (UUID, PK)
├── invoice_id (UUID, FK → invoices)
├── upload_token (TEXT, unique)
├── company_name (TEXT)
├── package_id (UUID, FK → sponsorship_packages)
├── logo_url (TEXT, Supabase Storage)
├── website_url (TEXT)
├── drive_folder_id (TEXT, Google Drive)
├── drive_file_id (TEXT, Google Drive)
├── sheets_row_index (INTEGER)
├── status (TEXT: pending/completed/expired)
├── uploaded_at (TIMESTAMPTZ)
├── token_expires_at (TIMESTAMPTZ)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)
```

**Key indexes:**
- `upload_token` (unique, public form access)
- `invoice_id` (relationship queries)
- `status` (dashboard filtering)

### Altered Table: sponsorship_packages

**New columns:**
- `includes_website_benefit` (BOOLEAN) - Display on Partners page
- `includes_banner` (BOOLEAN) - Physical banner at events
- `includes_tshirt` (BOOLEAN) - Logo on t-shirts
- `includes_golf_sign` (BOOLEAN) - Golf tournament signage
- `includes_game_day` (BOOLEAN) - Game day booth/presence
- `description` (TEXT) - Package description for display

**Benefits mapping (seed data):**

| Package | Website | Banner | T-shirt | Golf | Game Day | Cost |
|---------|---------|--------|---------|------|----------|------|
| Championship | ✓ | ✓ | ✓ | ✓ | | $3,500 |
| Website Only | ✓ | | | | | $600 |
| Game Day | | | | | ✓ | $750 |
| Academy T-shirt | | | ✓ | | | $500 |

---

## Google Drive Structure

```
RiseUp Sponsors/ (root, shared with service account)
├── Championship Package/
│   ├── Company A - inv_abc123/
│   │   └── logo.png
│   └── Company B - inv_def456/
│       └── logo.svg
├── Website Only Package/
│   └── Company C - inv_ghi789/
│       └── logo.jpg
├── Game Day Package/
└── Rise Up Academy t-shirt/
```

**Folder creation:**
- Package folders auto-created on first use
- Sponsor folders created by webhook on payment
- Naming convention ensures uniqueness

---

## Google Sheets Structure

**Spreadsheet: "RiseUp Sponsor Tracking"**

| Company Name | Package | Invoice ID | Amount | Payment Date | Upload Status | Drive Folder | Website URL | Created Date |
|--------------|---------|------------|--------|--------------|---------------|--------------|-------------|--------------|
| Acme Corp | Championship | inv_123 | $3,500.00 | 2026-01-20 | Completed | [Link] | acme.com | 2026-01-20 |
| Widget Inc | Website Only | inv_456 | $600.00 | | Pending | [Link] | | 2026-01-21 |

**Update lifecycle:**
1. **Row appended** - Invoice creation (Phase 9)
2. **Payment date updated** - Webhook on payment (Phase 10)
3. **Upload status + Website URL** - Upload form submission (Phase 11)

---

## Integration Flow

```mermaid
sequenceDiagram
    Admin->>Database: Create invoice (Phase 9)
    Database->>Sheets: Append row with invoice details
    
    Sponsor->>Stripe: Pay invoice
    Stripe->>Webhook: invoice.paid event
    Webhook->>Drive: Create sponsor folder
    Webhook->>Database: Insert sponsor_upload record
    Webhook->>Sheets: Update payment date
    Webhook->>Email: Send upload form link
    
    Sponsor->>Upload Form: Submit logo + website (Phase 11)
    Upload Form->>Drive: Upload logo to folder
    Upload Form->>Storage: Cache logo in Supabase
    Upload Form->>Database: Mark upload completed
    Upload Form->>Sheets: Update upload status
    
    Public->>Partners Page: View sponsors (Phase 12)
    Partners Page->>Database: Query paid sponsors with website benefit
    Partners Page->>Storage: Fetch cached logos
```

---

## Environment Variables

```bash
# Service Account Authentication
GOOGLE_SERVICE_ACCOUNT_EMAIL=riseup-sponsor@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Drive & Sheets IDs
GOOGLE_DRIVE_ROOT_FOLDER_ID=1abc123xyz456
GOOGLE_SHEETS_SPREADSHEET_ID=1def789uvw321
```

**Security:**
- Service account has Editor access ONLY to specific folder/spreadsheet
- Private key never committed to git
- Tokens use crypto-secure random generation

---

## Testing Strategy

### Validation Script Tests

1. ✓ Environment variables present
2. ✓ Drive authentication successful
3. ✓ Can create folders in Drive
4. ✓ Can upload files to Drive
5. ✓ Sheets authentication successful
6. ✓ Can append/update rows in Sheets

**Run:** `npm run validate:google`

### Manual Testing

After setup:
- [ ] Service account email has Drive folder access
- [ ] Service account email has Spreadsheet access
- [ ] Test folder appears in Drive
- [ ] Test row appears in Sheets
- [ ] Package benefit flags visible in database

---

## Migration Strategy

### Handling Old Sponsors Table

**Keep for historical data:**
- Old `sponsors` table remains (approved sponsors from v1)
- Partners page will use UNION query (Phase 12)
- No data migration needed
- New sponsors use invoice workflow

**Rationale:**
- Don't lose existing sponsor relationships
- Clean separation between old (free submission) and new (paid packages)
- Simpler than migrating old sponsors to invoice system

---

## Error Handling

### Google API Failures

**Strategy: Graceful degradation**

```typescript
try {
  await appendSponsorRow(data);
} catch (error) {
  console.error('Sheets update failed:', error);
  // Log error but don't fail invoice creation
  // Admin can manually sync later
}
```

**Why:**
- Google API is external dependency (can fail)
- Invoice creation is critical (must succeed)
- Sheets is reporting tool (not source of truth)
- Database is source of truth

### Token Expiration

- 90-day window for sponsor uploads
- Status automatically set to 'expired' on form access attempt
- Admin can manually extend by updating `token_expires_at`

---

## Dependencies

**NPM Packages:**
- `googleapis` (v134+) - Official Google APIs client
- `tsx` (already installed) - Run TypeScript scripts
- `zod` (already installed) - Validation schemas

**External Services:**
- Google Cloud project with APIs enabled
- Service account with Drive/Sheets access
- Root Drive folder shared with service account
- Spreadsheet shared with service account

---

## Blocking Relationships

**Phase 8 blocks:**
- Phase 9 (Invoice Management UI) - Needs Sheets client for row creation
- Phase 10 (Payment Webhook) - Needs Drive client for folder creation
- Phase 11 (Upload Form) - Needs sponsor_uploads table and Drive client
- Phase 12 (Sponsor Display) - Needs sponsor_uploads and package benefits
- Phase 13 (Dashboard) - Needs sponsor_uploads table for metrics

**Phase 8 depends on:**
- Phase 5 (Public Sponsorship Page) - Completed ✓
- Existing: `invoices` and `sponsorship_packages` tables

---

## Future Enhancements

**Not in Phase 8 scope:**
- Logo approval workflow (admin review before public display)
- Automated logo caching from Drive to Storage (webhook-based)
- Historical package switching (sponsor changes package type)
- Bulk upload token regeneration
- Drive folder permissions management (sharing)

**Why deferred:**
- v1.2 focuses on core workflow automation
- Can add without breaking changes
- User feedback will inform priorities

---

## Success Metrics

Phase 8 complete when:
- [x] All 3 plans executed
- [x] Migration applied successfully
- [x] Validation script passes 100%
- [x] Documentation complete
- [x] Admin can configure service account independently

---

*Context established: 2026-01-23*
