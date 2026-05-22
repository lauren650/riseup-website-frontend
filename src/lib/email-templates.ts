/**
 * Central email templates for RiseUp.
 * All subject lines and HTML bodies live here; callers pass the result to sendWithRetry.
 */

const SIGN_OFF = "RiseUp Youth Football";
const CTA_STYLE =
  "display:inline-block;background:#b72031;color:#fff;padding:12px 24px;text-decoration:none;border-radius:9999px;font-weight:600;";

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Wrap a body fragment with standard sign-off. */
function withSignOff(body: string): string {
  return `${body}<br>\n<p>Best regards,<br>${SIGN_OFF}</p>`;
}

export function uploadInstructions(data: {
  companyName: string;
  uploadUrl: string;
}): { subject: string; html: string } {
  const company = escapeHtml(data.companyName);
  const body = `
    <h2>Thank you for your sponsorship!</h2>
    <p>Hi ${company},</p>
    <p>Your payment has been received. To complete your partner profile and get your logo on our website, please upload your business information.</p>
    <p><strong>Upload your logo and website link here:</strong></p>
    <p><a href="${escapeHtml(data.uploadUrl)}" style="${CTA_STYLE}">Upload Business Info</a></p>
    <p>This link is unique to you and will expire in 90 days. If you need a new link, contact us.</p>
  `;
  return {
    subject: "Upload Your Business Information – RiseUp Youth Football",
    html: withSignOff(body),
  };
}

export function receipt(data: {
  companyName: string;
  packageName: string;
  amountFormatted: string;
  paidAtDate: string;
  stripeInvoiceId: string;
}): { subject: string; html: string } {
  const company = escapeHtml(data.companyName);
  const pkg = escapeHtml(data.packageName);
  const body = `
    <h2>Receipt for Goods and Services</h2>
    <p>Hi ${company},</p>
    <p>This confirms that RiseUp Youth Football has received your payment for the following:</p>
    <p><strong>Description:</strong> ${pkg} – RiseUp Youth Football Sponsorship</p>
    <p><strong>Amount paid:</strong> ${data.amountFormatted}</p>
    <p><strong>Date:</strong> ${escapeHtml(data.paidAtDate)}</p>
    <p><strong>Invoice ID:</strong> ${escapeHtml(data.stripeInvoiceId)}</p>
    <p>You have received the goods and/or services described above. Thank you for supporting RiseUp Youth Football.</p>
    <br>
    <p>${SIGN_OFF}</p>
  `;
  return {
    subject: "Receipt for Sponsorship – RiseUp Youth Football",
    html: body,
  };
}

export function sponsorConfirmation(data: {
  contactName: string;
  companyName: string;
}): { subject: string; html: string } {
  const name = escapeHtml(data.contactName);
  const company = escapeHtml(data.companyName);
  const body = `
    <h2>Thank you for your sponsorship submission!</h2>
    <p>Hi ${name},</p>
    <p>We've received your submission for <strong>${company}</strong>.</p>
    <p>Our team will review your submission and you'll see your logo on our Partners page shortly.</p>
  `;
  return {
    subject: "Sponsor Submission Received - RiseUp Youth Football",
    html: withSignOff(body),
  };
}

export function sponsorAdminNotification(data: {
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  websiteUrl: string;
  description?: string;
  logoUrl: string;
}): { subject: string; html: string } {
  const company = escapeHtml(data.companyName);
  const contact = escapeHtml(data.contactName);
  const email = escapeHtml(data.contactEmail);
  const phone = escapeHtml(data.contactPhone);
  const website = escapeHtml(data.websiteUrl);
  const desc = data.description ? escapeHtml(data.description) : "";
  const logoUrl = escapeHtml(data.logoUrl);
  const body = `
    <h2>New Sponsor Submission</h2>
    <p><strong>Company:</strong> ${company}</p>
    <p><strong>Contact:</strong> ${contact}</p>
    <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
    <p><strong>Phone:</strong> ${phone}</p>
    <p><strong>Website:</strong> <a href="${website}">${website}</a></p>
    ${desc ? `<p><strong>Description:</strong> ${desc}</p>` : ""}
    <p><strong>Logo:</strong> <a href="${logoUrl}">View Logo</a></p>
    <br>
    <p><em>Review and approve this sponsor in the admin dashboard.</em></p>
  `;
  return {
    subject: `New Sponsor Submission: ${company}`,
    html: body,
  };
}

export function sponsorInterestConfirmation(data: {
  name: string;
  companyName: string;
}): { subject: string; html: string } {
  const name = escapeHtml(data.name);
  const company = escapeHtml(data.companyName);
  const body = `
    <h2>Thank you for your interest in partnering with RiseUp Youth Football!</h2>
    <p>Hi ${name},</p>
    <p>We've received your partnership inquiry for <strong>${company}</strong>.</p>
    <p>A member of our team will reach out within 2-3 business days to discuss partnership opportunities and answer any questions you may have.</p>
    <p>We're excited about the possibility of partnering with you to support youth football in our community!</p>
  `;
  return {
    subject: "Partner Interest Received - RiseUp Youth Football",
    html: `${body}<br>\n<p>Best regards,<br>RiseUp Football Team</p>`,
  };
}

export function sponsorInterestAdminNotification(data: {
  companyName: string;
  name: string;
  email: string;
  phone: string;
}): { subject: string; html: string } {
  const company = escapeHtml(data.companyName);
  const name = escapeHtml(data.name);
  const email = escapeHtml(data.email);
  const phone = escapeHtml(data.phone);
  const body = `
    <h2>New Partnership Interest Submission</h2>
    <p><strong>Company:</strong> ${company}</p>
    <p><strong>Contact Name:</strong> ${name}</p>
    <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
    <p><strong>Phone:</strong> ${phone}</p>
    <br>
    <p><em>Follow up with this potential partner to discuss available packages.</em></p>
  `;
  return {
    subject: `New Partner Interest: ${company}`,
    html: body,
  };
}

export function contactFormToAdmin(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
}): { subject: string; html: string } {
  const name = escapeHtml(data.name);
  const email = escapeHtml(data.email);
  const subj = escapeHtml(data.subject);
  const message = escapeHtml(data.message).replace(/\n/g, "<br>");
  const phone = data.phone ? escapeHtml(data.phone) : "";
  const body = `
    <h2>New Contact Form Submission</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
    <p><strong>Subject:</strong> ${subj}</p>
    <p><strong>Message:</strong></p>
    <p>${message}</p>
  `;
  return {
    subject: `New Contact: ${subj} from ${name}`,
    html: body,
  };
}

export function artworkApprovalRequest(data: {
  companyName: string;
  approvalUrl: string;
}): { subject: string; html: string } {
  const company = escapeHtml(data.companyName);
  const body = `
    <h2>Artwork approval requested</h2>
    <p>Hi ${company},</p>
    <p>Please review and approve the following artwork within 24 hours.</p>
    <p><a href="${escapeHtml(data.approvalUrl)}" style="${CTA_STYLE}">Review & Approve</a></p>
    <p>If you need changes, click the link and select "Request changes."</p>
  `;
  return {
    subject: "Please approve artwork within 24 hours – RiseUp Youth Football",
    html: withSignOff(body),
  };
}
