# Editable Text Component Guide

## Overview
The `EditableText` component has been updated to properly load and save content from the database. All text on the Tackle Football page is now fully editable when in editing mode.

## Recent Fixes

### 1. **Database Loading Issue (FIXED)**
**Problem:** Changes were saving to the database but not loading when the page refreshed.

**Solution:** Updated the `EditableText` component to automatically fetch saved content from the database on mount. Now when you:
- Make an edit → It saves to the database ✅
- Refresh the page → It loads the saved content ✅

### 2. **Text Box Sizing**
**Problem:** Fixed textarea size for all content.

**Solution:** 
- Textareas now **auto-calculate the optimal number of rows** based on content length
- You can **manually resize** textareas by dragging the bottom-right corner
- Minimum height: 80px
- Maximum auto-calculated rows: 15
- The textarea uses `resize-y` (vertical resize only) for better control

### 3. **Clearing/Deleting Text**
**Problem:** No way to delete or clear text areas.

**Solution:** Added a **"Clear" button** that appears when hovering over editable text in edit mode:
- Hover over any editable text in edit mode
- Click the red "Clear" button in the top-right corner
- The text area opens with empty content
- Click elsewhere or press Enter to save the empty state

## How to Use

### Editing Text
1. **Enable Edit Mode** (toggle in admin panel)
2. **Hover** over any text - you'll see a dashed outline
3. **Click** the text to start editing
4. **Make your changes** in the input/textarea
5. **Save**: 
   - Press `Enter` (or `Shift+Enter` for new lines in textarea)
   - Click outside the text box
6. Changes save automatically to the database

### Clearing Text
1. **Enable Edit Mode**
2. **Hover** over the text you want to clear
3. **Click the "Clear" button** (red button, top-right)
4. The text box opens empty
5. **Save** to confirm deletion

### Resizing Textareas
- **Automatic**: The textarea auto-sizes based on content length
- **Manual**: Drag the bottom-right corner to resize in **both directions** (horizontal and vertical)
- **Minimum size**: 200px width, 80px height
- **Help text**: Shows keyboard shortcuts at the bottom

## Keyboard Shortcuts

- `Enter` - Save changes (single-line inputs)
- `Shift+Enter` - New line (in textareas, doesn't save)
- `Escape` - Cancel editing and revert changes
- Click outside - Save changes

## Error Handling

The component now includes:
- **Save errors** display as red notifications below the field
- **Auto-retry** on network errors
- **Revert on failure** - your edits won't be lost if save fails
- **Loading states** - shows "Saving..." while processing

## Component Properties

```typescript
<EditableText
  contentKey="tackle.overview.title"  // Unique database key
  as="span"                           // HTML element (span, p, h1-h4, div)
  page="tackle-football"              // Page identifier
  section="overview"                  // Section identifier
  className="text-white font-bold"    // Tailwind classes
>
  Default text content here
</EditableText>
```

## Content Keys

All tackle football page content uses the pattern:
```
tackle.{section}.{field}
```

Examples:
- `tackle.overview.title` - "2025 Season Overview"
- `tackle.registration.scholarship_intro` - Scholarship intro paragraph
- `tackle.equipment.item_helmet` - "Helmet (properly fitted for safety)"
- `tackle.cta.register_button` - "Register Now" button text

## Database Structure

Content is stored in the `site_content` table:
```sql
{
  content_key: "tackle.overview.title",
  content_type: "text",
  content: { text: "2025 Season Overview" },
  page: "tackle-football",
  section: "overview"
}
```

## Authentication Requirements

- You must be **logged in** to edit content
- The save action checks `auth.role() = 'authenticated'`
- Public users can only **read** content (RLS policy enforced)

## Tips

1. **Test your edits**: Always refresh the page after editing to confirm changes persisted
2. **Be careful with Clear**: Clearing creates an empty field in the database (can be edited again)
3. **Long text**: Use `as="p"` or `as="div"` for paragraphs - they get textareas automatically
4. **Short text**: Use `as="span"` for buttons and titles - they get single-line inputs
5. **Formatting**: HTML tags in content are preserved (like `<strong>`, `<br />`)

## Troubleshooting

### Changes not saving?
- Check browser console for errors
- Verify you're logged in (check auth state)
- Look for red error notification below the field
- Check network tab for failed requests

### Text not loading from database?
- Clear browser cache and refresh
- Check the database directly in Supabase dashboard
- Verify the `content_key` matches exactly

### Can't click to edit?
- Make sure Edit Mode is enabled
- Check that you're logged in
- Try refreshing the page

### Textarea too small/large?
- It auto-sizes, but you can manually drag to resize
- Or adjust the `calculateRows()` logic in the component

## Future Enhancements

Potential improvements:
- Rich text editing (bold, italic, links)
- Undo/redo functionality
- Version history UI
- Bulk editing mode
- Import/export content
- Content preview before save
