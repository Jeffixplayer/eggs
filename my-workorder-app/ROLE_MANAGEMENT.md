# Role-Based Access Control System

## 🔐 Overview

The Work Order Management System implements a comprehensive role-based access control (RBAC) system with two primary roles: **Worker** and **Admin**.

## 👷 Worker Role (Default)

### Registration Process
- All new user registrations **automatically default to "Worker" role**
- Users cannot select their role during registration for security reasons
- A notification message explains that admin privileges must be requested

### Worker Permissions
✅ **Can Do:**
- Create new work orders with complete details
- Upload multiple images per work order
- Provide digital signatures
- View and edit their own work orders
- Access predefined work order forms
- Submit work orders for admin review

❌ **Cannot Do:**
- View other users' work orders
- Change work order statuses to "In Progress" or "Completed"
- Access admin dashboard
- Manage user roles
- View system-wide statistics
- Export data

### Worker Dashboard Features
- Personal work order list (only their own submissions)
- Create new work order button prominently displayed
- Work order form with company details, images, and signature
- Mobile-responsive interface

## 👨‍💼 Admin Role (Promoted)

### Promotion Process
- Workers must be manually promoted by existing admins
- Promotion can be done through:
  1. **Web Interface**: Admin Dashboard → User Management section
  2. **Firebase Console**: Direct database edit (fallback method)

### Admin Permissions
✅ **Can Do:**
- View ALL work orders across the organization
- Change work order statuses (Pending → In Progress → Completed)
- Filter work orders by:
  - Company name
  - Postal address
  - Status
  - Priority
  - Date range
- Export work order data to CSV
- Promote workers to admin status
- Demote admins to worker status
- View system-wide statistics
- Access user management interface

✅ **Also Retains Worker Permissions:**
- Create their own work orders
- Upload images and digital signatures

### Admin Dashboard Features
- Advanced filtering system
- Real-time status management with dropdown controls
- Statistics cards showing totals by status
- Export functionality
- User management interface
- Color-coded status indicators (Orange = In Progress, Green = Completed)

## 🔄 Role Management Workflow

### 1. Initial Setup (First Admin)
```bash
# After the first user registers, manually promote them in Firestore:
1. Go to Firebase Console → Firestore Database
2. Navigate to "users" collection
3. Find the user document
4. Edit the document: change "role" from "worker" to "admin"
```

### 2. Promoting Users (Admin Interface)
```javascript
// Admins can promote users through the web interface:
1. Login as Admin
2. Navigate to "User Management" section
3. Click "Promote to Admin" for any worker
4. User immediately gains admin privileges
```

### 3. Role Verification
The system uses a custom hook `useUserRole()` that:
- Fetches user role from Firestore on login
- Provides real-time role updates
- Handles role-based UI rendering

## 🎨 Role-Based UI Rendering

### Sidebar Navigation
```javascript
// Dynamic menu items based on role
Worker View:
- 📋 Worksheet
- 📅 Schedule  
- 📊 Project

Admin View:
- 📋 Worksheet (Admin Dashboard)
- 📅 Schedule
- 📊 Project
- 👥 User Management (Admin Only)
```

### Dashboard Content
```javascript
// Different dashboards based on role
if (userRole?.role === 'admin') {
  // Show AdminDashboard with filtering and status management
  return <AdminDashboard />;
} else {
  // Show worker's personal work order list
  return <WorkerWorksheet />;
}
```

## 🔒 Security Implementation

### Firestore Security Rules
```javascript
// Users can only read/write their own user document
match /users/{userId} {
  allow read, write: if request.auth.uid == userId;
  // Admins can read all user documents for role management
  allow read: if isAdmin(request.auth.uid);
}

// Work orders - role-based access
match /workOrders/{workOrderId} {
  // Workers can create and read their own
  allow create: if request.auth != null;
  allow read: if isOwnerOrAdmin(request.auth.uid, resource.data.createdBy);
  
  // Only admins can delete
  allow delete: if isAdmin(request.auth.uid);
  
  // Admins can read/update all for status management
  allow read, update: if isAdmin(request.auth.uid);
}
```

### Frontend Role Checks
```javascript
// Example role-based rendering
{userRole?.role === 'admin' && (
  <button onClick={promoteUser}>
    Promote to Admin
  </button>
)}

// Example permission check
const canEditStatus = userRole?.role === 'admin';
```

## 📊 Data Structure

### User Document (Firestore)
```javascript
{
  id: "user_uuid",
  username: "John Doe",
  email: "john@company.com",
  role: "worker", // or "admin"
  status: "active",
  createdAt: timestamp,
  updatedAt: timestamp // when role was last changed
}
```

### Role Change Audit
```javascript
// When role is updated, the system tracks:
{
  role: "admin",
  updatedAt: new Date(),
  // Could be extended with updatedBy field for audit trail
}
```

## 🚀 Best Practices

### For Admins
1. **Promote Selectively**: Only promote trusted users to admin status
2. **Regular Audits**: Periodically review admin user list
3. **Principle of Least Privilege**: Users should have minimum required permissions
4. **Monitor Activity**: Keep track of who has admin access

### For Developers
1. **Always Check Roles**: Implement role checks on both frontend and backend
2. **Secure Defaults**: New users default to least privileged role
3. **Audit Trail**: Consider logging role changes for compliance
4. **Error Handling**: Gracefully handle role changes and permission denials

## 🛠️ Troubleshooting

### Common Issues

1. **User Can't See Admin Features**
   - Check that role is set to "admin" in Firestore
   - Verify user has logged out and back in after promotion
   - Check browser cache/refresh the page

2. **Permission Denied Errors**
   - Verify Firestore security rules are properly deployed
   - Check that user role exists in the database
   - Ensure Authentication is working correctly

3. **Role Not Updating in Real-Time**
   - The `useUserRole` hook should handle real-time updates
   - Check Firestore listeners are properly set up
   - Verify user document structure is correct

### Manual Role Management (Emergency)
```javascript
// Direct Firestore update (Firebase Console)
1. Go to Firestore Database
2. Find users/{userId}
3. Edit document:
   {
     "role": "admin",
     "updatedAt": "current timestamp"
   }
```

## 📱 Mobile Considerations

- Role-based navigation works on mobile devices
- Admin features are touch-friendly
- User management is responsive
- Role indicators are clearly visible on small screens

## 🔄 Future Enhancements

Potential role system improvements:
- Additional roles (Manager, Supervisor, etc.)
- Granular permissions within roles
- Time-based role assignments
- Role approval workflows
- Audit logging for role changes
- Bulk user role management

## 📈 Analytics & Monitoring

Track role-based metrics:
- Number of users by role
- Work orders created by role
- Admin actions performed
- Role change frequency
- User activity by role

This role-based system ensures security, proper access control, and a smooth user experience while maintaining the flexibility to manage user permissions as the organization grows.