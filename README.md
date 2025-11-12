# ClubsConnect - Quick Start Guide

## Prerequisites
- Java 17 or higher
- MySQL Server 8.0 or higher
- Maven 3.6+ (included in project)
- Web browser (Chrome, Firefox, Edge, Safari)

## Setup Instructions

### 1. Database Setup
```bash
# Start MySQL server (if not already running)
# Windows: Start MySQL service from Services
# The application will automatically create the 'clubconnect' database
```

### 2. Configure Database Connection
Edit `src/main/resources/application.properties` if needed:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/clubconnect?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

### 3. Run the Application

**Option A: Using IntelliJ IDEA**
1. Open the project in IntelliJ IDEA
2. Wait for Maven dependencies to download
3. Run `ClubsconnectApplication.java`
4. Look for "Started ClubsconnectApplication" in console

**Option B: Using Maven Command**
```bash
# Windows
.\mvnw.cmd clean spring-boot:run

# Linux/Mac
./mvnw clean spring-boot:run
```

### 4. Access the Application
1. Open browser and navigate to: http://localhost:8080/login.html
2. Use one of the demo accounts to login

## Demo Accounts

### Overall Club Head (Full Access)
- Username: `admin`
- Password: `admin123`

### Club Coordinators
- **Tech:** `tech_coordinator` / `tech123`
- **Sports:** `sports_coordinator` / `sports123`
- **Arts:** `arts_coordinator` / `arts123`

### Club Presidents
- **Tech:** `john_doe` / `president123`
- **Sports:** `jane_smith` / `president123`
- **Arts:** `alice_johnson` / `president123`

## Features Overview

### Dashboard
- Real-time statistics (clubs, members, events, active clubs)
- Welcome card with user greeting
- Quick navigation to all sections
- Global search functionality

### Clubs Management
- Create, view, update, and delete clubs
- Filter by category (Technology, Sports, Arts, etc.)
- View club details (president, contact, meeting schedule)
- Associate members and events with clubs

### Members Management
- Add members to clubs
- Assign roles (President, Vice President, Treasurer, etc.)
- Update member information
- View members by club

### Events Management
- Schedule events for clubs
- Set event status (SCHEDULED, ONGOING, COMPLETED, CANCELLED)
- Track event details (date, location, description)
- Filter events by club

### User Authentication
- Secure JWT-based login
- Role-based access control
- Session management
- Automatic logout after 24 hours

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/signup` - Register new user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Clubs
- `GET /api/clubs` - Get all clubs
- `POST /api/clubs` - Create club
- `PUT /api/clubs/{id}` - Update club
- `DELETE /api/clubs/{id}` - Delete club
- `GET /api/clubs/category/{category}` - Filter by category

### Members
- `GET /api/members` - Get all members
- `POST /api/members/club/{clubId}` - Add member to club
- `PUT /api/members/{id}` - Update member
- `DELETE /api/members/{id}` - Delete member
- `GET /api/members/club/{clubId}` - Get members by club

### Events
- `GET /api/events` - Get all events
- `POST /api/events/club/{clubId}` - Create event for club
- `PUT /api/events/{id}` - Update event
- `DELETE /api/events/{id}` - Delete event
- `GET /api/events/club/{clubId}` - Get events by club

### Users (Admin Only)
- `GET /api/users` - Get all users
- `GET /api/users/active` - Get active users
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

## Testing the Application

### 1. Login
- Go to http://localhost:8080/login.html
- Click on any demo account box to auto-fill
- Click "Sign In"

### 2. Create a Club
- Click "Clubs" in sidebar
- Click "+ Add Club" button
- Fill in the form
- Click "Save Club"

### 3. Add Members
- Click "Members" in sidebar
- Click "+ Add Member" button
- Select a club
- Fill in member details
- Click "Save Member"

### 4. Schedule Events
- Click "Events" in sidebar
- Click "+ Add Event" button
- Select a club
- Fill in event details
- Click "Save Event"

### 5. View Dashboard
- Click "Dashboard" in sidebar
- See updated statistics
- View recent activities

## Troubleshooting

### Port Already in Use
```bash
# Change port in application.properties
server.port=8081
```

### Database Connection Error
1. Check MySQL is running
2. Verify username/password in application.properties
3. Ensure port 3306 is not blocked
4. Check MySQL logs for errors

### Cannot Login
1. Check browser console for errors
2. Verify server is running (check console logs)
3. Clear browser cache and cookies
4. Try different browser

### 401 Unauthorized Error
1. Token may have expired
2. Log out and log in again
3. Check localStorage for token

## Default Data

The application automatically creates:
- **3 Clubs:** Tech Innovation Club, Basketball Club, Creative Arts Society
- **3 Members:** Bob Wilson (Tech), Carol Davis (Tech), David Brown (Sports)
- **3 Events:** Hackathon 2025, Basketball Tournament, Art Exhibition
- **7 Users:** 1 Admin, 3 Coordinators, 3 Presidents

## Development URLs

- **Frontend:** http://localhost:8080
- **Login:** http://localhost:8080/login.html
- **Dashboard:** http://localhost:8080/index.html
- **API Base:** http://localhost:8080/api

## Technology Stack

- **Backend:** Spring Boot 3.5.7, Spring Security, Spring Data JPA
- **Database:** MySQL 8.0
- **Authentication:** JWT (JSON Web Tokens)
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Icons:** Remix Icon
- **Build Tool:** Maven

## Project Structure

```
clubsconnect/
├── src/
│   ├── main/
│   │   ├── java/com/example/clubsconnect/
│   │   │   ├── config/          # Configuration classes
│   │   │   ├── controller/      # REST controllers
│   │   │   ├── dto/             # Data Transfer Objects
│   │   │   ├── model/           # JPA entities
│   │   │   ├── repository/      # Data access layer
│   │   │   ├── security/        # Security components
│   │   │   ├── service/         # Business logic
│   │   │   └── ClubsconnectApplication.java
│   │   └── resources/
│   │       ├── static/          # Frontend files
│   │       │   ├── css/
│   │       │   ├── js/
│   │       │   ├── index.html
│   │       │   └── login.html
│   │       └── application.properties
│   └── test/                    # Test files
├── pom.xml                      # Maven configuration
├── AUTHENTICATION.md            # Auth documentation
└── README.md                    # This file
```

## Next Steps

1. ✅ Login with demo account
2. ✅ Explore the dashboard
3. ✅ Create your first club
4. ✅ Add members to clubs
5. ✅ Schedule events
6. ✅ Test different user roles
7. 🔄 Customize for your needs
8. 🔄 Add more features

## Support & Documentation

- **Authentication Guide:** See AUTHENTICATION.md
- **API Documentation:** All endpoints listed above
- **Issue Reporting:** Check console logs for errors
- **Configuration:** application.properties file

## Security Notes

⚠️ **Important:** This is a development setup with demo credentials.

For production use:
- Change all default passwords
- Use environment variables for secrets
- Enable HTTPS
- Configure proper CORS settings
- Implement rate limiting
- Add input validation
- Enable SQL injection protection
- Use strong JWT secret key
- Implement password policies

## Happy Managing! 🎉

Your ClubsConnect application is now ready to use. Start by logging in and exploring the features!
