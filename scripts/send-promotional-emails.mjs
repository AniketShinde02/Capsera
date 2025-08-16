#!/usr/bin/env node

/**
 * Automated Promotional Email Sender
 * 
 * This script sends promotional emails to users who haven't received one in the last 3 days.
 * It should be run via a cron job or scheduled task.
 * 
 * Usage:
 * - Manual: node scripts/send-promotional-emails.mjs
 * - Cron: 0 9 every-3-days * * cd /path/to/captioncraft && node scripts/send-promotional-emails.mjs
 * 
 * Environment Variables Required:
 * - MONGODB_URI: MongoDB connection string
 * - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS: Email configuration
 * - NEXTAUTH_URL: Base URL for unsubscribe links
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';

// Load environment variables
dotenv.config();

// Email configuration
const host = process.env.SMTP_HOST;
const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.SMTP_FROM || process.env.EMAIL_FROM || user;

// Base URL for unsubscribe links
const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL;
if (!baseUrl) {
  console.error('❌ Missing NEXTAUTH_URL or NEXT_PUBLIC_APP_URL environment variable');
  console.error('Please set one of these environment variables to send promotional emails');
  process.exit(1);
}

// Create email transporter
const transporter = (host && port && user && pass)
  ? nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    })
  : null;

// User Schema (simplified for this script)
const UserSchema = new mongoose.Schema({
  email: String,
  name: String,
  username: String,
  emailPreferences: {
    promotional: { type: Boolean, default: true }
  },
  lastPromotionalEmailDate: Date,
  promotionalEmailCount: { type: Number, default: 0 },
  unsubscribeToken: String,
  status: { type: String, default: 'active' }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Beautiful promotional email template matching CaptionCraft design
function createPromotionalEmail(displayName, unsubscribeUrl) {
  return {
    from: `CaptionCraft <${from}>`,
    subject: '🚀 New CaptionCraft Features - Boost Your Social Media Game!',
    text: `Hi ${displayName}!\n\nReady to take your social media captions to the next level?\n\n🎯 What's New:\n• Advanced AI caption generation with better context understanding\n• New caption styles: Professional, Casual, and Creative\n• Community challenges and caption contests\n• Pro tips from top creators and social media experts\n\n💡 Pro Tip: Ask questions in your captions! Questions like "What's your favorite?" or "Tag someone who needs to see this" can increase engagement by up to 2x.\n\nStart creating: ${baseUrl}\n\nNeed inspiration? Check out our examples and templates at ${baseUrl}/examples\n\nUnsubscribe: ${unsubscribeUrl}\n\nBest regards,\nThe CaptionCraft Team`,
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
              <p style="margin: 0 0 12px 0; color: #166534; font-size: 14px; line-height: 1.5;">
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
    `
  };
}

async function sendPromotionalEmails() {
  console.log('🚀 Starting promotional email campaign...');
  
  if (!transporter) {
    console.error('❌ SMTP not configured. Please check your environment variables.');
    process.exit(1);
  }

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find users eligible for promotional emails (every 3 days)
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    
    const eligibleUsers = await User.find({
      'emailPreferences.promotional': true,
      $or: [
        { lastPromotionalEmailDate: { $lt: threeDaysAgo } },
        { lastPromotionalEmailDate: { $exists: false } }
      ],
      status: 'active'
    }).select('email name username unsubscribeToken');

    console.log(`📊 Found ${eligibleUsers.length} users eligible for promotional emails`);

    if (eligibleUsers.length === 0) {
      console.log('✅ No users eligible for promotional emails at this time');
      return;
    }

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Send promotional emails to eligible users
    for (const user of eligibleUsers) {
      try {
        const displayName = user.name || user.username || user.email.split('@')[0];
        const unsubscribeUrl = `${baseUrl}/unsubscribe?token=${user.unsubscribeToken || ''}`;
        
        const emailData = createPromotionalEmail(displayName, unsubscribeUrl);
        
        const info = await transporter.sendMail({
          ...emailData,
          to: user.email
        });

        // Mark promotional email as sent
        await User.findByIdAndUpdate(user._id, {
          $set: {
            lastPromotionalEmailDate: new Date(),
            promotionalEmailCount: { $inc: 1 },
            promotionalEmailSentAt: new Date()
          }
        });

        console.log(`✅ Promotional email sent to: ${user.email} (Message ID: ${info.messageId})`);
        successCount++;

        // Add a small delay between emails to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`❌ Failed to send promotional email to ${user.email}:`, error.message);
        errorCount++;
        errors.push(`Failed to send to ${user.email}: ${error.message}`);
      }
    }

    // Print summary
    console.log('\n📊 Promotional Email Campaign Summary:');
    console.log(`✅ Successfully sent: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log(`📧 Total processed: ${eligibleUsers.length}`);
    
    if (errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      errors.forEach(error => console.log(`  - ${error}`));
    }

    console.log('\n🎉 Promotional email campaign completed!');

  } catch (error) {
    console.error('❌ Error during promotional email campaign:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  sendPromotionalEmails()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export { sendPromotionalEmails };
