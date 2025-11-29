/**
 * Brevo SMTP Email Service
 * Handles all email notifications for role assignments and user management
 */

import nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface UserRoleAssignment {
  email: string;
  username?: string;
  roleName: string;
  roleDisplayName: string;
  permissions: string[];
  loginUrl: string;
  adminEmail: string;
}

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

class BrevoEmailService {
  private transporter: nodemailer.Transporter;
  private config: EmailConfig;

  constructor(useSecondaryKey: boolean = false) {
    this.config = {
      host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
      port: parseInt(process.env.BREVO_SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: useSecondaryKey
          ? (process.env.BREVO_SMTP_USER_SECONDARY || process.env.BREVO_SMTP_USER || process.env.ADMIN_EMAIL_RECEIVER || '')
          : (process.env.BREVO_SMTP_USER || process.env.ADMIN_EMAIL_RECEIVER || ''),
        pass: useSecondaryKey
          ? (process.env.SMTP_PASS_1 || '')
          : (process.env.BREVO_SMTP_PASS || process.env.BREVO_API_KEY_1 || '')
      }
    };

    this.transporter = nodemailer.createTransport(this.config);
  }


  /**
   * Send suggestion reply email to user
   */
  async sendSuggestionReplyEmail(data: {
    userEmail: string;
    userName: string;
    suggestionTitle: string;
    adminReply: string;
  }): Promise<boolean> {
    try {
      const template = this.getSuggestionReplyTemplate(data);

      const mailOptions = {
        from: `"${process.env.APP_NAME || 'Capsera'}" <${this.config.auth.user}>`,
        to: data.userEmail,
        subject: template.subject,
        html: template.html,
        text: template.text
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Suggestion reply email sent:', result.messageId);
      return true;
    } catch (error) {
      console.error('❌ Failed to send suggestion reply email:', error);
      return false;
    }
  }

  /**
   * Get suggestion reply email template
   */
  private getSuggestionReplyTemplate(data: {
    userEmail: string;
    userName: string;
    suggestionTitle: string;
    adminReply: string;
  }): EmailTemplate {
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.capsera.online';

    return {
      subject: `Re: ${data.suggestionTitle} - Update from Capsera`,
      html: getHtmlTemplate({
        title: 'Suggestion Update',
        previewText: 'We have an update regarding your suggestion.',
        heading: 'Suggestion Update 📢',
        baseUrl,
        content: `
          <p style="margin-bottom: 24px;">Hello <strong>${data.userName}</strong>,</p>
          <p style="margin-bottom: 24px;">Thank you for your suggestion: "<strong>${data.suggestionTitle}</strong>".</p>
          
          <div style="background-color: #1a1a1a; border: 1px solid #333333; border-left: 4px solid #06b6d4; border-radius: 8px; padding: 24px; margin: 24px 0;">
            <h3 style="margin: 0 0 16px 0; color: #06b6d4; font-size: 16px; font-weight: 600;">Admin Reply</h3>
            <p style="color: #e5e7eb; line-height: 1.6; white-space: pre-wrap;">${data.adminReply}</p>
          </div>
          
          <p style="color: #9ca3af; font-size: 14px;">We appreciate your feedback and are constantly working to improve Capsera.</p>
        `,
        cta: {
          text: 'Visit Capsera',
          url: baseUrl
        }
      }),
      text: `
Suggestion Update

Hello ${data.userName},

Thank you for your suggestion: "${data.suggestionTitle}".

Admin Reply:
${data.adminReply}

We appreciate your feedback and are constantly working to improve Capsera.

---
This is an automated message from Capsera.
      `
    };
  }

  /**
   * Send suggestion notification to admin
   */
  async sendSuggestionEmail(suggestionData: {
    userEmail: string;
    userName: string;
    title: string;
    description: string;
    category: string;
  }): Promise<boolean> {
    try {
      const adminEmail = process.env.ADMIN_EMAIL_RECEIVER;

      if (!adminEmail) {
        console.warn('⚠️ ADMIN_EMAIL_RECEIVER not set in .env, skipping suggestion email.');
        return false;
      }

      const template = this.getSuggestionTemplate(suggestionData);

      const mailOptions = {
        from: `"${process.env.APP_NAME || 'Capsera'}" <${this.config.auth.user}>`,
        to: adminEmail,
        replyTo: suggestionData.userEmail,
        subject: template.subject,
        html: template.html,
        text: template.text
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Suggestion email sent:', result.messageId);
      return true;
    } catch (error) {
      console.error('❌ Failed to send suggestion email:', error);
      return false;
    }
  }

  /**
   * Get suggestion email template
   */
  private getSuggestionTemplate(data: {
    userEmail: string;
    userName: string;
    title: string;
    description: string;
    category: string;
  }): EmailTemplate {
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.capsera.online';

    return {
      subject: `💡 New Suggestion: ${data.title}`,
      html: getHtmlTemplate({
        title: 'New User Suggestion',
        previewText: `New suggestion from ${data.userName}: ${data.title}`,
        heading: 'New Suggestion Received 💡',
        baseUrl,
        content: `
          <p style="margin-bottom: 24px;">You have received a new suggestion from <strong>${data.userName}</strong> (${data.userEmail}).</p>
          
          <div style="background-color: #1a1a1a; border: 1px solid #333333; border-left: 4px solid #8b5cf6; border-radius: 8px; padding: 24px; margin: 24px 0;">
            <h3 style="margin: 0 0 16px 0; color: #8b5cf6; font-size: 16px; font-weight: 600;">${data.title}</h3>
            <div style="margin-bottom: 12px;">
              <span style="background-color: #2e1065; color: #c4b5fd; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500; text-transform: uppercase;">${data.category}</span>
            </div>
            <p style="color: #e5e7eb; line-height: 1.6; white-space: pre-wrap;">${data.description}</p>
          </div>
          
          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #333333;">
            <p style="color: #9ca3af; font-size: 14px; margin: 0;">Submitted by:</p>
            <p style="color: #e5e7eb; font-size: 14px; margin: 4px 0 0 0;">
              <strong>${data.userName}</strong> • <a href="mailto:${data.userEmail}" style="color: #8b5cf6; text-decoration: none;">${data.userEmail}</a>
            </p>
          </div>
        `,
        cta: {
          text: 'View All Suggestions',
          url: `${baseUrl}/admin/suggestions`
        }
      }),
      text: `
New Suggestion Received

From: ${data.userName} (${data.userEmail})
Category: ${data.category}

Title: ${data.title}

Description:
${data.description}

---
This is an automated message from Capsera.
      `
    };
  }

  /**
   * Send role assignment email to user
   */
  async sendRoleAssignmentEmail(userData: UserRoleAssignment): Promise<boolean> {
    try {
      const template = this.getRoleAssignmentTemplate(userData);

      const mailOptions = {
        from: `"${process.env.APP_NAME || 'Capsera'}" <${this.config.auth.user}>`,
        to: userData.email,
        subject: template.subject,
        html: template.html,
        text: template.text
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Role assignment email sent:', result.messageId);
      return true;
    } catch (error) {
      console.error('❌ Failed to send role assignment email:', error);
      return false;
    }
  }

  /**
   * Send bulk role assignment emails
   */
  async sendBulkRoleAssignmentEmails(users: UserRoleAssignment[]): Promise<{
    success: number;
    failed: number;
    results: Array<{ email: string; success: boolean; error?: string }>;
  }> {
    const results: Array<{ email: string; success: boolean; error?: string }> = [];
    let success = 0;
    let failed = 0;

    for (const user of users) {
      try {
        const sent = await this.sendRoleAssignmentEmail(user);
        if (sent) {
          success++;
          results.push({ email: user.email, success: true });
        } else {
          failed++;
          results.push({ email: user.email, success: false, error: 'Email service failed' });
        }
      } catch (error) {
        failed++;
        results.push({
          email: user.email,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return { success, failed, results };
  }

  /**
   * Send role creation notification to admin
   */
  async sendRoleCreationNotification(adminEmail: string, roleData: {
    name: string;
    displayName: string;
    description: string;
    permissions: string[];
    assignedUsers: number;
  }): Promise<boolean> {
    try {
      const template = this.getRoleCreationTemplate(roleData);

      const mailOptions = {
        from: `"${process.env.APP_NAME || 'Capsera'}" <${this.config.auth.user}>`,
        to: adminEmail,
        subject: template.subject,
        html: template.html,
        text: template.text
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Role creation notification sent:', result.messageId);
      return true;
    } catch (error) {
      console.error('❌ Failed to send role creation notification:', error);
      return false;
    }
  }

  /**
   * Send user account creation email
   */
  async sendUserAccountCreationEmail(userData: {
    email: string;
    username: string;
    password: string;
    roleName: string;
    loginUrl: string;
  }): Promise<boolean> {
    try {
      const template = this.getUserAccountTemplate(userData);

      const mailOptions = {
        from: `"${process.env.APP_NAME || 'Capsera'}" <${this.config.auth.user}>`,
        to: userData.email,
        subject: template.subject,
        html: template.html,
        text: template.text
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ User account creation email sent:', result.messageId);
      return true;
    } catch (error) {
      console.error('❌ Failed to send user account creation email:', error);
      return false;
    }
  }

  /**
   * Get role assignment email template
   */
  private getRoleAssignmentTemplate(userData: UserRoleAssignment): EmailTemplate {
    const permissionsList = userData.permissions.map(p => `• ${p}`).join('\n');
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.capsera.online';

    return {
      subject: `🎭 New Role Assigned: ${userData.roleDisplayName}`,
      html: getHtmlTemplate({
        title: 'Role Assignment',
        previewText: 'You have been assigned a new role in Capsera.',
        heading: 'Role Assignment 🎭',
        baseUrl,
        content: `
          <p style="margin-bottom: 24px;">Hello <strong>${userData.username || userData.email}</strong>!</p>
          <p style="margin-bottom: 24px;">Great news! You have been assigned the <span style="display: inline-block; background: #06b6d4; color: #000000; padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 14px;">${userData.roleDisplayName}</span> role in our system.</p>
          
          <div style="background-color: #1a1a1a; border: 1px solid #333333; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <h3 style="margin: 0 0 16px 0; color: #f59e0b; font-size: 16px; font-weight: 600;">🔐 Your New Permissions</h3>
            <ul style="margin: 0; padding-left: 20px; color: #d1d5db; font-size: 14px; line-height: 1.6;">
              ${userData.permissions.map(p => `<li style="margin-bottom: 4px;">${p}</li>`).join('')}
            </ul>
          </div>
          
          <p style="color: #9ca3af; font-size: 14px;">This role gives you access to specific features and areas of the system based on your responsibilities.</p>
        `,
        cta: {
          text: 'Access Your Account',
          url: userData.loginUrl
        },
        footerText: `Need help? Contact your administrator at <a href="mailto:${userData.adminEmail}" style="color: #06b6d4; text-decoration: none;">${userData.adminEmail}</a>`
      }),
      text: `
Role Assignment - Capsera

Hello ${userData.username || userData.email}!

You have been assigned the ${userData.roleDisplayName} role in our system.

Your New Permissions:
${permissionsList}

This role gives you access to specific features and areas of the system based on your responsibilities.

Access Your Account: ${userData.loginUrl}

Need help? Contact your administrator at ${userData.adminEmail}

---
This is an automated message from Capsera. Please do not reply to this email.
      `
    };
  }

  /**
   * Get role creation notification template
   */
  private getRoleCreationTemplate(roleData: any): EmailTemplate {
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.capsera.online';

    return {
      subject: `✅ New Role Created: ${roleData.displayName}`,
      html: getHtmlTemplate({
        title: 'Role Created',
        previewText: 'A new role has been created in Capsera.',
        heading: 'Role Created Successfully ✅',
        baseUrl,
        content: `
          <p style="margin-bottom: 24px;">A new role has been created in Capsera.</p>
          
          <div style="background-color: #1a1a1a; border: 1px solid #333333; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <h3 style="margin: 0 0 16px 0; color: #ffffff; font-size: 16px; font-weight: 600;">🎭 Role Details</h3>
            <div style="display: grid; gap: 12px;">
              <div><strong style="color: #9ca3af;">Name:</strong> <span style="color: #e5e7eb;">${roleData.name}</span></div>
              <div><strong style="color: #9ca3af;">Display Name:</strong> <span style="color: #e5e7eb;">${roleData.displayName}</span></div>
              <div><strong style="color: #9ca3af;">Description:</strong> <span style="color: #e5e7eb;">${roleData.description}</span></div>
              <div><strong style="color: #9ca3af;">Assigned Users:</strong> <span style="color: #e5e7eb;">${roleData.assignedUsers}</span></div>
            </div>
          </div>
          
          <div style="background-color: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <h3 style="margin: 0 0 16px 0; color: #60a5fa; font-size: 16px; font-weight: 600;">🔐 Permissions</h3>
            <ul style="margin: 0; padding-left: 20px; color: #93c5fd; font-size: 14px; line-height: 1.6;">
              ${roleData.permissions.map((p: string) => `<li style="margin-bottom: 4px;">${p}</li>`).join('')}
            </ul>
          </div>
          
          <p style="color: #9ca3af; font-size: 14px;">The role has been created and is ready for user assignment.</p>
        `,
        cta: {
          text: 'View Roles',
          url: `${baseUrl}/admin/roles`
        }
      }),
      text: `
Role Created Successfully - Capsera

A new role has been created in Capsera.

Role Details:
- Name: ${roleData.name}
- Display Name: ${roleData.displayName}
- Description: ${roleData.description}
- Assigned Users: ${roleData.assignedUsers}

Permissions:
${roleData.permissions.map((p: string) => `• ${p}`).join('\n')}

The role has been created and is ready for user assignment.

---
This is an automated message from Capsera. Please do not reply to this email.
      `
    };
  }

  /**
   * Get user account creation template
   */
  private getUserAccountTemplate(userData: any): EmailTemplate {
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.capsera.online';

    return {
      subject: `🚀 Welcome to Capsera - Your Account is Ready!`,
      html: getHtmlTemplate({
        title: 'Welcome to Capsera',
        previewText: 'Your account has been created and is ready to use.',
        heading: 'Welcome to Capsera! 🚀',
        baseUrl,
        content: `
          <p style="margin-bottom: 24px;">Hello <strong>${userData.username}</strong>!</p>
          <p style="margin-bottom: 24px;">Welcome to Capsera! Your account has been created with the <strong>${userData.roleName}</strong> role.</p>
          
          <div style="background-color: #1a1a1a; border: 1px solid #333333; border-left: 4px solid #06b6d4; border-radius: 8px; padding: 24px; margin: 24px 0;">
            <h3 style="margin: 0 0 16px 0; color: #06b6d4; font-size: 16px; font-weight: 600;">🔑 Your Login Credentials</h3>
            <div style="display: grid; gap: 12px;">
              <div><strong style="color: #9ca3af;">Username:</strong> <span style="color: #e5e7eb;">${userData.username}</span></div>
              <div><strong style="color: #9ca3af;">Email:</strong> <span style="color: #e5e7eb;">${userData.email}</span></div>
              <div><strong style="color: #9ca3af;">Password:</strong> <code style="background: #000; padding: 4px 8px; border-radius: 4px; color: #06b6d4;">${userData.password}</code></div>
              <div><strong style="color: #9ca3af;">Role:</strong> <span style="color: #e5e7eb;">${userData.roleName}</span></div>
            </div>
          </div>
          
          <div style="background-color: #1a1a1a; border: 1px solid #333333; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 8px;">
            <p style="margin: 0 0 8px 0; color: #f59e0b; font-weight: 600; font-size: 14px;">⚠️ Important:</p>
            <p style="margin: 0; color: #d1d5db; font-size: 14px;">Please change your password after your first login for security.</p>
          </div>
        `,
        cta: {
          text: 'Login to Your Account',
          url: userData.loginUrl
        },
        footerText: 'If you have any questions or need assistance, please contact your administrator.'
      }),
      text: `
Welcome to Capsera - Your Account is Ready!

Hello ${userData.username}!

Welcome to Capsera! Your account has been created with the ${userData.roleName} role.

Your Login Credentials:
- Username: ${userData.username}
- Email: ${userData.email}
- Password: ${userData.password}
- Role: ${userData.roleName}

Important: Please change your password after your first login for security.

Login to Your Account: ${userData.loginUrl}

If you have any questions or need assistance, please contact your administrator.

---
This is an automated message from Capsera. Please do not reply to this email.
      `
    };
  }

  /**
   * Test email service connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('✅ Brevo SMTP connection successful');
      return true;
    } catch (error) {
      console.error('❌ Brevo SMTP connection failed:', error);
      return false;
    }
  }
}

export default BrevoEmailService;
