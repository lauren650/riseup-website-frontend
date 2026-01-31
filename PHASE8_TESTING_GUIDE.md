# Phase 8 Testing Guide

## ✅ **What We Built**

Phase 8 created the database foundation and core services for the v1.2 Sponsor Management Redesign:

1. **Database Schema**: New `sponsor_uploads` table + flexible package benefits
2. **Google Drive Integration**: Upload sponsor logos to organized folders
3. **Google Sheets Integration**: Track sponsorship data in spreadsheets
4. **Validation**: Type-safe schemas and setup verification tools

---

## 🧪 **How to Test Phase 8**

### **Test 1: Run Automated Test Suite** ✅

```bash
npm run test:phase8
```

**Expected Output:**
- ✅ All files created
- ✅ googleapis package installed
- ✅ TypeScript compiles
- ⚠️ Google credentials not configured (this is OK for now!)

**Status:** ✅ PASSED

---

### **Test 2: Verify Database Migration**

#### **Step 1: Open Supabase SQL Editor**
1. Go to https://supabase.com
2. Open your RiseUp project
3. Click "SQL Editor" in left sidebar

#### **Step 2: Run Test Queries**
Copy and paste from `TEST_PHASE8_MIGRATION.sql`:

```sql
-- Test if sponsor_uploads table exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'sponsor_uploads'
) AS sponsor_uploads_exists;
```

**Expected Result:** `true`

```sql
-- Test if package benefit columns exist
SELECT EXISTS (
  SELECT 1 FROM information_schema.columns 
  WHERE table_name = 'sponsorship_packages' 
  AND column_name = 'includes_website_benefit'
) AS benefit_columns_exist;
```

**Expected Result:** `true`

```sql
-- View sponsorship packages with benefits
SELECT 
  name,
  cost / 100 as price_dollars,
  includes_website_benefit,
  includes_banner,
  includes_tshirt,
  includes_golf_sign,
  includes_game_day,
  description
FROM sponsorship_packages
ORDER BY cost DESC;
```

**Expected Result:** 4 packages with checkboxes for benefits filled in

---

### **Test 3: Check TypeScript Types**

After migration is applied, regenerate types:

```bash
npx supabase gen types typescript --linked > src/lib/supabase/types.ts
```

Or manually in Supabase:
1. Go to Project Settings > API
2. Copy the TypeScript types
3. Update `src/lib/supabase/types.ts`

**Verify** the following types exist:
- `Database['public']['Tables']['sponsor_uploads']`
- `sponsorship_packages` has new benefit fields

---

### **Test 4: Google Integration Setup (Optional)**

If you want to test Google Drive/Sheets now:

#### **Step 1: Follow Setup Guide**
See `docs/GOOGLE_SETUP_GUIDE.md` for detailed instructions

#### **Step 2: Add Environment Variables**
In Supabase Dashboard > Project Settings > Environment Variables:
```
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@...
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
GOOGLE_DRIVE_ROOT_FOLDER_ID=your-folder-id
GOOGLE_SHEETS_SPREADSHEET_ID=your-sheet-id
```

#### **Step 3: Run Validation**
```bash
npm run validate:google
```

**Expected Output:**
- ✅ All environment variables set
- ✅ Can authenticate with Google
- ✅ Can access Drive folder
- ✅ Can access spreadsheet

---

## 📋 **Phase 8 Testing Checklist**

### **Code & Dependencies**
- [x] All Phase 8 files created
- [x] `googleapis` package installed
- [x] TypeScript compiles without errors
- [x] Test suite runs successfully

### **Database (To Complete)**
- [ ] Run `APPLY_PHASE8_MIGRATION.sql` in Supabase SQL Editor
- [ ] Verify `sponsor_uploads` table exists
- [ ] Verify benefit columns added to `sponsorship_packages`
- [ ] Regenerate TypeScript types

### **Google Integration (Optional - Can Do Later)**
- [ ] Create Google Cloud project
- [ ] Enable Drive & Sheets APIs
- [ ] Create service account
- [ ] Add environment variables
- [ ] Run `npm run validate:google`

---

## 🎯 **Success Criteria**

Phase 8 is **COMPLETE** when:

✅ **Code Complete:**
- [x] All files created and compile
- [x] Test suite passes
- [x] No TypeScript errors

🔄 **Database Pending:**
- [ ] Migration applied to Supabase
- [ ] Types regenerated

⏭️ **Google Optional:**
- Can be set up anytime before deploying sponsor upload feature
- Not required to proceed to Phase 9

---

## 🚀 **Next Steps**

### **Option 1: Complete Phase 8 Now** (Recommended)
1. **Apply Migration:** Run `APPLY_PHASE8_MIGRATION.sql` in Supabase SQL Editor
2. **Regenerate Types:** Update TypeScript types from Supabase
3. **Mark Phase 8 Complete:** Ready for Phase 9!

### **Option 2: Skip Database for Now**
- Proceed to Phase 9 (Invoice Management UI)
- Apply migration later when needed
- Google setup can happen anytime

### **Option 3: Full Google Setup**
- Follow `docs/GOOGLE_SETUP_GUIDE.md`
- Test with `npm run validate:google`
- Ready for end-to-end sponsor upload testing

---

## 📊 **Current Status**

| Component | Status | Notes |
|-----------|--------|-------|
| Code Files | ✅ Complete | All TypeScript files created |
| Dependencies | ✅ Complete | googleapis installed |
| TypeScript | ✅ Complete | Compiles without errors |
| Test Suite | ✅ Complete | `npm run test:phase8` passes |
| Migration | ⏳ Pending | Use `APPLY_PHASE8_MIGRATION.sql` |
| Type Generation | ⏳ Pending | After migration applied |
| Google Setup | ⏭️ Optional | Not required yet |

**Phase 8 Code:** ✅ **COMPLETE**  
**Phase 8 Database:** ⏳ **Pending** (1 SQL script to run)  
**Phase 8 Google:** ⏭️ **Optional** (can do later)

---

## 💡 **Tips**

- **Migration is quick:** Just copy/paste SQL in Supabase dashboard
- **Google setup takes ~15 min:** But not needed until you deploy sponsor uploads
- **Ready for Phase 9:** Can proceed with or without migration applied

**Recommended:** Apply the migration now (2 minutes), then move to Phase 9!
