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

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  // Always log the URL in dev to make testing easy
  if (process.env.NODE_ENV !== 'production') {
    console.log('[DEV] Password reset URL:', resetUrl);
  }
  if (!transporter) {
    return { queued: false, logged: true };
  }
  
  // Get base URL for production links - require proper configuration
  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (!baseUrl) {
    console.error('❌ Missing NEXTAUTH_URL or NEXT_PUBLIC_APP_URL environment variable');
    return { queued: false, error: 'Missing app URL configuration' };
  }
  
  const productionResetUrl = resetUrl.replace(/http:\/\/localhost:\d+/, baseUrl);
  
  try {
    const info = await transporter.sendMail({
      from: `Capsera <${from}>`,
      to,
      subject: '🔐 Reset Your Capsera Password - Action Required',
      text: `Hi there!\n\nWe received a request to reset your Capsera password.\n\nTo reset your password, click this link (valid for 1 hour):\n${productionResetUrl}\n\n⚠️ If this email landed in your spam folder, please mark it as "Not Spam" to ensure you receive future communications from us.\n\nIf you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.\n\nBest regards,\nThe Capsera Team\n\n---\nCapsera - AI-Powered Caption Generation\n${baseUrl}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Reset Your Capsera Password</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px; text-align: center;">
              <div style="display: inline-flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                <div style="background: rgba(255, 255, 255, 0.2); padding: 8px; border-radius: 8px;">
                  <div 
                    style="background: rgba(255, 255, 255, 0.2); padding: 8px; border-radius: 8px; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;"
                  >
                    <span style="color: white; font-weight: bold; font-size: 16px;">C</span>
                  </div>
                </div>
                <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 700;">Capsera</h1>
              </div>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">AI-Powered Caption Generation</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 32px;">
              <h2 style="margin: 0 0 24px 0; color: #1f2937; font-size: 28px; font-weight: 700; text-align: center;">🔐 Reset Your Password</h2>
              
              <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">Hello there!</p>
              
              <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                We received a request to reset your Capsera password. To proceed with resetting your password, please click the button below.
              </p>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${productionResetUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); transition: all 0.2s ease;">Reset My Password</a>
              </div>
              
              <!-- Security Info -->
              <div style="background-color: #f3f4f6; border-left: 4px solid #fbbf24; padding: 16px; margin: 24px 0; border-radius: 4px;">
                <p style="margin: 0 0 8px 0; color: #92400e; font-weight: 600; font-size: 14px;">⚠️ Important Security Notice:</p>
                <ul style="margin: 0; padding-left: 20px; color: #78350f; font-size: 14px; line-height: 1.5;">
                  <li>This link is valid for only <strong>1 hour</strong></li>
                  <li>The link can only be used once</li>
                  <li>If this email is in your spam folder, please mark it as "Not Spam"</li>
                </ul>
              </div>
              
              <p style="margin: 24px 0 0 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                If the button above doesn't work, you can copy and paste this link into your browser:
              </p>
              
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; margin: 16px 0; word-break: break-all;">
                <code style="color: #374151; font-size: 14px; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;">${productionResetUrl}</code>
              </div>
              
              <!-- Help Section -->
              <div style="background-color: #eff6ff; border: 1px solid #dbeafe; border-radius: 8px; padding: 20px; margin: 32px 0;">
                <h3 style="margin: 0 0 12px 0; color: #1e40af; font-size: 16px; font-weight: 600;">📧 Email Delivery Notice</h3>
                <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.5;">
                  If this email ended up in your <strong>spam/junk folder</strong>, please mark it as "Not Spam" or add <strong>ai.captioncraft@outlook.com</strong> to your contacts. This helps ensure you receive important updates from CaptionCraft.
                </p>
              </div>
              
              <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                <strong>Didn't request this?</strong> You can safely ignore this email. Your password will remain unchanged. However, if you keep receiving these emails, please contact our support team.
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 32px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">Best regards,</p>
              <p style="margin: 0 0 16px 0; color: #374151; font-weight: 600; font-size: 16px;">The CaptionCraft Team</p>
              
              <div style="margin: 20px 0;">
                <a href="${baseUrl}" style="color: #667eea; text-decoration: none; font-size: 14px; font-weight: 500;">Visit CaptionCraft →</a>
              </div>
              
              <p style="margin: 16px 0 0 0; color: #9ca3af; font-size: 12px;">
                CaptionCraft - AI-Powered Caption Generation for Creators Worldwide<br>
                © 2024 CaptionCraft. All rights reserved.
              </p>
            </div>
            
          </div>
          
          <!-- Email client compatibility styles -->
          <div style="display: none; max-height: 0; overflow: hidden;">
            CaptionCraft password reset request. Click to reset your password securely. This email contains important security information for your account.
          </div>
          
        </body>
        </html>
      `,
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
  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (!baseUrl) {
    console.error('❌ Missing NEXTAUTH_URL or NEXT_PUBLIC_APP_URL environment variable');
    return { queued: false, error: 'Missing app URL configuration' };
  }

  try {
    const info = await transporter.sendMail({
      from: `CaptionCraft Support <${from}>`,
      to: data.email,
      subject: '✅ We received your message - CaptionCraft Support',
      text: `Hi ${data.name}!\n\nThank you for reaching out to CaptionCraft! We've successfully received your message.\n\nYour Message Details:\nSubject: ${data.subject}\nSubmission ID: ${data.submissionId}\n\nWhat happens next?\n• Our team will review your message within 24 hours\n• You'll receive a personalized response from our support team\n• For urgent matters, you can also reach us at ai.captioncraft@outlook.com\n\nIn the meantime, feel free to explore CaptionCraft and start creating amazing captions for your social media content!\n\nBest regards,\nThe CaptionCraft Team\n\n---\nCaptionCraft - AI-Powered Caption Generation\n${baseUrl}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Message Received - CaptionCraft</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
            
            <!-- Header with CaptionCraft Branding -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px; text-align: center;">
              <div style="display: inline-flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                <div style="background: rgba(255, 255, 255, 0.2); padding: 8px; border-radius: 8px;">
                  <div style="width: 24px; height: 24px; color: white; font-size: 20px;">✅</div>
                </div>
                <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 700;">CaptionCraft</h1>
              </div>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">AI-Powered Caption Generation</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 32px;">
              <div style="text-align: center; margin-bottom: 32px;">
                <div style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; padding: 16px; margin-bottom: 16px;">
                  <div style="width: 32px; height: 32px; color: white; font-size: 28px; line-height: 32px;">✅</div>
                </div>
                <h2 style="margin: 0; color: #1f2937; font-size: 28px; font-weight: 700;">Message Received!</h2>
              </div>
              
              <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">Hi <strong>${data.name}</strong>!</p>
              
              <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Thank you for reaching out to CaptionCraft! We've successfully received your message and our team is excited to help you.
              </p>
              
              <!-- Message Details -->
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <h3 style="margin: 0 0 16px 0; color: #374151; font-size: 16px; font-weight: 600;">📋 Your Message Details</h3>
                <div style="margin-bottom: 12px;">
                  <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Subject:</span>
                  <span style="color: #374151; font-size: 14px; margin-left: 8px;">${data.subject}</span>
                </div>
                <div style="margin-bottom: 12px;">
                  <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Submission ID:</span>
                  <span style="color: #374151; font-size: 14px; margin-left: 8px; font-family: monospace;">${data.submissionId}</span>
                </div>
                <div>
                  <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Email:</span>
                  <span style="color: #374151; font-size: 14px; margin-left: 8px;">${data.email}</span>
                </div>
              </div>
              
              <!-- Next Steps -->
              <div style="background-color: #eff6ff; border: 1px solid #dbeafe; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <h3 style="margin: 0 0 16px 0; color: #1e40af; font-size: 16px; font-weight: 600;">🚀 What happens next?</h3>
                <ul style="margin: 0; padding-left: 20px; color: #1e40af; font-size: 14px; line-height: 1.6;">
                  <li style="margin-bottom: 8px;">Our team will review your message within <strong>24 hours</strong></li>
                  <li style="margin-bottom: 8px;">You'll receive a personalized response from our support team</li>
                  <li>For urgent matters, you can reach us directly at <strong>ai.captioncraft@outlook.com</strong></li>
                </ul>
              </div>
              
              <!-- CTA -->
              <div style="text-align: center; margin: 32px 0;">
                <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 16px;">In the meantime, start creating amazing captions!</p>
                <a href="${baseUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); transition: all 0.2s ease;">Explore CaptionCraft</a>
              </div>
              
              <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
                <strong>Need immediate help?</strong> Check out our <a href="${baseUrl}/help" style="color: #667eea; text-decoration: none;">Help Center</a> or email us directly.
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 32px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">Best regards,</p>
              <p style="margin: 0 0 16px 0; color: #374151; font-weight: 600; font-size: 16px;">The CaptionCraft Team</p>
              
              <div style="margin: 20px 0;">
                <a href="${baseUrl}" style="color: #667eea; text-decoration: none; font-size: 14px; font-weight: 500;">Visit CaptionCraft →</a>
              </div>
              
              <p style="margin: 16px 0 0 0; color: #9ca3af; font-size: 12px;">
                CaptionCraft - AI-Powered Caption Generation for Creators Worldwide<br>
                © 2024 CaptionCraft. All rights reserved.
              </p>
            </div>
            
          </div>
        </body>
        </html>
      `,
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
  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (!baseUrl) {
    console.error('❌ Missing NEXTAUTH_URL or NEXT_PUBLIC_APP_URL environment variable');
    return { queued: false, error: 'Missing app URL configuration' };
  }

  const displayName = data.name || data.username || data.email.split('@')[0];

  try {
    const info = await transporter.sendMail({
      from: `CaptionCraft <${from}>`,
      to: data.email,
      subject: '🎉 Welcome to CaptionCraft - Start Creating Amazing Captions!',
      text: `Hi ${displayName}!\n\nWelcome to CaptionCraft! 🎉\n\nWe're thrilled to have you join our community of creators who are revolutionizing their social media game with AI-powered captions.\n\n🚀 What you can do with CaptionCraft:\n• Generate engaging captions in seconds\n• Choose from multiple styles and tones\n• Get inspiration from our template library\n• Join our community challenges\n\nReady to get started? Visit: ${baseUrl}\n\nNeed help? Check out our examples and templates at ${baseUrl}/examples\n\nBest regards,\nThe CaptionCraft Team\n\n---\nCaptionCraft - AI-Powered Caption Generation\n${baseUrl}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Welcome to CaptionCraft - Start Creating Amazing Captions</title>
          <meta name="description" content="Welcome to CaptionCraft! Start generating AI-powered captions that will boost your social media engagement.">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
            
            <!-- Header with CaptionCraft Branding -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px; text-align: center;">
              <div style="display: inline-flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                <div style="background: rgba(255, 255, 255, 0.2); padding: 8px; border-radius: 8px;">
                  <div style="width: 24px; height: 24px; color: white; font-size: 20px;">🎉</div>
                </div>
                <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 700;">CaptionCraft</h1>
              </div>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">AI-Powered Caption Generation</p>
            </div>
            
            <!-- Main Content -->
            <div style="padding: 40px 32px;">
              <h2 style="margin: 0 0 24px 0; color: #1f2937; font-size: 28px; font-weight: 700; text-align: center;">Welcome to CaptionCraft! 🎉</h2>
              
              <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">Hi <strong>${displayName}</strong>!</p>
              
              <p style="margin: 0 0 32px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                We're thrilled to have you join our community of creators who are revolutionizing their social media game with AI-powered captions. Get ready to transform your content and boost your engagement!
              </p>
              
              <!-- What You Can Do Section -->
              <div style="background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 24px; margin: 24px 0;">
                <h3 style="margin: 0 0 16px 0; color: #92400e; font-size: 18px; font-weight: 600;">🚀 What You Can Do with CaptionCraft</h3>
                <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 14px; line-height: 1.6;">
                  <li style="margin-bottom: 8px;">Generate engaging captions in seconds with AI</li>
                  <li style="margin-bottom: 8px;">Choose from multiple styles and tones</li>
                  <li style="margin-bottom: 8px;">Get inspiration from our template library</li>
                  <li>Join our community challenges and contests</li>
                </ul>
              </div>
              
              <!-- Getting Started Section -->
              <div style="background-color: #eff6ff; border: 1px solid #dbeafe; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <h3 style="margin: 0 0 12px 0; color: #1e40af; font-size: 16px; font-weight: 600;">💡 Getting Started</h3>
                <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.5;">
                  <strong>Quick Start:</strong> Upload an image, describe your content, and let our AI generate the perfect caption for your social media post!
                </p>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${baseUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); transition: all 0.2s ease;">Start Creating Now</a>
              </div>
              
              <!-- Inspiration Section -->
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <h3 style="margin: 0 0 12px 0; color: #166534; font-size: 16px; font-weight: 600;">✨ Need Inspiration?</h3>
                <p style="margin: 0; color: #166534; font-size: 14px; line-height: 1.5;">
                  Check out our <a href="${baseUrl}/examples" style="color: #059669; text-decoration: none; font-weight: 500;">caption examples</a> and <a href="${baseUrl}/templates" style="color: #059669; text-decoration: none; font-weight: 500;">templates</a> to get started.
                </p>
              </div>
              
              <!-- Email Delivery Notice -->
              <div style="background-color: #f3f4f6; border-left: 4px solid #fbbf24; padding: 16px; margin: 24px 0; border-radius: 4px;">
                <p style="margin: 0 0 8px 0; color: #92400e; font-weight: 600; font-size: 14px;">📧 Email Delivery Notice</p>
                <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.5;">
                  If this email ended up in your <strong>spam/junk folder</strong>, please mark it as "Not Spam" or add <strong>${from}</strong> to your contacts to ensure you receive important updates.
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 32px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">Best regards,</p>
              <p style="margin: 0 0 16px 0; color: #374151; font-weight: 600; font-size: 16px;">The CaptionCraft Team</p>
              
              <div style="margin: 20px 0;">
                <a href="${baseUrl}" style="color: #667eea; text-decoration: none; font-size: 14px; font-weight: 500;">Visit CaptionCraft →</a>
              </div>
              
              <p style="margin: 16px 0 0 0; color: #9ca3af; font-size: 12px;">
                CaptionCraft - AI-Powered Caption Generation for Creators Worldwide<br>
                © 2024 CaptionCraft. All rights reserved.
              </p>
            </div>
            
          </div>
          
          <!-- Email client compatibility styles -->
          <div style="display: none; max-height: 0; overflow: hidden;">
            Welcome to CaptionCraft! Start generating AI-powered captions that will boost your social media engagement. Join our community of creators.
          </div>
          
        </body>
        </html>
      `,
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
  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (!baseUrl) {
    console.error('❌ Missing NEXTAUTH_URL or NEXT_PUBLIC_APP_URL environment variable');
    return { queued: false, error: 'Missing app URL configuration' };
  }

  const displayName = data.name || data.username || data.email.split('@')[0];
  const unsubscribeUrl = `${baseUrl}/unsubscribe?token=${data.unsubscribeToken}`;

  try {
    const info = await transporter.sendMail({
      from: `CaptionCraft <${from}>`,
      to: data.email,
      subject: '🚀 New CaptionCraft Features - Boost Your Social Media Game!',
      text: `Hi ${displayName}!\n\nReady to take your social media captions to the next level?\n\n🎯 What's New:\n• Advanced AI caption generation with better context understanding\n• New caption styles: Professional, Casual, and Creative\n• Community challenges and caption contests\n• Pro tips from top creators and social media experts\n\n💡 Pro Tip: Ask questions in your captions! Questions like "What's your favorite?" or "Tag someone who needs to see this" can increase engagement by up to 2x.\n\nStart creating: ${baseUrl}\n\nNeed inspiration? Check out our examples and templates at ${baseUrl}/examples\n\nUnsubscribe: ${unsubscribeUrl}\n\nBest regards,\nThe CaptionCraft Team\n\n---\nCaptionCraft - AI-Powered Caption Generation\n${baseUrl}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>New CaptionCraft Features - Boost Your Social Media Game</title>
          <meta name="description" content="Discover new AI-powered caption generation features and pro tips to boost your social media engagement.">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
            
            <!-- Header with CaptionCraft Branding -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px; text-align: center;">
              <div style="display: inline-flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                <div style="background: rgba(255, 255, 255, 0.2); padding: 8px; border-radius: 8px;">
                  <div style="width: 24px; height: 24px; color: white; font-size: 20px;">🚀</div>
                </div>
                <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 700;">CaptionCraft</h1>
              </div>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">AI-Powered Caption Generation</p>
            </div>
            
            <!-- Main Content -->
            <div style="padding: 40px 32px;">
              <h2 style="margin: 0 0 24px 0; color: #1f2937; font-size: 28px; font-weight: 700; text-align: center;">🚀 Boost Your Social Media Game!</h2>
              
              <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">Hi <strong>${displayName}</strong>!</p>
              
              <p style="margin: 0 0 32px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Ready to take your social media captions to the next level? We've got some exciting updates and features that will help you create even more engaging content!
              </p>
              
              <!-- New Features Section -->
              <div style="background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 24px; margin: 24px 0;">
                <h3 style="margin: 0 0 16px 0; color: #92400e; font-size: 18px; font-weight: 600;">🎯 What's New This Week</h3>
                <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 14px; line-height: 1.6;">
                  <li style="margin-bottom: 8px;">Advanced AI caption generation with better context understanding</li>
                  <li style="margin-bottom: 8px;">New caption styles: Professional, Casual, and Creative</li>
                  <li style="margin-bottom: 8px;">Community challenges and caption contests</li>
                  <li>Pro tips from top creators and social media experts</li>
                </ul>
              </div>
              
              <!-- Pro Tip Section -->
              <div style="background-color: #eff6ff; border: 1px solid #dbeafe; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <h3 style="margin: 0 0 12px 0; color: #1e40af; font-size: 16px; font-weight: 600;">💡 Pro Tip of the Week</h3>
                <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.5;">
                  <strong>Engagement Hack:</strong> Ask questions in your captions! Questions like "What's your favorite?" or "Tag someone who needs to see this" can increase engagement by up to 2x.
                </p>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${baseUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); transition: all 0.2s ease;">Start Creating Now</a>
              </div>
              
              <!-- Inspiration Section -->
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <h3 style="margin: 0 0 12px 0; color: #166534; font-size: 16px; font-weight: 600;">✨ Need Inspiration?</h3>
                <p style="margin: 0; color: #166534; font-size: 14px; line-height: 1.5;">
                  Check out our <a href="${baseUrl}/examples" style="color: #059669; text-decoration: none; font-weight: 500;">caption examples</a> and <a href="${baseUrl}/templates" style="color: #059669; text-decoration: none; font-weight: 500;">templates</a> to get started.
                </p>
              </div>
              
              <!-- Email Delivery Notice -->
              <div style="background-color: #f3f4f6; border-left: 4px solid #fbbf24; padding: 16px; margin: 24px 0; border-radius: 4px;">
                <p style="margin: 0 0 8px 0; color: #92400e; font-weight: 600; font-size: 14px;">📧 Email Delivery Notice</p>
                <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.5;">
                  If this email ended up in your <strong>spam/junk folder</strong>, please mark it as "Not Spam" or add <strong>${from}</strong> to your contacts to ensure you receive future updates.
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 32px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">Best regards,</p>
              <p style="margin: 0 0 16px 0; color: #374151; font-weight: 600; font-size: 16px;">The CaptionCraft Team</p>
              
              <div style="margin: 20px 0;">
                <a href="${baseUrl}" style="color: #667eea; text-decoration: none; font-size: 14px; font-weight: 500;">Visit CaptionCraft →</a>
              </div>
              
              <p style="margin: 16px 0 0 0; color: #9ca3af; font-size: 12px;">
                CaptionCraft - AI-Powered Caption Generation for Creators Worldwide<br>
                © 2024 CaptionCraft. All rights reserved.
              </p>
              
              <!-- Unsubscribe Section -->
              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 8px 0; color: #9ca3af; font-size: 12px;">
                  You're receiving this email because you're a CaptionCraft user with promotional emails enabled.
                </p>
                <a href="${unsubscribeUrl}" style="color: #9ca3af; text-decoration: none; font-size: 12px;">Unsubscribe from promotional emails</a>
              </div>
            </div>
            
          </div>
          
          <!-- Email client compatibility styles -->
          <div style="display: none; max-height: 0; overflow: hidden;">
            CaptionCraft promotional email with new features and pro tips to boost your social media engagement. Discover advanced AI caption generation tools.
          </div>
          
        </body>
        </html>
      `,
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
  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (!baseUrl) {
    console.error('❌ Missing NEXTAUTH_URL or NEXT_PUBLIC_APP_URL environment variable');
    return { queued: false, error: 'Missing app URL configuration' };
  }
  
  // Map request types to friendly names
  const requestTypeNames = {
    'data_recovery': 'Data Recovery Request',
    'data_deletion': 'Data Deletion Request',
    'profile_deletion': 'Profile Deletion Request',
    'other': 'Support Request'
  };

  const requestTypeName = requestTypeNames[data.requestType] || 'Support Request';

  try {
    const info = await transporter.sendMail({
      from: `CaptionCraft Support <${from}>`,
      to: data.email,
      subject: `✅ Request Received - ${requestTypeName} - CaptionCraft`,
      text: `Hi ${data.name}!\n\nThank you for submitting your ${requestTypeName.toLowerCase()} to CaptionCraft. We've successfully received your request and our team is working on it.\n\nRequest Details:\nRequest ID: ${data.requestId}\nType: ${requestTypeName}\nEstimated Processing Time: ${data.estimatedTime}\n\nNext Steps:\n${data.nextSteps.map(step => `• ${step}`).join('\n')}\n\nWe'll keep you updated on the progress. If you have any questions, please don't hesitate to contact our support team.\n\nBest regards,\nThe CaptionCraft Support Team\n\n---\nCaptionCraft - AI-Powered Caption Generation\n${baseUrl}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Request Received - CaptionCraft</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px; text-align: center;">
              <div style="display: inline-flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                <div style="background: rgba(255, 255, 255, 0.2); padding: 8px; border-radius: 8px;">
                  <div style="width: 24px; height: 24px; color: white; font-size: 20px;">✅</div>
                </div>
                <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 700;">CaptionCraft</h1>
              </div>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">AI-Powered Caption Generation</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 32px;">
              <div style="text-align: center; margin-bottom: 32px;">
                <div style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; padding: 16px; margin-bottom: 16px;">
                  <div style="width: 32px; height: 32px; color: white; font-size: 28px; line-height: 32px;">📋</div>
                </div>
                <h2 style="margin: 0; color: #1f2937; font-size: 28px; font-weight: 700;">Request Received!</h2>
              </div>
              
              <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">Hi <strong>${data.name}</strong>!</p>
              
              <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Thank you for submitting your <strong>${requestTypeName.toLowerCase()}</strong> to CaptionCraft. We've successfully received your request and our team is working on it.
              </p>
              
              <!-- Request Details -->
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <h3 style="margin: 0 0 16px 0; color: #374151; font-size: 16px; font-weight: 600;">📋 Request Details</h3>
                <div style="margin-bottom: 12px;">
                  <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Request ID:</span>
                  <span style="color: #374151; font-size: 14px; margin-left: 8px; font-family: monospace;">${data.requestId}</span>
                </div>
                <div style="margin-bottom: 12px;">
                  <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Type:</span>
                  <span style="color: #374151; font-size: 14px; margin-left: 8px;">${requestTypeName}</span>
                </div>
                <div>
                  <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Estimated Time:</span>
                  <span style="color: #374151; font-size: 14px; margin-left: 8px;">${data.estimatedTime}</span>
                </div>
              </div>
              
              <!-- Next Steps -->
              <div style="background-color: #eff6ff; border: 1px solid #dbeafe; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <h3 style="margin: 0 0 16px 0; color: #1e40af; font-size: 16px; font-weight: 600;">🚀 What happens next?</h3>
                <ul style="margin: 0; padding-left: 20px; color: #1e40af; font-size: 14px; line-height: 1.6;">
                  ${data.nextSteps.map(step => `<li style="margin-bottom: 8px;">${step}</li>`).join('')}
                </ul>
              </div>
              
              <!-- Support Info -->
              <div style="background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <h3 style="margin: 0 0 12px 0; color: #92400e; font-size: 16px; font-weight: 600;">💬 Need Help?</h3>
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
                  If you have any questions about your request, please don't hesitate to contact our support team. We're here to help!
                </p>
              </div>
              
              <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
                We'll keep you updated on the progress of your request. Thank you for your patience!
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 32px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">Best regards,</p>
              <p style="margin: 0 0 16px 0; color: #374151; font-weight: 600; font-size: 16px;">The CaptionCraft Support Team</p>
              
              <div style="margin: 20px 0;">
                <a href="${baseUrl}" style="color: #667eea; text-decoration: none; font-size: 14px; font-weight: 500;">Visit CaptionCraft →</a>
              </div>
              
              <p style="margin: 16px 0 0 0; color: #9ca3af; font-size: 12px;">
                CaptionCraft - AI-Powered Caption Generation for Creators Worldwide<br>
                © 2024 CaptionCraft. All rights reserved.
              </p>
            </div>
            
          </div>
        </body>
        </html>
      `,
    });

    console.log('📧 Request confirmation email sent to:', data.email, 'Message ID:', info.messageId);
    return { queued: true, messageId: info.messageId };

  } catch (err) {
    console.error('📧 Failed to send request confirmation email:', err);
    return { queued: false, error: String(err) };
  }
}
