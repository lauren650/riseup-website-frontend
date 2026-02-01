-- Migration: Update Sponsorship Packages
-- Description: Update sponsorship packages with new 2026 offerings
-- Date: 2026-02-01

-- Clear existing packages
TRUNCATE TABLE sponsorship_packages CASCADE;

-- Insert updated sponsorship packages based on 2026 fundraising plan
INSERT INTO sponsorship_packages (name, cost, closing_date, total_slots, available_slots, description, benefits) VALUES
  (
    'RiseUp Champion Sponsor',
    500000, -- $5,000
    '2026-07-31',
    4,
    4,
    'Elite partnership for maximum visibility and engagement',
    ARRAY[
      'Logo on tackle & flag football t-shirts',
      'Prominent website logo placement',
      'Banner display at all games',
      'Sign at golf tournament (sponsor hole)',
      '4-person team for 2026 golf tournament',
      'Exclusive sponsor for longest drive hole contest (4 contests available)'
    ]
  ),
  (
    'Jamboree Presenting Sponsor',
    500000, -- $5,000
    '2026-07-31',
    1,
    1,
    'Exclusive presenting sponsor for season jamboree',
    ARRAY[
      'Logo on tackle & flag football t-shirts',
      'Prominent website logo placement',
      'Banner display at all games',
      'T-sign at golf tournament',
      'Exclusive "Jamboree Presenting Sponsor" title and recognition'
    ]
  ),
  (
    'Girls Flag Championship Title Sponsor',
    500000, -- $5,000
    '2026-07-31',
    1,
    1,
    'Exclusive title sponsor for girls flag football championship',
    ARRAY[
      'Logo on tackle & flag football t-shirts',
      'Prominent website logo placement',
      'Banner display at all games',
      'T-sign at golf tournament',
      'Exclusive naming rights for Girls Flag Championship',
      'Your company name featured on championship shirts'
    ]
  ),
  (
    'Blue Level Sponsor',
    350000, -- $3,500
    '2026-07-31',
    12,
    12,
    'Premium visibility across programs and events',
    ARRAY[
      'Logo on tackle & flag football t-shirts',
      'Website logo placement',
      'Banner display at all games',
      'Sign at golf tournament'
    ]
  ),
  (
    'Red Level Sponsor',
    100000, -- $1,000
    '2026-07-31',
    8,
    8,
    'Core partnership with digital and apparel presence',
    ARRAY[
      'Logo on tackle & flag football t-shirts',
      'Website logo placement'
    ]
  ),
  (
    'Digital Supporter Sponsor',
    60000, -- $600
    NULL, -- Year-round, can prorate
    18,
    18,
    'Year-round digital presence for your brand',
    ARRAY[
      'Logo on website sponsors section',
      'Link to your website or social media',
      'Year-round visibility (can be prorated)'
    ]
  ),
  (
    'Game Day Sponsor',
    75000, -- $750
    '2026-07-31',
    13,
    13,
    'Game day brand exposure and engagement',
    ARRAY[
      'Banner display at games',
      'PA announcements during games',
      'Social media recognition on game days'
    ]
  ),
  (
    'Academy Sponsor',
    50000, -- $500
    '2026-02-18',
    18,
    18,
    'Support off-season youth development',
    ARRAY[
      'Logo on Rise Up Academy t-shirts',
      'Recognition at academy sessions',
      'Certificate of appreciation'
    ]
  )
ON CONFLICT DO NOTHING;

-- Add helpful comment about social media
COMMENT ON TABLE sponsorship_packages IS 'All sponsors receive social media shout-outs when they sign up, featuring their logo with a thank you message (Brittany creates template posts)';
