# 📧 CaptionCraft Email System Guide

## Overview

CaptionCraft features a comprehensive, beautifully designed email system that ensures consistent branding and excellent user experience across all email communications. This system includes welcome emails, promotional emails, password reset emails, contact confirmations, and more.

## 🎨 Design Principles

### **Consistent Branding**
- **Primary Colors**: Blue to purple gradient (`#667eea` to `#764ba2`)
- **Typography**: System fonts for maximum compatibility
- **Layout**: 600px max-width, centered design
- **Visual Hierarchy**: Clear sections with appropriate spacing

### **Email Client Compatibility**
- Responsive design that works on all devices
- Fallback text versions for accessibility
- Proper HTML structure for email clients
- Hidden preview text for better deliverability

### **User Experience**
- Clear call-to-action buttons
- Helpful information sections
- Professional yet friendly tone
- Easy unsubscribe options for promotional emails

## 📧 Email Templates

### 1. **Welcome Email** (`sendWelcomeEmail`)
**Purpose**: Sent to new users upon registration
**Subject**: `🎉 Welcome to CaptionCraft - Start Creating Amazing Captions!`

**Features**:
- Personalized greeting with user's name
- Overview of CaptionCraft capabilities
- Getting started guide
- Inspiration section with links to examples
- Email delivery notice

**Usage**:
```typescript
import { sendWelcomeEmail } from '@/lib/mail';

await sendWelcomeEmail({
  name: 'John Doe',
  email: 'john@example.com',
  username: 'johndoe'
});
```

### 2. **Promotional Email** (`sendPromotionalEmail`)
**Purpose**: Regular updates about new features and tips
**Subject**: `🚀 New CaptionCraft Features - Boost Your Social Media Game!`

**Features**:
- Weekly feature updates
- Pro tips and engagement hacks
- Call-to-action buttons
- Unsubscribe functionality
- Inspiration and template links

**Usage**:
```typescript
import { sendPromotionalEmail } from '@/lib/mail';

await sendPromotionalEmail({
  name: 'John Doe',
  email: 'john@example.com',
  username: 'johndoe',
  unsubscribeToken: 'unique-token-123'
});
```

### 3. **Password Reset Email** (`sendPasswordResetEmail`)
**Purpose**: Secure password reset functionality
**Subject**: `🔐 Reset Your CaptionCraft Password - Action Required`

**Features**:
- Secure reset links with expiration
- Security notices and warnings
- Spam folder guidance
- Professional security messaging

**Usage**:
```typescript
import { sendPasswordResetEmail } from '@/lib/mail';

await sendPasswordResetEmail(
  'user@example.com',
  'https://ai-caption-generator-pied.vercel.app/reset?token=abc123'
);
```

### 4. **Contact Confirmation Email** (`sendContactConfirmationEmail`)
**Purpose**: Confirmation when users submit contact forms
**Subject**: `✅ We received your message - CaptionCraft Support`

**Features**:
- Message receipt confirmation
- Submission details
- Next steps information
- Support contact information

**Usage**:
```typescript
import { sendContactConfirmationEmail } from '@/lib/mail';

await sendContactConfirmationEmail({
  name: 'John Doe',
  email: 'john@example.com',
  subject: 'Feature Request',
  message: 'I would like to request...',
  submissionId: 'CONTACT-12345'
});
```

### 5. **Request Confirmation Email** (`sendRequestConfirmationEmail`)
**Purpose**: Confirmation for data recovery/deletion requests
**Subject**: `📋 Request Received - CaptionCraft Support`

**Features**:
- Request type identification
- Processing timeline
- Next steps
- Support contact information

**Usage**:
```typescript
import { sendRequestConfirmationEmail } from '@/lib/mail';

await sendRequestConfirmationEmail({
  name: 'John Doe',
  email: 'john@example.com',
  requestType: 'data_recovery',
  requestId: 'REQ-12345',
  estimatedTime: '24-48 hours',
  nextSteps: [
    'Review your request',
    'Process data recovery',
    'Send confirmation'
  ]
});
```

## 🚀 Automated Email Campaigns

### **Promotional Email Sender**
**Script**: `scripts/send-promotional-emails.mjs`
**Purpose**: Automated sending of promotional emails every 3 days

**Features**:
- Smart user targeting (every 3 days)
- Email preference respect
- Unsubscribe token handling
- Rate limiting protection
- Comprehensive logging

**Usage**:
```bash
# Manual execution
node scripts/send-promotional-emails.mjs

# Via npm script
npm run send-promotional-emails

# Cron job (every 3 days at 9 AM)
0 9 */3 * * cd /path/to/captioncraft && node scripts/send-promotional-emails.mjs
```

## 🧪 Testing and Development

### **Email Template Testing**
**Script**: `scripts/test-email-templates.mjs`
**Purpose**: Test all email templates for rendering and SMTP delivery

**Usage**:
```bash
# Test email rendering only
node scripts/test-email-templates.mjs

# Via npm script
npm run test-emails
```

**Test Features**:
- Template rendering verification
- SMTP delivery testing
- Comprehensive error reporting
- Test data generation

## ⚙️ Configuration

### **Environment Variables**
```env
# SMTP Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
SMTP_FROM=CaptionCraft <ai.captioncraft@outlook.com>

# Application URLs
NEXTAUTH_URL=https://ai-caption-generator-pied.vercel.app
NEXT_PUBLIC_APP_URL=https://ai-caption-generator-pied.vercel.app
```

### **SMTP Providers**
The system works with any SMTP provider:
- **Brevo (formerly Sendinblue)**: Port 587, STARTTLS
- **Gmail**: Port 587, STARTTLS
- **Outlook**: Port 587, STARTTLS
- **Custom SMTP**: Any provider supporting SMTP

## 📱 Email Client Support

### **Tested Clients**
- ✅ Gmail (Web & Mobile)
- ✅ Outlook (Web & Desktop)
- ✅ Apple Mail
- ✅ Thunderbird
- ✅ Mobile email apps

### **Responsive Design**
- Mobile-first approach
- Flexible layouts
- Touch-friendly buttons
- Readable typography on all devices

## 🔒 Security Features

### **Email Security**
- SPF/DKIM support
- Secure unsubscribe tokens
- Rate limiting protection
- Spam folder guidance
- Professional sender addresses

### **Data Protection**
- Minimal data collection
- Secure token generation
- Privacy-compliant messaging
- Easy opt-out mechanisms

## 📊 Monitoring and Analytics

### **Delivery Tracking**
- Message ID logging
- SMTP response tracking
- Error reporting
- Success rate monitoring

### **User Engagement**
- Email preference management
- Unsubscribe tracking
- Delivery confirmation
- User feedback collection

## 🚨 Troubleshooting

### **Common Issues**

#### **Emails Not Sending**
1. Check SMTP configuration
2. Verify environment variables
3. Check SMTP provider status
4. Review server logs

#### **Emails in Spam Folder**
1. Add sender to contacts
2. Mark as "Not Spam"
3. Check SPF/DKIM setup
4. Review email content

#### **Template Rendering Issues**
1. Test with email template tester
2. Check HTML validation
3. Verify CSS compatibility
4. Test in multiple email clients

### **Debug Commands**
```bash
# Test email templates
npm run test-emails

# Check environment variables
npm run maintenance:env

# Test promotional email system
npm run send-promotional-emails
```

## 📈 Best Practices

### **Email Design**
- Keep content concise and engaging
- Use clear call-to-action buttons
- Include unsubscribe options
- Test across multiple email clients
- Optimize for mobile devices

### **Content Strategy**
- Regular but not excessive sending
- Valuable content over promotional
- User preference respect
- Clear value proposition
- Professional yet friendly tone

### **Technical Implementation**
- Proper error handling
- Comprehensive logging
- Rate limiting protection
- Secure token generation
- Email validation

## 🔮 Future Enhancements

### **Planned Features**
- A/B testing capabilities
- Advanced analytics dashboard
- Template customization tools
- Automated content generation
- Multi-language support

### **Integration Opportunities**
- CRM system integration
- Marketing automation tools
- Customer feedback systems
- Social media integration
- Analytics platforms

## 📚 Additional Resources

### **Documentation**
- [Email Automation System](./EMAIL_AUTOMATION_SYSTEM.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Setup Guide](./SETUP.md)

### **External Resources**
- [Email Client Support](https://www.campaignmonitor.com/resources/guides/coding-html-emails/)
- [SMTP Configuration](https://nodemailer.com/smtp/)
- [Email Best Practices](https://mailchimp.com/resources/email-marketing-best-practices/)

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Maintainer**: CaptionCraft Development Team
