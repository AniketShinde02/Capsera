# Auto User Creation System Setup Guide

## Overview
The Auto User Creation System automatically creates user accounts when creating roles, assigns them the appropriate role, and sends welcome emails with login credentials.

## Features
- ✅ **Automatic User Creation**: Creates users when creating roles
- ✅ **Role Assignment**: Automatically assigns the new role to created users
- ✅ **Email Notifications**: Sends welcome emails with login credentials
- ✅ **Bulk Import**: Support for CSV-style bulk user import
- ✅ **Secure Passwords**: Generates secure random passwords for new users
- ✅ **Email Templates**: Professional email templates for notifications

## Environment Variables Required

### Brevo SMTP Configuration
```bash
# Brevo SMTP Settings
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your-brevo-email@domain.com
BREVO_SMTP_PASS=your-brevo-smtp-password

# App Configuration
APP_NAME=Capsera
NEXTAUTH_URL=http://localhost:3000
```

### How to Get Brevo SMTP Credentials
1. Go to [Brevo.com](https://www.brevo.com/) and create an account
2. Navigate to **Senders & IP** → **SMTP & API**
3. Create a new SMTP key
4. Copy the SMTP credentials to your `.env.local` file

## How It Works

### 1. Role Creation with Auto User Creation
When creating a role, you can enable "Auto-Create Users with This Role":

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

### 2. User Creation Process
1. **Validation**: Checks if users already exist
2. **Password Generation**: Creates secure random passwords
3. **Database Insertion**: Creates user records with role assignment
4. **Email Sending**: Sends welcome emails with credentials
5. **Admin Notification**: Notifies admin of successful creation

### 3. Email Templates
The system sends two types of emails:

#### Welcome Email to New Users
- **Subject**: "Welcome to [App Name] - Your Account Details"
- **Content**: Username, password, role details, login URL
- **Features**: Professional HTML template with branding

#### Admin Notification Email
- **Subject**: "Role Created Successfully - [Role Name]"
- **Content**: Role details, assigned users count, permissions summary

## Testing the System

### 1. Run the Test Script
```bash
node scripts/test-auto-user-creation-complete.js
```

### 2. Manual Testing via UI
1. Go to **Admin Dashboard** → **Role Management**
2. Click **"+ Create Role"**
3. Fill in role details
4. Check **"🚀 Auto-Create Users with This Role"**
5. Add users manually or use bulk import
6. Click **"Create Role"**
7. Check email inboxes for welcome emails

### 3. Bulk Import Format
Use CSV-style format for bulk user import:

```csv
email,username,firstName,lastName,phone,department
john@example.com,johndoe,John,Doe,1234567890,IT
jane@example.com,janedoe,Jane,Doe,0987654321,HR
```

## Troubleshooting

### Common Issues

#### 1. Email Not Sending
- Check Brevo SMTP credentials in `.env.local`
- Verify `BREVO_SMTP_HOST`, `BREVO_SMTP_USER`, `BREVO_SMTP_PASS`
- Check Brevo account status and SMTP limits

#### 2. Users Not Created
- Check database connection
- Verify role creation permissions
- Check console logs for error messages

#### 3. Role Name Validation
- Role names can contain: letters, numbers, hyphens, underscores
- No spaces allowed
- Examples: `Content-Moderator`, `support_agent`, `Admin123`

### Debug Steps
1. Check browser console for errors
2. Check server logs for API errors
3. Verify environment variables are loaded
4. Test email service connection
5. Check database permissions

## Security Features

### Password Security
- **Length**: 12 characters minimum
- **Complexity**: Uppercase, lowercase, numbers, special characters
- **Hashing**: bcrypt with 12 rounds of salting
- **Storage**: Only hashed passwords stored in database

### Access Control
- **Admin Only**: Only authenticated admins can create roles
- **Permission Validation**: Checks admin permissions before creation
- **Input Sanitization**: Validates and sanitizes all user inputs

### Email Security
- **SMTP Authentication**: Secure SMTP with authentication
- **TLS Encryption**: Encrypted email transmission
- **Rate Limiting**: Prevents email spam

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
      "total": 2,
      "success": 2,
      "failed": 0,
      "results": [...]
    }
  }
}
```

## Best Practices

### 1. Role Naming
- Use descriptive names: `Content-Moderator`, `Support-Agent`
- Avoid generic names: `user`, `admin`, `test`
- Use consistent naming conventions

### 2. User Data
- Always provide valid email addresses
- Use unique usernames
- Include relevant user information (department, etc.)

### 3. Permissions
- Grant minimal required permissions
- Review permissions before role creation
- Document permission purposes

### 4. Testing
- Test with small user groups first
- Verify email delivery in test environment
- Check user creation in database

## Support

If you encounter issues:
1. Check this documentation
2. Review console logs and server logs
3. Verify environment variables
4. Test email service connection
5. Contact system administrator

## Changelog

### Version 1.0.0
- Initial release
- Basic auto user creation
- Email notifications
- Bulk import support
- Security features
