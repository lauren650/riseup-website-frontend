# Pitfalls Research: Sponsor Management v1.2

**Research Date:** 2026-01-23
**Milestone:** v1.2 Sponsor Management Redesign
**Focus:** Common mistakes when adding Google Drive integration, upload workflows, and invoice management

## Pitfall 1: Google Drive API Rate Limits

**Mistake:** Making Drive API calls on every page load or user request.

**Impact:** 
- 1,000 queries per 100 seconds per user limit
- 10,000 queries per 100 seconds per project limit
- Exceeding limits causes 403 errors and blocked requests

**Warning Signs:**
- Slow Partners page load times
- Intermittent "Rate limit exceeded" errors
- Multiple Drive API calls in server logs for same data

**Prevention Strategy:**
- Cache logo URLs in database after first fetch
- Use Supabase Storage as CDN (copy from Drive after upload)
- Batch Drive operations (folder creation, uploads) during webhook
- Never fetch from Drive on public page renders

**Which Phase:** Phase 5 (Conditional Display) - implement caching strategy.

---

## Pitfall 2: Service Account Permissions Misconfiguration

**Mistake:** Service account doesn't have access to target Drive folder/Spreadsheet.

**Impact:**
- 404 "File not found" errors even though folder exists
- 403 "Permission denied" errors when uploading
- Operations fail silently with no clear error message

**Warning Signs:**
- Successful folder creation but can't upload files
- Can't read/write to specified spreadsheet
- Different behavior in development vs production

**Prevention Strategy:**
- Share Drive root folder with service account email (editor permission)
- Share target spreadsheet with service account email (editor permission)
- Test with minimal example (create folder, upload file) before integration
- Log service account email on first API call to verify correct credentials
- Store folder/sheet IDs in environment variables, validate at startup

**Which Phase:** Phase 1 (Database & Core Services) - validate during Google Drive client setup.

---

## Pitfall 3: Webhook Idempotency Failures

**Mistake:** Processing same webhook event multiple times (Stripe retries on failures).

**Impact:**
- Duplicate folders created in Google Drive
- Duplicate rows in Google Sheets
- Multiple emails sent to sponsor
- Upload token generated multiple times (different tokens for same invoice)

**Warning Signs:**
- Multiple folders with same sponsor name in Drive
- Duplicate rows in tracking spreadsheet
- Sponsors report receiving multiple emails

**Prevention Strategy:**
- Check `webhook_events` table BEFORE processing (already exists in v1.1)
- Use database transaction for webhook processing
- Make Google Drive folder creation idempotent (check if exists first)
- Google Sheets: track row index in database, update instead of append if exists
- Test by manually triggering duplicate webhooks

**Which Phase:** Phase 3 (Payment Webhook Enhancement) - implement before any Drive/Sheets calls.

---

## Pitfall 4: Upload Token Security Vulnerabilities

**Mistake:** Predictable tokens, no expiration, or reusable after completion.

**Impact:**
- Attackers can guess tokens and upload malicious files
- Old tokens remain valid indefinitely (security risk)
- Sponsors can repeatedly upload, overwriting previous files

**Warning Signs:**
- Unauthorized uploads appearing in Drive
- Sponsors uploading multiple times accidentally
- Token enumeration attempts in server logs

**Prevention Strategy:**
- Generate cryptographically secure tokens (crypto.randomUUID() or randomBytes)
- Set expiration date (90 days recommended)
- Validate token on upload form load (check expiration, used status)
- Mark token as used after successful upload (prevent reuse)
- Rate-limit upload endpoint (max 5 attempts per token)

**Which Phase:** Phase 4 (Upload Form) - implement before public deployment.

---

## Pitfall 5: Large File Upload Failures

**Mistake:** No file size limits, timeout on slow connections, memory issues.

**Impact:**
- Server crashes on 50MB+ file uploads
- Upload endpoint times out (Next.js 60s limit)
- Out-of-memory errors in serverless environment

**Warning Signs:**
- Failed uploads with no error message
- 504 timeout errors
- Lambda/Vercel function memory exceeded logs

**Prevention Strategy:**
- Client-side validation: max 2MB file size, image types only (PNG/JPG/SVG)
- Server-side validation: double-check file size and MIME type
- Use streaming upload to Drive (don't buffer entire file in memory)
- Consider direct client → Drive upload for files >5MB (future enhancement)
- Set explicit timeout on server action (throw error after 30s)

**Which Phase:** Phase 4 (Upload Form) - validate before submission, implement server checks.

---

## Pitfall 6: Race Conditions in Invoice Status Updates

**Mistake:** Webhook updates invoice status while admin is viewing/editing.

**Impact:**
- Admin sees stale data (invoice shows "open" but actually paid)
- Admin voids invoice that was just paid
- Sponsor completes upload but invoice still shows "pending upload"

**Warning Signs:**
- Dashboard shows incorrect invoice counts
- Admin reports data "changing unexpectedly"
- Invoices stuck in wrong status

**Prevention Strategy:**
- Use database timestamps (updated_at) to detect stale data
- Implement optimistic locking (check updated_at on UPDATE)
- Auto-refresh dashboard every 30s or use server-sent events
- Show warning if admin tries to void recently-updated invoice
- Make invoice list read-only after finalization

**Which Phase:** Phase 2 (Invoice Management UI) - add timestamps and refresh logic.

---

## Pitfall 7: Google Sheets Row Index Desync

**Mistake:** Storing row index in database but rows get manually deleted/reordered in Sheets.

**Impact:**
- Updates write to wrong row (overwrite other sponsor's data)
- Dashboard shows incorrect upload status
- Can't find sponsor row to update after upload

**Warning Signs:**
- Row updates affecting wrong sponsors
- "Row not found" errors when updating
- Manual Sheet edits breaking automation

**Prevention Strategy:**
- Store Invoice ID in Sheets column A (hidden or leftmost)
- Always search by Invoice ID before updating (don't trust cached row index)
- Use `spreadsheets.values.update` with A1 notation after search
- Consider appending new rows only (no updates) if search is complex
- Document in Sheets: "Do NOT delete rows - automation relies on them"

**Which Phase:** Phase 1 (Database & Core Services) - implement search-before-update in Sheets module.

---

## Pitfall 8: Conditional Display Logic Edge Cases

**Mistake:** Hardcoding package name checks, not handling missing data gracefully.

**Impact:**
- Sponsors who paid don't appear on Partners page
- Sponsors who shouldn't appear (no website benefit) show up anyway
- Broken images or missing URLs on public page

**Warning Signs:**
- Paid sponsors report "we're not on the Partners page"
- Wrong sponsors appearing (packages without website benefit)
- Console errors on Partners page load

**Prevention Strategy:**
- Use explicit boolean flag (`includes_website_benefit`) not name matching
- Null-check all fields (logo URL, website URL) before rendering
- Fallback to placeholder if logo missing
- Test with all package types (especially edge cases)
- Query JOIN sponsor_uploads to ensure upload exists

**Which Phase:** Phase 5 (Conditional Display) - add boolean flag in Phase 1 migration, implement null checks.

---

## Pitfall 9: Email Delivery Failures Going Unnoticed

**Mistake:** Not logging email failures, no retry mechanism, no admin notification.

**Impact:**
- Sponsor pays but never receives upload link
- Admin unaware that emails aren't sending
- Upload form never gets accessed, sponsor thinks something is wrong

**Warning Signs:**
- Sponsors contacting support: "I paid but didn't get the upload link"
- Low upload completion rate
- Email provider logs show high bounce rate

**Prevention Strategy:**
- Log all email attempts (success/failure) to database
- Store upload token in database immediately (even if email fails)
- Show upload link in admin dashboard (admin can manually forward if needed)
- Retry email send 3 times with exponential backoff
- Send admin notification if email fails after 3 attempts
- Build "resend upload link" button in admin UI

**Which Phase:** Phase 3 (Payment Webhook Enhancement) - implement email logging and fallback.

---

## Pitfall 10: Migrating Historical Sponsor Data

**Mistake:** Assuming old `sponsors` table workflow disappears, breaking existing partners.

**Impact:**
- Existing sponsors (pre-v1.2) don't appear on Partners page
- Two different sponsor management systems running in parallel
- Confusion about which system to use

**Warning Signs:**
- Partners page missing existing sponsors after v1.2 deploy
- Admin asking "where did the old sponsors go?"
- Historical sponsor logos broken

**Prevention Strategy:**
- Keep old `sponsors` table data intact (read-only)
- Display old sponsors alongside new invoice-driven sponsors
- Add `source` column to differentiate: "legacy" vs "v1.2"
- Create migration script (optional): convert old sponsors to invoice records
- Document: new sponsors use invoice workflow, old sponsors are grandfathered

**Which Phase:** Phase 5 (Conditional Display) - union query for old + new sponsors, separate rendering logic.

---

## Summary: Prevention Checklist

Before deploying each phase, verify:

- [ ] **Phase 1:** Service account has Drive/Sheets permissions, test folder creation
- [ ] **Phase 2:** Invoice UI shows timestamps, warns on stale data
- [ ] **Phase 3:** Webhook idempotency guards in place, email failures logged
- [ ] **Phase 4:** Token validation (expiration, single-use), file size limits enforced
- [ ] **Phase 5:** Logo caching (not Drive API on every page load), null checks, historical sponsors included
- [ ] **Phase 6:** Dashboard queries optimized, no N+1 queries

---
*Pitfalls research complete for v1.2 milestone*
