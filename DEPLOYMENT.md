# 🚀 Deployment Guide - Study Mode Extension

This guide covers different deployment methods for the Study Mode Chrome Extension.

## 📦 Packaging for Distribution

### Create a ZIP Package

1. **Prepare Your Files**
   - Make sure you have an `icon.png` (128x128 pixels recommended)
   - Remove any development files not needed in production
   - Test the extension thoroughly

2. **Create the ZIP**
   - Select all files in the extension folder
   - Right-click → Send to → Compressed (zipped) folder
   - Name it `study-mode-extension-v1.0.zip`

### Create a CRX Package (Chrome Extension File)

1. Go to `chrome://extensions/`
2. Click **Pack extension**
3. Select your extension directory
4. Chrome will create a `.crx` file and a `.pem` key file
5. **Keep the .pem file safe** - you need it for updates!

## 🌐 Chrome Web Store Deployment

### Prerequisites

- Google Account
- One-time $5 developer registration fee
- High-quality promotional images

### Steps

1. **Register as a Chrome Web Store Developer**
   - Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
   - Pay the one-time $5 fee

2. **Prepare Store Assets**
   - **Icon**: 128x128 PNG
   - **Screenshots**: 1280x800 or 640x400 PNG/JPG (at least 1)
   - **Promotional Tile**: 440x280 PNG/JPG (optional)
   - **Small Tile**: 440x280 PNG/JPG (optional)

3. **Upload Your Extension**
   - Click **New Item**
   - Upload your `.zip` file
   - Fill in all required information:
     - Name: "Study Mode - Educational Access Only"
     - Description: (Use the one from manifest or README)
     - Category: Productivity
     - Language: English

4. **Complete Store Listing**
   - Add screenshots
   - Add promotional images
   - Write a detailed description
   - Add privacy policy (if collecting data)

5. **Submit for Review**
   - Review all information
   - Click **Submit for Review**
   - Wait 1-3 business days for approval

## 🏢 Enterprise Deployment (Schools/Organizations)

### Method 1: Self-Hosted via Chrome Enterprise

Perfect for schools and organizations with Google Workspace.

#### Requirements
- Chrome Enterprise or Google Workspace license
- Admin access to Google Admin Console

#### Steps

1. **Upload to Enterprise Store**
   - Go to Google Admin Console
   - Navigate to: Devices → Chrome → Apps & Extensions
   - Click the + button
   - Upload your `.zip` or `.crx` file

2. **Configure Force Install**
   ```
   Chrome Management → Apps & Extensions → Settings
   → Select Organizational Unit
   → Add the extension
   → Set to "Force install"
   ```

3. **Configure Policies (Optional)**
   - Block access to `chrome://extensions`
   - Block other extensions
   - Pre-configure allowed sites

4. **Deploy**
   - Policies will apply automatically on managed devices
   - Users cannot disable the extension

### Method 2: Manual Distribution

For smaller organizations or testing.

#### Using CRX File

1. Create a `.crx` package (see above)
2. Host the `.crx` file on your web server or shared drive
3. Users navigate to `chrome://extensions/`
4. Drag and drop the `.crx` file
5. Click "Add extension"

**Note**: Chrome may show warnings for extensions not from the Web Store.

#### Using Unpacked Extension

1. Share the extension folder via shared drive or USB
2. Each user:
   - Goes to `chrome://extensions/`
   - Enables Developer Mode
   - Clicks "Load unpacked"
   - Selects the extension folder

**Limitations**: 
- Shows "Developer mode" warning
- Not suitable for production deployment

## 🔒 Enterprise Policy Configuration

### Windows Group Policy

1. **Download Policy Templates**
   - Get Chrome ADMX templates from [Google Chrome Enterprise](https://chromeenterprise.google/browser/download/)

2. **Install Templates**
   - Copy ADMX files to `C:\Windows\PolicyDefinitions\`
   - Copy ADML files to `C:\Windows\PolicyDefinitions\en-US\`

3. **Configure Policies**
   - Open `gpedit.msc`
   - Navigate to: Computer Configuration → Administrative Templates → Google → Google Chrome → Extensions

4. **Force Install Extension**
   - Enable "Configure the list of force-installed apps and extensions"
   - Add: `YOUR_EXTENSION_ID;https://clients2.google.com/service/update2/crx`

5. **Block Other Extensions (Optional)**
   - Enable "Configure extension installation blocklist"
   - Add: `*` (blocks all extensions)
   - Then whitelist your extension using "Configure extension installation allowlist"

### Chrome Enterprise Policy JSON

For more advanced configurations:

```json
{
  "ExtensionInstallForcelist": [
    "YOUR_EXTENSION_ID;https://clients2.google.com/service/update2/crx"
  ],
  "ExtensionSettings": {
    "*": {
      "installation_mode": "blocked",
      "blocked_permissions": ["all"]
    },
    "YOUR_EXTENSION_ID": {
      "installation_mode": "force_installed",
      "update_url": "https://clients2.google.com/service/update2/crx"
    }
  },
  "URLBlocklist": ["chrome://extensions/*"],
  "DeveloperToolsDisabled": true
}
```

### Managed Storage (Pre-configured Settings)

Push allowed sites list to all users:

```json
{
  "ExtensionSettings": {
    "YOUR_EXTENSION_ID": {
      "installation_mode": "force_installed",
      "update_url": "https://clients2.google.com/service/update2/crx",
      "storage_managed": {
        "allowedSites": [
          "khanacademy.org",
          "coursera.org",
          "yourschool.edu"
        ],
        "studyModeEnabled": true,
        "settingsLocked": true
      }
    }
  }
}
```

## 📱 Distribution Methods Comparison

| Method | Pros | Cons | Best For |
|--------|------|------|----------|
| **Chrome Web Store** | ✅ Easy updates<br>✅ No warnings<br>✅ Trusted | ❌ $5 fee<br>❌ Review process | Public distribution |
| **Enterprise Store** | ✅ Force install<br>✅ Policy control<br>✅ Private | ❌ Requires license<br>❌ Admin setup | Schools, organizations |
| **CRX File** | ✅ No cost<br>✅ Fast deployment | ❌ Security warnings<br>❌ Manual install | Small groups, testing |
| **Unpacked** | ✅ Immediate<br>✅ Development | ❌ Not for production<br>❌ Warnings | Development only |

## 🔄 Updating the Extension

### Chrome Web Store

1. Increment version in `manifest.json`
2. Create new `.zip` package
3. Upload to Chrome Web Store Developer Dashboard
4. Submit for review
5. Users receive automatic updates

### Enterprise

1. Increment version in `manifest.json`
2. Create new package
3. Upload to Google Admin Console
4. Extension updates automatically on managed devices

### Self-Distributed

1. Increment version
2. Re-create `.crx` with **same private key**
3. Distribute new `.crx` file
4. Users must manually update

## ✅ Pre-Deployment Checklist

- [ ] Tested extension thoroughly
- [ ] Added proper icon (128x128 PNG)
- [ ] Updated version number in manifest.json
- [ ] Reviewed all permissions needed
- [ ] Created README/documentation
- [ ] Prepared screenshots (for Web Store)
- [ ] Backed up private key (.pem file)
- [ ] Tested on different Chrome versions
- [ ] Verified blocking rules work correctly
- [ ] Tested import/export functionality

## 📊 Post-Deployment Monitoring

### For Chrome Web Store
- Check user reviews and ratings
- Monitor crash reports in Developer Dashboard
- Track installation statistics

### For Enterprise
- Collect feedback from users
- Monitor support tickets
- Review usage via Chrome Enterprise reporting

## 🆘 Common Deployment Issues

### Extension Shows as "Not from Chrome Web Store"
- **Solution**: Publish to Chrome Web Store or use Enterprise policies

### Can't Force Install
- **Solution**: Verify Enterprise/Workspace license is active
- Check extension ID is correct in policy

### Updates Not Working
- **Solution**: Ensure using same .pem key for signing
- Check update URL in policy

### Sites Not Blocking
- **Solution**: Verify extension has required permissions
- Check if Study Mode is enabled

## 📞 Support Resources

- [Chrome Extension Developer Guide](https://developer.chrome.com/docs/extensions/)
- [Chrome Web Store Publishing](https://developer.chrome.com/docs/webstore/publish/)
- [Chrome Enterprise Help](https://support.google.com/chrome/a/)

---

**Ready to deploy? Choose the method that fits your needs and follow the steps above!** 🚀
