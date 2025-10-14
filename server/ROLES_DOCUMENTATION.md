# User Roles Documentation

## Overview
The Gezana platform now supports 5 user roles with different levels of access and permissions.

## Available Roles

### 1. **Seeker** (Default)
- **Purpose**: Regular users looking for services
- **Permissions**:
  - Browse and search services
  - Book services
  - View their own bookings
  - Manage their profile
  - Earn and redeem loyalty points
  
### 2. **Provider**
- **Purpose**: Service providers offering their services
- **Permissions**:
  - All Seeker permissions
  - Create and manage their services
  - View bookings for their services
  - Update booking statuses
  - Upload credentials and documents
  - Manage subscription

### 3. **Support** (Customer Support)
- **Purpose**: Customer support staff
- **Permissions**:
  - View all bookings (read-only for support tasks)
  - Help users with booking-related queries
  - View user information (limited)
  - **Auto-verified**: No need for manual verification
  - **No welcome notifications**: System users

### 4. **Admin**
- **Purpose**: Platform administrators
- **Permissions**:
  - All Support permissions
  - Manage all users (view, edit, delete)
  - Approve/reject provider applications
  - Approve/reject services
  - Manage all bookings
  - View analytics and reports
  - **Auto-verified**: Full system access
  - **No welcome notifications**: System users

### 5. **Superadmin**
- **Purpose**: Super administrators with highest privileges
- **Permissions**:
  - All Admin permissions
  - Manage admin accounts
  - System-wide configurations
  - Access to all features without restrictions
  - **Auto-verified**: Highest system access
  - **No welcome notifications**: System users

## Role Hierarchy

```
Superadmin (Highest)
    ↓
  Admin
    ↓
 Support
    ↓
 Provider
    ↓
 Seeker (Lowest)
```

## Registration

### User Registration
Users can register with roles during signup by sending a `role` parameter:

```json
POST /api/auth/register
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "role": "seeker" | "provider" | "admin" | "superadmin" | "support",
  "phone": "+251912345678"
}
```

### Role-Specific Requirements

#### Seeker Registration
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "seeker",
  "phone": "+251912345678",
  "address": "Addis Ababa",
  "whatsapp": "+251912345678",
  "telegram": "@johndoe"
}
```

#### Provider Registration
```json
{
  "fullName": "John Provider",
  "companyName": "ABC Services",
  "email": "provider@example.com",
  "password": "password123",
  "role": "provider",
  "subRole": "freelancer" | "smallBusiness" | "specializedBusiness",
  "phone": "+251912345678",
  "serviceType": "Plumbing",
  "city": "Addis Ababa",
  // ... additional provider fields
}
```

#### Admin/Superadmin/Support Registration
```json
{
  "fullName": "Admin User",
  "email": "admin@gezana.com",
  "password": "securePassword123",
  "role": "admin" | "superadmin" | "support",
  "phone": "+251911111111"
}
```

## Using Role Middleware

### Import Middleware
```javascript
const { authMiddleware } = require("../middleware/authMiddleware");
const { isAdmin, isSuperAdmin, isSupport, hasRole } = require("../middleware/roleMiddleware");
```

### Protect Routes by Role

#### Super Admin Only
```javascript
router.delete("/users/:id", authMiddleware, isSuperAdmin, async (req, res) => {
  // Only superadmin can access this
});
```

#### Admin or Superadmin
```javascript
router.get("/admin/dashboard", authMiddleware, isAdmin, async (req, res) => {
  // Both admin and superadmin can access
});
```

#### Support Staff or Higher
```javascript
router.get("/support/tickets", authMiddleware, isSupport, async (req, res) => {
  // Support, Admin, and Superadmin can access
});
```

#### Multiple Specific Roles
```javascript
router.get("/special-access", authMiddleware, hasRole("admin", "superadmin"), async (req, res) => {
  // Only specified roles can access
});
```

#### Manual Role Check
```javascript
router.put("/booking/:id", authMiddleware, async (req, res) => {
  if (!["admin", "superadmin", "support"].includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied" });
  }
  // Process request
});
```

## Permission Matrix

| Feature | Seeker | Provider | Support | Admin | Superadmin |
|---------|--------|----------|---------|-------|------------|
| Browse Services | ✅ | ✅ | ✅ | ✅ | ✅ |
| Book Services | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create Services | ❌ | ✅ | ❌ | ✅ | ✅ |
| View All Bookings | ❌ | Own Services | ✅ | ✅ | ✅ |
| Approve Services | ❌ | ❌ | ❌ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ❌ | ✅ | ✅ |
| Manage Admins | ❌ | ❌ | ❌ | ❌ | ✅ |
| System Config | ❌ | ❌ | ❌ | ❌ | ✅ |

## Best Practices

1. **Superadmin**: Use sparingly, only for system owners
2. **Admin**: For trusted team members managing the platform
3. **Support**: For customer service representatives
4. **Provider**: For service providers after verification
5. **Seeker**: Default role for all regular users

## Security Notes

- All admin-level roles (support, admin, superadmin) are auto-verified
- Admin-level accounts don't receive welcome notifications
- Always use middleware to protect routes
- Check user roles on both frontend and backend
- Log all admin actions for audit trails

## Examples in Routes

### Current Implementation
All routes have been updated to support the new roles:

- **Bookings**: Support staff can view all bookings
- **Services**: Admin and Superadmin can manage services
- **Users**: Admin and Superadmin can manage users
- **Providers**: Admin and Superadmin can view provider lists

### Route Protection Example
```javascript
// Before
if (req.user.role !== "admin") {
  return res.status(403).json({ message: "Admin only" });
}

// After (includes superadmin)
if (!["admin", "superadmin"].includes(req.user.role)) {
  return res.status(403).json({ message: "Admin access required" });
}
```

## Future Enhancements

Consider adding:
- Role-based dashboards
- Activity logging for admin actions
- Role permissions customization
- Temporary role elevation
- Role-based notifications

