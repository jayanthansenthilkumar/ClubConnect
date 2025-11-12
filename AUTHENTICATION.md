# ClubsConnect Authentication System

## Overview
ClubsConnect now includes a complete JWT-based authentication system with role-based access control (RBAC) for three user roles:
1. **Overall Club Head** - Full system access
2. **Club Coordinator** - Manages specific club activities
3. **Club President** - Leads a specific club

## Authentication Features

### Backend Components

1. **User Entity** (`User.java`)
   - Username, email, password (encrypted)
   - Role-based system (OVERALL_CLUB_HEAD, CLUB_COORDINATOR, CLUB_PRESIDENT)
   - Club association for Coordinators and Presidents
   - Active/inactive status management

2. **JWT Security**
   - Token-based authentication
   - 24-hour token expiration
   - Secure password encryption using BCrypt
   - JWT secret key configuration

3. **Security Configuration** (`SecurityConfig.java`)
   - Stateless session management
   - Protected API endpoints
   - Public access to login and static resources
   - CORS enabled for development

4. **API Endpoints**

   **Auth Controller** (`/api/auth`)
   - `POST /api/auth/login` - User login
   - `POST /api/auth/signup` - User registration
   - `GET /api/auth/me` - Get current user info
   - `POST /api/auth/logout` - User logout

   **User Controller** (`/api/users`)
   - `GET /api/users` - Get all users (OVERALL_CLUB_HEAD only)
   - `GET /api/users/active` - Get active users
   - `GET /api/users/{id}` - Get user by ID
   - `GET /api/users/role/{role}` - Get users by role
   - `GET /api/users/club/{clubId}` - Get users by club
   - `PUT /api/users/{id}` - Update user
   - `DELETE /api/users/{id}` - Delete user (OVERALL_CLUB_HEAD only)
   - `PUT /api/users/{id}/activate` - Activate user
   - `PUT /api/users/{id}/deactivate` - Deactivate user

### Frontend Components

1. **Login Page** (`login.html`)
   - Modern, responsive design
   - Password visibility toggle
   - Demo account credentials display
   - Click-to-fill demo accounts
   - Error handling and validation

2. **Authentication Integration** (`login.js`, `app.js`)
   - Token storage in localStorage
   - Automatic redirect to login if not authenticated
   - Token validation on page load
   - Auth headers added to all API requests
   - Auto-logout on 401 responses

## Default User Accounts

### Overall Club Head
- **Username:** `admin`
- **Password:** `admin123`
- **Access:** Full system access, manage all clubs and users

### Tech Club Coordinator
- **Username:** `tech_coordinator`
- **Password:** `tech123`
- **Club:** Tech Innovation Club
- **Access:** Coordinate Tech Club activities

### Tech Club President
- **Username:** `john_doe`
- **Password:** `president123`
- **Club:** Tech Innovation Club
- **Access:** Lead Tech Club

### Sports Club Coordinator
- **Username:** `sports_coordinator`
- **Password:** `sports123`
- **Club:** Basketball Club
- **Access:** Coordinate Sports Club activities

### Sports Club President
- **Username:** `jane_smith`
- **Password:** `president123`
- **Club:** Basketball Club
- **Access:** Lead Basketball Club

### Arts Club Coordinator
- **Username:** `arts_coordinator`
- **Password:** `arts123`
- **Club:** Creative Arts Society
- **Access:** Coordinate Arts Club activities

### Arts Club President
- **Username:** `alice_johnson`
- **Password:** `president123`
- **Club:** Creative Arts Society
- **Access:** Lead Arts Club

## How to Use

### Running the Application

1. **Start MySQL Server**
   ```bash
   # Ensure MySQL is running on localhost:3306
   ```

2. **Run the Application**
   ```bash
   # From IntelliJ IDEA, run ClubsconnectApplication.java
   # Or use Maven:
   mvnw spring-boot:run
   ```

3. **Access the Application**
   - Login Page: http://localhost:8080/login.html
   - Dashboard: http://localhost:8080/index.html (redirects to login if not authenticated)

### Login Process

1. Navigate to http://localhost:8080/login.html
2. Enter credentials or click on a demo account to auto-fill
3. Click "Sign In"
4. Upon successful login:
   - JWT token stored in localStorage
   - User info stored for session
   - Redirected to dashboard
   - User name and role displayed in header

### Logout Process

1. Click on user avatar in the top-right corner
2. Click "Logout" from dropdown
3. Token and user info cleared
4. Redirected to login page

## Security Features

1. **Password Encryption**
   - BCrypt hashing algorithm
   - Salt automatically generated
   - Passwords never stored in plain text

2. **JWT Tokens**
   - Signed with HS512 algorithm
   - Include user information
   - 24-hour expiration
   - Validated on every request

3. **Protected Endpoints**
   - All `/api/clubs`, `/api/members`, `/api/events` require authentication
   - `/api/auth/**` endpoints are public
   - Static resources (HTML, CSS, JS) are accessible

4. **Role-Based Access**
   - `@PreAuthorize` annotations on sensitive endpoints
   - Overall Club Head has full access
   - Coordinators and Presidents have restricted access

## API Request Format

### Login Request
```json
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

### Login Response
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "type": "Bearer",
  "id": 1,
  "username": "admin",
  "email": "admin@clubsconnect.com",
  "fullName": "Admin User",
  "role": "OVERALL_CLUB_HEAD",
  "clubId": null,
  "clubName": null
}
```

### Authenticated API Request
```javascript
fetch('http://localhost:8080/api/clubs', {
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9...',
    'Content-Type': 'application/json'
  }
})
```

### Signup Request
```json
POST /api/auth/signup
Content-Type: application/json

{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123",
  "fullName": "New User",
  "role": "CLUB_PRESIDENT",
  "clubId": 1,
  "phoneNumber": "123-456-7890",
  "department": "Computer Science"
}
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    club_id BIGINT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    phone_number VARCHAR(50),
    department VARCHAR(100),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    FOREIGN KEY (club_id) REFERENCES club(id)
);
```

## Configuration

### application.properties
```properties
# JWT Configuration
app.jwt.secret=clubsConnectSecretKeyForJWTTokenGenerationAndValidation2024MustBeLongEnoughForHS512
app.jwt.expiration=86400000

# Database
spring.datasource.url=jdbc:mysql://localhost:3306/clubconnect?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

## Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Token expired (24 hours)
   - Invalid token
   - Solution: Log out and log in again

2. **403 Forbidden**
   - Insufficient permissions for the role
   - Solution: Use an account with appropriate role

3. **Cannot login**
   - Check if MySQL is running
   - Verify database connection
   - Check application logs

4. **Token not persisting**
   - Check browser localStorage
   - Clear cache and cookies
   - Disable browser extensions blocking storage

## Future Enhancements

- [ ] Password reset functionality
- [ ] Email verification
- [ ] Refresh tokens for extended sessions
- [ ] Two-factor authentication (2FA)
- [ ] Activity logging and audit trails
- [ ] Password strength requirements
- [ ] Account lockout after failed attempts
- [ ] Remember me functionality

## Tech Stack

- **Backend:** Spring Boot 3.5.7, Spring Security, JWT (jjwt 0.11.5)
- **Database:** MySQL with JPA/Hibernate
- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Icons:** Remix Icon v3.5.0
- **Password Encryption:** BCrypt

## Support

For issues or questions:
1. Check the browser console for errors
2. Check the application logs
3. Verify all dependencies are installed
4. Ensure MySQL server is running
5. Check that ports 8080 and 3306 are available
