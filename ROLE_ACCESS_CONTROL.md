# Role-Based Access Control Documentation

## Overview
This document describes the role-based access control implementation for the Club Management System.

## User Roles

### 1. OVERALL_CLUB_HEAD (Admin)
**Username:** `admin`
**Password:** `admin123`

**Permissions:**
- ✅ View all clubs, members, and events
- ✅ Create, edit, and delete all clubs
- ✅ Add, edit, and delete members from any club
- ✅ Create, edit, and delete events for any club
- ✅ Access Settings section
- ✅ Access Reports section
- ✅ Full administrative control

**UI Features:**
- See "Add Club" button
- See "Add Member" button
- See "Add Event" button
- Edit and Delete buttons visible on all items

---

### 2. CLUB_COORDINATOR
**Example Username:** `tech_coordinator`
**Password:** `tech123`

**Permissions:**
- ✅ View only their assigned club
- ✅ View members of their club only
- ✅ View events of their club only
- ✅ Add new members to their club
- ✅ Edit members in their club
- ✅ Create and edit events for their club
- ❌ Cannot delete clubs
- ❌ Cannot create new clubs
- ❌ Cannot access Settings
- ❌ Cannot access Reports

**UI Features:**
- "Add Club" button hidden
- "Add Member" button visible
- "Add Event" button visible
- Edit buttons visible for their club's items
- Delete buttons hidden

---

### 3. CLUB_PRESIDENT
**Example Username:** `john_doe`
**Password:** `president123`

**Permissions:**
- ✅ View only their assigned club
- ✅ View members of their club only
- ✅ View events of their club only
- ✅ Create events for their club
- ❌ Cannot add members
- ❌ Cannot edit members
- ❌ Cannot delete clubs
- ❌ Cannot create new clubs
- ❌ Cannot access Settings
- ❌ Cannot access Reports

**UI Features:**
- "Add Club" button hidden
- "Add Member" button hidden
- "Add Event" button visible
- Limited or no edit/delete buttons

---

## Implementation Details

### Frontend Implementation

#### 1. Session Management
```javascript
// Global variables track user role and club assignment
let userRole = null;
let userClubId = null;

// Set on login from currentUser object
userRole = currentUser.role;
userClubId = currentUser.clubId;
```

#### 2. Data Filtering

**Clubs:**
```javascript
if (userRole !== 'OVERALL_CLUB_HEAD') {
    clubs = clubs.filter(club => club.id === userClubId);
}
```

**Members:**
```javascript
if (userRole !== 'OVERALL_CLUB_HEAD') {
    members = members.filter(member => member.clubId === userClubId);
}
```

**Events:**
```javascript
if (userRole !== 'OVERALL_CLUB_HEAD') {
    events = events.filter(event => event.clubId === userClubId);
}
```

#### 3. UI Element Visibility

```javascript
function applyRoleBasedRestrictions() {
    if (userRole === 'OVERALL_CLUB_HEAD') {
        // Admin sees all buttons
        document.getElementById('add-club-btn')?.classList.remove('d-none');
        document.getElementById('add-member-btn')?.classList.remove('d-none');
        document.getElementById('add-event-btn')?.classList.remove('d-none');
    } else if (userRole === 'CLUB_COORDINATOR') {
        // Coordinator can add members and events
        document.getElementById('add-club-btn')?.classList.add('d-none');
        document.getElementById('add-member-btn')?.classList.remove('d-none');
        document.getElementById('add-event-btn')?.classList.remove('d-none');
    } else if (userRole === 'CLUB_PRESIDENT') {
        // President can only add events
        document.getElementById('add-club-btn')?.classList.add('d-none');
        document.getElementById('add-member-btn')?.classList.add('d-none');
        document.getElementById('add-event-btn')?.classList.remove('d-none');
    }
}
```

#### 4. Action Button Rendering

**Edit Buttons:**
- Shown to: OVERALL_CLUB_HEAD, CLUB_COORDINATOR
- Hidden from: CLUB_PRESIDENT

**Delete Buttons:**
- Shown to: OVERALL_CLUB_HEAD only
- Hidden from: CLUB_COORDINATOR, CLUB_PRESIDENT

---

## SweetAlert2 Integration

### Toast Notifications
All success/error messages now use SweetAlert2 toast notifications:

```javascript
Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'success',
    title: 'Operation successful!',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true
});
```

### Confirmation Dialogs
Delete operations use SweetAlert2 confirmations:

```javascript
const result = await confirmAction(
    'Delete Club?',
    'This action cannot be undone!',
    'warning'
);

if (result.isConfirmed) {
    // Proceed with deletion
}
```

### Error Messages
Login and validation errors use SweetAlert2:

```javascript
Swal.fire({
    icon: 'error',
    title: 'Login Failed',
    text: 'Invalid username or password'
});
```

---

## Testing Instructions

### 1. Test OVERALL_CLUB_HEAD Access
1. Login with: `admin` / `admin123`
2. Verify you see all clubs
3. Verify "Add Club" button is visible
4. Verify edit/delete buttons are visible on all items
5. Test creating, editing, and deleting a club
6. Verify Settings and Reports sections are accessible

### 2. Test CLUB_COORDINATOR Access
1. Login with: `tech_coordinator` / `tech123`
2. Verify you see only "Tech Innovation Club"
3. Verify "Add Club" button is hidden
4. Verify "Add Member" and "Add Event" buttons are visible
5. Verify you can only see members and events from Tech Innovation Club
6. Test adding a member to your club
7. Verify delete buttons are hidden
8. Verify Settings and Reports sections are hidden

### 3. Test CLUB_PRESIDENT Access
1. Login with: `john_doe` / `president123`
2. Verify you see only your assigned club
3. Verify "Add Club" and "Add Member" buttons are hidden
4. Verify "Add Event" button is visible
5. Verify you can create events but cannot edit members
6. Verify Settings and Reports sections are hidden

### 4. Test SweetAlert2
1. Trigger a success notification (e.g., save data)
2. Trigger an error notification (e.g., validation error)
3. Attempt to delete an item (if admin) - verify confirmation dialog
4. Test login page error messages
5. Verify all alerts use SweetAlert2 styling

---

## Security Notes

### ⚠️ Important Security Considerations

1. **Frontend filtering is NOT security!**
   - The frontend filtering is for UX only
   - Backend must enforce role-based access control
   - API endpoints should validate user permissions

2. **Backend Security Required:**
   - Add `@PreAuthorize` annotations to controller methods
   - Validate user's club assignment on data access
   - Implement proper Spring Security configuration

3. **Example Backend Security:**
   ```java
   @PreAuthorize("hasRole('OVERALL_CLUB_HEAD') or @clubSecurity.isUserClub(#clubId)")
   @GetMapping("/clubs/{clubId}")
   public ResponseEntity<Club> getClub(@PathVariable Long clubId) {
       // Implementation
   }
   ```

4. **JWT Token Security:**
   - Tokens expire after 24 hours
   - Store tokens securely (currently localStorage)
   - Consider using httpOnly cookies for production

---

## File Changes Summary

### Modified Files:
1. **index.html**
   - Added SweetAlert2 CDN links
   - Added IDs to action buttons (add-club-btn, add-member-btn, add-event-btn)

2. **app.js**
   - Added userRole and userClubId global variables
   - Implemented role-based filtering in loadClubs(), loadMembers(), loadEvents()
   - Created applyRoleBasedRestrictions() function
   - Replaced all native alerts with SweetAlert2
   - Updated delete functions with SweetAlert2 confirmations
   - Modified display functions for conditional button rendering

3. **login.html**
   - Added SweetAlert2 CDN links

4. **login.js**
   - Updated error/success handlers to use SweetAlert2

---

## Future Enhancements

### Recommended Improvements:
1. ✨ Add audit logging for all user actions
2. ✨ Implement more granular permissions (e.g., edit own events only)
3. ✨ Add permission checking on backend APIs
4. ✨ Create admin panel for role management
5. ✨ Add role-based navigation menu
6. ✨ Implement activity dashboard per role
7. ✨ Add export functionality (role-specific data)
8. ✨ Create role-based reports

---

## Troubleshooting

### Issue: User sees all data despite being coordinator/president
**Solution:** 
- Check that userClubId is properly set in the user object
- Verify filtering logic in loadClubs/Members/Events functions
- Clear localStorage and login again

### Issue: SweetAlert2 alerts not showing
**Solution:**
- Verify CDN links are loaded (check browser console)
- Check for JavaScript errors blocking execution
- Ensure SweetAlert2 CSS and JS are both included

### Issue: Buttons not hiding/showing based on role
**Solution:**
- Verify button IDs match those in applyRoleBasedRestrictions()
- Check that checkAuth() is calling applyRoleBasedRestrictions()
- Verify userRole is properly set

### Issue: Token expired errors
**Solution:**
- Tokens expire after 24 hours
- Logout and login again
- Check JWT configuration in backend

---

## Contact & Support

For issues or questions about role-based access control:
1. Check browser console for JavaScript errors
2. Verify backend is running and accessible
3. Check network tab for API response errors
4. Review this documentation for permission matrix

---

**Last Updated:** January 2025
**Version:** 1.0
**Author:** Club Management System Development Team
