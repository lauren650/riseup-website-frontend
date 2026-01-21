-- Migration: 006_package_display
-- Description: Add display fields to sponsorship_packages for public sponsorship page
-- Created: 2026-01-20

-- ============================================================================
-- ADD DISPLAY COLUMNS TO SPONSORSHIP_PACKAGES
-- ============================================================================
-- description: Short tagline for pricing table display
-- benefits: Array of benefit strings for checklist display

ALTER TABLE sponsorship_packages
ADD COLUMN description TEXT,
ADD COLUMN benefits TEXT[];

-- ============================================================================
-- UPDATE EXISTING PACKAGES WITH DISPLAY CONTENT
-- ============================================================================

-- T-shirt package ($3500)
UPDATE sponsorship_packages
SET description = 'Premium visibility across all programs',
    benefits = ARRAY[
      'Logo on tackle & flag t-shirts',
      'Website logo placement',
      'Banner at all games',
      'Golf tournament sign'
    ]
WHERE name = 'T-shirt (tackle & flag), website, banner, golf tournament sign';

-- Website only package ($600)
UPDATE sponsorship_packages
SET description = 'Digital presence for your brand',
    benefits = ARRAY[
      'Logo on website sponsors section',
      'Link to your website'
    ]
WHERE name = 'Website only logo';

-- Game day package ($750)
UPDATE sponsorship_packages
SET description = 'Game day brand exposure',
    benefits = ARRAY[
      'Banner display at games',
      'PA announcements',
      'Social media mentions'
    ]
WHERE name = 'Game day package';

-- Academy t-shirt package ($500)
UPDATE sponsorship_packages
SET description = 'Support youth development',
    benefits = ARRAY[
      'Logo on Rise Up Academy t-shirts',
      'Certificate of appreciation'
    ]
WHERE name = 'Rise Up Academy t-shirt';
