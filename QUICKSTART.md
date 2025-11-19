# ClubConnect - Quick Start Guide

## Prerequisites
- Java 17+
- MySQL 8.0+
- Maven 3.6+

## Setup Steps

### 1. Database Setup
```sql
CREATE DATABASE clubconnect;
```
The application will auto-create all tables on first run.

### 2. Email Configuration
Edit `src/main/resources/application.properties`:

```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=YOUR_EMAIL@gmail.com
spring.mail.password=YOUR_APP_PASSWORD
```

**For Gmail:**
1. Enable 2-Factor Authentication
2. Create an App Password: https://myaccount.google.com/apppasswords
3. Use the 16-character app password

### 3. Run Application
```bash
./mvnw clean install
./mvnw spring-boot:run
```

Or on Windows:
```bash
mvnw.cmd clean install
mvnw.cmd spring-boot:run
```

### 4. Access Application
- **Admin/Coordinator/President**: http://localhost:8080/login.html
- **Member Portal**: http://localhost:8080/member-login.html

## Default Test Users
You'll need to create users through the signup or data initialization.

## Quick Test Workflow

### Step 1: Create Admin User
1. Go to http://localhost:8080/login.html
2. Click "Sign Up" (if available) or use DataInitializer
3. Create user with role: ADMIN

### Step 2: Create Club (As Admin)
1. Login as ADMIN
2. Navigate to Clubs → Create Club
3. Fill details and save

### Step 3: Create Coordinator
1. Create user with role: CLUB_COORDINATOR
2. Assign to the club created

### Step 4: Add Members (As Coordinator)
1. Login as COORDINATOR
2. Navigate to Members → Add Member
3. Fill in:
   - Student ID: `STU001`
   - Name: `Test Student`
   - Email: `student@example.com`
   - Academic Year: `2024-2025`
   - Department: `Computer Science`
4. Click Save

**Result:**
- Member is created
- Username auto-generated (e.g., `tests001`)
- Password auto-generated
- Welcome email sent with credentials
- Member can now login at `/member-login.html`

### Step 5: Create Event (As Coordinator/President)
1. Navigate to Events → Create Event
2. Fill event details
3. Submit

**Result:**
- Event created with status PENDING
- Email sent to all club members
- Event appears in member portal

### Step 6: Approve Event (As Coordinator)
1. Navigate to Events → Pending Approval
2. Click Approve on the event
3. Provide approval notes

**Result:**
- Event status: APPROVED
- Email sent to all members
- Event now visible in member upcoming events

### Step 7: Member Login
1. Go to http://localhost:8080/member-login.html
2. Use credentials from email
3. Explore dashboard:
   - View upcoming events
   - Check attendance
   - See winners

### Step 8: Mark Attendance (As Coordinator/President)
1. Navigate to Attendance → Mark Attendance
2. Select event and member
3. Mark status (PRESENT/ABSENT/LATE)

**Result:**
- Attendance recorded
- Visible in member portal
- Included in reports

### Step 9: Announce Winner (As Coordinator/President)
1. Navigate to Winners → Announce Winner
2. Select event and member
3. Fill position, achievement, prize
4. Submit

**Result:**
- Winner announced
- Flower shower animation on member portal
- Added to Hall of Fame

### Step 10: Download Reports
1. Navigate to Events → Past Events
2. Click "Download Post-Event Report"

**Result:**
- PDF generated with:
  - Event details
  - Attendance statistics
  - Financial summary
  - Analysis notes

## Testing Email Functionality

### Option 1: Use Mailtrap (Recommended for Testing)
```properties
spring.mail.host=smtp.mailtrap.io
spring.mail.port=2525
spring.mail.username=your_mailtrap_username
spring.mail.password=your_mailtrap_password
```

### Option 2: Use Gmail
1. Enable "Less secure app access" (not recommended)
2. OR use App Passwords (recommended)

### Option 3: Use Local SMTP Server
Install and run Mailhog or similar:
```properties
spring.mail.host=localhost
spring.mail.port=1025
```

## Common Issues & Solutions

### Issue: Email not sending
**Solution:** Check email configuration and credentials

### Issue: Member creation fails - "Student already exists"
**Solution:** This is working correctly! The student is already in another club. Use different student ID.

### Issue: Cannot approve event
**Solution:** Ensure you're logged in as COORDINATOR (only coordinators can approve)

### Issue: Member cannot login
**Solution:** 
1. Check email for credentials
2. Verify membershipStatus is ACTIVE
3. Ensure password is correct

### Issue: PDF download fails
**Solution:** Ensure event has post-event report data

## API Testing with Postman/cURL

### Create Member
```bash
curl -X POST http://localhost:8080/api/members/club/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "studentId": "STU001",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "academicYear": "2024-2025",
    "department": "CS"
  }'
```

### Member Login
```bash
curl -X POST http://localhost:8080/api/member/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johnd001",
    "password": "TempPass123"
  }'
```

### Approve Event
```bash
curl -X PUT http://localhost:8080/api/events/1/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "approvedBy": "coordinator_username"
  }'
```

## Verification Checklist

- [ ] Application starts without errors
- [ ] Database tables created automatically
- [ ] Can create clubs
- [ ] Can add members (duplicate check works)
- [ ] Welcome email received with credentials
- [ ] Member can login with credentials
- [ ] Events created send email notifications
- [ ] Event approval workflow works
- [ ] Attendance can be marked
- [ ] Winners announced with celebration
- [ ] PDF reports downloadable
- [ ] Role-based access enforced

## Next Steps

1. **Customize Email Templates**: Edit EmailService.java
2. **Add More Features**: Event reminders, notifications
3. **Enhance UI**: Add more dashboards and charts
4. **Deploy**: Configure for production environment
5. **Backup**: Set up database backups
6. **Monitoring**: Add logging and monitoring

## Support

For issues or questions:
1. Check IMPLEMENTATION_GUIDE.md for detailed documentation
2. Review SUMMARY.md for feature overview
3. Check application logs in console
4. Verify database connections and configurations

## License & Credits

ClubConnect - A comprehensive club management system with role-based access, event management, and automated workflows.

Built with:
- Spring Boot 3.5.7
- MySQL
- JWT Authentication
- Apache PDFBox
- Spring Mail

---

**Ready to go!** Start the application and test all features. 🚀
