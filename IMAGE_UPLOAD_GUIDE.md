# Image Upload Guide - Tackle Football Page

## ✅ Setup Complete!

Your Tackle Football page now has **editable images** that you can upload and replace through the admin panel!

## 📸 Images on the Page

### 1. **Hero Image** (Top banner)
- **Location**: Top of page
- **Content Key**: `tackle_football.hero`
- **Current**: Editable through admin
- **File**: `/images/tackle-football-hero.jpg`

### 2. **Registration Day Image**
- **Location**: "How to Register" section
- **Content Key**: `tackle.registration.how_to_image`
- **Current**: Placeholder (dark blue with red text)
- **File**: `/images/registration-day.jpg`

### 3. **Equipment Fitting Image**
- **Location**: "What RiseUp Provides" section
- **Content Key**: `tackle.equipment.provides_image`
- **Current**: Placeholder (dark blue with red text)
- **File**: `/images/equipment-fitting.jpg`

### 4. **Practice Action Image**
- **Location**: "Weekly Practice Schedule" section
- **Content Key**: `tackle.schedule.practice_image`
- **Current**: Placeholder (dark blue with red text)
- **File**: `/images/practice-action.jpg`

---

## 🎨 How to Upload & Replace Images

### Method 1: Through Admin Panel (Recommended)

1. **Log in to Admin** at `/admin/login`
2. **Navigate** to the Tackle Football page at `/tackle-football`
3. **Enable Edit Mode** (toggle in the header)
4. **Hover over any image** - you'll see a camera icon overlay
5. **Click the image** to open file picker
6. **Select your new image** (JPG, PNG, WebP, or GIF - max 5MB)
7. **Wait for upload** - you'll see a progress bar
8. **Done!** The image is now saved and will show for all visitors

### Method 2: Manual File Replacement

1. **Prepare your image** (recommended: 800x600px or similar aspect ratio)
2. **Rename** to match one of the filenames above
3. **Place in folder**: `/public/images/`
4. **Refresh** the page

---

## 📋 Image Requirements

- **Formats**: JPG, PNG, WebP, or GIF
- **Max Size**: 5MB per image
- **Recommended Dimensions**: 800x600px (or 4:3 ratio)
- **Content**: High quality, relevant to section

---

## 🗄️ Where Images are Stored

### Admin-Uploaded Images
- Stored in: **Supabase Storage** (`site-images` bucket)
- Database: **`content` table** with type `image`
- Permanent URLs that won't break

### Manual Images
- Stored in: `/public/images/` folder
- Served directly by Next.js
- Need to be committed to Git

---

## 🔧 Technical Details

### New Component Created
`PhotoContentBlockEditable` - A wrapper around `PhotoContentBlock` that adds:
- Image upload functionality
- Hover overlays in edit mode
- Progress indicators
- Error handling
- Database persistence

### Content Keys
Each image has a unique content key for database storage:
- `tackle.registration.how_to_image`
- `tackle.equipment.provides_image`
- `tackle.schedule.practice_image`

These keys ensure images are properly saved and retrieved.

---

## 💡 Tips

1. **Use high-quality images** - they represent your brand
2. **Optimize before upload** - compress images to reduce file size
3. **Test on mobile** - images should look good on all devices
4. **Keep aspect ratios consistent** - images are 4:3 ratio by default
5. **Use descriptive filenames** - helps with organization

---

## 🚨 Troubleshooting

### "Storage bucket not set up" error?
You need to create a `site-images` bucket in your Supabase dashboard:
1. Go to Supabase Dashboard > Storage
2. Create new bucket: `site-images`
3. Make it **public**
4. Try uploading again

### Image not showing?
- Check browser console for errors
- Verify file size is under 5MB
- Make sure you're in edit mode
- Try refreshing the page

### Can't upload in admin mode?
- Verify you're logged in as admin
- Check that edit mode toggle is ON
- Ensure Supabase connection is working

---

## 📝 Notes

- Placeholder images are SVG-based and show "Upload your image in admin mode"
- Original filenames don't matter - images are renamed on upload
- Old images are NOT automatically deleted (saves storage history)
- Images persist across deployments when using Supabase Storage

---

Need help? Contact the development team or check the admin documentation.
