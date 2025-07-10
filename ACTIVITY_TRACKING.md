# SOS and Login Activity Tracking

This document describes the new activity tracking features added to the SOS backend.

## Features Added

### 1. SOS Activity Tracking
- Tracks all SOS requests sent by users
- Stores location data (latitude, longitude, address)
- Records recipient email and status
- Timestamps all activities

### 2. Login Activity Tracking
- Tracks all login attempts (successful and failed)
- Records device information (user agent, IP address, device type)
- Stores location data when available
- Timestamps all activities

## Database Schema Changes

### User Model Updates
The User model now includes two new arrays:

#### SOS Activities
```javascript
sosActivities: [{
  timestamp: Date,
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  status: String, // 'sent', 'received', 'resolved'
  recipientEmail: String,
  notes: String
}]
```

#### Login Activities
```javascript
loginActivities: [{
  timestamp: Date,
  deviceInfo: {
    userAgent: String,
    ipAddress: String,
    deviceType: String // 'mobile', 'tablet', 'desktop', 'unknown'
  },
  location: {
    ipAddress: String,
    country: String,
    city: String,
    region: String
  },
  success: Boolean,
  failureReason: String
}]
```

## API Endpoints

### User Endpoints (Requires Authentication)
- `GET /api/user/my/sos-activities` - Get current user's SOS activities
- `GET /api/user/my/login-activities` - Get current user's login activities

### Admin Endpoints (Requires Admin Role)
- `GET /api/user/sos-activities` - Get all SOS activities across all users
- `GET /api/user/login-activities` - Get all login activities across all users

## Response Format

### SOS Activities Response
```json
{
  "success": true,
  "sosActivities": [
    {
      "timestamp": "2024-01-01T12:00:00.000Z",
      "location": {
        "latitude": 40.7128,
        "longitude": -74.0060,
        "address": "New York, NY, USA"
      },
      "status": "sent",
      "recipientEmail": "emergency@example.com",
      "notes": "Emergency situation"
    }
  ],
  "total": 1
}
```

### Login Activities Response
```json
{
  "success": true,
  "loginActivities": [
    {
      "timestamp": "2024-01-01T12:00:00.000Z",
      "deviceInfo": {
        "userAgent": "Mozilla/5.0...",
        "ipAddress": "192.168.1.1",
        "deviceType": "mobile"
      },
      "success": true
    }
  ],
  "total": 1
}
```

## Automatic Tracking

### SOS Activities
- Automatically tracked when `POST /api/sos` endpoint is called
- Location data is extracted from the request
- Address is resolved using Google Maps Geocoding API

### Login Activities
- Automatically tracked on every login attempt
- Both successful and failed attempts are recorded
- Device information is automatically detected
- IP address is captured from the request

## Device Detection

The system automatically detects device types based on user agent strings:
- **Mobile**: Android, iPhone, mobile browsers
- **Tablet**: iPad, tablet devices
- **Desktop**: Windows, Mac, Linux desktop browsers
- **Unknown**: When device type cannot be determined

## Security Considerations

1. **Data Privacy**: Activity data is only accessible to the user who owns it or admin users
2. **IP Address Storage**: IP addresses are stored for security monitoring
3. **Data Retention**: Consider implementing data retention policies for old activity records
4. **GDPR Compliance**: Users should be informed about activity tracking

## Future Enhancements

1. **Geolocation**: Add IP-based geolocation for login activities
2. **Activity Analytics**: Add analytics endpoints for activity patterns
3. **Data Export**: Allow users to export their activity data
4. **Activity Notifications**: Send notifications for suspicious login activities
5. **Data Cleanup**: Implement automatic cleanup of old activity records 