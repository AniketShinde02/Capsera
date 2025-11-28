# 🚀 Auto User Creation & Role Assignment System

## 📋 Overview

Your Capsera system now has **automatic user creation and role assignment**! No more manual work - create a role and automatically create users with that role, complete with email notifications via Brevo SMTP.

## ✨ **What's New**

### **🎭 Automatic Role + User Creation**
- **Create role + users in one step**
- **Automatic password generation** (secure, random)
- **Instant email notifications** to new users
- **Bulk user import** from CSV/text
- **Individual user addition** with forms

### **📧 Brevo SMTP Integration**
- **Professional email templates** for all notifications
- **Role assignment emails** with permissions
- **Welcome emails** with login credentials
- **Admin notifications** for role creation
- **Bulk email sending** for multiple users

## 🔧 **How It Works**

### **1. Role Creation with Auto User Creation**
```typescript
// When creating a role, enable auto user creation
{
  name: 'moderator',
  displayName: 'Content Moderator',
  permissions: [...],
  autoCreateUsers: true,           // 🚀 Enable auto user creation
  usersToCreate: [                 // 👥 Users to create
    {
      email: 'mod@example.com',
      username: 'moderator1',
      firstName: 'John',
      lastName: 'Moderator'
    }
  ],
  sendEmailNotifications: true     // 📧 Send emails
}
```

### **2. Automatic Process**
1. **Role created** in database
2. **Users automatically created** with secure passwords
3. **Role assigned** to each user
4. **Welcome emails sent** with login credentials
5. **Admin notified** of successful creation

## 🎯 **Usage Examples**

### **Example 1: Create Moderator Role + Users**
```typescript
// Create moderator role with 3 users
const roleData = {
  name: 'content_moderator',
  displayName: 'Content Moderator',
  description: 'Can moderate posts and manage content',
  permissions: [
    { resource: 'posts', actions: ['read', 'update', 'delete'] },
    { resource: 'users', actions: ['read'] }
  ],
  autoCreateUsers: true,
  usersToCreate: [
    { email: 'mod1@company.com', username: 'moderator1' },
    { email: 'mod2@company.com', username: 'moderator2' },
    { email: 'mod3@company.com', username: 'moderator3' }
  ]
};
```

### **Example 2: Bulk Import from CSV**
```csv
email,username,firstName,lastName,phone,department
john@company.com,johndoe,John,Doe,1234567890,IT
jane@company.com,janedoe,Jane,Doe,0987654321,HR
bob@company.com,bobsmith,Bob,Smith,5555555555,Marketing
```

### **Example 3: Individual User Addition**
```typescript
// Add users one by one through the UI
const userData = {
  email: 'newuser@company.com',
  username: 'newuser',
  firstName: 'New',
  lastName: 'User',
  phone: '1234567890',
  department: 'Sales'
};
```

## 📧 **Email Templates**

### **User Welcome Email**
- **Subject**: "🚀 Welcome to Capsera - Your Account is Ready!"
- **Content**: Login credentials, role information, security tips
- **Action**: Login button with direct link

### **Role Assignment Email**
- **Subject**: "🎭 New Role Assigned: [Role Name]"
- **Content**: Role details, permissions, access instructions
- **Action**: Access account button

### **Admin Notification Email**
- **Subject**: "✅ New Role Created: [Role Name]"
- **Content**: Role summary, user count, permissions overview

## ⚙️ **Configuration**

### **Environment Variables**
```bash
# Brevo SMTP Configuration
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your-email@domain.com
BREVO_SMTP_PASS=your-api-key

# App Configuration
NEXTAUTH_URL=http://localhost:3000
APP_NAME=Capsera
```

### **Database Requirements**
- **Users collection**: Stores user accounts with roles
- **Roles collection**: Stores role definitions and permissions
- **Auto-created users**: Include roleId, role, and metadata

## 🔒 **Security Features**

### **Password Generation**
- **12 characters** minimum length
- **Mixed case** (uppercase + lowercase)
- **Numbers** and special characters
- **Randomized** for each user
- **Hashed** with bcrypt (12 rounds)

### **Role Validation**
- **Permission structure** validation
- **Resource-action** mapping
- **Duplicate prevention** (email/username)
- **Role existence** verification

## 📊 **Monitoring & Analytics**

### **Creation Results**
```typescript
{
  total: 5,           // Total users attempted
  success: 4,          // Successfully created
  failed: 1,           // Failed creations
  results: [           // Detailed results
    { success: true, email: 'user1@example.com' },
    { success: false, email: 'user2@example.com', error: 'User already exists' }
  ]
}
```

### **Email Status Tracking**
- **Email sent** confirmation
- **Failed emails** logging
- **SMTP connection** testing
- **Template rendering** validation

## 🚨 **Error Handling**

### **Common Issues & Solutions**

#### **1. User Already Exists**
```typescript
// Error: User already exists with this email or username
// Solution: Check existing users before creation
const existingUser = await db.collection('users').findOne({
  $or: [
    { email: userData.email.toLowerCase() },
    { username: userData.username.toLowerCase() }
  ]
});
```

#### **2. Role Not Found**
```typescript
// Error: Role 'moderator' not found
// Solution: Ensure role exists before user creation
const role = await db.collection('roles').findOne({ name: userData.roleName });
```

#### **3. Email Service Failure**
```typescript
// Error: SMTP connection failed
// Solution: Check Brevo credentials and network
await emailService.testConnection();
```

## 🧪 **Testing**

### **Test Scripts**
```bash
# Test auto user creation
node scripts/test-auto-user-creation.js

# Test email service
node scripts/test-email-service.js
```

### **Manual Testing**
1. **Create role** with auto user creation enabled
2. **Add users** individually or bulk import
3. **Verify emails** are sent to new users
4. **Check database** for user creation
5. **Test login** with generated credentials

## 📈 **Performance Considerations**

### **Bulk Operations**
- **Rate limiting**: 100ms delay between users
- **Batch processing**: Handle multiple users efficiently
- **Error isolation**: One failure doesn't stop others
- **Progress tracking**: Real-time status updates

### **Email Optimization**
- **Async sending**: Non-blocking email delivery
- **Template caching**: Reuse email templates
- **Connection pooling**: Efficient SMTP connections
- **Retry logic**: Handle temporary failures

## 🔮 **Future Enhancements**

### **Planned Features**
- **User invitation system** (email links instead of passwords)
- **Role templates** (predefined role configurations)
- **Advanced permissions** (time-based, conditional)
- **Audit logging** (track all role and user changes)
- **Integration APIs** (connect with external HR systems)

### **Customization Options**
- **Email template customization** (branding, styling)
- **Permission inheritance** (role hierarchies)
- **Conditional access** (IP-based, time-based)
- **Multi-tenant support** (organization-based roles)

## 📚 **API Reference**

### **Create Role with Auto Users**
```typescript
POST /api/admin/roles
{
  name: string,
  displayName: string,
  description: string,
  permissions: Array<{resource: string, actions: string[]}>,
  autoCreateUsers: boolean,
  usersToCreate: Array<UserData>,
  sendEmailNotifications: boolean
}
```

### **Auto User Manager**
```typescript
import AutoUserManager from '@/lib/auto-user-manager';

const manager = new AutoUserManager();

// Create single user
const result = await manager.createUserWithRole(userData, adminEmail);

// Create bulk users
const results = await manager.createBulkUsersWithRole(bulkData);

// Assign role to existing user
const success = await manager.assignRoleToUser(email, roleName, adminEmail);
```

## 🎉 **Success Stories**

### **Before (Manual Process)**
1. Create role manually
2. Create each user individually
3. Assign role to each user
4. Send welcome emails manually
5. Track all changes separately
6. **Time**: 30+ minutes for 10 users

### **After (Auto System)**
1. Create role + users in one form
2. System handles everything automatically
3. Emails sent instantly
4. All tracking automated
5. **Time**: 2 minutes for 10 users

## 🆘 **Support & Troubleshooting**

### **Common Questions**

**Q: Can I modify users after creation?**
A: Yes! Users can be edited through the admin interface or API.

**Q: What if email fails?**
A: User is still created, but you'll get a warning. Check SMTP settings.

**Q: Can I reuse passwords?**
A: No, each user gets a unique, secure password. They should change it on first login.

**Q: How do I handle role changes?**
A: Use the role assignment API to change existing users' roles.

### **Getting Help**
- **Check logs** for detailed error messages
- **Verify SMTP** configuration
- **Test with small** user sets first
- **Review permissions** structure
- **Check database** connections

---

## 🚀 **Ready to Use!**

Your auto user creation system is now fully functional! Create roles, add users, and let the system handle the rest. No more manual work - just pure automation! 🎯✨
