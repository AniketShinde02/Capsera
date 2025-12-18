# Email Configuration Guide for Capsera Admin

## Overview
This guide explains how email notifications are configured for the Capsera application, specifically for admin notifications when users submit contact forms.

## Current Email Flow

### 1. **User Submits Contact Form** → Two Emails Are Sent:
   - ✅ **Confirmation Email to User** - Confirms their submission was received
   - ✅ **Notification Email to Admin** - Alerts you of the new submission

## Required Environment Variables

Add these variables to your `.env` file:

```env
# ============================================
# SMTP Configuration (Required for sending emails)
# ============================================
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-smtp-password-or-api-key
SMTP_FROM=noreply@capsera.online

# ============================================
# Admin Email (Required for receiving notifications)
# ============================================
ADMIN_EMAIL_RECEIVER=your-admin-email@example.com

# ============================================
# App Configuration
# ============================================
NEXTAUTH_URL=https://www.capsera.online
NEXT_PUBLIC_APP_URL=https://www.capsera.online
APP_NAME=Capsera
```

## Environment Variable Explanations

| Variable | Purpose | Example |
|----------|---------|---------|
| `SMTP_HOST` | SMTP server hostname | `smtp-relay.brevo.com` |
| `SMTP_PORT` | SMTP server port (587 for TLS, 465 for SSL) | `587` |
| `SMTP_USER` | Your SMTP username (usually your email) | `admin@capsera.online` |
| `SMTP_PASS` | Your SMTP password or API key | `xkeysib-xxxxx` |
| `SMTP_FROM` | The "from" email address for outgoing emails | `noreply@capsera.online` |
| `ADMIN_EMAIL_RECEIVER` | **YOUR email** where notifications will be sent | `your-email@gmail.com` |
| `NEXTAUTH_URL` | Your production URL | `https://www.capsera.online` |
| `NEXT_PUBLIC_APP_URL` | Public-facing app URL | `https://www.capsera.online` |

## How It Works

### Contact Form Submission Flow:

1. **User fills out contact form** on your website
2. **Form data is saved** to MongoDB database
3. **Two emails are sent simultaneously:**
   
   **Email #1: User Confirmation**
   - **To:** User's email address
   - **Subject:** "✅ We received your message - Capsera Support"
   - **Content:** Confirmation that their message was received
   - **Purpose:** Builds trust and confirms successful submission
   
   **Email #2: Admin Notification** ⭐ **NEW**
   - **To:** `ADMIN_EMAIL_RECEIVER` (your email)
   - **Subject:** "📬 New Contact Form Submission: [Subject]"
   - **Content:** Full submission details including:
     - User's name and email
     - Subject/category
     - Full message text
     - Submission ID
   - **Reply-To:** User's email (you can reply directly)
   - **Purpose:** Notifies you immediately of new submissions

## Email Templates

### Admin Notification Email Features:
- ✅ Beautiful, branded HTML template
- ✅ Dark theme matching Capsera's design
- ✅ All submission details clearly displayed
- ✅ Reply-To header set to user's email for easy responses
- ✅ Direct link to view all submissions in admin panel
- ✅ Mobile-responsive design

## Testing the Configuration

### 1. **Check if SMTP is configured:**
```bash
# Look for these variables in your .env file
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
```

### 2. **Check if Admin Email is set:**
```bash
# This is YOUR email where notifications will be sent
ADMIN_EMAIL_RECEIVER=your-admin-email@example.com
```

### 3. **Test by submitting a contact form:**
- Go to your contact page
- Fill out and submit the form
- Check your console logs for:
  ```
  📧 Confirmation email sent to: user@example.com
  📧 Admin notification email sent
  ```
- Check your inbox (ADMIN_EMAIL_RECEIVER) for the notification

## Troubleshooting

### ❌ "Admin notification email not received"

**Possible causes:**

1. **`ADMIN_EMAIL_RECEIVER` not set in .env**
   - Solution: Add `ADMIN_EMAIL_RECEIVER=your-email@example.com` to `.env`
   - Check console for: `⚠️ ADMIN_EMAIL_RECEIVER not set in .env`

2. **SMTP credentials incorrect**
   - Solution: Verify `SMTP_USER` and `SMTP_PASS` are correct
   - Test SMTP connection with Brevo dashboard

3. **Email in spam folder**
   - Solution: Check spam/junk folder
   - Add sender to safe senders list

4. **SMTP server blocking**
   - Solution: Check Brevo dashboard for sending limits
   - Verify your account is active and verified

### ❌ "User confirmation email not received"

**Possible causes:**

1. **SMTP not configured**
   - Check console for: `📧 SMTP not configured - contact confirmation would be sent to: user@example.com`
   - Solution: Configure all SMTP variables in `.env`

2. **Invalid user email address**
   - Solution: Verify email format is correct

## Code Changes Made

### 1. **New Function Added** (`src/lib/mail.ts`):
```typescript
export async function sendContactAdminNotification(data: ContactConfirmationData)
```
- Sends beautifully formatted email to admin
- Includes all submission details
- Sets Reply-To header for easy responses

### 2. **Contact API Updated** (`src/app/api/contact/route.ts`):
```typescript
// After sending user confirmation, also send admin notification
await sendContactAdminNotification({
  name: savedContact.name,
  email: savedContact.email,
  subject: savedContact.category,
  message: savedContact.message,
  submissionId: savedContact._id.toString()
});
```

## Security Best Practices

1. **Never commit `.env` file** to version control
2. **Use environment-specific `.env` files:**
   - `.env.local` for local development
   - `.env.production` for production (set in Vercel/hosting platform)
3. **Rotate SMTP credentials** periodically
4. **Use API keys** instead of passwords when possible
5. **Monitor email sending limits** to prevent abuse

## Brevo SMTP Setup (Recommended)

### Why Brevo?
- ✅ Free tier: 300 emails/day
- ✅ Reliable delivery
- ✅ Easy setup
- ✅ Good deliverability rates

### Setup Steps:

1. **Sign up** at [brevo.com](https://www.brevo.com)
2. **Verify your domain** (optional but recommended)
3. **Get SMTP credentials:**
   - Go to Settings → SMTP & API
   - Copy your SMTP credentials
4. **Add to `.env`:**
   ```env
   SMTP_HOST=smtp-relay.brevo.com
   SMTP_PORT=587
   SMTP_USER=your-brevo-email@example.com
   SMTP_PASS=your-brevo-smtp-key
   ```

## Alternative Email Providers

| Provider | Free Tier | Setup Difficulty | Recommended For |
|----------|-----------|------------------|-----------------|
| **Brevo** | 300/day | Easy | Production |
| **SendGrid** | 100/day | Medium | Production |
| **Mailgun** | 5,000/month | Medium | Production |
| **Gmail SMTP** | 500/day | Easy | Development only |
| **AWS SES** | 62,000/month | Hard | Large scale |

## Monitoring Email Delivery

### Check Console Logs:
```bash
# Successful sends:
📧 Confirmation email sent to: user@example.com Message ID: <xxx>
📧 Admin notification email sent to: admin@example.com Message ID: <xxx>

# Failures:
❌ Failed to send confirmation email: [error details]
❌ Failed to send admin notification email: [error details]

# Warnings:
⚠️ ADMIN_EMAIL_RECEIVER not set in .env, skipping admin notification email.
📧 SMTP not configured - admin notification would be sent to: admin@example.com
```

### Check Database:
All contact form submissions are saved to MongoDB regardless of email status:
```javascript
// Query all contacts
db.contacts.find().sort({ createdAt: -1 })
```

## Next Steps

1. ✅ **Add environment variables** to your `.env` file
2. ✅ **Restart your development server** to load new variables
3. ✅ **Test the contact form** by submitting a test message
4. ✅ **Check your admin email inbox** for the notification
5. ✅ **Deploy to production** and set environment variables in Vercel/hosting platform

## Production Deployment Checklist

When deploying to Vercel/production:

- [ ] Set all SMTP environment variables in Vercel dashboard
- [ ] Set `ADMIN_EMAIL_RECEIVER` to your production admin email
- [ ] Set `NEXTAUTH_URL` to your production domain
- [ ] Test contact form on production
- [ ] Verify emails are being delivered
- [ ] Check spam folder if emails not received
- [ ] Monitor Brevo dashboard for sending statistics

## Support

If you're still not receiving admin notification emails after following this guide:

1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Test SMTP connection with a simple test email
4. Check Brevo dashboard for blocked/failed sends
5. Verify your admin email inbox (including spam folder)

---

**Last Updated:** December 18, 2024
**Version:** 1.0.0
