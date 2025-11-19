# 🎓 ClubConnect - Comprehensive Club Management System

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.7-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-17+-orange.svg)](https://www.oracle.com/java/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-blue.svg)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A full-featured club management system with role-based access control, event management, attendance tracking, automated notifications, and comprehensive reporting.

## ✨ Features

### 🔐 Role-Based Access Control
- **ADMIN**: Complete system administration
- **CLUB_COORDINATOR**: Event approval, member management, club oversight
- **CLUB_PRESIDENT**: Event creation, member management, club operations
- **MEMBER**: View events, attendance, and winners

### 👥 Smart Member Management
- **Duplicate Prevention**: Prevents students from joining multiple clubs
- **Auto-Login Creation**: Automatic username and password generation
- **Email Notifications**: Welcome emails with login credentials
- **Academic Year Tracking**: Session-based membership management
- **Status Management**: ACTIVE, INACTIVE, PENDING membership states

### 📅 Event Management Workflow
- **Event Creation**: Presidents and coordinators can create events
- **Approval System**: Coordinators approve events before publication
- **Email Notifications**: Automatic notifications on creation and approval
- **Status Tracking**: PENDING → APPROVED → SCHEDULED → ONGOING → COMPLETED
- **Report Generation**: Pre and post-event PDF reports

### 📊 Attendance Management
- **Real-time Tracking**: Check-in and check-out timestamps
- **Multiple Status**: PRESENT, ABSENT, LATE, EXCUSED
- **Statistics**: Automatic calculation and reporting
- **Member Access**: Personal attendance history in member portal

### 🏆 Winner Celebration System
- **Winner Announcements**: Track positions, achievements, and prizes
- **Visual Celebrations**: Animated flower shower on member portal
- **Auto Duration**: Celebrations run until next event (or 30 days)
- **Hall of Fame**: Complete winner history

### 📧 Email Notification System
- Welcome emails with login credentials
- Event creation announcements
- Event approval notifications
- Customizable HTML templates
- Async processing for performance

### 📄 PDF Report Generation
**Pre-Event Reports:**
- Event details and planning
- Budget allocation
- Timeline and logistics

**Post-Event Reports:**
- Attendance statistics
- Financial analysis (Budget vs Actual)
- Participant metrics
- Event summary and analysis

### 🎨 Member Portal
- Upcoming events dashboard
- Past events with downloadable reports
- Personal attendance records and statistics
- Hall of Fame with active celebrations
- Profile management and password change

## 🚀 Quick Start

### Prerequisites
```bash
- Java 17 or higher
- MySQL 8.0+
- Maven 3.6+
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/jayanthansenthilkumar/ClubConnect.git
cd ClubConnect
```

2. **Configure Database**
```sql
CREATE DATABASE clubconnect;
```

3. **Configure Email** (Edit `src/main/resources/application.properties`)
```properties
spring.mail.host=smtp.gmail.com
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
```

4. **Build and Run**
```bash
./mvnw clean install
./mvnw spring-boot:run
```

5. **Access Application**
- Admin Panel: http://localhost:8080/login.html
- Member Portal: http://localhost:8080/member-login.html

## 📖 Documentation

- **[Quick Start Guide](QUICKSTART.md)** - Get started in minutes
- **[Implementation Guide](IMPLEMENTATION_GUIDE.md)** - Detailed technical documentation
- **[Feature Summary](SUMMARY.md)** - Complete feature overview

## 🏗️ Architecture

### Technology Stack
- **Backend**: Spring Boot 3.5.7
- **Database**: MySQL 8.0
- **Security**: JWT Authentication, BCrypt encryption
- **Email**: Spring Mail with async processing
- **PDF**: Apache PDFBox
- **Frontend**: HTML5, CSS3, Vanilla JavaScript

### Key Components
```
clubsconnect/
├── model/              # Data models (User, Member, Event, etc.)
├── repository/         # JPA repositories
├── service/           # Business logic
│   ├── EmailService   # Async email notifications
│   ├── PDFService     # Report generation
│   ├── MemberService  # Member management with auto-login
│   ├── EventService   # Event workflow with approvals
│   └── AttendanceService # Attendance tracking
├── controller/        # REST API endpoints
│   ├── MemberAuthController    # Member authentication
│   ├── AttendanceController    # Attendance management
│   ├── WinnerController        # Winner announcements
│   └── ReportController        # PDF downloads
├── security/          # JWT, authentication
└── config/            # Spring configuration
```

## 🔑 Key Workflows

### Adding a Member
1. Coordinator logs in
2. Navigates to Members → Add Member
3. Fills student details (ID, name, email, year)
4. System validates (no duplicates across clubs)
5. Auto-generates username and password
6. Sends welcome email with credentials
7. Member can login immediately

### Event Lifecycle
1. **Creation**: President creates event → Members receive email
2. **Approval**: Coordinator approves → Approval email sent
3. **Execution**: Event happens, attendance tracked
4. **Completion**: Post-event report added
5. **Download**: Members download PDF reports

### Winner Announcement
1. Coordinator announces winner post-event
2. System calculates celebration duration
3. Flower shower animation appears on member portal
4. Winner added to Hall of Fame
5. Celebration continues until next event

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Role-Based Access**: Method-level security with @PreAuthorize
- **Password Encryption**: BCrypt hashing
- **CORS Configuration**: Configurable cross-origin policies
- **Session Management**: Stateless JWT sessions

## 📱 API Endpoints

### Authentication
```
POST   /api/auth/signin          # Admin/Coordinator/President login
POST   /api/auth/signup          # User registration
POST   /api/member/login         # Member login
```

### Members
```
GET    /api/members              # Get all members
POST   /api/members/club/{id}    # Add member (auto-creates login)
PUT    /api/members/{id}         # Update member
DELETE /api/members/{id}         # Delete member
```

### Events
```
GET    /api/events                    # Get all events
POST   /api/events/club/{id}          # Create event
PUT    /api/events/{id}/approve       # Approve event (coordinator)
PUT    /api/events/{id}/reject        # Reject event
GET    /api/events/pending-approval   # Get pending events
```

### Attendance
```
POST   /api/attendance/mark           # Mark attendance
GET    /api/attendance/event/{id}     # Get event attendance
GET    /api/attendance/event/{id}/stats # Get statistics
```

### Winners
```
POST   /api/winners                   # Announce winner
GET    /api/winners/active            # Get active celebrations
GET    /api/winners/club/{id}         # Get club winners
```

### Reports
```
GET    /api/reports/event/{id}/pre-event   # Download pre-event PDF
GET    /api/reports/event/{id}/post-event  # Download post-event PDF
```

## 🎯 Use Cases

### For Administrators
- Manage all clubs and users
- Oversee system operations
- Access all reports and analytics

### For Coordinators
- Approve/reject events
- Add members with duplicate prevention
- Track attendance and announce winners
- Download comprehensive reports

### For Presidents
- Create and manage events
- Add members to their club
- Mark attendance
- Generate event reports

### For Members
- View upcoming approved events
- Check personal attendance history
- See winner celebrations
- Download event reports
- Change password

## 🧪 Testing

### Manual Testing Checklist
- [ ] Create club and users
- [ ] Add member (check email received)
- [ ] Try adding same student to different club (should fail)
- [ ] Member logs in with emailed credentials
- [ ] Create event (check email sent)
- [ ] Approve event (check email sent)
- [ ] Mark attendance
- [ ] Announce winner (check celebration animation)
- [ ] Download PDF reports
- [ ] Verify role-based access

### Sample Test Data
```java
// Create test student
Student ID: STU2024001
Name: John Doe
Email: john.doe@example.com
Academic Year: 2024-2025
Department: Computer Science
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Jayanthan Senthilkumar**

## 🙏 Acknowledgments

- Spring Boot team for the excellent framework
- Apache PDFBox for PDF generation
- All contributors and testers

## 📞 Support

For issues and questions:
1. Check the [Implementation Guide](IMPLEMENTATION_GUIDE.md)
2. Review the [Quick Start Guide](QUICKSTART.md)
3. Open an issue on GitHub

---

**Made with ❤️ for better club management**
