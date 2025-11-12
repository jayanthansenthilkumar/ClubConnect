# Authentication Flow Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLUBSCONNECT                             │
│                   Authentication System                          │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐          ┌──────────────────┐          ┌──────────────────┐
│                  │          │                  │          │                  │
│   Frontend       │◄────────►│   Backend        │◄────────►│   Database       │
│   (HTML/CSS/JS)  │   HTTP   │   (Spring Boot)  │   JPA    │   (MySQL)        │
│                  │   REST   │                  │          │                  │
└──────────────────┘          └──────────────────┘          └──────────────────┘
```

## Authentication Flow

### 1. Login Process

```
User                    Frontend                Backend                 Database
 │                         │                       │                        │
 │ 1. Enter credentials   │                       │                        │
 ├─────────────────────────►                       │                        │
 │                         │ 2. POST /api/auth/login                       │
 │                         ├───────────────────────►                        │
 │                         │                       │ 3. Find user           │
 │                         │                       ├────────────────────────►
 │                         │                       │                        │
 │                         │                       │◄────────────────────────
 │                         │                       │ 4. Verify password     │
 │                         │                       │    (BCrypt check)      │
 │                         │                       │                        │
 │                         │                       │ 5. Generate JWT token  │
 │                         │                       │    (JwtUtils)          │
 │                         │                       │                        │
 │                         │ 6. Return LoginResponse                        │
 │                         │◄───────────────────────                        │
 │                         │   {token, user info}                          │
 │ 7. Store token         │                       │                        │
 │    in localStorage     │                       │                        │
 │◄────────────────────────│                       │                        │
 │                         │                       │                        │
 │ 8. Redirect to dashboard                       │                        │
 │◄────────────────────────                        │                        │
```

### 2. Authenticated Request Flow

```
User                    Frontend                Backend                 Database
 │                         │                       │                        │
 │ 1. Click "Create Club" │                       │                        │
 ├─────────────────────────►                       │                        │
 │                         │ 2. POST /api/clubs    │                        │
 │                         │    Headers:           │                        │
 │                         │    Authorization:     │                        │
 │                         │    Bearer {token}     │                        │
 │                         ├───────────────────────►                        │
 │                         │                       │ 3. AuthTokenFilter     │
 │                         │                       │    validates token     │
 │                         │                       │                        │
 │                         │                       │ 4. Extract username    │
 │                         │                       │    from token          │
 │                         │                       │                        │
 │                         │                       │ 5. Load user details   │
 │                         │                       ├────────────────────────►
 │                         │                       │◄────────────────────────
 │                         │                       │                        │
 │                         │                       │ 6. Set authentication  │
 │                         │                       │    in SecurityContext  │
 │                         │                       │                        │
 │                         │                       │ 7. Process request     │
 │                         │                       │    (ClubController)    │
 │                         │                       │                        │
 │                         │                       │ 8. Save to database    │
 │                         │                       ├────────────────────────►
 │                         │                       │◄────────────────────────
 │                         │ 9. Return response    │                        │
 │                         │◄───────────────────────                        │
 │ 10. Display success    │                       │                        │
 │◄────────────────────────                        │                        │
```

### 3. Logout Process

```
User                    Frontend                Backend
 │                         │                       │
 │ 1. Click "Logout"      │                       │
 ├─────────────────────────►                       │
 │                         │ 2. Clear localStorage │
 │                         │    - Remove token     │
 │                         │    - Remove user      │
 │                         │                       │
 │                         │ 3. POST /api/auth/logout
 │                         ├───────────────────────►
 │                         │◄───────────────────────
 │                         │                       │
 │ 4. Redirect to login   │                       │
 │◄────────────────────────                        │
```

## Component Structure

### Backend Components

```
┌─────────────────────────────────────────────────────────┐
│                  Spring Security Layer                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐      ┌──────────────┐                │
│  │ Security     │      │ AuthToken    │                │
│  │ Config       │─────►│ Filter       │                │
│  └──────────────┘      └──────────────┘                │
│         │                      │                        │
│         │                      ▼                        │
│         │              ┌──────────────┐                │
│         │              │ JWT Utils    │                │
│         │              └──────────────┘                │
│         │                      │                        │
│         ▼                      ▼                        │
│  ┌──────────────────────────────────┐                  │
│  │    UserDetailsService            │                  │
│  └──────────────────────────────────┘                  │
│                    │                                    │
└────────────────────┼────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Application Layer                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐      ┌──────────────┐                │
│  │ Auth         │      │ User         │                │
│  │ Controller   │      │ Controller   │                │
│  └──────┬───────┘      └──────┬───────┘                │
│         │                     │                         │
│         ▼                     ▼                         │
│  ┌──────────────┐      ┌──────────────┐                │
│  │ Auth         │      │ User         │                │
│  │ Service      │      │ Service      │                │
│  └──────┬───────┘      └──────┬───────┘                │
│         │                     │                         │
│         └──────────┬──────────┘                         │
│                    ▼                                    │
│         ┌──────────────────┐                           │
│         │ User Repository  │                           │
│         └────────┬─────────┘                           │
│                  │                                      │
└──────────────────┼──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│                  Database Layer                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  Users   │  │  Clubs   │  │ Members  │             │
│  │  Table   │  │  Table   │  │  Table   │             │
│  └──────────┘  └──────────┘  └──────────┘             │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Frontend Components

```
┌─────────────────────────────────────────────────────────┐
│                  Login Page (login.html)                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────┐            │
│  │  Login Form                             │            │
│  │  ┌──────────────────────────┐          │            │
│  │  │ Username Input            │          │            │
│  │  ├──────────────────────────┤          │            │
│  │  │ Password Input            │          │            │
│  │  ├──────────────────────────┤          │            │
│  │  │ Sign In Button            │          │            │
│  │  └──────────────────────────┘          │            │
│  └────────────────────────────────────────┘            │
│                                                          │
│  ┌────────────────────────────────────────┐            │
│  │  Demo Accounts                          │            │
│  │  - Overall Club Head                    │            │
│  │  - Club Coordinators                    │            │
│  │  - Club Presidents                      │            │
│  └────────────────────────────────────────┘            │
│                                                          │
└─────────────────────────────────────────────────────────┘
                        │
                        │ On successful login
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Dashboard Page (index.html)                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────┐            │
│  │  Header                                 │            │
│  │  ┌────────────┐  ┌──────────────────┐ │            │
│  │  │ User Name  │  │ User Dropdown    │ │            │
│  │  │ User Role  │  │ - Profile        │ │            │
│  │  └────────────┘  │ - Settings       │ │            │
│  │                  │ - Logout ◄───────┼─┼─── Triggers│
│  │                  └──────────────────┘ │    logout   │
│  └────────────────────────────────────────┘            │
│                                                          │
│  ┌────────────┐  ┌────────────────────────────────┐   │
│  │  Sidebar   │  │  Main Content                   │   │
│  │  - Dashboard│  │  - Statistics                  │   │
│  │  - Clubs   │  │  - Cards                       │   │
│  │  - Members │  │  - Tables                      │   │
│  │  - Events  │  │  - Forms                       │   │
│  └────────────┘  └────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Security Layers

```
┌──────────────────────────────────────────┐
│    Request from Browser                   │
└──────────────────┬───────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────┐
│  Layer 1: CORS Filter                     │
│  - Check origin                           │
│  - Validate headers                       │
└──────────────────┬───────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────┐
│  Layer 2: AuthTokenFilter                 │
│  - Extract JWT from header                │
│  - Validate token signature               │
│  - Check expiration                       │
│  - Load user from database                │
│  - Set authentication                     │
└──────────────────┬───────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────┐
│  Layer 3: Method Security                 │
│  - @PreAuthorize annotations              │
│  - Role-based access checks               │
└──────────────────┬───────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────┐
│  Layer 4: Controller                      │
│  - Business logic                         │
│  - Data validation                        │
└──────────────────┬───────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────┐
│  Response to Browser                      │
└──────────────────────────────────────────┘
```

## User Roles & Permissions

```
┌─────────────────────────────────────────────────────────┐
│                  OVERALL CLUB HEAD                       │
├─────────────────────────────────────────────────────────┤
│  Full Access:                                            │
│  ✓ Manage all clubs                                     │
│  ✓ Manage all members                                   │
│  ✓ Manage all events                                    │
│  ✓ Manage all users                                     │
│  ✓ View system statistics                               │
│  ✓ Activate/Deactivate users                           │
│  ✓ Delete any resource                                  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  CLUB COORDINATOR                        │
├─────────────────────────────────────────────────────────┤
│  Limited Access:                                         │
│  ✓ Manage assigned club                                 │
│  ✓ Manage club members                                  │
│  ✓ Manage club events                                   │
│  ✓ View club statistics                                 │
│  ✗ Cannot manage other clubs                            │
│  ✗ Cannot manage users                                  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  CLUB PRESIDENT                          │
├─────────────────────────────────────────────────────────┤
│  Restricted Access:                                      │
│  ✓ View assigned club                                   │
│  ✓ View club members                                    │
│  ✓ Manage club events                                   │
│  ✓ View club statistics                                 │
│  ✗ Cannot modify club details                           │
│  ✗ Cannot manage other clubs                            │
│  ✗ Cannot manage users                                  │
└─────────────────────────────────────────────────────────┘
```

## JWT Token Structure

```
Header
┌────────────────────────┐
│ {                      │
│   "alg": "HS512",     │
│   "typ": "JWT"        │
│ }                      │
└────────────────────────┘
          │
          ▼
Payload
┌────────────────────────┐
│ {                      │
│   "sub": "admin",     │
│   "iat": 1699876543,  │
│   "exp": 1699962943   │
│ }                      │
└────────────────────────┘
          │
          ▼
Signature
┌────────────────────────┐
│ HMACSHA512(            │
│   base64(header) +     │
│   "." +                │
│   base64(payload),     │
│   secret               │
│ )                      │
└────────────────────────┘
          │
          ▼
Final Token
┌────────────────────────────────────────────┐
│ eyJhbGci...eyJzdWI...SflKxwRJ               │
└────────────────────────────────────────────┘
```

## Data Flow Example: Creating a Club

```
1. User Action
   ├─ User clicks "+ Add Club" button
   └─ User fills form and clicks "Save"

2. Frontend Processing
   ├─ Retrieve JWT token from localStorage
   ├─ Prepare club data from form
   └─ Make POST request to /api/clubs
       └─ Include Authorization header: Bearer {token}

3. Backend Processing
   ├─ AuthTokenFilter intercepts request
   │   ├─ Extract token from header
   │   ├─ Validate token signature
   │   ├─ Check token expiration
   │   └─ Load user details
   │
   ├─ SecurityContext authentication set
   │
   ├─ Request reaches ClubController
   │   └─ @PreAuthorize checks role (if needed)
   │
   ├─ ClubService processes request
   │   ├─ Validate club data
   │   ├─ Check duplicates
   │   └─ Save to database
   │
   └─ Return response with saved club

4. Frontend Response
   ├─ Receive HTTP 200 OK
   ├─ Display success notification
   ├─ Refresh clubs list
   └─ Close modal
```

## Error Handling Flow

```
Error Occurs
     │
     ├─ 401 Unauthorized
     │   ├─ Token expired or invalid
     │   ├─ Call logout()
     │   ├─ Clear localStorage
     │   └─ Redirect to login page
     │
     ├─ 403 Forbidden
     │   ├─ Insufficient permissions
     │   └─ Show error notification
     │
     ├─ 400 Bad Request
     │   ├─ Invalid data
     │   └─ Show validation errors
     │
     └─ 500 Internal Server Error
         ├─ Server issue
         └─ Show error notification
```

This completes the visual representation of the authentication system!
