import { NextRequest } from 'next/server';

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(emailData: EmailData): Promise<boolean> {
  try {
    const { BREVO_API_KEY, BREVO_SENDER_EMAIL, BREVO_SENDER_NAME } = process.env;

    if (!BREVO_API_KEY || !BREVO_SENDER_EMAIL) {
      console.error('❌ Missing Brevo configuration:', {
        BREVO_API_KEY: BREVO_API_KEY ? '✅ Set' : '❌ Missing',
        BREVO_SENDER_EMAIL: BREVO_SENDER_EMAIL ? '✅ Set' : '❌ Missing'
      });
      return false;
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: {
          name: BREVO_SENDER_NAME || 'Capsera Team',
          email: BREVO_SENDER_EMAIL
        },
        to: [
          {
            email: emailData.to,
            name: emailData.to.split('@')[0] // Use part before @ as name
          }
        ],
        subject: emailData.subject,
        htmlContent: emailData.html,
        textContent: emailData.text || emailData.html.replace(/<[^>]*>/g, '') // Strip HTML for text version
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Brevo API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      return false;
    }

    const result = await response.json();
    console.log('✅ Email sent successfully via Brevo:', {
      messageId: result.messageId,
      to: emailData.to
    });

    return true;

  } catch (error) {
    console.error('❌ Email sending error:', error);
    return false;
  }
}

// Helper function for sending feature update notifications
export async function sendFeatureUpdateNotification(
  email: string, 
  featureName: string, 
  featureDescription: string
): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #333; margin-bottom: 10px;">🚀 New Feature Available!</h1>
        <p style="color: #666; font-size: 16px;">Great news! A feature you've been waiting for is now live.</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
        <h2 style="color: #333; margin-bottom: 15px;">${featureName}</h2>
        <p style="color: #555; line-height: 1.6;">${featureDescription}</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXTAUTH_URL || 'https://ai-caption-generator-pied.vercel.app'}" 
           style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
          🎉 Try It Now
        </a>
      </div>
      
      <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; text-align: center;">
        <p style="color: #999; font-size: 12px;">
          © 2024 Capsera. All rights reserved.
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `🚀 ${featureName} is Now Available on Capsera!`,
    html
  });
}
