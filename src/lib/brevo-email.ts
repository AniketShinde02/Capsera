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

class BrevoEmailService {
  private transporter: nodemailer.Transporter;
  private config: EmailConfig;

  constructor() {
    this.config = {
      host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
      port: parseInt(process.env.BREVO_SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.BREVO_SMTP_USER || '',
        pass: process.env.BREVO_SMTP_PASS || ''
      }
    };

    this.transporter = nodemailer.createTransport(this.config);
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
    
    return {
      subject: `🎭 New Role Assigned: ${userData.roleDisplayName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Role Assignment</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .role-badge { display: inline-block; background: #667eea; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 10px 0; }
            .permissions { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .btn { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎭 Role Assignment</h1>
              <p>You have been assigned a new role in Capsera</p>
            </div>
            
            <div class="content">
              <h2>Hello ${userData.username || userData.email}!</h2>
              
              <p>Great news! You have been assigned the <span class="role-badge">${userData.roleDisplayName}</span> role in our system.</p>
              
              <div class="permissions">
                <h3>🔐 Your New Permissions:</h3>
                <ul>
                  ${userData.permissions.map(p => `<li>${p}</li>`).join('')}
                </ul>
              </div>
              
              <p>This role gives you access to specific features and areas of the system based on your responsibilities.</p>
              
              <a href="${userData.loginUrl}" class="btn">🚀 Access Your Account</a>
              
              <p><strong>Need help?</strong> Contact your administrator at <a href="mailto:${userData.adminEmail}">${userData.adminEmail}</a></p>
            </div>
            
            <div class="footer">
              <p>This is an automated message from Capsera. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
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
    return {
      subject: `✅ New Role Created: ${roleData.displayName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Role Created</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .role-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .permissions { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Role Created Successfully</h1>
              <p>A new role has been created in Capsera</p>
            </div>
            
            <div class="content">
              <div class="role-info">
                <h3>🎭 Role Details:</h3>
                <p><strong>Name:</strong> ${roleData.name}</p>
                <p><strong>Display Name:</strong> ${roleData.displayName}</p>
                <p><strong>Description:</strong> ${roleData.description}</p>
                <p><strong>Assigned Users:</strong> ${roleData.assignedUsers}</p>
              </div>
              
              <div class="permissions">
                <h3>🔐 Permissions:</h3>
                <ul>
                  ${roleData.permissions.map((p: string) => `<li>${p}</li>`).join('')}
                </ul>
              </div>
              
              <p>The role has been created and is ready for user assignment.</p>
            </div>
            
            <div class="footer">
              <p>This is an automated message from Capsera. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
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
    return {
      subject: `🚀 Welcome to Capsera - Your Account is Ready!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to Capsera</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
            .btn { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚀 Welcome to Capsera!</h1>
              <p>Your account has been created and is ready to use</p>
            </div>
            
            <div class="content">
              <h2>Hello ${userData.username}!</h2>
              
              <p>Welcome to Capsera! Your account has been created with the <strong>${userData.roleName}</strong> role.</p>
              
              <div class="credentials">
                <h3>🔑 Your Login Credentials:</h3>
                <p><strong>Username:</strong> ${userData.username}</p>
                <p><strong>Email:</strong> ${userData.email}</p>
                <p><strong>Password:</strong> ${userData.password}</p>
                <p><strong>Role:</strong> ${userData.roleName}</p>
              </div>
              
              <p><strong>⚠️ Important:</strong> Please change your password after your first login for security.</p>
              
              <a href="${userData.loginUrl}" class="btn">🚀 Login to Your Account</a>
              
              <p>If you have any questions or need assistance, please contact your administrator.</p>
            </div>
            
            <div class="footer">
              <p>This is an automated message from Capsera. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
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
