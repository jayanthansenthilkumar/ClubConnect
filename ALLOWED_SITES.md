# CodZe v2.0 - Allowed Educational Sites

## 🎓 Complete List of Accessible Websites

### Learning Platforms
- Khan Academy (khanacademy.org)
- Coursera (coursera.org)
- edX (edx.org)
- Udemy (udemy.com)
- Udacity (udacity.com)
- Skillshare (skillshare.com)
- Pluralsight (pluralsight.com)
- LinkedIn Learning (linkedin.com)
- Codecademy (codecademy.com)
- freeCodeCamp (freecodecamp.org)
- The Odin Project (theodinproject.com)

### Coding Practice & Competition
- **CodeTantra (codetantra.com + all subdomains including mkce.codetantra.com)**
- HackerRank (hackerrank.com)
- LeetCode (leetcode.com)
- CodeChef (codechef.com)
- Codeforces (codeforces.com)
- TopCoder (topcoder.com)
- Codewars (codewars.com)
- Exercism (exercism.org)

### Documentation & Developer Resources
- Stack Overflow (stackoverflow.com)
- Stack Exchange (stackexchange.com)
- GitHub (github.com)
- GitLab (gitlab.com)
- Bitbucket (bitbucket.org)
- MDN Web Docs (mdn.mozilla.org, developer.mozilla.org)
- W3Schools (w3schools.com)
- Python Docs (docs.python.org)
- Oracle Docs (docs.oracle.com)
- Dev.to (dev.to)
- Medium (medium.com)

### Educational Resources
- Wikipedia (wikipedia.org)
- WikiHow (wikihow.com)
- Encyclopedia Britannica (britannica.com)
- National Geographic (nationalgeographic.com)
- TED Talks (ted.com)
- YouTube (youtube.com)
- Vimeo (vimeo.com)

### Academic & Research
- Google Scholar (scholar.google.com)
- arXiv (arxiv.org)
- ResearchGate (researchgate.net)
- Academia.edu (academia.edu)
- JSTOR (jstor.org)
- ScienceDirect (sciencedirect.com)
- IEEE (ieee.org)
- ACM (acm.org)

### Math & Science Tools
- Wolfram Alpha (wolframalpha.com)
- Desmos (desmos.com)
- Mathway (mathway.com)
- Brilliant (brilliant.org)
- GeoGebra (geogebra.org)

### Language Learning
- Duolingo (duolingo.com)
- Memrise (memrise.com)
- Babbel (babbel.com)

### Productivity & Collaboration Tools
- Google Services (google.com, drive.google.com, docs.google.com, gmail.com, meet.google.com)
- Zoom (zoom.us)
- Microsoft Teams (teams.microsoft.com)
- Microsoft Office (office.com, office365.com)
- OneDrive (onedrive.live.com)
- Dropbox (dropbox.com)
- Notion (notion.so)
- Trello (trello.com)
- Slack (slack.com)
- Discord (discord.com)

---

## 🔧 Important Notes

### Subdomain Support
All subdomains of allowed sites are automatically accessible. For example:
- `codetantra.com` allows `mkce.codetantra.com`, `test.codetantra.com`, etc.
- `google.com` allows `mail.google.com`, `drive.google.com`, etc.

### How It Works
1. ✅ **Always Active** - CodZe runs automatically, cannot be disabled
2. ✅ **80+ Sites Allowed** - Comprehensive list of educational resources
3. 🚫 **Everything Else Blocked** - All non-educational sites redirect to blocked page
4. 🔒 **Extension Management Blocked** - Cannot access chrome://extensions

### Testing Access
To test if a site is accessible:
1. Reload CodZe extension at `chrome://extensions/`
2. Visit the site you want to test
3. If blocked, you'll see the "This site is blocked" page
4. If allowed, the site loads normally

### Special Fix for mkce.codetantra.com
Version 2.0 includes:
- ✅ Both `codetantra.com` AND `mkce.codetantra.com` explicitly listed
- ✅ Enhanced subdomain handling that automatically includes parent domains
- ✅ Both www and non-www versions included

---

## 📝 Version History

### v2.0 (Current)
- Added 80+ educational websites
- Fixed mkce.codetantra.com access issue
- Enhanced subdomain support
- Improved parent domain inclusion

### v1.9
- Added extension management blocking
- Added management permission

### v1.8
- Made extension always active
- Removed toggle functionality

### v1.7
- Updated popup UI to show always-active status

### v1.6-1.5
- Disabled fullscreen mode
- Cleaned up fullscreen enforcement code

---

## 🆘 Troubleshooting

If `mkce.codetantra.com` still doesn't work:

1. **Hard Reload Extension**
   - Go to `chrome://extensions/`
   - Toggle CodZe OFF
   - Click REMOVE
   - Load unpacked again from `D:\Codze`

2. **Check Console**
   - Open Developer Tools (F12)
   - Check Console tab for CodZe logs
   - Should see "✅ CodZe: Blocking rules updated successfully!"

3. **Verify Storage**
   - Open Developer Tools on any page
   - Console → Type: `chrome.storage.local.get(null, console.log)`
   - Check if `allowedSites` includes both "codetantra.com" and "mkce.codetantra.com"

4. **Clear Extension Data**
   - Remove and reinstall extension
   - This resets to default allowed sites list

---

## 📧 Contact
For issues or to request additional sites, contact your administrator.
