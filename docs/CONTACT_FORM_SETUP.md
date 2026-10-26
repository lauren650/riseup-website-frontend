# Contact Form Setup

The contact form sends emails via Resend. Spam is blocked with reCAPTCHA v3 plus a honeypot field and a minimum time-to-submit check. The partner interest form uses the same checks.

## Required Environment Variables (Vercel / Production)

### For emails to send

| Variable | Required | Description |
|----------|----------|-------------|
| `RESEND_API_KEY` | **Yes** | API key from [Resend Dashboard](https://resend.com/api-keys). Without this, the form will show success but no email is sent. |
| `RESEND_FROM_EMAIL` | No | Sender address – must use your verified domain (default: RiseUp Website &lt;noreply@riseupfootball.org&gt;). Required for sending to recipients other than yourself. |
| `CONTACT_EMAIL` | No | Where contact form submissions go (default: admin@riseupfootball.org) |
| `SPONSOR_INTEREST_EMAIL` | No | Where partner/sponsor interest form submissions go (default: krystie@riseupfootball.org) |

### For reCAPTCHA (spam protection)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | **Yes, in production** | From [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin). Create a **v3** site and add `riseupfootball.org`. |
| `RECAPTCHA_SECRET_KEY` | **Yes, in production** | Server-side verification. When this is set, submissions without a valid token are rejected. |

**Important:** Add your production domain (e.g. `riseupfootball.org`) to the reCAPTCHA admin console under "Domains". If the domain isn't listed, the reCAPTCHA script may fail to load.

## Verifying setup

1. **Resend:** In Vercel, add `RESEND_API_KEY` from your Resend dashboard.
2. **Resend domain:** Verify your domain in Resend. The `from` address must use your verified domain (e.g. `noreply@riseupfootball.org`). Using `onboarding@resend.dev` only allows sending to your own email.
3. **reCAPTCHA:** Create a v3 site at Google reCAPTCHA admin, add your domain, and set both keys in Vercel.

Submissions are also rejected when a hidden field is filled or the form is posted in under 2.5 seconds. Those checks stay on even if the Google keys are missing.

## Disable reCAPTCHA

If reCAPTCHA causes issues (invalid domain, script blocked), you can disable the Google check:

```
NEXT_PUBLIC_DISABLE_RECAPTCHA=true
```

Set this in Vercel → Project → Settings → Environment Variables. The honeypot and timing checks still run. Remove the variable once the domain is listed in the reCAPTCHA admin console.

## Debugging

- **Vercel logs:** After submitting, check Vercel → Project → Logs. Look for `[Contact]` messages:
  - "Form submission received" = server action ran
  - "RESEND_API_KEY not set" = add the key in Vercel
  - "Sending email to: X" = Resend is being called
  - "Email sent successfully" = it worked
  - "Resend API error: X" = Resend returned an error (check message)

- **Error messages:** The form now shows Resend's actual error message when send fails (e.g. domain not verified).

## Troubleshooting

- **"Spam protection didn't load"** – Add your domain to the reCAPTCHA admin console, or set `NEXT_PUBLIC_DISABLE_RECAPTCHA=true` as a temporary bypass. The form no longer sends mail when the Google check is configured but the token is missing.
- **"Unrecognized feature: private-token"** – Harmless browser warning, can be ignored.
- **Email not received** – Confirm `RESEND_API_KEY` is set in Vercel. Check Vercel logs for `[Contact]` messages.
