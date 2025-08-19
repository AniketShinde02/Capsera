// Email service utility for production use
// This file provides a unified interface for sending emails through various providers

import { transporter } from './mail';

export interface EmailData {
  to: string;
  subject: string;
  body: string;
  html?: string;
}

export interface EmailService {
  sendEmail(emailData: EmailData): Promise<boolean>;
}

// Brevo SMTP email service (using existing configuration)
export class BrevoEmailService implements EmailService {
  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      if (!transporter) {
        console.error('❌ SMTP transporter not configured');
        return false;
      }

      const info = await transporter.sendMail({
        from: `Capsera Admin <${process.env.SMTP_FROM || process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
        to: emailData.to,
        subject: emailData.subject,
        text: emailData.body,
        html: emailData.html || emailData.body,
      });

      console.log('📧 Email sent via Brevo SMTP:', {
        to: emailData.to,
        messageId: info.messageId,
        response: info.response
      });

      return true;
    } catch (error) {
      console.error('❌ Brevo SMTP email error:', error);
      return false;
    }
  }
}

// Basic console email service (for development/testing when SMTP is not configured)
export class ConsoleEmailService implements EmailService {
  async sendEmail(emailData: EmailData): Promise<boolean> {
    console.log('📧 EMAIL SENT (Console Service):');
    console.log('📧 To:', emailData.to);
    console.log('📧 Subject:', emailData.subject);
    console.log('📧 Body:', emailData.body);
    if (emailData.html) {
      console.log('📧 HTML:', emailData.html);
    }
    console.log('📧 --- End Email ---');
    return true;
  }
}

// Factory function to get the appropriate email service
export function getEmailService(): EmailService {
  // Check if Brevo SMTP is configured
  if (transporter) {
    console.log('📧 Using Brevo SMTP email service');
    return new BrevoEmailService();
  }
  
  // Fallback to console service if SMTP is not configured
  console.warn('⚠️ SMTP not configured, falling back to console service');
  return new ConsoleEmailService();
}

// Helper function to send admin setup OTP
export async function sendAdminSetupOTP(email: string, otp: string): Promise<boolean> {
  const emailService = getEmailService();
  
  const emailData: EmailData = {
    to: email,
    subject: 'Capsera Admin Setup OTP',
    body: `Your admin setup OTP is: ${otp}\n\nThis OTP expires in 5 minutes.\n\nPlease use this OTP to complete the admin setup process.\n\nIf you did not request this OTP, please contact system administrators immediately.`,
    html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <!-- Header with Logo -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px; text-align: center; border-radius: 8px 8px 0 0;">
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
          <div style="background: white; padding: 32px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #2563eb; margin: 0 0 24px 0;">🔐 Admin Setup OTP</h2>
            <p>Your admin setup OTP has been generated successfully.</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="margin: 0; font-family: monospace; font-size: 24px; font-weight: bold; color: #2563eb; letter-spacing: 4px;">${otp}</p>
            </div>
            <p><strong>⚠️ Important:</strong></p>
            <ul>
              <li>This OTP expires in 5 minutes</li>
              <li>Keep this OTP secure and confidential</li>
              <li>Use this OTP to complete the admin setup process</li>
            </ul>
            <p>If you did not request this OTP, please contact system administrators immediately.</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px;">This is an automated message from Capsera Admin System.</p>
          </div>
        </div>
    `
  };
  
  return await emailService.sendEmail(emailData);
}
