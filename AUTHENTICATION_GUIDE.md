# ClubConnect - Authentication & Authorization System

## Overview
The ClubConnect application implements a comprehensive role-based authentication and authorization system with JWT tokens, supporting both User (admin/coordinator/president) and Member authentication.

## Architecture

### 1. Authentication Flow

#### User Authentication (Admin, Coordinator, President)
1. User submits credentials to `/api/auth/login`
2. `AuthService` validates credentials using Spring Security's `AuthenticationManager`
3. Upon success, `JwtUtils` generates a JWT token with:
   - Username
   - Roles (ROLE_ADMIN, ROLE_CLUB_COORDINATOR, ROLE_CLUB_PRESIDENT)
   - User type: "USER"
   - Expiration time (24 hours default)
4. Client receives token and includes it in subsequent requests via `Authorization: Bearer <token>` header

#### Member Authentication
1. Member submits credentials to `/api/member/login`
2. `MemberAuthController` validates credentials manually against Member entity
3. Upon success, `JwtUtils` generates a JWT token with:
   - Username
   - Role: ROLE_MEMBER
   - User type: "MEMBER"
   - Expiration time (24 hours default)
4. Client receives token for accessing member portal endpoints

### 2. Authorization Layers

#### Layer 1: SecurityFilterChain (URL-based)
Configured in `SecurityConfig.java`:
- **Public endpoints**: Authentication, login pages, static resources
- **Member-only endpoints**: `/api/member/**` requires ROLE_MEMBER
- **Admin/Coordinator endpoints**: Event approvals, audit logs
- **General authenticated endpoints**: Most API endpoints require authentication

#### Layer 2: Method Security (@PreAuthorize)
Fine-grained authorization on controller methods:
- `@PreAuthorize("hasRole('ADMIN')")` - Admin only
- `@PreAuthorize("hasAnyRole('ADMIN', 'CLUB_COORDINATOR')")` - Admin or Coordinator
- `@PreAuthorize("hasAnyRole('ADMIN', 'CLUB_COORDINATOR', 'CLUB_PRESIDENT')")` - Management roles
- `@PreAuthorize("hasRole('MEMBER')")` - Members only

#### Layer 3: Service Level (AccessControlService)
Programmatic authorization checks:
- `canAccessClub(clubId)` - Check if user can access specific club
- `canCreateEvent()` - Check event creation permission
- `canApproveEvent()` - Check event approval permission
- `canManageMembers()` - Check member management permission
- `canDeleteMembers()` - Check member deletion permission

## User Roles & Permissions

### ADMIN (System Administrator)
**Capabilities:**
- Full access to all clubs and resources
- Create, update, delete clubs
- Approve/reject events from any club
- View all audit logs
- Manage all users and members
- Access all reports

**Restricted:**
- None - has complete system access

### CLUB_COORDINATOR
**Capabilities:**
- Approve/reject events for assigned club
- View and manage club information for assigned club
- Create, update events for assigned club
- Manage members (create, update, delete) for assigned club
- Manage attendance for assigned club
- View audit logs for assigned club
- Announce winners for assigned club

**Restricted:**
- Cannot create/delete clubs
- Cannot access other clubs' data (unless ADMIN)
- Cannot manage system-wide settings

### CLUB_PRESIDENT
**Capabilities:**
- Create, update events for assigned club (requires coordinator approval)
- View club information for assigned club
- Manage members (create, update) for assigned club
- Mark attendance for assigned club
- Add pre/post event reports
- Announce winners for assigned club
- View audit logs for assigned club

**Restricted:**
- Cannot approve/reject events
- Cannot delete members
- Cannot delete events
- Cannot access other clubs' data

### MEMBER
**Capabilities:**
- View own profile
- Change own password
- View upcoming and past events for own club
- View own attendance records
- View winners/celebrations for own club

**Restricted:**
- Cannot create/update events
- Cannot manage members
- Cannot mark attendance
- Cannot access admin/coordinator features
- Cannot access other clubs' data

## Security Features

### 1. JWT Token Security
- **Algorithm**: HS512 (HMAC with SHA-512)
- **Secret Key**: Configurable via `app.jwt.secret` (default provided)
- **Expiration**: 24 hours (configurable via `app.jwt.expiration`)
- **Token Claims**:
  - `sub`: Username
  - `roles`: Comma-separated role list
  - `type`: "USER" or "MEMBER"
  - `iat`: Issued at timestamp
  - `exp`: Expiration timestamp

### 2. Password Security
- **Encoding**: BCrypt with strength 10 (Spring Security default)
- **User Passwords**: Set during signup, can be changed via profile
- **Member Passwords**: Auto-generated on creation, must be changed on first login
- **Password Requirements**: Minimum 10 characters with mix of letters, numbers, and special characters (for auto-generated)

### 3. Session Management
- **Stateless**: No server-side sessions (SessionCreationPolicy.STATELESS)
- **Token-based**: All authentication via JWT tokens
- **CSRF Protection**: Disabled (appropriate for stateless JWT authentication)
- **CORS**: Configured to allow cross-origin requests

### 4. Audit Logging
All sensitive operations are logged in `audit_logs` table:
- **Event Operations**: Create, approve, reject, update, delete
- **Member Operations**: Create, update, delete, status changes
- **Attendance Operations**: Mark, update, delete
- **Winner Operations**: Announce, update, delete

**Audit Log Fields:**
- Action type (EVENT_APPROVED, MEMBER_CREATED, etc.)
- Entity type and ID
- Performed by (username)
- User type (USER/MEMBER)
- Timestamp
- IP address
- Club ID (if applicable)
- Success/failure status
- Error message (if failed)

## API Endpoint Security

### Public Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/member/login` - Member login
- `GET /`, `/index.html`, `/login.html`, etc. - Static pages

### Authenticated Endpoints

#### Club Management
- `GET /api/clubs` - All authenticated users
- `GET /api/clubs/{id}` - All authenticated users
- `POST /api/clubs` - ADMIN only
- `PUT /api/clubs/{id}` - ADMIN, CLUB_COORDINATOR
- `DELETE /api/clubs/{id}` - ADMIN only

#### Event Management
- `GET /api/events` - ADMIN, CLUB_COORDINATOR, CLUB_PRESIDENT
- `POST /api/events/club/{clubId}` - ADMIN, CLUB_COORDINATOR, CLUB_PRESIDENT
- `PUT /api/events/{id}` - ADMIN, CLUB_COORDINATOR, CLUB_PRESIDENT
- `DELETE /api/events/{id}` - ADMIN, CLUB_COORDINATOR
- `PUT /api/events/{id}/approve` - ADMIN, CLUB_COORDINATOR
- `PUT /api/events/{id}/reject` - ADMIN, CLUB_COORDINATOR

#### Member Management
- `GET /api/members` - ADMIN, CLUB_COORDINATOR, CLUB_PRESIDENT
- `POST /api/members/club/{clubId}` - ADMIN, CLUB_COORDINATOR, CLUB_PRESIDENT
- `PUT /api/members/{id}` - ADMIN, CLUB_COORDINATOR, CLUB_PRESIDENT
- `DELETE /api/members/{id}` - ADMIN, CLUB_COORDINATOR

#### Member Portal
- `GET /api/member/profile` - MEMBER only
- `PUT /api/member/change-password` - MEMBER only
- `GET /api/member/events/**` - MEMBER only
- `GET /api/member/attendance/**` - MEMBER only
- `GET /api/member/winners/**` - MEMBER only

#### Attendance Management
- `POST /api/attendance/mark` - ADMIN, CLUB_COORDINATOR, CLUB_PRESIDENT
- `PUT /api/attendance/{id}/**` - ADMIN, CLUB_COORDINATOR, CLUB_PRESIDENT
- `DELETE /api/attendance/{id}` - ADMIN, CLUB_COORDINATOR

#### Audit Logs
- `GET /api/audit` - ADMIN, CLUB_COORDINATOR
- `GET /api/audit/club/{clubId}` - ADMIN, CLUB_COORDINATOR, CLUB_PRESIDENT
- `GET /api/audit/entity/**` - ADMIN, CLUB_COORDINATOR, CLUB_PRESIDENT

## Implementation Details

### Key Classes

#### Security Configuration
- `SecurityConfig.java` - Main security configuration
- `JwtUtils.java` - JWT token generation and validation
- `AuthTokenFilter.java` - Request filter for JWT authentication
- `AuthEntryPointJwt.java` - Handles authentication errors

#### User Details Services
- `UserDetailsServiceImpl.java` - Loads User entities for authentication
- `UserDetailsImpl.java` - UserDetails implementation for Users
- `MemberDetailsServiceImpl.java` - Loads Member entities for authentication
- `MemberDetailsImpl.java` - UserDetails implementation for Members

#### Services
- `AuthService.java` - Handles user authentication and registration
- `AccessControlService.java` - Programmatic authorization checks
- `AuditLogService.java` - Audit logging functionality

### Database Tables

#### users
Stores admin, coordinator, and president accounts
- `role`: ADMIN, CLUB_COORDINATOR, CLUB_PRESIDENT, MEMBER (enum)
- `club_id`: Associated club (nullable for admin)
- `active`: Account status

#### members
Stores club member accounts
- `username`: Auto-generated from name and student ID
- `password`: BCrypt hashed
- `membership_status`: ACTIVE, INACTIVE, PENDING
- `club_id`: Associated club (required)

#### audit_logs
Stores all audited operations
- `action`: Operation type
- `entity_type`, `entity_id`: Affected entity
- `performed_by`: User who performed action
- `user_type`: USER or MEMBER
- `timestamp`: When action occurred
- `status`: SUCCESS or FAILURE
- `ip_address`: Client IP address

## Configuration

### application.properties
```properties
# JWT Configuration
app.jwt.secret=clubsConnectSecretKeyForJWTTokenGenerationAndValidation2024
app.jwt.expiration=86400000

# CORS Configuration (handled in SecurityConfig)
# Session Management (STATELESS)
```

## Best Practices

1. **Always validate club ownership**: Before allowing operations on club resources, verify user has access to that club
2. **Use @PreAuthorize**: Add method-level security annotations on all controller methods
3. **Log sensitive operations**: Use AuditLogService for all create/update/delete operations
4. **Handle exceptions properly**: Return appropriate HTTP status codes and error messages
5. **Validate input**: Always validate user input before processing
6. **Keep tokens secure**: Never log or expose JWT tokens
7. **Use HTTPS in production**: Always use HTTPS to protect tokens in transit
8. **Implement token refresh**: Consider implementing refresh tokens for better UX
9. **Monitor audit logs**: Regularly review audit logs for suspicious activity
10. **Keep dependencies updated**: Regularly update Spring Security and other dependencies

## Testing Authentication

### Test User Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

### Test Member Login
```bash
curl -X POST http://localhost:8080/api/member/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john2024","password":"temppass123"}'
```

### Test Protected Endpoint
```bash
curl -X GET http://localhost:8080/api/clubs \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check if token is valid and not expired
2. **403 Forbidden**: User doesn't have required role for the endpoint
3. **Token validation fails**: Verify JWT secret matches configuration
4. **CORS errors**: Check CORS configuration in SecurityConfig
5. **Member can't access user endpoints**: Members have ROLE_MEMBER, need different endpoints

### Debug Mode
Enable Spring Security debug logging:
```properties
logging.level.org.springframework.security=DEBUG
```
