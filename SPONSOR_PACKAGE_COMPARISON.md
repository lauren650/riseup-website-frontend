# Sponsorship Package Comparison

## 2026 Updated Packages

| Package Name | Cost | Available | Closing Date | Key Benefits |
|-------------|------|-----------|--------------|--------------|
| **RiseUp Champion Sponsor** | $5,000 | 4 | July 31, 2026 | T-shirts, website, banner, golf sign + 4-person team + longest drive contest sponsor |
| **Jamboree Presenting Sponsor** | $5,000 | 1 | July 31, 2026 | T-shirts, website, banner, golf T-sign + exclusive jamboree title |
| **Girls Flag Championship Title Sponsor** | $5,000 | 1 | July 31, 2026 | T-shirts, website, banner, golf T-sign + championship naming rights + name on shirts |
| **Blue Level Sponsor** | $3,500 | 12 | July 31, 2026 | T-shirts, website, banner, golf sign |
| **Red Level Sponsor** | $1,000 | 8 | July 31, 2026 | T-shirts + website |
| **Digital Supporter Sponsor** | $600 | 18 | Year-round | Website logo + link (can prorate) |
| **Game Day Sponsor** | $750 | 13 | July 31, 2026 | Banner, PA announcements, social media |
| **Academy Sponsor** | $500 | 18 | Feb 18, 2026 | Academy t-shirts + recognition |

**Total Potential Revenue**: $109,550 (if all slots filled at internal cost)

---

## Previous Packages (Legacy)

| Package Name | Cost | Available | Closing Date | Key Benefits |
|-------------|------|-----------|--------------|--------------|
| T-shirt (tackle & flag), website, banner, golf tournament sign | $3,500 | 18 | July 31, 2026 | T-shirts, website, banner, golf sign |
| Website only logo | $600 | 15 | Year-round | Website logo + link |
| Game day package | $750 | 13 | July 31, 2026 | Banner, PA, social media |
| Rise Up Academy t-shirt | $500 | 18 | Feb 18, 2026 | Academy t-shirts |

---

## What's New?

### ✅ Added Premium Tiers
- **3 new $5,000 packages** with exclusive benefits and increased visibility
- Differentiated high-value sponsors with unique naming opportunities

### ✅ Improved Mid-Tier Options
- **Blue Level ($3,500)**: Maintained the original premium package
- **Red Level ($1,000)**: New mid-tier option for businesses wanting t-shirt presence without full premium cost

### ✅ Better Package Names
- Replaced generic descriptions with branded tier names (Champion, Blue Level, Red Level, etc.)
- Makes it easier for sponsors to understand positioning

### ✅ Enhanced Benefits
- Golf tournament teams included in Champion sponsor
- Exclusive contest sponsorships (longest drive)
- Championship title sponsorships for special events
- Clearer benefit descriptions

### ✅ Maintained Popular Options
- Digital Supporter ($600) - year-round, can prorate
- Game Day Sponsor ($750) - unchanged
- Academy Sponsor ($500) - unchanged

---

## Package Distribution Strategy

### Premium ($5,000) - 6 total slots
- **4x RiseUp Champion Sponsors** - Maximum visibility + golf perks
- **1x Jamboree Presenting Sponsor** - Exclusive jamboree title
- **1x Girls Flag Championship Title Sponsor** - Exclusive championship title

### Mid-Tier ($1,000 - $3,500) - 20 total slots
- **12x Blue Level Sponsors** - Traditional premium package
- **8x Red Level Sponsors** - New accessible mid-tier

### Entry-Level ($500 - $750) - 44 total slots
- **18x Digital Supporter Sponsors** - Year-round, flexible
- **13x Game Day Sponsors** - Event-focused
- **18x Academy Sponsors** - Off-season support (closes early)

**Total Available Slots: 70 sponsors**

---

## Social Media Benefit (All Packages)

Every sponsor receives:
- Social media shout-out upon signup
- Logo featured in thank-you post
- Template created by Brittany for consistency

---

## Implementation Notes

1. **Database**: All packages stored in `sponsorship_packages` table with PostgreSQL
2. **Frontend**: Automatically displays on `/become-a-partner` page
3. **Sorting**: Packages display lowest-to-highest cost on website
4. **Filtering**: Past closing dates automatically hidden from public view
5. **Slot Management**: Available slots decrement automatically when sponsors sign up
