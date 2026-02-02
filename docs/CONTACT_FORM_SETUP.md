# Contact Form Setup

The contact form sends emails via Resend and uses reCAPTCHA v3 for spam protection.

## Required Environment Variables (Vercel / Production)

### For emails to send

| Variable | Required | Description |
|----------|----------|-------------|
| `RESEND_API_KEY` | **Yes** | API key from [Resend Dashboard](https://resend.com/api-keys). Without this, the form will show success but no email is sent. |
| `CONTACT_EMAIL` | No | Where to receive submissions (default: admin@riseupfootball.org) |

### For reCAPTCHA (spam protection)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | No | From [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin). If not set, form works without spam protection. |
| `RECAPTCHA_SECRET_KEY` | No | Server-side verification. If not set, verification is skipped. |

**Important:** Add your production domain (e.g. `riseupfootball.org`) to the reCAPTCHA admin console under "Domains". If the domain isn't listed, the reCAPTCHA script may fail to load.

## Verifying setup

1. **Resend:** In Vercel, add `RESEND_API_KEY` from your Resend dashboard.
2. **Resend domain:** Verify your domain in Resend, or use `onboarding@resend.dev` (sandbox – limited to verified recipient emails).
3. **reCAPTCHA:** Create a v3 site at Google reCAPTCHA admin, add your domain, and set both keys in Vercel.

## Troubleshooting

- **"Recaptcha has not been loaded"** – The form now has a 10-second fallback; if reCAPTCHA doesn't load, you can still submit. Check that your domain is in the reCAPTCHA admin console.
- **Email not received** – Confirm `RESEND_API_KEY` is set in Vercel. If Resend isn't configured, the success modal will show "(Note: Email delivery not configured)".
