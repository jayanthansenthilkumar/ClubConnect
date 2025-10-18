# CodZe v1.3 - Improved Site Blocking Control

## What's New in v1.3

### 🔧 Enhanced Blocking System

1. **Better Domain Handling**
   - Properly handles www and non-www versions
   - Correctly blocks all non-educational sites
   - Improved subdomain support

2. **Better Logging**
   - Clear console messages when rules update
   - Shows allowed sites count
   - Better error reporting

3. **Built-in Testing**
   - New test.html page to verify blocking
   - Debug functions to check current rules
   - Easy troubleshooting

---

## 🧪 How to Test Site Blocking

### Method 1: Use Test Page (Recommended)

1. **Open Test Page:**
   ```
   Right-click on extension icon → Options
   Or open: chrome-extension://[YOUR_EXTENSION_ID]/test.html
   ```

2. **Check Configuration:**
   - Click "Show Allowed Sites" button
   - Verify your expected sites are listed

3. **Test Allowed Sites:**
   - Click links in "Test Allowed Sites" section
   - They should load normally ✅

4. **Test Blocked Sites:**
   - Click links in "Test Blocked Sites" section
   - They should show blocked.html page ❌

### Method 2: Manual Testing

1. **Enable CodZe:**
   - Click extension icon
   - Make sure toggle is ON (green)

2. **Test Allowed Sites:**
   ```
   ✅ https://wikipedia.org - Should work
   ✅ https://khanacademy.org - Should work
   ✅ https://stackoverflow.com - Should work
   ✅ https://github.com - Should work
   ✅ https://google.com - Should work
   ```

3. **Test Blocked Sites:**
   ```
   ❌ https://facebook.com - Should block
   ❌ https://twitter.com - Should block
   ❌ https://instagram.com - Should block
   ❌ https://reddit.com - Should block
   ```

### Method 3: Check Console

1. **Open Browser Console:**
   - Press F12
   - Go to "Console" tab

2. **Look for CodZe Messages:**
   ```
   ✅ CodZe: Blocking rules updated successfully!
   📚 Allowed sites: [list of sites]
   🚫 All other sites will be blocked
   ```

3. **Check Current Rules:**
   ```javascript
   chrome.runtime.sendMessage({action: "checkRules"}, console.log)
   ```

4. **Check Allowed Sites:**
   ```javascript
   chrome.runtime.sendMessage({action: "testSite"}, console.log)
   ```

---

## 🔍 Troubleshooting

### Problem: Allowed Sites Are Being Blocked

**Symptoms:**
- Wikipedia, Khan Academy, etc. redirect to blocked.html
- Educational sites show "Access Blocked" page

**Solutions:**

1. **Check if CodZe is Enabled:**
   - Click extension icon
   - Make sure toggle is ON
   - Green indicator should show "CodZe Active"

2. **Verify Allowed Sites List:**
   ```javascript
   // In browser console:
   chrome.storage.local.get('allowedSites', console.log)
   ```

3. **Check for Typos in Domain Names:**
   - Open background.js
   - Verify defaultAllowedSites array
   - No typos in domain names

4. **Reload Extension:**
   - Go to chrome://extensions/
   - Find CodZe
   - Click Reload (🔄)
   - Try again

5. **Clear Storage and Reinstall:**
   ```javascript
   // In console:
   chrome.storage.local.clear()
   ```
   Then reload extension

### Problem: Blocked Sites Are NOT Being Blocked

**Symptoms:**
- Facebook, Twitter, etc. load normally
- Non-educational sites are accessible

**Solutions:**

1. **Verify CodZe is Enabled:**
   - Extension icon should show green toggle
   - Status should say "CodZe Active"

2. **Check Console for Errors:**
   - Press F12
   - Look for error messages
   - Check if rules were loaded

3. **Verify Rules Are Active:**
   ```javascript
   // In console:
   chrome.runtime.sendMessage({action: "checkRules"}, (r) => {
     console.log('Active rules:', r.rules.length);
   })
   ```
   Should show at least 1 rule

4. **Check Resource Type:**
   - Rules only block main_frame (full page loads)
   - Embedded content may not be blocked

5. **Hard Reload:**
   - Ctrl + Shift + R on the blocked site
   - Should force re-check of rules

### Problem: Extension Not Working At All

**Symptoms:**
- No blocking happens
- Extension icon doesn't respond
- No console messages

**Solutions:**

1. **Check Extension is Loaded:**
   - Go to chrome://extensions/
   - CodZe should be visible
   - Should be "Enabled" (toggle on)

2. **Check for Errors:**
   - Click "Errors" button on extension
   - Fix any JavaScript errors

3. **Check Permissions:**
   - Extension should have:
     - declarativeNetRequest
     - storage
     - tabs
     - host_permissions: <all_urls>

4. **Reinstall Extension:**
   - Remove extension
   - Reload from folder
   - Test again

---

## 📋 Default Allowed Sites

The following sites are allowed by default:

```javascript
✅ khanacademy.org
✅ coursera.org
✅ edx.org
✅ wikipedia.org (+ all language versions)
✅ stackoverflow.com
✅ github.com
✅ mdn.mozilla.org
✅ w3schools.com
✅ youtube.com
✅ google.com
✅ chrome.google.com (for extension management)
✅ chromewebstore.google.com (for Chrome Web Store)
```

### Subdomain Handling

- `wikipedia.org` allows:
  - wikipedia.org ✅
  - www.wikipedia.org ✅
  - en.wikipedia.org ✅
  - fr.wikipedia.org ✅
  - (all subdomains) ✅

### What Gets Blocked

**ALL sites NOT in the allowed list:**
- ❌ Social media (Facebook, Twitter, Instagram)
- ❌ Entertainment (Netflix, TikTok, Twitch)
- ❌ Gaming sites
- ❌ Shopping sites (Amazon, eBay)
- ❌ News sites (unless added to allowed list)
- ❌ Everything else

---

## 🔧 How to Add More Allowed Sites

### Method 1: Edit background.js (Administrator)

1. Open `background.js`
2. Find `defaultAllowedSites` array (line ~7)
3. Add new sites:
   ```javascript
   const defaultAllowedSites = [
     "khanacademy.org",
     "coursera.org",
     // Add your site here:
     "newsite.edu",
     "anothereducationalsite.org"
   ];
   ```
4. Save file
5. Reload extension

### Method 2: Use Chrome DevTools (Testing)

```javascript
// Add a site temporarily:
chrome.storage.local.get('allowedSites', (data) => {
  const sites = data.allowedSites || [];
  sites.push('newsite.edu');
  chrome.storage.local.set({ allowedSites: sites }, () => {
    console.log('Site added:', sites);
  });
});
```

### Method 3: Reset to Defaults

```javascript
// Reset to default allowed sites:
chrome.storage.local.remove('allowedSites', () => {
  console.log('Allowed sites reset to defaults');
  // Reload extension
});
```

---

## 🎯 Verification Checklist

After making changes, verify:

- [ ] Extension loads without errors
- [ ] CodZe toggle works (on/off)
- [ ] Console shows "Blocking rules updated successfully"
- [ ] Allowed sites list shows correct domains
- [ ] Wikipedia.org loads normally
- [ ] Google.com loads normally  
- [ ] Facebook.com shows blocked page
- [ ] Twitter.com shows blocked page
- [ ] Full screen lock activates
- [ ] Green indicator visible when active

---

## 📊 Expected Behavior Summary

| Site | When CodZe OFF | When CodZe ON |
|------|---------------|---------------|
| wikipedia.org | ✅ Loads | ✅ Loads |
| khanacademy.org | ✅ Loads | ✅ Loads |
| google.com | ✅ Loads | ✅ Loads |
| facebook.com | ✅ Loads | ❌ **BLOCKED** |
| twitter.com | ✅ Loads | ❌ **BLOCKED** |
| Any unlisted site | ✅ Loads | ❌ **BLOCKED** |

---

## 🚀 Quick Start Test

1. **Reload Extension:**
   ```
   chrome://extensions/ → Find CodZe → Click Reload
   ```

2. **Enable CodZe:**
   ```
   Click extension icon → Toggle ON
   ```

3. **Test Allowed:**
   ```
   Visit: https://wikipedia.org
   Expected: Page loads ✅
   ```

4. **Test Blocked:**
   ```
   Visit: https://facebook.com
   Expected: Redirects to blocked.html ❌
   ```

5. **Check Console:**
   ```
   F12 → Console → Should see:
   "✅ CodZe: Blocking rules updated successfully!"
   ```

**If all 5 tests pass → CodZe is working correctly! ✅**

---

## 📞 Still Not Working?

1. Check GitHub Issues
2. Review ADMIN_GUIDE.md
3. Check browser console for errors
4. Try test.html page
5. Reset and reinstall extension

---

**CodZe v1.3 - Proper Site Control Restored!** 🔒✨
