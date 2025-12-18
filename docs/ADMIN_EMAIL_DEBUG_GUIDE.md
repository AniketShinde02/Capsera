# 🔍 Admin Email Not Received - Debugging Guide

## Problem
- ✅ Recipient (user) is receiving confirmation emails
- ❌ Admin is NOT receiving notification emails
- ✅ Environment variables are properly set in production

## Step-by-Step Debugging Process

### Step 1: Verify Environment Variables in Production

#### For Vercel:
1. Go to your Vercel project dashboard
2. Navigate to **Settings → Environment Variables**
3. Verify these variables are set:

```
ADMIN_EMAIL_RECEIVER=your-admin-email@gmail.com
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-smtp-password
SMTP_FROM=noreply@capsera.online
```

4. **IMPORTANT:** After adding/changing variables, you MUST redeploy!
   - Go to **Deployments** tab
   - Click the **three dots** on the latest deployment
   - Click **Redeploy**

### Step 2: Check Production Logs

#### View Vercel Logs:
1. Go to your Vercel project
2. Click on **Deployments**
3. Click on the latest deployment
4. Click on **Functions** tab
5. Look for the contact API function logs

#### What to Look For:

**✅ Good Signs:**
```
🔍 [Admin Email Debug] Starting admin notification process...
🔍 [Admin Email Debug] ADMIN_EMAIL_RECEIVER: your-email@gmail.com (SET)
🔍 [Admin Email Debug] SMTP configured: YES
✅ [Admin Email Debug] Admin notification email sent successfully!
📧 Admin notification email sent to: your-email@gmail.com Message ID: <xxx>
```

**❌ Bad Signs:**
```
⚠️ ADMIN_EMAIL_RECEIVER not set in .env, skipping admin notification email.
```
→ **Solution:** Variable not set in production. Add it in Vercel and redeploy.

```
📧 SMTP not configured - admin notification would be sent to: your-email@gmail.com
```
→ **Solution:** SMTP variables missing. Add all SMTP variables and redeploy.

```
❌ [Admin Email Debug] Failed to send admin notification email!
```
→ **Solution:** Check the error details in logs. Likely SMTP authentication issue.

### Step 3: Test Email Configuration Endpoint

Visit this URL in your browser (replace with your domain):
```
https://www.capsera.online/api/test-email-config
```

**Expected Response:**
```json
{
  "success": true,
  "message": "✅ All email configuration variables are set!",
  "config": {
    "environment": "production",
    "smtp": {
      "host": "✅ SET",
      "port": "✅ SET",
      "user": "✅ SET (your-email@example.com)",
      "pass": "✅ SET (hidden)",
      "from": "✅ SET (noreply@capsera.online)"
    },
    "admin": {
      "email": "✅ SET (your-admin-email@gmail.com)"
    }
  },
  "ready": true
}
```

If any show `❌ NOT SET`, those variables are missing in production!

### Step 4: Common Issues & Solutions

#### Issue 1: Environment Variables Not Loading
**Symptoms:**
- Test endpoint shows variables as `❌ NOT SET`
- Logs show "ADMIN_EMAIL_RECEIVER not set"

**Solutions:**
1. ✅ Add variables in Vercel dashboard (Settings → Environment Variables)
2. ✅ Make sure to select **Production** environment
3. ✅ **REDEPLOY** after adding variables (this is critical!)
4. ✅ Wait 2-3 minutes for deployment to complete
5. ✅ Test again

#### Issue 2: SMTP Authentication Failure
**Symptoms:**
- Logs show "Failed to send admin notification email"
- Error message contains "authentication failed" or "invalid credentials"

**Solutions:**
1. ✅ Verify SMTP credentials in Brevo dashboard
2. ✅ Make sure you're using the correct SMTP password/API key
3. ✅ Check if Brevo account is active and verified
4. ✅ Try generating a new SMTP API key in Brevo

#### Issue 3: Email Going to Spam
**Symptoms:**
- Logs show email sent successfully
- Admin email not in inbox

**Solutions:**
1. ✅ Check spam/junk folder
2. ✅ Check "All Mail" folder in Gmail
3. ✅ Search for "Capsera" in your email
4. ✅ Add sender to safe senders list
5. ✅ Check email filters/rules

#### Issue 4: Brevo Sending Limits
**Symptoms:**
- First few emails work, then stop
- Brevo dashboard shows "limit reached"

**Solutions:**
1. ✅ Check Brevo dashboard for daily limits (free tier: 300/day)
2. ✅ Verify account is verified (unverified accounts have lower limits)
3. ✅ Check if account is suspended
4. ✅ Upgrade plan if needed

#### Issue 5: Wrong Admin Email Address
**Symptoms:**
- Logs show email sent to different address
- Email going to wrong inbox

**Solutions:**
1. ✅ Double-check `ADMIN_EMAIL_RECEIVER` value in Vercel
2. ✅ Make sure there are no typos
3. ✅ Make sure there are no extra spaces
4. ✅ Redeploy after fixing

### Step 5: Manual Testing

#### Test 1: Submit Contact Form
1. Go to your production site
2. Fill out the contact form
3. Submit
4. Immediately check Vercel logs (within 1-2 minutes)
5. Look for the debug logs mentioned above

#### Test 2: Check Brevo Dashboard
1. Log into Brevo
2. Go to **Statistics → Email**
3. Check recent sends
4. Look for emails to your admin address
5. Check delivery status

#### Test 3: Test with Different Email Provider
Try changing `ADMIN_EMAIL_RECEIVER` to a different email:
- Gmail
- Outlook
- Yahoo
- ProtonMail

This helps identify if it's an email provider issue.

### Step 6: Advanced Debugging

If none of the above works, add this temporary code to get more details:

#### In `src/lib/mail.ts`, add at the top of `sendContactAdminNotification`:

```typescript
console.log('🔍 [DEBUG] All env vars:', {
  ADMIN_EMAIL_RECEIVER: process.env.ADMIN_EMAIL_RECEIVER,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS ? 'SET' : 'NOT SET',
  NODE_ENV: process.env.NODE_ENV,
});
```

This will show you exactly what values are loaded in production.

### Step 7: Verify Code Deployment

Make sure the latest code with admin notifications is actually deployed:

1. Check the deployment timestamp in Vercel
2. Verify the commit hash matches your latest changes
3. Look for the new debug logs in production logs
4. If old code is running, trigger a new deployment

### Step 8: Check Email Headers (Advanced)

If emails ARE being sent but not received:

1. Ask a friend to submit the contact form
2. Check if THEY receive the confirmation email
3. If yes, check Brevo logs for the admin email
4. Look for bounce/rejection messages
5. Check SPF/DKIM/DMARC records (if using custom domain)

## Quick Checklist

Use this checklist to verify everything:

- [ ] `ADMIN_EMAIL_RECEIVER` is set in Vercel environment variables
- [ ] All SMTP variables are set in Vercel
- [ ] Environment is set to "Production" in Vercel
- [ ] Redeployed after adding/changing variables
- [ ] Test endpoint shows all variables as "SET"
- [ ] Production logs show debug messages
- [ ] Logs show "Admin notification email sent successfully"
- [ ] Checked spam folder
- [ ] Checked Brevo dashboard for sends
- [ ] Brevo account is active and verified
- [ ] No sending limits reached
- [ ] Admin email address is correct (no typos)
- [ ] Tried different email provider

## Still Not Working?

If you've tried everything above and it's still not working:

### Option 1: Use Alternative Email Service

Try using a different email service temporarily:

**Gmail SMTP (for testing only):**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-app-password  # Generate in Google Account settings
```

**SendGrid:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### Option 2: Add Webhook Notification

As a backup, you can add a webhook to notify you via Slack/Discord:

```typescript
// In contact API, after saving to database
await fetch('YOUR_WEBHOOK_URL', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: `New contact form submission from ${savedContact.name} (${savedContact.email})`
  })
});
```

### Option 3: Database Polling

Set up a cron job to check for new submissions:
- Query database every 5 minutes
- Send digest email of new submissions
- Mark submissions as "notified"

## Contact for Help

If you need help debugging:

1. Share the output of `/api/test-email-config`
2. Share relevant Vercel logs (with sensitive info redacted)
3. Share Brevo dashboard screenshot
4. Confirm all checklist items are done

---

**Last Updated:** December 18, 2024
**Version:** 1.0.0
