# Changelog

## Version 1.0 - Admin-Controlled Configuration

### Major Changes

#### User Interface (Popup)
- **REMOVED**: User ability to add/remove websites from allowed list
- **REMOVED**: "Add Site" input field and button
- **REMOVED**: Remove buttons (×) next to each allowed site
- **REMOVED**: "Reset to Defaults" button
- **REMOVED**: Link to Advanced Settings/Options page
- **ADDED**: Informational message explaining that only administrators can modify the allowed list
- **KEPT**: Study Mode toggle (enable/disable functionality)

#### Functionality
- Users can now only:
  - Toggle Study Mode ON/OFF
  - View blocked page when accessing non-educational sites
  
- Users can NO LONGER:
  - Add new websites to the allowed list
  - Remove websites from the allowed list
  - Reset to default settings
  - Access the options/advanced settings page

#### Administrative Control
- Created comprehensive **ADMIN_GUIDE.md** with instructions for:
  - Modifying allowed websites via background.js
  - Using Chrome DevTools to manage settings
  - Enterprise deployment strategies
  - Troubleshooting common issues
  
#### Files Modified
1. **popup.html** - Removed website management UI, added info section
2. **popup.js** - Removed all functions related to adding/removing sites
3. **styles.css** - Added styling for new info section
4. **background.js** - Removed redundant webNavigation listener (was causing errors)
5. **README.md** - Updated to reflect admin-controlled model
6. **icon.png** - Created (fixed missing icon error)

#### Files Created
1. **ADMIN_GUIDE.md** - Complete administrator documentation
2. **CHANGELOG.md** - This file

### Bug Fixes
- Fixed: "Could not load icon 'icon.png'" error
- Fixed: "Service worker registration failed" error (removed webNavigation listener)
- Fixed: Uncaught TypeError with webNavigation API

### Security Improvements
- Users can no longer bypass restrictions by modifying the allowed list
- Configuration must be done at the file system level (requires admin access)
- Suitable for deployment in educational institutions with managed devices

### Deployment Notes
For administrators deploying this extension:
- Customize the `defaultAllowedSites` array in `background.js` before deployment
- Use Chrome Enterprise policies to force-install and prevent users from disabling
- See ADMIN_GUIDE.md for detailed deployment instructions
