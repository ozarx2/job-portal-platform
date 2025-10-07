# Cron Job System Documentation

## Overview

The cron job system automatically sends application status updates to candidates and provides various notification services. It runs scheduled tasks to check for application status changes and send appropriate notifications.

## Features

### 1. Application Status Updates
- **Schedule**: Every 5 minutes
- **Purpose**: Monitors application status changes and sends email notifications
- **Triggers**: When application status changes to Shortlisted, Interviewed, Selected, Hired, Rejected, or Onboarding

### 2. Daily Application Summary
- **Schedule**: Daily at 9:00 AM (Asia/Kolkata timezone)
- **Purpose**: Sends daily summary of application activity to candidates
- **Content**: List of applications applied on that day with their current status

### 3. Weekly Application Reports
- **Schedule**: Every Monday at 10:00 AM (Asia/Kolkata timezone)
- **Purpose**: Sends weekly report of application activity to candidates
- **Content**: Summary statistics and list of applications updated in the past week

## Architecture

### Components

1. **CronService** (`backend/services/cronService.js`)
   - Main service class that manages all cron jobs
   - Handles scheduling, execution, and error handling
   - Provides methods to start/stop the service

2. **Notification Model** (`backend/models/Notification.js`)
   - Tracks sent notifications to prevent duplicates
   - Stores notification metadata and status
   - Enables audit trail of all notifications

3. **Cron Routes** (`backend/routes/cron.js`)
   - API endpoints for managing cron service
   - Admin-only access for manual triggers
   - Status monitoring and control

4. **Admin Interface** (`frontend/src/components/admin/CronManagement.jsx`)
   - Web interface for managing cron jobs
   - Real-time status monitoring
   - Manual trigger capabilities

### Database Schema

#### Notification Model
```javascript
{
  application: ObjectId,    // Reference to Application
  candidate: ObjectId,      // Reference to User
  type: String,            // 'status_update', 'daily_summary', 'weekly_report'
  status: String,          // Application status (for status_update type)
  sentAt: Date,            // When notification was sent
  emailSent: Boolean,      // Whether email was sent successfully
  emailStatus: String,     // 'sent', 'failed', 'pending'
  errorMessage: String,    // Error details if failed
  metadata: Object         // Additional data
}
```

## API Endpoints

### Cron Management Endpoints

#### GET `/api/cron/status`
- **Purpose**: Get current cron service status
- **Access**: Admin only
- **Response**: Service status and active jobs information

#### POST `/api/cron/start`
- **Purpose**: Start the cron service
- **Access**: Admin only
- **Response**: Success/failure message

#### POST `/api/cron/stop`
- **Purpose**: Stop the cron service
- **Access**: Admin only
- **Response**: Success/failure message

#### POST `/api/cron/trigger-status-updates`
- **Purpose**: Manually trigger status update checking
- **Access**: Admin only
- **Response**: Success/failure message

#### POST `/api/cron/trigger-daily-summary`
- **Purpose**: Manually trigger daily summary sending
- **Access**: Admin only
- **Response**: Success/failure message

#### POST `/api/cron/trigger-weekly-reports`
- **Purpose**: Manually trigger weekly reports sending
- **Access**: Admin only
- **Response**: Success/failure message

## Email Templates

### Status Update Email
- **Subject**: "Application Update - [Job Title]"
- **Content**: Personalized message based on status
- **Includes**: Job details, company name, current status
- **CTA**: Link to candidate dashboard

### Daily Summary Email
- **Subject**: "Daily Application Summary - Ozarx"
- **Content**: Table of applications applied today
- **Includes**: Job title, company, status, applied date
- **Purpose**: Keep candidates informed of their daily activity

### Weekly Report Email
- **Subject**: "Weekly Application Report - Ozarx"
- **Content**: Statistics and list of recent applications
- **Includes**: Total applications, status breakdown, recent updates
- **Purpose**: Provide weekly progress overview

## Configuration

### Environment Variables
```bash
# Timezone for cron jobs (default: Asia/Kolkata)
CRON_TIMEZONE=Asia/Kolkata

# Email configuration (already configured)
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password
```

### Cron Schedule Patterns
```javascript
// Every 5 minutes
'*/5 * * * *'

// Daily at 9:00 AM
'0 9 * * *'

// Weekly on Monday at 10:00 AM
'0 10 * * 1'
```

## Usage

### Starting the Service
The cron service starts automatically when the server starts. It can also be controlled via:

1. **API Endpoints**: Use the cron management endpoints
2. **Admin Interface**: Use the web interface at `/admin/cron`
3. **Programmatically**: Instantiate CronService and call start()

### Monitoring
- Check service status via API or admin interface
- View logs for execution details
- Monitor notification records in database

### Manual Triggers
- Use admin interface for immediate execution
- Useful for testing and debugging
- Can trigger individual job types

## Error Handling

### Notification Tracking
- Prevents duplicate notifications
- Tracks failed email sends
- Maintains audit trail

### Error Recovery
- Failed notifications are logged
- Service continues running despite individual failures
- Retry mechanism for failed emails

### Logging
- Comprehensive logging for debugging
- Error tracking and reporting
- Performance monitoring

## Testing

### Test Script
Run the test script to verify functionality:
```bash
node backend/test-cron.js
```

### Manual Testing
1. Use admin interface to trigger manual executions
2. Check email delivery
3. Verify notification records in database

## Deployment

### Production Considerations
1. **Server Restart**: Service auto-starts with server
2. **Timezone**: Ensure server timezone matches cron timezone
3. **Email Limits**: Monitor SMTP rate limits
4. **Database**: Ensure proper indexing on notification queries

### Monitoring
- Set up alerts for service failures
- Monitor email delivery rates
- Track notification performance

## Troubleshooting

### Common Issues

1. **Service Not Starting**
   - Check database connection
   - Verify environment variables
   - Check server logs

2. **Emails Not Sending**
   - Verify SMTP configuration
   - Check email service limits
   - Review error logs

3. **Duplicate Notifications**
   - Check notification tracking
   - Verify cron schedule
   - Review application update logic

### Debug Commands
```bash
# Check service status
curl -H "Authorization: Bearer <token>" http://localhost:5000/api/cron/status

# Manual trigger
curl -X POST -H "Authorization: Bearer <token>" http://localhost:5000/api/cron/trigger-status-updates
```

## Security

### Access Control
- All cron management endpoints require admin authentication
- JWT token validation
- Role-based access control

### Data Protection
- Notification data is encrypted in transit
- Email content follows privacy guidelines
- Audit trail for compliance

## Performance

### Optimization
- Efficient database queries with proper indexing
- Batch processing for multiple notifications
- Rate limiting to prevent email spam

### Scalability
- Service can handle high volume of applications
- Database indexing for fast queries
- Configurable batch sizes

## Future Enhancements

### Planned Features
1. **SMS Notifications**: Add SMS support for critical updates
2. **Push Notifications**: Mobile app notifications
3. **Custom Schedules**: User-configurable notification preferences
4. **Analytics**: Notification delivery analytics
5. **Templates**: Customizable email templates

### Integration Points
- Mobile app push notifications
- Third-party email services
- Analytics platforms
- CRM systems








