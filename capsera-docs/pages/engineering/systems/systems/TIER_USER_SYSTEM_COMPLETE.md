# Complete Tier User System Guide

## Overview
The Tier User System automatically creates user accounts when creating roles, stores them in the database with proper authentication, and allows them to log in immediately with their credentials.

## How It Works - Complete Flow

### 1. Role Creation with Auto User Creation 🚀
When an admin creates a role with "Auto-Create Users" enabled:

```typescript
const roleData = {
  name: 'Content-Moderator',
  displayName: 'Content Moderator',
  description: 'Can moderate content and manage posts',
  permissions: [...],
  autoCreateUsers: true,           // Enable auto user creation
  usersToCreate: [                 // List of users to create
    {
      email: 'moderator@example.com',
      username: 'moderator1',
      firstName: 'John',
      lastName: 'Doe',
      department: 'Content'
    }
  ],
  sendEmailNotifications: true     // Send welcome emails
};
```

### 2. User Creation Process 👤
The system automatically:

1. **Validates User Data**: Checks if users already exist
2. **Generates Secure Passwords**: Creates 12-character complex passwords
3. **Stores in Database**: Saves users in `adminusers` collection (not regular `users`)
4. **Assigns Role**: Links users to the created role with permissions
5. **Sends Welcome Emails**: Delivers credentials via email
6. **Notifies Admin**: Confirms successful creation

### 3. Database Storage Structure 💾
Users are stored in the `adminusers` collection with this structure:

```json
{
  "_id": "ObjectId",
  "email": "moderator@example.com",
  "username": "moderator1",
  "password": "hashedPassword123", // bcrypt hashed
  "firstName": "John",
  "lastName": "Doe",
  "department": "Content",
  "role": {
    "name": "content-moderator",
    "id": "roleObjectId",
    "displayName": "Content Moderator"
  },
  "status": "active",
  "isActive": true,
  "isDeleted": false,
  "permissions": [...], // Role permissions
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "lastLogin": null,
  "profileImage": null,
  "preferences": {
    "theme": "light",
    "notifications": true,
    "language": "en"
  }
}
```

### 4. Authentication System 🔐
The system has **three authentication providers**:

#### A. Regular User Authentication
- **Provider**: `credentials`
- **Collection**: `users`
- **Use Case**: Normal app users

#### B. Admin User Authentication
- **Provider**: `admin-credentials`
- **Collection**: `adminusers`
- **Use Case**: Admin users with `isAdmin: true`

#### C. Tier User Authentication ⭐
- **Provider**: `tier-credentials`
- **Collection**: `adminusers`
- **Use Case**: Tier users (non-admin users in adminusers collection)

### 5. Login Flow for Tier Users 📱
When a tier user tries to log in:

1. **Input Credentials**: Email + password
2. **Provider Selection**: NextAuth automatically selects `tier-credentials`
3. **Database Lookup**: Searches `adminusers` collection for non-admin users
4. **Password Verification**: Uses bcrypt to compare passwords
5. **Status Check**: Ensures account is `active`
6. **Session Creation**: Creates JWT session with user data
7. **Login Success**: User is redirected to dashboard

### 6. What Users Receive 📬

#### Welcome Email Contents:
- **Subject**: "Welcome to Capsera - Your Account Details"
- **Body**: 
  - Username and password
  - Role information and permissions
  - Login URL
  - Security tips

#### Admin Notification Email:
- **Subject**: "Role Created Successfully - Content Moderator"
- **Body**: Role details, assigned users count, permissions summary

## Testing the System

### 1. Run the Complete Test
```bash
node scripts/test-tier-user-login.js
```

### 2. Manual Testing Steps
1. **Create Role**: Go to Admin Dashboard → Role Management
2. **Enable Auto User Creation**: Check "🚀 Auto-Create Users with This Role"
3. **Add Users**: Enter user details or use bulk import
4. **Create Role**: Click "Create Role"
5. **Check Email**: Verify welcome email received
6. **Test Login**: Use credentials on login page
7. **Verify Access**: Check role permissions and access

### 3. Expected Results
- ✅ **User Created**: In `adminusers` collection
- ✅ **Password Stored**: Hashed with bcrypt
- ✅ **Role Assigned**: With correct permissions
- ✅ **Email Sent**: Welcome email with credentials
- ✅ **Login Works**: User can authenticate immediately
- ✅ **Access Granted**: Based on role permissions

## Security Features

### Password Security
- **Length**: 12 characters minimum
- **Complexity**: Uppercase, lowercase, numbers, special characters
- **Hashing**: bcrypt with 12 rounds of salting
- **Storage**: Only hashed passwords in database

### Authentication Security
- **Multiple Providers**: Separate auth for different user types
- **Status Validation**: Only active accounts can log in
- **Failed Login Tracking**: Prevents brute force attacks
- **Session Management**: JWT-based with proper expiration

### Data Security
- **Collection Separation**: Admin users vs regular users
- **Permission Inheritance**: Users get role permissions
- **Input Validation**: All user data validated and sanitized

## Troubleshooting

### Common Issues

#### 1. User Created But Can't Login
- **Check**: User is in `adminusers` collection (not `users`)
- **Verify**: Account status is `active`
- **Confirm**: Password was generated and sent via email

#### 2. Email Not Received
- **Check**: Brevo SMTP credentials in `.env.local`
- **Verify**: `sendEmailNotifications` is enabled
- **Confirm**: Email address is valid

#### 3. Role Not Assigned
- **Check**: Role exists in `roles` collection
- **Verify**: User has correct `role` object structure
- **Confirm**: Permissions are properly set

#### 4. Login Provider Issues
- **Check**: NextAuth configuration
- **Verify**: All three credential providers are configured
- **Confirm**: Database connections are working

### Debug Steps
1. **Check Console Logs**: Look for auth provider logs
2. **Verify Database**: Check `adminusers` collection
3. **Test Email Service**: Verify SMTP configuration
4. **Check Role Data**: Ensure role exists and has permissions
5. **Verify Auth Flow**: Test with known working credentials

## Best Practices

### 1. Role Design
- Use descriptive names: `Content-Moderator`, `Support-Agent`
- Grant minimal required permissions
- Document permission purposes

### 2. User Management
- Always provide valid email addresses
- Use unique usernames
- Include relevant user information

### 3. Security
- Regularly review role permissions
- Monitor failed login attempts
- Keep passwords secure (never log them)

### 4. Testing
- Test with small user groups first
- Verify email delivery in test environment
- Check user creation and login flow

## API Endpoints

### Create Role with Auto User Creation
```
POST /api/admin/roles
Content-Type: application/json

{
  "name": "role-name",
  "displayName": "Role Display Name",
  "description": "Role description",
  "permissions": [...],
  "autoCreateUsers": true,
  "usersToCreate": [...],
  "sendEmailNotifications": true
}
```

### Response Format
```json
{
  "success": true,
  "message": "Role created successfully",
  "role": { ... },
  "autoUserCreation": {
    "enabled": true,
    "results": {
      "total": 1,
      "success": 1,
      "failed": 0,
      "results": [
        {
          "success": true,
          "email": "user@example.com",
          "credentials": {
            "username": "username",
            "password": "generatedPassword123"
          }
        }
      ]
    }
  }
}
```

## Summary

The Tier User System provides a **complete end-to-end solution**:

1. **🎯 Automatic Creation**: Users created when roles are created
2. **💾 Proper Storage**: Users stored in correct database collection
3. **🔐 Authentication Ready**: Users can log in immediately
4. **📧 Credentials Delivered**: Welcome emails with login information
5. **🛡️ Security Built-in**: Secure passwords, proper hashing, access control
6. **📱 Ready to Use**: Complete user management from creation to access

**Result**: When you create a role with auto user creation, the system automatically creates fully functional user accounts that can log in immediately with the credentials sent to their email! 🚀
