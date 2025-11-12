# ClubsConnect - Setup Instructions

## Prerequisites
1. MySQL Server installed and running
2. Java 17 or higher
3. Maven

## Database Setup
1. Start MySQL server
2. The application will automatically create the database 'clubconnect'
3. Default MySQL credentials in application.properties:
   - Username: root
   - Password: (empty)
   
   Change these in src/main/resources/application.properties if needed

## Running the Application

### Option 1: Using IntelliJ IDEA
1. Open the project in IntelliJ IDEA
2. Wait for Maven dependencies to download
3. Run the main class: ClubsconnectApplication.java
4. Or use the green play button in IntelliJ

### Option 2: Using Maven Command Line
```
mvnw spring-boot:run
```

## Accessing the Application
- Frontend: http://localhost:8080
- API Base URL: http://localhost:8080/api

## Features
1. **Clubs Management**: Create, view, edit, and delete clubs
2. **Members Management**: Manage club members
3. **Events Management**: Schedule and manage club events

## Sample Data
The application will automatically load sample data on first run:
- 3 Sample Clubs (Tech, Sports, Arts)
- 3 Sample Members
- 3 Sample Events

## API Endpoints

### Clubs
- GET /api/clubs - Get all clubs
- GET /api/clubs/{id} - Get club by ID
- POST /api/clubs - Create new club
- PUT /api/clubs/{id} - Update club
- DELETE /api/clubs/{id} - Delete club
- GET /api/clubs/category/{category} - Get clubs by category
- GET /api/clubs/search?name={name} - Search clubs

### Members
- GET /api/members - Get all members
- GET /api/members/{id} - Get member by ID
- POST /api/members/club/{clubId} - Add member to club
- PUT /api/members/{id} - Update member
- DELETE /api/members/{id} - Delete member
- GET /api/members/club/{clubId} - Get members by club

### Events
- GET /api/events - Get all events
- GET /api/events/{id} - Get event by ID
- POST /api/events/club/{clubId} - Create event for club
- PUT /api/events/{id} - Update event
- DELETE /api/events/{id} - Delete event
- GET /api/events/club/{clubId} - Get events by club
- GET /api/events/status/{status} - Get events by status

## Troubleshooting

### Database Connection Error
- Ensure MySQL is running
- Check credentials in application.properties
- Verify MySQL is listening on port 3306

### Port Already in Use
- Change server.port in application.properties

### Maven Dependencies
- Run: mvnw clean install
