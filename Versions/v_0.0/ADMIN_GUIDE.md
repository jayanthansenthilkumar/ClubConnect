# Study Mode Extension - Administrator Guide

## Overview
This extension is designed for educational environments where administrators need to control which websites students can access. Regular users can only enable/disable Study Mode but cannot modify the allowed websites list.

## Modifying Allowed Websites (Admin Only)

### Method 1: Edit Background Script (Recommended for Deployment)

1. Open `background.js` in a text editor
2. Locate the `defaultAllowedSites` array (around line 7)
3. Modify the list as needed:

```javascript
const defaultAllowedSites = [
  "khanacademy.org",
  "coursera.org",
  "edx.org",
  "wikipedia.org",
  "stackoverflow.com",
  "github.com",
  "mdn.mozilla.org",
  "w3schools.com",
  "youtube.com",
  "google.com"
  // Add more sites here
];
```

4. Save the file
5. Reload the extension in Chrome:
   - Go to `chrome://extensions/`
   - Click the reload icon for Study Mode extension

### Method 2: Chrome DevTools (For Testing)

1. Right-click the extension icon and select "Inspect popup"
2. Go to the Console tab
3. Run this command to add a site:

```javascript
chrome.storage.local.get('allowedSites', (data) => {
  const sites = data.allowedSites || [];
  sites.push('newsite.edu');
  chrome.storage.local.set({ allowedSites: sites }, () => {
    console.log('Site added:', sites);
  });
});
```

4. To view current allowed sites:

```javascript
chrome.storage.local.get('allowedSites', (data) => {
  console.log('Current allowed sites:', data.allowedSites);
});
```

5. To reset to defaults:

```javascript
chrome.storage.local.set({ 
  allowedSites: [
    "khanacademy.org",
    "coursera.org",
    "edx.org",
    "wikipedia.org",
    "stackoverflow.com",
    "github.com",
    "mdn.mozilla.org",
    "w3schools.com",
    "youtube.com",
    "google.com"
  ]
}, () => console.log('Reset complete'));
```

## Enterprise Deployment

### Chrome Policy Configuration

For schools and organizations wanting to enforce Study Mode on all managed devices:

#### 1. Force Install the Extension

Add to your Chrome policy JSON:

```json
{
  "ExtensionInstallForcelist": [
    "YOUR_EXTENSION_ID;https://path/to/extension/update.xml"
  ]
}
```

#### 2. Prevent Users from Disabling Extension

```json
{
  "ExtensionInstallBlacklist": ["*"],
  "ExtensionInstallWhitelist": ["YOUR_EXTENSION_ID"],
  "ExtensionSettings": {
    "YOUR_EXTENSION_ID": {
      "installation_mode": "force_installed",
      "update_url": "https://clients2.google.com/service/update2/crx"
    }
  }
}
```

#### 3. Block Access to Extension Management

```json
{
  "URLBlocklist": [
    "chrome://extensions/*",
    "chrome://settings/*"
  ]
}
```

## Domain Format Rules

When adding domains to the allowed list:

✅ **Correct Formats:**
- `example.com` - Allows example.com and www.example.com
- `.example.com` - Allows all subdomains (mail.example.com, app.example.com, etc.)
- `subdomain.example.com` - Allows only that specific subdomain

❌ **Incorrect Formats:**
- `https://example.com` - Remove the protocol
- `www.example.com/` - Remove trailing slash
- `example.com/page` - Don't include paths

## Security Best Practices

1. **Protect Extension Files**: Store the extension in a protected directory that students cannot access
2. **Use Group Policy**: Deploy via Chrome Enterprise policies to prevent tampering
3. **Regular Audits**: Periodically review the allowed sites list
4. **Backup Configuration**: Keep a backup of your customized `background.js` file
5. **Test Changes**: Always test on a single machine before deploying to all devices

## Troubleshooting

### Students Can Still Access Blocked Sites

1. Check if Study Mode is enabled (toggle should be green)
2. Verify the extension is loaded: `chrome://extensions/`
3. Check if the site is in the allowed list (use DevTools method above)
4. Ensure the extension has proper permissions
5. Try reloading the extension

### Extension Not Loading

1. Check for errors in `chrome://extensions/` (enable Developer mode)
2. Verify all files are present (especially `icon.png`)
3. Check manifest.json for syntax errors
4. Review background.js console for errors

### Need to Temporarily Allow a Site

Use Method 2 (Chrome DevTools) to add sites temporarily without modifying the source code.

## Support

For technical issues or questions about deployment, consult the main [README.md](README.md) and [DEPLOYMENT.md](DEPLOYMENT.md) files.
