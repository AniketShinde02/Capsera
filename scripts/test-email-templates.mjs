#!/usr/bin/env node

/**
 * Email Template Test Script
 * 
 * This script tests all CaptionCraft email templates to ensure they render correctly
 * and can be sent via SMTP. It's useful for development and testing.
 * 
 * Usage:
 * - node scripts/test-email-templates.mjs
 * - npm run test-emails (if added to package.json)
 */

import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

// Load environment variables
dotenv.config();

// Email configuration
const host = process.env.SMTP_HOST;
const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.SMTP_FROM || process.env.EMAIL_FROM || user;

// Base URL
const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL;
if (!baseUrl) {
  console.error('❌ Missing NEXTAUTH_URL or NEXT_PUBLIC_APP_URL environment variable');
  console.error('Please set one of these environment variables to test email templates');
  process.exit(1);
}

// Create test email transporter
const transporter = (host && port && user && pass)
  ? nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    })
  : null;

// Test data
const testData = {
  name: 'John Doe',
  email: 'test@example.com',
  username: 'johndoe',
  subject: 'Test Contact Form Submission',
  message: 'This is a test message for testing email templates.',
  submissionId: 'TEST-12345',
  unsubscribeToken: 'test-unsubscribe-token-123',
  requestType: 'data_recovery',
  requestId: 'REQ-67890',
  estimatedTime: '24-48 hours',
  nextSteps: [
    'We will review your request',
    'Process your data recovery',
    'Send you a confirmation email'
  ]
};

// Test Welcome Email Template
function testWelcomeEmail() {
  const displayName = testData.name || testData.username || testData.email.split('@')[0];
  
  return {
    from: `CaptionCraft <${from}>`,
    to: testData.email,
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
              © 2025 CaptionCraft. All rights reserved.
            </p>
          </div>
          
        </div>
        
        <!-- Email client compatibility styles -->
        <div style="display: none; max-height: 0; overflow: hidden;">
          Welcome to CaptionCraft! Start generating AI-powered captions that will boost your social media engagement. Join our community of creators.
        </div>
        
      </body>
      </html>
    `
  };
}

// Test Promotional Email Template
function testPromotionalEmail() {
  const displayName = testData.name || testData.username || testData.email.split('@')[0];
  const unsubscribeUrl = `${baseUrl}/unsubscribe?token=${testData.unsubscribeToken}`;
  
  return {
    from: `CaptionCraft <${from}>`,
    to: testData.email,
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
              © 2025 CaptionCraft. All rights reserved.
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
    `
  };
}

// Main test function
async function testEmailTemplates() {
  console.log('🧪 Testing CaptionCraft Email Templates...\n');
  
  if (!transporter) {
    console.log('❌ SMTP not configured. Testing email rendering only.');
    console.log('📧 Welcome Email Template:');
    console.log(testWelcomeEmail().subject);
    console.log('\n📧 Promotional Email Template:');
    console.log(testPromotionalEmail().subject);
    console.log('\n✅ Email templates rendered successfully!');
    return;
  }

  try {
    console.log('📧 Testing Welcome Email...');
    const welcomeResult = await transporter.sendMail(testWelcomeEmail());
    console.log(`✅ Welcome email sent successfully! Message ID: ${welcomeResult.messageId}`);
    
    console.log('\n📧 Testing Promotional Email...');
    const promotionalResult = await transporter.sendMail(testPromotionalEmail());
    console.log(`✅ Promotional email sent successfully! Message ID: ${promotionalResult.messageId}`);
    
    console.log('\n🎉 All email templates tested successfully!');
    console.log('\n📋 Test Summary:');
    console.log(`• Welcome Email: ✅ Sent to ${testData.email}`);
    console.log(`• Promotional Email: ✅ Sent to ${testData.email}`);
    console.log(`• SMTP Configuration: ✅ Working`);
    
  } catch (error) {
    console.error('❌ Error testing email templates:', error.message);
  }
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  testEmailTemplates()
    .then(() => {
      console.log('\n✅ Email template testing completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Email template testing failed:', error);
      process.exit(1);
    });
}

export { testEmailTemplates };
