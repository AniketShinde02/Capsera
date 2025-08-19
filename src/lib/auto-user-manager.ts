/**
 * Auto User Manager
 * Automatically creates users and assigns roles with email notifications
 */

import { connectToDatabase } from './db';
import BrevoEmailService from './brevo-email';
import bcrypt from 'bcryptjs';

interface AutoUserData {
  email: string;
  username: string;
  roleName: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  department?: string;
}

interface BulkUserData {
  users: AutoUserData[];
  roleName: string;
  adminEmail: string;
}

interface UserCreationResult {
  success: boolean;
  userId?: string;
  email?: string;
  error?: string;
  credentials?: {
    username: string;
    password: string;
  };
}

class AutoUserManager {
  private emailService: BrevoEmailService;

  constructor() {
    this.emailService = new BrevoEmailService();
  }

  /**
   * Create a single user with role assignment
   */
  async createUserWithRole(userData: AutoUserData, adminEmail: string): Promise<UserCreationResult> {
    try {
      const { db } = await connectToDatabase();
      
      // Check if user already exists in both collections
      const existingUserInUsers = await db.collection('users').findOne({ 
        $or: [
          { email: userData.email.toLowerCase() },
          { username: userData.username.toLowerCase() }
        ]
      });

      const existingUserInAdminUsers = await db.collection('adminusers').findOne({ 
        $or: [
          { email: userData.email.toLowerCase() },
          { username: userData.username.toLowerCase() }
        ]
      });

      if (existingUserInUsers || existingUserInAdminUsers) {
        return {
          success: false,
          email: userData.email,
          error: 'User already exists with this email or username'
        };
      }

      // Get role details
      const role = await db.collection('roles').findOne({ name: userData.roleName });
      if (!role) {
        return {
          success: false,
          email: userData.email,
          error: `Role '${userData.roleName}' not found`
        };
      }

      // Generate secure password
      const password = this.generateSecurePassword();
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user in adminusers collection (for tier accounts)
      const newAdminUser = {
        email: userData.email.toLowerCase(),
        username: userData.username.toLowerCase(),
        password: hashedPassword,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        phone: userData.phone || '',
        department: userData.department || '',
        role: {
          name: userData.roleName,
          id: role._id,
          displayName: role.displayName || userData.roleName
        },
        status: 'active',
        isActive: true,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: null,
        profileImage: null,
        permissions: role.permissions || [],
        preferences: {
          theme: 'light',
          notifications: true,
          language: 'en'
        }
      };

      const result = await db.collection('adminusers').insertOne(newAdminUser);
      
      if (!result.insertedId) {
        return {
          success: false,
          email: userData.email,
          error: 'Failed to create user in database'
        };
      }

      console.log(`✅ User created successfully in adminusers collection: ${userData.email}`);

      // Send welcome email with credentials
      const loginUrl = `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || '#'}/login`;
      const emailSent = await this.emailService.sendUserAccountCreationEmail({
        email: userData.email,
        username: userData.username,
        password: password,
        roleName: role.displayName || userData.roleName,
        loginUrl: loginUrl
      });

      if (!emailSent) {
        console.warn(`⚠️ User created but email failed: ${userData.email}`);
      }

      // Send role creation notification to admin
      await this.emailService.sendRoleCreationNotification(adminEmail, {
        name: role.name,
        displayName: role.displayName,
        description: role.description,
        permissions: role.permissions?.map((p: any) => `${p.resource}: ${p.actions.join(', ')}`) || [],
        assignedUsers: 1
      });

      return {
        success: true,
        userId: result.insertedId.toString(),
        email: userData.email,
        credentials: {
          username: userData.username,
          password: password
        }
      };

    } catch (error) {
      console.error('❌ Error creating user with role:', error);
      return {
        success: false,
        email: userData.email,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Create multiple users with role assignment (bulk import)
   */
  async createBulkUsersWithRole(bulkData: BulkUserData): Promise<{
    total: number;
    success: number;
    failed: number;
    results: UserCreationResult[];
  }> {
    const results: UserCreationResult[] = [];
    let success = 0;
    let failed = 0;

    console.log(`🚀 Starting bulk user creation for ${bulkData.users.length} users...`);

    for (const userData of bulkData.users) {
      try {
        const result = await this.createUserWithRole(userData, bulkData.adminEmail);
        
        if (result.success) {
          success++;
          console.log(`✅ User created: ${userData.email}`);
        } else {
          failed++;
          console.log(`❌ User creation failed: ${userData.email} - ${result.error}`);
        }
        
        results.push(result);
        
        // Small delay to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        failed++;
        console.error(`❌ Error processing user ${userData.email}:`, error);
        results.push({
          success: false,
          email: userData.email,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log(`🎯 Bulk user creation completed: ${success} success, ${failed} failed`);

    return {
      total: bulkData.users.length,
      success,
      failed,
      results
    };
  }

  /**
   * Assign existing role to existing user
   */
  async assignRoleToUser(userEmail: string, roleName: string, adminEmail: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const { db } = await connectToDatabase();
      
      // Find user in adminusers collection first (for tier accounts)
      let user = await db.collection('adminusers').findOne({ 
        email: userEmail.toLowerCase(),
        isDeleted: { $ne: true }
      });

      // If not found in adminusers, check regular users collection
      if (!user) {
        user = await db.collection('users').findOne({ 
          email: userEmail.toLowerCase(),
          isDeleted: { $ne: true }
        });
      }

      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      // Find role
      const role = await db.collection('roles').findOne({ name: roleName });
      if (!role) {
        return {
          success: false,
          error: `Role '${roleName}' not found`
        };
      }

      // Update user role based on which collection they're in
      if (user.status !== undefined) {
        // This is an adminuser (tier account)
        await db.collection('adminusers').updateOne(
          { _id: user._id },
          { 
            $set: { 
              role: {
                name: roleName,
                id: role._id,
                displayName: role.displayName || roleName
              },
              permissions: role.permissions || [],
              updatedAt: new Date()
            }
          }
        );
      } else {
        // This is a regular user
        await db.collection('users').updateOne(
          { _id: user._id },
          { 
            $set: { 
              role: roleName,
              roleId: role._id,
              updatedAt: new Date()
            }
          }
        );
      }

      // Send role assignment email
      const loginUrl = `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || '#'}/login`;
      await this.emailService.sendRoleAssignmentEmail({
        email: user.email,
        username: user.username,
        roleName: role.name,
        roleDisplayName: role.displayName || role.name,
        permissions: role.permissions?.map((p: any) => `${p.resource}: ${p.actions.join(', ')}`) || [],
        loginUrl: loginUrl,
        adminEmail: adminEmail
      });

      return { success: true };

    } catch (error) {
      console.error('❌ Error assigning role to user:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Generate secure random password
   */
  private generateSecurePassword(): string {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    // Ensure at least one of each type
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Uppercase
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Lowercase
    password += '0123456789'[Math.floor(Math.random() * 10)]; // Number
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // Special char
    
    // Fill remaining with random chars
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Test email service connection
   */
  async testEmailService(): Promise<boolean> {
    try {
      return await this.emailService.testConnection();
    } catch (error) {
      console.error('❌ Email service test failed:', error);
      return false;
    }
  }
}

export default AutoUserManager;
