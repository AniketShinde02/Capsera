# 📧 Email Automation System

## Overview

CaptionCraft now includes a comprehensive email automation system that handles welcome emails, promotional campaigns, and request confirmations. This system is designed to improve user engagement while maintaining compliance with email best practices.

## 🎯 Features Implemented

### 1. Welcome Emails
- **Trigger**: Automatically sent when a user registers
- **Content**: Personalized welcome message with user's name/username
- **Purpose**: Onboard new users and introduce CaptionCraft features
- **Template**: Professional HTML email with branding and call-to-action

### 2. Promotional/Marketing Emails
- **Frequency**: Every 3 days (configurable)
- **Content**: Feature updates, tips, and engagement content
- **Unsubscribe**: One-click unsubscribe with token-based security
- **Tracking**: Comprehensive analytics and delivery monitoring

### 3. Request Confirmation Emails
- **Data Recovery**: Confirmation when users submit recovery requests
- **Profile Deletion**: Confirmation when accounts are deleted
- **Contact Form**: Already existing, enhanced with better templates
- **Purpose**: Keep users informed about their request status

## 🏗️ System Architecture

### Database Schema Updates

#### User Model Extensions
```typescript
// Email preferences
emailPreferences: {
  promotional: { type: Boolean, default: true },
  welcome: { type: Boolean, default: true },
  requestConfirmations: { type: Boolean, default: true }
}

// Promotional email tracking
promotionalEmailSentAt: Date,
lastPromotionalEmailDate: Date,
promotionalEmailCount: Number,
unsubscribeToken: String,
welcomeEmailSent: Boolean
```

#### New Methods
- `canSendPromotionalEmail()`: Checks if 3 days have passed
- `markPromotionalEmailSent()`: Updates tracking fields
- `generateUnsubscribeToken()`: Creates secure unsubscribe tokens
- `unsubscribeFromPromotional()`: Handles unsubscription
- `shouldSendWelcomeEmail()`: Checks welcome email eligibility
- `markWelcomeEmailSent()`: Marks welcome email as sent

### API Endpoints

#### `/api/admin/send-promotional-emails`
- **POST**: Manually trigger promotional email campaign
- **GET**: View promotional email statistics and status
- **Admin Only**: Requires admin authentication

#### `/api/unsubscribe`
- **GET**: Process unsubscribe via token (redirects to confirmation)
- **POST**: Programmatic unsubscribe (API-based)

### Email Templates

#### Welcome Email Template
- **Subject**: "🎉 Welcome to CaptionCraft - Start Creating Amazing Captions!"
- **Features**: 
  - Personalized greeting with user's name
  - Feature overview and getting started guide
  - Quick tips and best practices
  - Call-to-action buttons

#### Promotional Email Template
- **Subject**: "🚀 Boost Your Social Media Game - New CaptionCraft Features!"
- **Features**:
  - Weekly feature updates
  - Pro tips and engagement hacks
  - Community highlights
  - Unsubscribe link with token

#### Request Confirmation Template
- **Subject**: "✅ Request Received - [Request Type] - CaptionCraft"
- **Features**:
  - Request details and ID
  - Estimated processing time
  - Next steps and timeline
  - Support contact information

## 🚀 Usage Instructions

### For Developers

#### Sending Welcome Emails
```typescript
import { sendWelcomeEmail } from '@/lib/mail';

await sendWelcomeEmail({
  name: 'John Doe',
  email: 'john@example.com',
  username: 'johndoe'
});
```

#### Sending Promotional Emails
```typescript
import { sendPromotionalEmail } from '@/lib/mail';

await sendPromotionalEmail({
  name: 'John Doe',
  email: 'john@example.com',
  username: 'johndoe',
  unsubscribeToken: 'abc123...'
});
```

#### Sending Request Confirmations
```typescript
import { sendRequestConfirmationEmail } from '@/lib/mail';

await sendRequestConfirmationEmail({
  name: 'John Doe',
  email: 'john@example.com',
  requestType: 'data_recovery',
  requestId: 'req_123',
  estimatedTime: '3-5 business days',
  nextSteps: [
    'Our team will review your request within 24 hours',
    'You\'ll receive updates via email'
  ]
});
```

### For Administrators

#### Manual Promotional Email Campaign
```bash
# Send promotional emails to eligible users
curl -X POST /api/admin/send-promotional-emails \
  -H "Authorization: Bearer [admin-token]"
```

#### Check Promotional Email Status
```bash
# View statistics and recent activity
curl /api/admin/send-promotional-emails \
  -H "Authorization: Bearer [admin-token]"
```

#### Automated Script
```bash
# Run promotional email campaign manually
npm run send-promotional-emails

# Set up cron job (every 3 days at 9 AM)
0 9 */3 * * cd /path/to/captioncraft && npm run send-promotional-emails
```

## ⚙️ Configuration

### Environment Variables
```bash
# SMTP Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
SMTP_FROM=ai.captioncraft@outlook.com

# App URLs
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Database
MONGODB_URI=mongodb://localhost:27017/captioncraft
```

### Email Preferences
Users can control their email preferences through:
- Account settings page
- Unsubscribe links in emails
- Direct API calls

## 📊 Monitoring and Analytics

### Promotional Email Metrics
- Total users eligible for emails
- Success/failure rates
- Delivery tracking
- Unsubscribe rates
- User engagement patterns

### Request Confirmation Tracking
- Email delivery status
- User acknowledgment
- Support ticket reduction
- User satisfaction improvement

## 🔒 Security Features

### Unsubscribe Tokens
- **Generation**: Cryptographically secure random tokens
- **Storage**: Hashed and stored securely in database
- **Validation**: Token-based unsubscribe verification
- **Expiration**: Tokens invalidated after use

### Rate Limiting
- **Email Frequency**: Maximum 1 promotional email per 3 days
- **User Control**: Users can disable specific email types
- **Admin Oversight**: All campaigns require admin authentication

### Data Protection
- **GDPR Compliance**: Clear unsubscribe mechanisms
- **User Consent**: Explicit opt-in for promotional emails
- **Data Minimization**: Only necessary data collected
- **Audit Trail**: Complete logging of email activities

## 🧪 Testing

### Development Testing
```bash
# Test welcome email
npm run dev
# Register a new user account

# Test promotional emails
npm run send-promotional-emails

# Test unsubscribe
# Click unsubscribe link in promotional email
```

### Production Testing
```bash
# Test with small user group
# Monitor delivery rates
# Check unsubscribe functionality
# Verify email templates render correctly
```

## 📈 Performance Considerations

### Email Delivery
- **Batch Processing**: Process users in batches to avoid rate limits
- **Retry Logic**: Automatic retry for failed deliveries
- **Queue Management**: Handle email queuing efficiently
- **Monitoring**: Real-time delivery status tracking

### Database Optimization
- **Indexing**: Proper indexes on email-related fields
- **Batch Updates**: Efficient bulk operations for tracking
- **Cleanup**: Regular cleanup of old unsubscribe tokens
- **Caching**: Cache frequently accessed user preferences

## 🚨 Troubleshooting

### Common Issues

#### Emails Not Sending
1. Check SMTP configuration
2. Verify environment variables
3. Check MongoDB connection
4. Review email preferences settings

#### High Bounce Rates
1. Verify sender email address
2. Check domain reputation
3. Review email content
4. Monitor spam folder placement

#### Unsubscribe Not Working
1. Verify token generation
2. Check database updates
3. Test unsubscribe flow
4. Review redirect URLs

### Debug Commands
```bash
# Check email system status
curl /api/admin/send-promotional-emails

# Test SMTP connection
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});
transporter.verify().then(console.log).catch(console.error);
"

# Check user email preferences
# Query MongoDB directly for user email settings
```

## 🔮 Future Enhancements

### Planned Features
- **A/B Testing**: Test different email templates
- **Segmentation**: Target specific user groups
- **Analytics Dashboard**: Visual email performance metrics
- **Template Editor**: Admin interface for email templates
- **Scheduling**: Advanced campaign scheduling options

### Integration Opportunities
- **CRM Systems**: Sync with customer relationship management
- **Marketing Tools**: Integrate with email marketing platforms
- **Analytics**: Connect with web analytics for conversion tracking
- **Automation**: Trigger emails based on user behavior

## 📚 Additional Resources

### Documentation
- [Email Template Guidelines](./EMAIL_TEMPLATES.md)
- [SMTP Configuration Guide](./SMTP_SETUP.md)
- [User Email Preferences](./EMAIL_PREFERENCES.md)

### Code Examples
- [Welcome Email Implementation](./examples/welcome-email.ts)
- [Promotional Email Campaign](./examples/promotional-campaign.ts)
- [Request Confirmation Flow](./examples/request-confirmation.ts)

### Best Practices
- [Email Deliverability Tips](./EMAIL_DELIVERABILITY.md)
- [Template Design Guidelines](./TEMPLATE_DESIGN.md)
- [Compliance Checklist](./EMAIL_COMPLIANCE.md)

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Maintainer**: CaptionCraft Development Team
