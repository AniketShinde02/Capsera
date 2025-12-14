# 🎮 Discord-Like Role System Guide

## 📋 Overview

Your Capsera system now has a **Discord-style role hierarchy** that controls who can do what! This system provides:

- **Role-based access control** (RBAC)
- **Hierarchical permissions** (higher roles can manage lower ones)
- **Granular permissions** for different resources and actions
- **Easy role management** through the admin interface

## 🏗️ Role Hierarchy

### **Priority System (Higher = More Powerful)**

| Priority | Role | Description | Color |
|----------|------|-------------|-------|
| **100** | 🥇 **Server Owner** | Full system control | 🔴 Red |
| **90** | 🥈 **Administrator** | Full admin access | 🔵 Blue |
| **80** | 🥉 **Moderator** | Content moderation | 🔷 Dark Blue |
| **70** | 📝 **Content Editor** | Content management | 🟢 Green |
| **60** | ⭐ **Premium User** | Enhanced features | 🟡 Yellow |
| **50** | 👤 **Standard User** | Basic permissions | 🟣 Purple |
| **40** | 👁️ **Viewer** | Read-only access | 🟢 Light Green |
| **30** | 🚶 **Guest** | Limited access | 🟡 Light Yellow |

## 🔐 Permission System

### **Resources & Actions**

Each role has permissions for different **resources**:

- **`users`** - User management
- **`roles`** - Role management  
- **`posts`** - Content management
- **`captions`** - Caption generation
- **`data-recovery`** - Data recovery tools
- **`archived-profiles`** - Deleted profile management
- **`dashboard`** - Admin dashboard access
- **`system`** - System settings
- **`analytics`** - Analytics and reports

Each resource supports these **actions**:

- **`create`** - Create new items
- **`read`** - View items
- **`update`** - Edit items
- **`delete`** - Remove items
- **`manage`** - Full control (includes all actions)

## 🎯 How Roles Work

### **1. Server Owner (Priority 100)**
- ✅ **Can do everything**
- ✅ **Manage other owners**
- ✅ **Full system access**
- ✅ **Create/delete any role**

### **2. Administrator (Priority 90)**
- ✅ **Full admin access**
- ✅ **Manage users and content**
- ✅ **Cannot manage owners**
- ✅ **Limited system settings access**

### **3. Moderator (Priority 80)**
- ✅ **Moderate content**
- ✅ **Warn users**
- ✅ **View analytics**
- ✅ **Cannot manage roles**

### **4. Content Editor (Priority 70)**
- ✅ **Edit all content**
- ✅ **Manage posts and captions**
- ✅ **View dashboard**
- ✅ **Cannot manage users**

### **5. Premium User (Priority 60)**
- ✅ **Enhanced features**
- ✅ **View analytics**
- ✅ **Create content**
- ✅ **Standard user features**

### **6. Standard User (Priority 50)**
- ✅ **Create/edit posts**
- ✅ **Generate captions**
- ✅ **Basic features**
- ✅ **No admin access**

### **7. Viewer (Priority 40)**
- ✅ **Read public content**
- ✅ **View captions**
- ❌ **Cannot create content**
- ❌ **No editing permissions**

### **8. Guest (Priority 30)**
- ✅ **View public posts**
- ❌ **No account features**
- ❌ **Limited access**

## 🚀 How to Use

### **1. Setup the Role System**

```bash
# Run the Discord role setup script
node scripts/setup-discord-roles.js
```

This will:
- Create all predefined roles
- Set up proper permissions
- Establish role hierarchy
- Remove old system roles

### **2. Assign Roles to Users**

#### **Through Admin Dashboard**
1. Go to **Admin Dashboard** → **Users**
2. Find the user you want to modify
3. Click **Edit** → **Change Role**
4. Select the appropriate role
5. Save changes

#### **Through API**
```bash
PUT /api/admin/users/{userId}
{
  "role": "moderator"
}
```

### **3. Check Permissions in Code**

```typescript
import { checkPermission, canManageUser } from '@/lib/permission-checker';

// Check if user can delete posts
const canDelete = await checkPermission(user, 'posts', 'delete');

// Check if user can manage another user
const canManage = await canManageUser(manager, target);

// Get role-based access for UI
const access = getRoleBasedAccess(user);
if (access.canModerateContent) {
  // Show moderation tools
}
```

### **4. Role-Based UI Components**

```typescript
// Show/hide features based on role
{user.role?.priority >= 80 && (
  <ModerationPanel />
)}

// Disable actions based on permissions
<Button 
  disabled={!canDeletePosts}
  onClick={handleDelete}
>
  Delete Post
</Button>
```

## 🔧 Role Management

### **Creating Custom Roles**

1. Go to **Admin Dashboard** → **Roles**
2. Click **Create Role**
3. Set name, display name, and description
4. Select permissions for each resource
5. Set priority (higher = more powerful)
6. Save the role

### **Editing Existing Roles**

- **System roles** can be modified but not deleted
- **Custom roles** can be fully edited/deleted
- **Priority changes** affect role hierarchy

### **Role Inheritance**

- Higher priority roles can manage lower priority ones
- Users inherit permissions from their role
- Role changes affect all users with that role

## 🛡️ Security Features

### **Permission Validation**
- All API endpoints check permissions
- Frontend validates before sending requests
- Role hierarchy prevents privilege escalation

### **Access Control**
- Users can only access what their role allows
- Role management restricted to appropriate users
- System prevents unauthorized actions

### **Audit Trail**
- All role changes are logged
- Permission modifications tracked
- User role assignments recorded

## 🎨 UI Integration

### **Role Colors**
Each role has a distinct color for easy identification:
- **Owner**: Red (#FF6B6B)
- **Admin**: Blue (#4ECDC4)
- **Moderator**: Dark Blue (#45B7D1)
- **Editor**: Green (#96CEB4)
- **Premium**: Yellow (#FFEAA7)
- **User**: Purple (#DDA0DD)
- **Viewer**: Light Green (#98D8C8)
- **Guest**: Light Yellow (#F7DC6F)

### **Role Badges**
```typescript
<Badge 
  style={{ backgroundColor: getRoleColor(user.role?.name) }}
>
  {user.role?.displayName}
</Badge>
```

### **Permission Indicators**
```typescript
{hasPermission(user, 'posts', 'delete') && (
  <Button variant="destructive">Delete</Button>
)}
```

## 🧪 Testing the System

### **Test Scripts**
```bash
# Test role creation
node scripts/test-role-creation.js

# Test permission checking
node scripts/test-permissions.js

# Test role hierarchy
node scripts/test-role-hierarchy.js
```

### **Manual Testing**
1. **Create different user accounts**
2. **Assign different roles**
3. **Test permission boundaries**
4. **Verify role hierarchy works**
5. **Check UI shows/hides correctly**

## 🚨 Troubleshooting

### **Common Issues**

#### **Role Creation Fails**
- Check permission validation
- Ensure all required fields are filled
- Verify role name format (lowercase, no spaces)

#### **Permissions Not Working**
- Check user's role assignment
- Verify role has correct permissions
- Check role priority hierarchy

#### **UI Not Updating**
- Refresh user session after role change
- Check browser console for errors
- Verify permission checking logic

### **Debug Steps**
1. **Check user's current role**
2. **Verify role permissions**
3. **Test permission checking**
4. **Check role hierarchy**
5. **Review API responses**

## 🔮 Future Enhancements

### **Advanced Features**
- **Role templates** for quick setup
- **Temporary roles** with expiration
- **Role inheritance** (users can have multiple roles)
- **Permission groups** for easier management
- **Role-based themes** and UI customization

### **Integration**
- **Discord bot** for role management
- **Slack integration** for team roles
- **LDAP/AD** integration for enterprise
- **SSO** with role mapping

## 📚 Related Documentation

- **[Admin Dashboard Guide](/docs/engineering/admin/admin-guides/ADMIN_DASHBOARD_IMPROVEMENTS_SUMMARY)**
- **[User Management](./USER_MANAGEMENT_GUIDE.md)**
- **[Permission System](./PERMISSION_SYSTEM.md)**
- **[API Documentation](/docs/engineering/api/API_DOCUMENTATION)**

---

**Last Updated**: Current Session  
**Status**: ✅ **COMPLETED**  
**Next Review**: After user testing and feedback
