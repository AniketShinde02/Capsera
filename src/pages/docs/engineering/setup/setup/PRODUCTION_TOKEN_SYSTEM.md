# Production Token System for CaptionCraft

This document explains how to use the new production-ready token system for admin setup in CaptionCraft.

## Overview

The production token system allows authorized administrators to generate JWT setup tokens through a secure web interface, eliminating the need for local environment files or manual token generation.

## How It Works

### 1. Get Token Button
- Located on the `/setup` page
- Only accessible to authorized administrators
- Generates a unique JWT token with 24-hour expiration
- Automatically sends the token to the configured admin email

### 2. Security Features
- **Email Restriction**: Only `sunnyshinde2601@gmail.com` can request tokens
- **JWT Security**: Tokens are cryptographically signed and time-limited
- **One-time Use**: Each token can only be used once for setup
- **Audit Logging**: All token requests are logged for security monitoring

### 3. Token Flow
1. Admin visits `/setup` page
2. Clicks "Get Token" button
3. System generates JWT token
4. Token is sent to authorized email
5. Admin receives token via email
6. Admin pastes token in setup form
7. Token is verified and admin account is created

## Configuration

### Environment Variables

```bash
# Required for JWT signing
JWT_SECRET=your-super-secure-jwt-secret-key

# Brevo SMTP configuration (already configured)
SMTP_HOST=smtp-relay.sendinblue.com
SMTP_PORT=587
SMTP_USER=your-brevo-username
SMTP_PASS=your-brevo-password
SMTP_FROM=your-from-email@domain.com

# Optional: Email fallback configuration
EMAIL_FROM=your-from-email@domain.com
```

### Email Service Options

#### 1. Brevo SMTP Service (Default)
- Uses your existing Brevo SMTP configuration
- Professional email delivery service
- High deliverability rates
- Already configured and working in production

#### 2. Console Service (Fallback)
- Logs emails to console when SMTP is not configured
- Used for development/testing
- No external dependencies

## Usage Instructions

### For Administrators

1. **Access Setup Page**
   - Navigate to `/setup` in your browser
   - Ensure you're using the authorized email address

2. **Request Token**
   - Click the "Get Token" button
   - Wait for confirmation message
   - Check your email for the token

3. **Complete Setup**
   - Copy the token from your email
   - Paste it in the "Setup Token" field
   - Click "Verify Token"
   - Follow the setup wizard

### For Developers

1. **Local Development**
   - Ensure your Brevo SMTP credentials are set in `.env`
   - Tokens will be sent via Brevo SMTP
   - Check server logs for email delivery confirmation

2. **Production Deployment (Vercel)**
   - Brevo SMTP credentials are already configured in Vercel
   - Ensure `JWT_SECRET` is set securely in Vercel environment variables
   - Tokens will be sent via Brevo SMTP automatically

## Security Considerations

### Token Security
- JWT tokens are cryptographically signed
- 24-hour expiration prevents long-term exposure
- Unique token IDs prevent replay attacks
- One-time use prevents multiple setups

### Access Control
- Only authorized email can request tokens
- All requests are logged and monitored
- Failed attempts are tracked
- IP-based blocking can be implemented

### Email Security
- Tokens are sent only to verified admin email
- Email content includes security warnings
- Clear instructions for legitimate use
- Contact information for security issues

## Troubleshooting

### Common Issues

1. **"Unauthorized email address"**
   - Ensure you're using `sunnyshinde2601@gmail.com`
   - Check if the email is correctly configured

2. **"Failed to send email"**
   - Check email service configuration
   - Verify API keys and credentials
   - Check network connectivity

3. **"Token verification failed"**
   - Ensure token is copied completely
   - Check if token has expired
   - Verify JWT_SECRET is set correctly

### Debug Mode

Enable debug logging by checking the browser console and server logs:

```bash
# Server logs will show:
🔐 Production setup token generated for: sunnyshinde2601@gmail.com
📝 Token ID: setup_1234567890_abc123
⏰ Expires: 2024-01-01T12:00:00.000Z
📧 TOKEN FOR EMAIL: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
✅ Token sent successfully via email to: sunnyshinde2601@gmail.com
```

## Production Deployment Checklist

- [ ] Set secure `JWT_SECRET` environment variable in Vercel
- [ ] ✅ Brevo SMTP is already configured and working
- [ ] Test token generation and email delivery via Brevo
- [ ] Verify token verification works correctly
- [ ] Monitor security logs for unauthorized attempts
- [ ] Document admin email addresses and procedures

## Support

For technical support or security concerns:
- Check server logs for detailed error information
- Verify environment variable configuration
- Test email service connectivity
- Contact system administrators if issues persist

## Future Enhancements

- Multi-factor authentication for token requests
- IP whitelisting for additional security
- Token usage analytics and reporting
- Integration with additional email providers
- Mobile app support for token management
