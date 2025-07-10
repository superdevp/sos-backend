# Delete Account Feature for Admin Role

This document describes the delete account functionality that allows admin users to delete user accounts from the system.

## Features Added

### 1. Single User Account Deletion
- Allows admins to delete individual user accounts
- Includes safety checks to prevent self-deletion
- Automatically cleans up associated files (avatars)

### 2. Bulk User Account Deletion
- Allows admins to delete multiple user accounts at once
- Efficient batch processing
- Comprehensive error handling

## API Endpoints

### Admin Only Endpoints

#### Delete Single User Account
```
DELETE /api/user/:userId
```

**Parameters:**
- `userId` (path parameter): The ID of the user to delete

**Response:**
```json
{
  "success": true,
  "message": "User account deleted successfully",
  "deletedUser": {
    "id": "user_id_here",
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### Delete Multiple User Accounts
```
DELETE /api/user/bulk
```

**Request Body:**
```json
{
  "userIds": ["user_id_1", "user_id_2", "user_id_3"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "3 user account(s) deleted successfully",
  "deletedUsers": [
    {
      "id": "user_id_1",
      "firstname": "John",
      "lastname": "Doe",
      "email": "john@example.com",
      "role": "user"
    },
    {
      "id": "user_id_2",
      "firstname": "Jane",
      "lastname": "Smith",
      "email": "jane@example.com",
      "role": "user"
    }
  ],
  "totalDeleted": 2
}
```

## Security Features

### 1. Role-Based Access Control
- Only users with `admin` role can access delete endpoints
- Non-admin users receive `403 Forbidden` error

### 2. Self-Deletion Prevention
- Admins cannot delete their own accounts
- Prevents accidental account lockout

### 3. Admin Account Protection
- Admins cannot delete other admin accounts
- Maintains system integrity

### 4. Input Validation
- Validates user IDs before deletion
- Ensures required parameters are provided

## Error Handling

### Common Error Responses

#### 403 Forbidden
```json
{
  "success": false,
  "message": "Not authorized to access this resource"
}
```

#### 400 Bad Request
```json
{
  "success": false,
  "message": "Cannot delete your own account"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

## Data Cleanup

### 1. User Data
- Completely removes user from database
- Deletes all associated data (SOS activities, login activities, etc.)

### 2. File Cleanup
- Automatically deletes user avatars from Firebase Storage
- Handles file deletion errors gracefully
- Continues with user deletion even if file deletion fails

### 3. Cascade Effects
- All user-related data is permanently removed
- No orphaned data left in the system

## Usage Examples

### Delete Single User
```bash
curl -X DELETE \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  http://localhost:3000/api/user/USER_ID_HERE
```

### Delete Multiple Users
```bash
curl -X DELETE \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userIds": ["user1", "user2", "user3"]}' \
  http://localhost:3000/api/user/bulk
```

## Safety Considerations

### 1. Confirmation Required
- Consider implementing frontend confirmation dialogs
- Warn users about permanent data loss

### 2. Audit Trail
- Consider logging all delete operations for audit purposes
- Track who deleted what and when

### 3. Backup Strategy
- Ensure regular database backups before bulk operations
- Consider soft delete option for critical data

### 4. Rate Limiting
- Consider implementing rate limiting for delete operations
- Prevent abuse of the delete endpoints

## Future Enhancements

### 1. Soft Delete
- Add option to soft delete users (mark as deleted but keep data)
- Allow data recovery within a time window

### 2. Batch Operations
- Add support for filtering users before bulk deletion
- Implement pagination for large user lists

### 3. Notification System
- Notify users before account deletion
- Send confirmation emails to admins

### 4. Data Export
- Allow admins to export user data before deletion
- Provide data retention options

## Testing

### Test Cases to Consider
1. **Valid deletion**: Admin deletes a regular user
2. **Self-deletion attempt**: Admin tries to delete their own account
3. **Admin deletion attempt**: Admin tries to delete another admin
4. **Non-existent user**: Try to delete a user that doesn't exist
5. **Bulk deletion**: Delete multiple users at once
6. **Unauthorized access**: Regular user tries to access delete endpoints
7. **File cleanup**: Verify avatar files are deleted from storage
8. **Error handling**: Test with invalid user IDs

### Sample Test Data
```javascript
// Test user data
const testUsers = [
  {
    firstname: "Test",
    lastname: "User1",
    email: "test1@example.com",
    role: "user"
  },
  {
    firstname: "Test",
    lastname: "User2", 
    email: "test2@example.com",
    role: "user"
  }
];
``` 