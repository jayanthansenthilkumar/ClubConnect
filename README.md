# 🎓 Study Mode - Chrome Extension

A powerful Chrome extension that creates a distraction-free browsing environment by allowing access only to educational websites and blocking all other sites automatically.

![Study Mode Extension](https://img.shields.io/badge/version-1.0-blue)
![Chrome](https://img.shields.io/badge/Chrome-Extension-green)
![License](https://img.shields.io/badge/license-MIT-orange)

## 🎯 Project Goal

To develop a Chrome extension that creates a distraction-free browsing environment by:

- ✅ Allowing access only to educational websites (like .edu, Khan Academy, Coursera, etc.)
- ✅ Blocking all other websites automatically
- ✅ Providing a simple, user-friendly "Study Mode" interface
- ✅ (Optional) Restricting other Chrome extensions via enterprise policy

## ✨ Features

### Core Features

- **� Full Screen Lock** - Automatically locks browser in full screen mode when active (NEW!)
- **�📚 Allowlist-Based Access** - Pre-configured list of allowed educational domains (admin-controlled)
- **🚫 Automatic Blocking** - Blocks all non-educational sites with a custom blocked page
- **🎛️ Simple Toggle** - Users can enable/disable CodZe with a single click
- **💾 Persistent Storage** - Settings are saved and synced across sessions
- **🔐 Admin-Controlled** - Only administrators can modify the allowed websites list
- **📊 Enterprise Ready** - Designed for educational institutions and managed environments

### Full Screen Lock Features
- Prevents browser minimization and tab switching
- Disables keyboard shortcuts (F11, Alt+Tab, Ctrl+W, Ctrl+T)
- Automatically re-enters full screen if exited
- Shows warnings when attempting to exit full screen
- Disables right-click context menu

## ⚙️ Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Frontend (UI) | HTML, CSS, JavaScript | Popup menu, Blocked page, Options page |
| Logic / Backend | JavaScript (Manifest V3) | Controls blocking, checks allowed sites |
| Storage | `chrome.storage.local` | Stores allowed site list, settings |
| Networking / Blocking | `chrome.declarativeNetRequest` API | Intercepts and blocks URLs |
| Deployment | Chrome Web Store or enterprise policy | Distribution method |

## 📁 Project Structure

```
study-mode-extension/
├── manifest.json          # Extension configuration
├── background.js          # Background service worker (blocking logic)
├── popup.html            # Extension popup interface
├── popup.js              # Popup functionality
├── blocked.html          # Page shown when site is blocked
├── options.html          # Advanced settings page
├── options.js            # Options page functionality
├── styles.css            # Global styles
├── icon.png              # Extension icon (you need to add this)
└── README.md             # This file
```

## 🚀 Installation & Testing

### Development Mode

1. **Clone or Download** this repository to your local machine

2. **Add an Icon** (optional but recommended):
   - Create or download a 128x128 PNG icon
   - Save it as `icon.png` in the extension folder

3. **Load the Extension**:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable **Developer Mode** (toggle in top-right corner)
   - Click **Load unpacked**
   - Select the `study-mode-extension` folder

4. **Test the Extension**:
   - Click the extension icon in your toolbar
   - Try visiting a non-educational site → should show blocked page
   - Visit an allowed site (e.g., wikipedia.org) → should open normally
   - Add/remove sites from the popup

## 🎮 Usage Guide

### For Users

1. **Enable/Disable Study Mode**
   - Click the extension icon
   - Use the toggle switch to enable or disable Study Mode
   - When enabled, only educational websites will be accessible

2. **Accessing Blocked Sites**
   - Contact your administrator if you need access to a specific website
   - The blocked page will show when you try to access non-educational sites

### For Administrators

See the **[ADMIN_GUIDE.md](ADMIN_GUIDE.md)** for detailed instructions on:

- Adding or removing allowed websites
- Modifying the default allowed sites list
- Using Chrome DevTools to manage settings
- Deploying to managed devices
- Troubleshooting common issues

## 📋 Default Allowed Sites

The extension comes pre-configured with these educational websites (modifiable by administrators only):

- khanacademy.org
- coursera.org
- edx.org
- wikipedia.org
- stackoverflow.com
- github.com
- mdn.mozilla.org (Mozilla Developer Network)
- w3schools.com
- youtube.com (for educational videos)
- google.com (for searching)

**Note:** Users cannot modify this list. Administrators must edit the `background.js` file or use Chrome DevTools to add/remove sites. See [ADMIN_GUIDE.md](ADMIN_GUIDE.md) for details.

## 🏢 Enterprise Deployment

For schools, libraries, or organizations wanting to enforce Study Mode, see the detailed **[ADMIN_GUIDE.md](ADMIN_GUIDE.md)** and **[DEPLOYMENT.md](DEPLOYMENT.md)** files.

### Quick Overview

1. **Force-Install the Extension** via Chrome Enterprise policies
2. **Lock Extension Settings** to prevent users from disabling it
3. **Pre-configure Allowed Sites** in the background.js file before deployment
4. **Block Access** to chrome://extensions to prevent tampering

This ensures students cannot disable the extension or modify the allowed websites list.

## 🛠️ Development

### Making Changes

1. Edit the relevant files (background.js, popup.js, etc.)
2. Go to `chrome://extensions/`
3. Click the **Reload** button on the Study Mode extension
4. Test your changes

### Key Files to Modify

- **`background.js`** - Change blocking logic or default allowed sites (ADMIN ONLY)
- **`popup.html/popup.js`** - Customize the user interface
- **`blocked.html`** - Customize the blocked page design
- **`styles.css`** - Change colors, fonts, layout

**Note:** To modify the allowed websites list, see [ADMIN_GUIDE.md](ADMIN_GUIDE.md).

## 🐛 Troubleshooting

### Extension Not Blocking Sites

- Check if Study Mode is enabled (toggle should be ON)
- Verify the site is not in the allowed list (ask your administrator)
- Try reloading the extension at `chrome://extensions/`

### Need Access to a Blocked Site

- Contact your administrator to request the site be added to the allowed list
- Provide a valid educational reason for access

### Extension Icon Not Showing

- Right-click the toolbar → Pin the Study Mode extension
- Or click the puzzle icon and pin it

### For Administrators

See the [ADMIN_GUIDE.md](ADMIN_GUIDE.md) for troubleshooting deployment and configuration issues.

## 📝 To-Do / Future Enhancements

- [ ] Password protection for settings
- [ ] Time-based scheduling (auto-enable during study hours)
- [ ] Whitelist templates (Science, Math, Language, etc.)
- [ ] Usage statistics and reports
- [ ] Parent/teacher dashboard
- [ ] Sync settings across devices via Chrome Sync
- [ ] Break reminders and motivational quotes

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

Created for students, by students who understand the struggle of staying focused online.

## 📞 Support

For questions, issues, or feature requests:

- Open an issue on GitHub
- Contact your system administrator (for enterprise deployments)

---

**Happy Studying! 🎓📚**

*Stay focused. Stay productive. Achieve your goals.*
