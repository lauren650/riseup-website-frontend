-- Email templates for admin-editable copy (partner/invoice/contact emails).
-- Placeholders use {{variableName}} and are replaced when sending; values are HTML-escaped.
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_body TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: only authenticated users (admins) can read/update
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read email_templates"
  ON email_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update email_templates"
  ON email_templates FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Seed defaults (placeholder-based). Omit INSERT if you prefer to seed from app on first load.
INSERT INTO email_templates (template_key, name, subject, html_body) VALUES
('upload_instructions', 'Upload instructions (after payment)', 'Upload Your Business Information – RiseUp Youth Football', '<h2>Thank you for your sponsorship!</h2>
<p>Hi {{companyName}},</p>
<p>Your payment has been received. To complete your partner profile and get your logo on our website, please upload your business information.</p>
<p><strong>Upload your logo and website link here:</strong></p>
<p><a href="{{uploadUrl}}" style="display:inline-block;background:#b72031;color:#fff;padding:12px 24px;text-decoration:none;border-radius:9999px;font-weight:600;">Upload Business Info</a></p>
<p>This link is unique to you and will expire in 90 days. If you need a new link, contact us.</p>
<br>
<p>Best regards,<br>RiseUp Youth Football</p>'),
('receipt', 'Sponsorship receipt', 'Receipt for Sponsorship – RiseUp Youth Football', '<h2>Receipt for Goods and Services</h2>
<p>Hi {{companyName}},</p>
<p>This confirms that RiseUp Youth Football has received your payment for the following:</p>
<p><strong>Description:</strong> {{packageName}} – RiseUp Youth Football Sponsorship</p>
<p><strong>Amount paid:</strong> {{amountFormatted}}</p>
<p><strong>Date:</strong> {{paidAtDate}}</p>
<p><strong>Invoice ID:</strong> {{stripeInvoiceId}}</p>
<p>You have received the goods and/or services described above. Thank you for supporting RiseUp Youth Football.</p>
<br>
<p>RiseUp Youth Football</p>'),
('sponsor_confirmation', 'Sponsor form confirmation', 'Sponsor Submission Received - RiseUp Youth Football', '<h2>Thank you for your sponsorship submission!</h2>
<p>Hi {{contactName}},</p>
<p>We''ve received your submission for <strong>{{companyName}}</strong>.</p>
<p>Our team will review your submission and you''ll see your logo on our Partners page shortly.</p>
<br>
<p>Best regards,<br>RiseUp Youth Football</p>'),
('sponsor_admin_notification', 'New sponsor (admin)', 'New Sponsor Submission: {{companyName}}', '<h2>New Sponsor Submission</h2>
<p><strong>Company:</strong> {{companyName}}</p>
<p><strong>Contact:</strong> {{contactName}}</p>
<p><strong>Email:</strong> <a href="mailto:{{contactEmail}}">{{contactEmail}}</a></p>
<p><strong>Phone:</strong> {{contactPhone}}</p>
<p><strong>Website:</strong> <a href="{{websiteUrl}}">{{websiteUrl}}</a></p>
<p><strong>Description:</strong> {{description}}</p>
<p><strong>Logo:</strong> <a href="{{logoUrl}}">View Logo</a></p>
<br>
<p><em>Review and approve this sponsor in the admin dashboard.</em></p>'),
('sponsor_interest_confirmation', 'Partner interest confirmation', 'Partner Interest Received - RiseUp Youth Football', '<h2>Thank you for your interest in partnering with RiseUp Youth Football!</h2>
<p>Hi {{name}},</p>
<p>We''ve received your partnership inquiry for <strong>{{companyName}}</strong>.</p>
<p>A member of our team will reach out within 2-3 business days to discuss partnership opportunities and answer any questions you may have.</p>
<p>We''re excited about the possibility of partnering with you to support youth football in our community!</p>
<br>
<p>Best regards,<br>RiseUp Football Team</p>'),
('sponsor_interest_admin_notification', 'Partner interest (admin)', 'New Partner Interest: {{companyName}}', '<h2>New Partnership Interest Submission</h2>
<p><strong>Company:</strong> {{companyName}}</p>
<p><strong>Contact Name:</strong> {{name}}</p>
<p><strong>Email:</strong> <a href="mailto:{{email}}">{{email}}</a></p>
<p><strong>Phone:</strong> {{phone}}</p>
<br>
<p><em>Follow up with this potential partner to discuss available packages.</em></p>'),
('contact_form_to_admin', 'Contact form (admin)', 'New Contact: {{subject}} from {{name}}', '<h2>New Contact Form Submission</h2>
<p><strong>Name:</strong> {{name}}</p>
<p><strong>Email:</strong> {{email}}</p>
<p><strong>Phone:</strong> {{phone}}</p>
<p><strong>Subject:</strong> {{subject}}</p>
<p><strong>Message:</strong></p>
<p>{{message}}</p>'),
('artwork_approval_request', 'Artwork approval request', 'Please approve artwork within 24 hours – RiseUp Youth Football', '<h2>Artwork approval requested</h2>
<p>Hi {{companyName}},</p>
<p>Please review and approve the following artwork within 24 hours.</p>
<p><a href="{{approvalUrl}}" style="display:inline-block;background:#b72031;color:#fff;padding:12px 24px;text-decoration:none;border-radius:9999px;font-weight:600;">Review & Approve</a></p>
<p>If you need changes, click the link and select "Request changes."</p>
<br>
<p>Best regards,<br>RiseUp Youth Football</p>')
ON CONFLICT (template_key) DO NOTHING;
