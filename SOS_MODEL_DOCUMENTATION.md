# SOS Model and API Documentation

This document describes the new SOS model and comprehensive API endpoints for managing SOS requests.

## SOS Model Features

### 1. **Comprehensive Data Storage**
- User information and device details
- Location data with geocoding
- Status tracking with timestamps
- Emergency contact information
- Response and resolution tracking

### 2. **Advanced Status Management**
- `sent`: Initial SOS request sent
- `received`: SOS request acknowledged
- `resolved`: SOS request resolved
- `cancelled`: SOS request cancelled

### 3. **Built-in Statistics**
- Automatic aggregation of SOS statistics
- Dashboard-ready data
- Performance optimized with indexes

## API Endpoints

### 1. **Send SOS Request**
```
POST /api/sos/send-sos
```

**Request Body:**
```json
{
  "lat": 40.7128,
  "lng": -74.0060,
  "email": "emergency@example.com",
  "notes": "Emergency situation",
  "emergencyContact": {
    "name": "John Doe",
    "phone": "+1234567890",
    "relationship": "Spouse"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "SOS sent successfully",
  "data": {
    "sosId": "sos_id_here",
    "address": "New York, NY, USA",
    "status": "sent",
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### 2. **Get All SOS Requests (Admin)**
```
GET /api/sos/admin/all?page=1&limit=10&status=sent&userId=user_id
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status (optional)
- `userId`: Filter by user ID (optional)

**Response:**
```json
{
  "success": true,
  "sosRequests": [
    {
      "_id": "sos_id_here",
      "userId": {
        "_id": "user_id",
        "firstname": "John",
        "lastname": "Doe",
        "email": "john@example.com"
      },
      "userName": "John Doe",
      "userEmail": "john@example.com",
      "location": {
        "latitude": 40.7128,
        "longitude": -74.0060,
        "address": "New York, NY, USA"
      },
      "recipientEmail": "emergency@example.com",
      "status": "sent",
      "notes": "Emergency situation",
      "emergencyContact": {
        "name": "Jane Doe",
        "phone": "+1234567890",
        "relationship": "Spouse"
      },
      "deviceInfo": {
        "userAgent": "Mozilla/5.0...",
        "ipAddress": "192.168.1.1",
        "deviceType": "mobile"
      },
      "responseTime": null,
      "resolvedBy": null,
      "resolutionNotes": null,
      "createdAt": "2024-01-01T12:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  },
  "statistics": {
    "total": 25,
    "sent": 10,
    "received": 8,
    "resolved": 5,
    "cancelled": 2
  }
}
```

### 3. **Get User's SOS Requests**
```
GET /api/sos/my?page=1&limit=10&status=sent
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status (optional)

**Response:**
```json
{
  "success": true,
  "sosRequests": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  }
}
```

### 4. **Get Single SOS Request**
```
GET /api/sos/:sosId
GET /api/sos/admin/:sosId
```

**Response:**
```json
{
  "success": true,
  "sosRequest": {
    "_id": "sos_id_here",
    "userId": {
      "_id": "user_id",
      "firstname": "John",
      "lastname": "Doe",
      "email": "john@example.com"
    },
    "userName": "John Doe",
    "userEmail": "john@example.com",
    "location": {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "address": "New York, NY, USA"
    },
    "recipientEmail": "emergency@example.com",
    "status": "resolved",
    "notes": "Emergency situation",
    "emergencyContact": {
      "name": "Jane Doe",
      "phone": "+1234567890",
      "relationship": "Spouse"
    },
    "deviceInfo": {
      "userAgent": "Mozilla/5.0...",
      "ipAddress": "192.168.1.1",
      "deviceType": "mobile"
    },
    "responseTime": "2024-01-01T12:05:00.000Z",
    "resolvedBy": {
      "_id": "admin_id",
      "firstname": "Admin",
      "lastname": "User",
      "email": "admin@example.com"
    },
    "resolutionNotes": "Emergency resolved by first responders",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:05:00.000Z"
  }
}
```

### 5. **Update SOS Status (Admin)**
```
PUT /api/sos/admin/:sosId/status
```

**Request Body:**
```json
{
  "status": "resolved",
  "notes": "Emergency resolved by first responders"
}
```

**Response:**
```json
{
  "success": true,
  "message": "SOS request resolved successfully",
  "sosRequest": {
    // Updated SOS request object
  }
}
```

### 6. **Get SOS Statistics (Admin)**
```
GET /api/sos/admin/statistics
```

**Response:**
```json
{
  "success": true,
  "statistics": {
    "total": 25,
    "sent": 10,
    "received": 8,
    "resolved": 5,
    "cancelled": 2
  },
  "recentSOS": [
    // Last 5 SOS requests
  ]
}
```

## Database Schema

### SOS Model Fields

#### **User Information**
- `userId`: Reference to User model
- `userName`: User's full name
- `userEmail`: User's email address

#### **Location Data**
- `location.latitude`: GPS latitude
- `location.longitude`: GPS longitude
- `location.address`: Resolved address from Google Maps

#### **Request Details**
- `recipientEmail`: Email where SOS was sent
- `status`: Current status (sent/received/resolved/cancelled)
- `notes`: Additional notes about the SOS
- `emergencyContact`: Emergency contact information

#### **Device Information**
- `deviceInfo.userAgent`: Browser/device user agent
- `deviceInfo.ipAddress`: Client IP address
- `deviceInfo.deviceType`: Detected device type

#### **Response Tracking**
- `responseTime`: When SOS was acknowledged
- `resolvedBy`: Admin who resolved the SOS
- `resolutionNotes`: Notes about resolution

#### **Timestamps**
- `createdAt`: When SOS was sent
- `updatedAt`: Last update time

## Features

### 1. **Backward Compatibility**
- SOS activities are still saved to User model
- Existing user SOS activities continue to work
- Seamless migration from old system

### 2. **Advanced Filtering**
- Filter by status, user, date range
- Pagination for large datasets
- Search and sort capabilities

### 3. **Security**
- Role-based access control
- Users can only access their own SOS requests
- Admins can access all SOS requests

### 4. **Performance**
- Database indexes for fast queries
- Efficient aggregation for statistics
- Optimized for dashboard usage

## Usage Examples

### Send SOS Request
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "lat": 40.7128,
    "lng": -74.0060,
    "email": "emergency@example.com",
    "notes": "Medical emergency"
  }' \
  http://localhost:3000/api/sos/send-sos
```

### Get All SOS Requests (Admin)
```bash
curl -X GET \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  "http://localhost:3000/api/sos/admin/all?page=1&limit=10&status=sent"
```

### Update SOS Status (Admin)
```bash
curl -X PUT \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "resolved", "notes": "Emergency resolved"}' \
  http://localhost:3000/api/sos/admin/SOS_ID/status
```

## Error Handling

### Common Error Responses

#### 403 Forbidden
```json
{
  "success": false,
  "message": "Not authorized to access this resource"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "SOS request not found"
}
```

#### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid status"
}
```

## Future Enhancements

### 1. **Real-time Updates**
- WebSocket integration for live updates
- Push notifications for status changes

### 2. **Advanced Analytics**
- Geographic heat maps
- Response time analytics
- Trend analysis

### 3. **Integration Features**
- Emergency services API integration
- SMS notifications
- Voice call integration

### 4. **Mobile App Support**
- Offline SOS requests
- Location tracking
- Emergency contacts sync 