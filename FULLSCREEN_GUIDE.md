# CodZe Full Screen Lock Feature

## Overview
When CodZe is activated, it automatically locks the browser in full screen mode to create a distraction-free, focused study environment.

## How It Works

### Automatic Activation
1. User enables CodZe via the popup toggle
2. Extension automatically requests full screen mode
3. Content script monitors full screen status continuously
4. If user exits full screen, extension shows warning and re-requests

### Security Measures

#### Disabled Actions
- **F11 Key** - Full screen toggle disabled
- **Ctrl+W** - Close tab disabled
- **Ctrl+T** - New tab disabled  
- **Alt+Tab** - Task switching disabled (limited)
- **Right-Click** - Context menu disabled

#### Monitoring System
- Checks full screen status every 2 seconds
- Listens for full screen change events
- Automatically re-requests full screen if exited
- Shows warning toast messages

## Important Browser Limitations

⚠️ **Chrome Security Restrictions:**

Due to browser security policies, Chrome extensions **cannot** completely prevent:
1. Using Windows key to access start menu
2. Alt+F4 to close the browser
3. Task Manager force close
4. Physical power button

The extension provides **maximum possible restriction** within Chrome's security model.

## For Administrators

### Enabling/Disabling Full Screen Lock

The full screen lock is **automatically enabled** when CodZe is activated. To disable it:

```javascript
// Via Chrome DevTools Console
chrome.storage.local.set({ fullScreenLock: false });
```

### Enterprise Deployment Recommendations

For maximum effectiveness in educational environments:

1. **Kiosk Mode** - Run Chrome in kiosk mode via command line:
   ```
   chrome.exe --kiosk --kiosk-printing --app=https://allowed-site.com
   ```

2. **Group Policy** - Configure Windows Group Policy to:
   - Disable Task Manager (Ctrl+Shift+Esc)
   - Disable Windows key
   - Block access to system settings
   - Prevent browser close during exams

3. **Physical Security**
   - Lock down computer cases
   - Disable USB ports via BIOS
   - Use monitoring software alongside CodZe

### Testing Full Screen Lock

1. Load the extension
2. Enable CodZe via popup
3. Browser should enter full screen automatically
4. Try pressing F11 - should show warning
5. Try right-clicking - should show warning
6. If you exit full screen, extension should re-request within 2 seconds

## User Experience

### What Users See

1. **On Activation:**
   - Popup message: "CodZe enabled - Full screen mode will be activated"
   - Browser automatically enters full screen
   - All toolbars and UI hidden

2. **During Use:**
   - Toast warnings if attempting to exit
   - Blocked access to non-educational sites
   - Focused, distraction-free environment

3. **On Deactivation:**
   - Full screen exits automatically
   - Normal browser controls restored
   - All websites accessible again

## Technical Details

### Files Involved
- `fullscreen.js` - Content script with full screen logic
- `background.js` - Manages full screen state across tabs
- `manifest.json` - Registers content script
- `popup.js` - Handles user toggle interaction

### Event Flow
```
User enables CodZe
    ↓
popup.js updates storage
    ↓
background.js detects change
    ↓
Sends message to all tabs
    ↓
fullscreen.js receives message
    ↓
Requests full screen + starts monitoring
    ↓
User attempts to exit
    ↓
fullscreen.js detects exit
    ↓
Shows warning + re-requests full screen
```

## Troubleshooting

### Full Screen Not Activating

**Possible causes:**
1. Browser permissions not granted
2. User clicked "Deny" on full screen request
3. Content script not loaded on page

**Solutions:**
1. Reload the extension
2. Reload the webpage
3. Check browser console for errors
4. Ensure content script permissions in manifest

### Users Can Still Exit Full Screen

**This is expected behavior** - Chrome's security prevents complete lockdown. The extension:
- Makes it difficult (not impossible)
- Shows warnings
- Re-requests full screen automatically
- Creates friction to discourage exiting

For true lockdown, use **Chrome Kiosk Mode** with Group Policy.

### Full Screen Prompt Keeps Appearing

This means the content script is working correctly! The user is likely:
- Pressing Escape key
- Using browser UI to exit full screen
- Switching tabs/windows

This is the intended behavior to maintain full screen mode.

## Best Practices

### For Schools/Institutions

1. **Combine with Kiosk Mode** - Use Chrome's native kiosk mode
2. **Network Monitoring** - Monitor for extension tampering
3. **Physical Supervision** - Have proctors during exams
4. **Test Environment** - Test on one machine before deploying
5. **Backup Plan** - Have paper-based backup for critical exams

### For Students

1. **Close Other Apps** - Before enabling CodZe
2. **Prepare Materials** - Have everything ready in browser
3. **Understand Restrictions** - Know what's blocked
4. **Report Issues** - Contact admin if legitimate site is blocked

## Future Enhancements

Potential improvements:
- [ ] Password protection to exit full screen
- [ ] Admin unlock codes
- [ ] Time-based auto-disable
- [ ] Screenshot prevention
- [ ] Eye tracking integration (advanced)

---

**Note:** This feature is designed for educational purposes in controlled environments. It should be used ethically and with student awareness and consent.
