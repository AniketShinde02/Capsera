import nodemailer from 'nodemailer';

const host = process.env.SMTP_HOST;
const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.SMTP_FROM || process.env.EMAIL_FROM || user;

if (!host || !port || !user || !pass) {
  console.warn('SMTP configuration is incomplete. Forgot-password emails will log the URL in the server console.');
}

export const transporter = (host && port && user && pass)
  ? nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // Brevo uses 587 typically (STARTTLS)
    auth: { user, pass },
  })
  : null;

// --- Email Template Helper ---

interface EmailTemplateOptions {
  title: string;
  previewText: string;
  heading: string;
  content: string;
  cta?: {
    text: string;
    url: string;
  };
  footerText?: string;
  baseUrl: string;
}

function getHtmlTemplate({ title, previewText, heading, content, cta, footerText, baseUrl }: EmailTemplateOptions): string {
  const logoUrl = `${baseUrl}/web-app-manifest-192x192.png`;
  const year = new Date().getFullYear();

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${title}</title>
      <meta name="description" content="${previewText}">
      <!--[if mso]>
      <style type="text/css">
        body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
      </style>
      <![endif]-->
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #e2e8f0;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #0f172a;">
        
        <!-- Container -->
        <div style="margin: 40px auto; background-color: #1e293b; border: 1px solid #334155; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          
          <!-- Header -->
          <div style="padding: 32px; text-align: center; border-bottom: 1px solid #334155; background-color: #1e293b;">
            <div style="margin-bottom: 16px;">
              <img src="${logoUrl}" alt="Capsera Logo" width="48" height="48" style="display: inline-block; border-radius: 10px;">
            </div>
            <h1 style="margin: 0; color: #f8fafc; font-size: 24px; font-weight: 700; letter-spacing: -0.025em;">Capsera</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 32px; background-color: #1e293b;">
            <h2 style="margin: 0 0 24px 0; color: #f8fafc; font-size: 24px; font-weight: 600; text-align: center; letter-spacing: -0.025em;">${heading}</h2>
            
            <div style="color: #cbd5e1; font-size: 16px; line-height: 1.6;">
              ${content}
            </div>
            
            ${cta ? `
            <!-- CTA Button -->
            <div style="text-align: center; margin: 32px 0;">
              <a href="${cta.url}" style="display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; transition: all 0.2s ease;">${cta.text}</a>
            </div>
            ` : ''}
            
            ${footerText ? `
            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #334155; font-size: 14px; color: #94a3b8; text-align: center;">
              ${footerText}
            </div>
            ` : ''}
          </div>
          
          <!-- Footer -->
          <div style="background-color: #0f172a; padding: 32px; text-align: center; border-top: 1px solid #334155;">
            <p style="margin: 0 0 12px 0; color: #f8fafc; font-weight: 600; font-size: 14px;">The Capsera Team</p>
            
            <div style="margin: 20px 0;">
              <a href="${baseUrl}" style="color: #38bdf8; text-decoration: none; font-size: 14px; font-weight: 500;">Visit Capsera →</a>
            </div>
            
            <p style="margin: 16px 0 0 0; color: #64748b; font-size: 12px;">
              Capsera - AI-Powered Caption Generation<br>
              © ${year} Capsera. All rights reserved.
            </p>
          </div>
          
        </div>
        
        <!-- Email client compatibility styles -->
        <div style="display: none; max-height: 0; overflow: hidden; color: #0f172a;">
          ${previewText}
        </div>
        
      </div>
    </body>
    </html>
  `;
}

// --- Email Functions ---

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  // Always log the URL in dev to make testing easy
  if (process.env.NODE_ENV !== 'production') {
    console.log('[DEV] Password reset URL:', resetUrl);
  }
  if (!transporter) {
    return { queued: false, logged: true };
  }

  // Get base URL for production links - require proper configuration
  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.capsera.online';
  if (!baseUrl) {
    console.error('❌ Missing NEXTAUTH_URL or NEXT_PUBLIC_APP_URL environment variable');
    return { queued: false, error: 'Missing app URL configuration' };
  }

  const productionResetUrl = resetUrl.replace(/http:\/\/localhost:\d+/, baseUrl);

  try {
    const info = await transporter.sendMail({
      from: `Capsera <${from}>`,
      to,
      subject: '🔐 Reset Your Capsera Password',
      text: `Hi there!\n\nWe received a request to reset your Capsera password.\n\nTo reset your password, click this link (valid for 1 hour):\n${productionResetUrl}\n\nIf you didn't request this, you can safely ignore this email.\n\nBest regards,\nThe Capsera Team\n${baseUrl}`,
      html: getHtmlTemplate({
        title: 'Reset Your Capsera Password',
        previewText: 'Capsera password reset request. Click to reset your password securely.',
        heading: 'Reset Your Password',
        baseUrl,
        content: `
          <p style="margin-bottom: 24px;">Hello there!</p>
          <p style="margin-bottom: 24px;">We received a request to reset your Capsera password. To proceed with resetting your password, please click the button below.</p>
          
          <div style="background-color: #1a1a1a; border: 1px solid #333333; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 8px;">
            <p style="margin: 0 0 8px 0; color: #f59e0b; font-weight: 600; font-size: 14px;">⚠️ Security Notice:</p>
            <ul style="margin: 0; padding-left: 20px; color: #d1d5db; font-size: 14px; line-height: 1.5;">
              <li>This link is valid for only <strong>1 hour</strong></li>
              <li>The link can only be used once</li>
            </ul>
          </div>
          
          <p style="margin-top: 24px; font-size: 14px; color: #9ca3af;">
            If the button doesn't work, copy and paste this link:<br>
            <code style="display: block; margin-top: 8px; padding: 12px; background: #000000; border: 1px solid #333333; border-radius: 6px; color: #06b6d4; word-break: break-all;">${productionResetUrl}</code>
          </p>
        `,
        cta: {
          text: 'Reset My Password',
          url: productionResetUrl
        }
      })
    });
    console.log('SMTP message queued. id:', info.messageId, 'response:', info.response);
    return { queued: true, messageId: info.messageId };
  } catch (err) {
    console.error('SMTP send failed:', err);
    // Still surface the URL in logs for manual testing
    return { queued: false, error: String(err) };
  }
}

interface ContactConfirmationData {
  name: string;
  email: string;
  subject: string;
  message: string;
  submissionId: string;
}

// New interfaces for different email types
interface WelcomeEmailData {
  name: string;
  email: string;
  username?: string;
}

interface PromotionalEmailData {
  name: string;
  email: string;
  username?: string;
  unsubscribeToken: string;
}

interface RequestConfirmationData {
  name: string;
  email: string;
  requestType: 'data_recovery' | 'data_deletion' | 'profile_deletion' | 'other';
  requestId: string;
  estimatedTime: string;
  nextSteps: string[];
}

export async function sendContactConfirmationEmail(data: ContactConfirmationData) {
  // Always log in dev for testing
  if (process.env.NODE_ENV !== 'production') {
    console.log('[DEV] Contact form submission:', {
      name: data.name,
      email: data.email,
      subject: data.subject,
      submissionId: data.submissionId
    });
  }

  if (!transporter) {
    console.log('📧 SMTP not configured - contact confirmation would be sent to:', data.email);
    return { queued: false, logged: true };
  }

  // Get base URL - require proper configuration
  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.capsera.online';
  if (!baseUrl) {
    console.error('❌ Missing NEXTAUTH_URL or NEXT_PUBLIC_APP_URL environment variable');
    return { queued: false, error: 'Missing app URL configuration' };
  }

  try {
    const info = await transporter.sendMail({
      from: `Capsera Support <${from}>`,
      to: data.email,
      subject: '✅ We received your message - Capsera Support',
      text: `Hi ${data.name}!\n\nThank you for reaching out to Capsera! We've successfully received your message.\n\nYour Message Details:\nSubject: ${data.subject}\nSubmission ID: ${data.submissionId}\n\nBest regards,\nThe Capsera Team\n${baseUrl}`,
      html: getHtmlTemplate({
        title: 'Message Received - Capsera',
        previewText: 'We received your message and our team will review it shortly.',
        heading: 'Message Received!',
        baseUrl,
        content: `
          <p style="margin-bottom: 24px;">Hi <strong>${data.name}</strong>!</p>
          <p style="margin-bottom: 24px;">Thank you for reaching out to Capsera! We've successfully received your message and our team is excited to help you.</p>
          
          <div style="background-color: #1a1a1a; border: 1px solid #333333; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <h3 style="margin: 0 0 16px 0; color: #ffffff; font-size: 16px; font-weight: 600;">📋 Your Message Details</h3>
            <div style="margin-bottom: 12px;">
              <span style="color: #9ca3af; font-size: 14px; font-weight: 500;">Subject:</span>
              <span style="color: #e5e7eb; font-size: 14px; margin-left: 8px;">${data.subject}</span>
            </div>
            <div style="margin-bottom: 12px;">
              <span style="color: #9ca3af; font-size: 14px; font-weight: 500;">Submission ID:</span>
              <span style="color: #06b6d4; font-size: 14px; margin-left: 8px; font-family: monospace;">${data.submissionId}</span>
            </div>
          </div>
          
          <div style="background-color: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <h3 style="margin: 0 0 16px 0; color: #60a5fa; font-size: 16px; font-weight: 600;">🚀 What happens next?</h3>
            <ul style="margin: 0; padding-left: 20px; color: #93c5fd; font-size: 14px; line-height: 1.6;">
              <li style="margin-bottom: 8px;">Our team will review your message within <strong>24 hours</strong></li>
              <li style="margin-bottom: 8px;">You'll receive a personalized response from our support team</li>
            </ul>
          </div>
        `,
        cta: {
          text: 'Explore Capsera',
          url: baseUrl
        }
      })
    });

    console.log('📧 Contact confirmation email sent to:', data.email, 'Message ID:', info.messageId);
    return { queued: true, messageId: info.messageId };

  } catch (err) {
    console.error('📧 Failed to send contact confirmation email:', err);
    return { queued: false, error: String(err) };
  }
}

// New function: Send welcome email to new users
export async function sendWelcomeEmail(data: WelcomeEmailData) {
  // Always log in dev for testing
  if (process.env.NODE_ENV !== 'production') {
    console.log('[DEV] Welcome email would be sent to:', data.email);
  }

  if (!transporter) {
    console.log('📧 SMTP not configured - welcome email would be sent to:', data.email);
    return { queued: false, logged: true };
  }

  // Get base URL - require proper configuration
  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.capsera.online';
  if (!baseUrl) {
    console.error('❌ Missing NEXTAUTH_URL or NEXT_PUBLIC_APP_URL environment variable');
    return { queued: false, error: 'Missing app URL configuration' };
  }

  const displayName = data.name || data.username || data.email.split('@')[0];

  try {
    const info = await transporter.sendMail({
      from: `Capsera <${from}>`,
      to: data.email,
      subject: '🎉 Welcome to Capsera - Start Creating Amazing Captions!',
      text: `Hi ${displayName}!\n\nWelcome to Capsera! 🎉\n\nWe're thrilled to have you join our community.\n\nReady to get started? Visit: ${baseUrl}\n\nBest regards,\nThe Capsera Team\n${baseUrl}`,
      html: getHtmlTemplate({
        title: 'Welcome to Capsera',
        previewText: 'Welcome to Capsera! Start generating AI-powered captions that will boost your social media engagement.',
        heading: 'Welcome to Capsera! 🎉',
        baseUrl,
        content: `
          <p style="margin-bottom: 24px;">Hi <strong>${displayName}</strong>!</p>
          <p style="margin-bottom: 32px;">We're thrilled to have you join our community of creators who are revolutionizing their social media game with AI-powered captions. Get ready to transform your content!</p>
          
          <div style="background-color: #1a1a1a; border: 1px solid #333333; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <h3 style="margin: 0 0 16px 0; color: #f59e0b; font-size: 18px; font-weight: 600;">🚀 What You Can Do</h3>
            <ul style="margin: 0; padding-left: 20px; color: #d1d5db; font-size: 14px; line-height: 1.6;">
              <li style="margin-bottom: 8px;">Generate engaging captions in seconds with AI</li>
              <li style="margin-bottom: 8px;">Choose from multiple styles and tones</li>
              <li style="margin-bottom: 8px;">Get inspiration from our template library</li>
            </ul>
          </div>
          
          <div style="background-color: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <h3 style="margin: 0 0 12px 0; color: #60a5fa; font-size: 16px; font-weight: 600;">💡 Getting Started</h3>
            <p style="margin: 0; color: #93c5fd; font-size: 14px; line-height: 1.5;">
              <strong>Quick Start:</strong> Upload an image, describe your content, and let our AI generate the perfect caption for your social media post!
            </p>
          </div>
        `,
        cta: {
          text: 'Start Creating Now',
          url: baseUrl
        },
        footerText: `If you have any questions, reply to this email or visit our <a href="${baseUrl}/help" style="color: #06b6d4; text-decoration: none;">Help Center</a>.`
      })
    });
    console.log('SMTP welcome message queued. id:', info.messageId, 'response:', info.response);
    return { queued: true, messageId: info.messageId };
  } catch (err) {
    console.error('SMTP welcome send failed:', err);
    return { queued: false, error: String(err) };
  }
}

// New function: Send promotional/marketing emails
export async function sendPromotionalEmail(data: PromotionalEmailData) {
  // Always log in dev for testing
  if (process.env.NODE_ENV !== 'production') {
    console.log('[DEV] Promotional email would be sent to:', data.email);
  }

  if (!transporter) {
    console.log('📧 SMTP not configured - promotional email would be sent to:', data.email);
    return { queued: false, logged: true };
  }

  // Get base URL - require proper configuration
  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.capsera.online';
  if (!baseUrl) {
    console.error('❌ Missing NEXTAUTH_URL or NEXT_PUBLIC_APP_URL environment variable');
    return { queued: false, error: 'Missing app URL configuration' };
  }

  const displayName = data.name || data.username || data.email.split('@')[0];
  const unsubscribeUrl = `${baseUrl}/unsubscribe?token=${data.unsubscribeToken}`;

  try {
    const info = await transporter.sendMail({
      from: `Capsera <${from}>`,
      to: data.email,
      subject: '🚀 New Capsera Features - Boost Your Social Media Game!',
      text: `Hi ${displayName}!\n\nReady to take your social media captions to the next level?\n\nCheck out what's new at Capsera!\n\nUnsubscribe: ${unsubscribeUrl}\n\nBest regards,\nThe Capsera Team\n${baseUrl}`,
      html: getHtmlTemplate({
        title: 'New Capsera Features',
        previewText: 'Discover new AI-powered caption generation features and pro tips to boost your social media engagement.',
        heading: 'Boost Your Social Media Game! 🚀',
        baseUrl,
        content: `
          <p style="margin-bottom: 24px;">Hi <strong>${displayName}</strong>!</p>
          <p style="margin-bottom: 32px;">Ready to take your social media captions to the next level? We've got some exciting updates and features that will help you create even more engaging content!</p>
          
          <div style="background-color: #1a1a1a; border: 1px solid #333333; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <h3 style="margin: 0 0 16px 0; color: #f59e0b; font-size: 18px; font-weight: 600;">🎯 What's New This Week</h3>
            <ul style="margin: 0; padding-left: 20px; color: #d1d5db; font-size: 14px; line-height: 1.6;">
              <li style="margin-bottom: 8px;">Advanced AI caption generation with better context understanding</li>
              <li style="margin-bottom: 8px;">New caption styles: Professional, Casual, and Creative</li>
              <li style="margin-bottom: 8px;">Community challenges and caption contests</li>
            </ul>
          </div>
          
          <div style="background-color: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <h3 style="margin: 0 0 12px 0; color: #60a5fa; font-size: 16px; font-weight: 600;">💡 Pro Tip of the Week</h3>
            <p style="margin: 0; color: #93c5fd; font-size: 14px; line-height: 1.5;">
              <strong>Engagement Hack:</strong> Ask questions in your captions! Questions like "What's your favorite?" or "Tag someone who needs to see this" can increase engagement by up to 2x.
            </p>
          </div>
        `,
        cta: {
          text: 'Check It Out',
          url: baseUrl
        },
        footerText: `You're receiving this because you're a Capsera user.<br><a href="${unsubscribeUrl}" style="color: #6b7280; text-decoration: underline;">Unsubscribe from promotional emails</a>`
      })
    });
    console.log('SMTP promotional message queued. id:', info.messageId, 'response:', info.response);
    return { queued: true, messageId: info.messageId };
  } catch (err) {
    console.error('SMTP promotional send failed:', err);
    return { queued: false, error: String(err) };
  }
}

// New function: Send request confirmation emails
export async function sendRequestConfirmationEmail(data: RequestConfirmationData) {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[DEV] Request confirmation email would be sent to:', data.email);
  }

  if (!transporter) {
    console.log('📧 SMTP not configured - request confirmation would be sent to:', data.email);
    return { queued: false, logged: true };
  }

  // Get base URL - require proper configuration
  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.capsera.online';
  if (!baseUrl) {
    console.error('❌ Missing NEXTAUTH_URL or NEXT_PUBLIC_APP_URL environment variable');
    return { queued: false, error: 'Missing app URL configuration' };
  }

  // Map request types to friendly names
  const requestTypeNames = {
    'data_deletion': 'Data Deletion Request',
    'profile_deletion': 'Profile Deletion Request',
    'other': 'Support Request'
  };

  const requestTypeName = requestTypeNames[data.requestType] || 'Support Request';

  try {
    const info = await transporter.sendMail({
      from: `Capsera Support <${from}>`,
      to: data.email,
      subject: `✅ Request Received - ${requestTypeName} - Capsera`,
      text: `Hi ${data.name}!\n\nThank you for submitting your ${requestTypeName.toLowerCase()} to Capsera. We've successfully received your request.\n\nRequest ID: ${data.requestId}\n\nBest regards,\nThe Capsera Support Team\n${baseUrl}`,
      html: getHtmlTemplate({
        title: 'Request Received - Capsera',
        previewText: `We received your ${requestTypeName.toLowerCase()} and are processing it.`,
        heading: 'Request Received!',
        baseUrl,
        content: `
          <p style="margin-bottom: 24px;">Hi <strong>${data.name}</strong>!</p>
          <p style="margin-bottom: 24px;">Thank you for submitting your <strong>${requestTypeName.toLowerCase()}</strong> to Capsera. We've successfully received your request and our team is working on it.</p>
          
          <div style="background-color: #1a1a1a; border: 1px solid #333333; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <h3 style="margin: 0 0 16px 0; color: #ffffff; font-size: 16px; font-weight: 600;">📋 Request Details</h3>
            <div style="margin-bottom: 12px;">
              <span style="color: #9ca3af; font-size: 14px; font-weight: 500;">Request ID:</span>
              <span style="color: #06b6d4; font-size: 14px; margin-left: 8px; font-family: monospace;">${data.requestId}</span>
            </div>
            <div style="margin-bottom: 12px;">
              <span style="color: #9ca3af; font-size: 14px; font-weight: 500;">Type:</span>
              <span style="color: #e5e7eb; font-size: 14px; margin-left: 8px;">${requestTypeName}</span>
            </div>
            <div>
              <span style="color: #9ca3af; font-size: 14px; font-weight: 500;">Estimated Time:</span>
              <span style="color: #e5e7eb; font-size: 14px; margin-left: 8px;">${data.estimatedTime}</span>
            </div>
          </div>
          
          <div style="background-color: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <h3 style="margin: 0 0 16px 0; color: #60a5fa; font-size: 16px; font-weight: 600;">🚀 What happens next?</h3>
            <ul style="margin: 0; padding-left: 20px; color: #93c5fd; font-size: 14px; line-height: 1.6;">
              ${data.nextSteps.map(step => `<li style="margin-bottom: 8px;">${step}</li>`).join('')}
            </ul>
          </div>
        `,
        footerText: `We'll keep you updated on the progress of your request. Thank you for your patience!`
      })
    });

    console.log('📧 Request confirmation email sent to:', data.email, 'Message ID:', info.messageId);
    return { queued: true, messageId: info.messageId };

  } catch (err) {
    console.error('📧 Failed to send request confirmation email:', err);
    return { queued: false, error: String(err) };
  }
}
