/**
 * CodZe Extension - Background Service Worker
 * Manages URL blocking rules based on an allowlist of educational websites
 */

const defaultAllowedSites = [
  // Learning Platforms
  "khanacademy.org",
  "coursera.org",
  "edx.org",
  "udemy.com",
  "udacity.com",
  "skillshare.com",
  "pluralsight.com",
  "linkedin.com",  // LinkedIn Learning
  "codecademy.com",
  "freecodecamp.org",
  "theodinproject.com",
  
  // Coding Practice & Competition
  "codetantra.com",  // Parent domain for mkce.codetantra.com
  "mkce.codetantra.com",
  "hackerrank.com",
  "leetcode.com",
  "codechef.com",
  "codeforces.com",
  "topcoder.com",
  "codewars.com",
  "exercism.org",
  
  // Documentation & References
  "stackoverflow.com",
  "stackexchange.com",
  "github.com",
  "gitlab.com",
  "bitbucket.org",
  "mdn.mozilla.org",
  "w3schools.com",
  "developer.mozilla.org",
  "docs.python.org",
  "docs.oracle.com",
  "dev.to",
  "medium.com",
  
  // Educational Resources
  "wikipedia.org",
  "wikihow.com",
  "britannica.com",
  "nationalgeographic.com",
  "khanacademy.org",
  "ted.com",
  "youtube.com",
  "vimeo.com",
  
  // Academic & Research
  "scholar.google.com",
  "arxiv.org",
  "researchgate.net",
  "academia.edu",
  "jstor.org",
  "sciencedirect.com",
  "ieee.org",
  "acm.org",
  
  // Math & Science
  "wolframalpha.com",
  "desmos.com",
  "mathway.com",
  "brilliant.org",
  "geogebra.org",
  
  // Language Learning
  "duolingo.com",
  "memrise.com",
  "babbel.com",
  
  // General Tools
  "google.com",
  "drive.google.com",
  "docs.google.com",
  "gmail.com",
  "zoom.us",
  "meet.google.com",
  "teams.microsoft.com",
  "office.com",
  "office365.com",
  "onedrive.live.com",
  "dropbox.com",
  "notion.so",
  "trello.com",
  "slack.com",
  "discord.com"
];

// Initialize rules when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  console.log("CodZe Extension installed");
  
  // Set default allowed sites and ALWAYS keep CodZe enabled
  chrome.storage.local.get(["allowedSites"], (data) => {
    if (!data.allowedSites) {
      chrome.storage.local.set({ allowedSites: defaultAllowedSites });
    }
    // Force always enabled - cannot be disabled
    chrome.storage.local.set({ studyModeEnabled: true });
    
    // Enable blocking rules immediately
    updateBlockingRules(data.allowedSites || defaultAllowedSites, true);
  });
});

// Ensure CodZe stays enabled at all times
chrome.storage.onChanged.addListener((changes) => {
  if (changes.studyModeEnabled && changes.studyModeEnabled.newValue === false) {
    // Prevent disabling - force it back to true
    console.log("CodZe: Cannot disable - forcing back to active state");
    chrome.storage.local.set({ studyModeEnabled: true });
  }
});
// Listen for changes in allowed sites list
chrome.storage.onChanged.addListener((changes) => {
  if (changes.allowedSites) {
    chrome.storage.local.get(["allowedSites"], (data) => {
      // Always enabled - no need to check studyModeEnabled
      updateBlockingRules(data.allowedSites, true);
    });
  }
});

/**
 * Updates the blocking rules based on allowed sites list
 * CodZe is ALWAYS ACTIVE - blocking rules are always enforced
 * @param {Array} allowedSites - List of allowed domain names
 * @param {Boolean} enabled - Always true (kept for compatibility)
 */
function updateBlockingRules(allowedSites, enabled = true) {
  // CodZe is always active - no disable option

  // Prepare excluded domains (normalize URLs and handle subdomains)
  const excludedDomains = [];
  
  allowedSites.forEach((site) => {
    // Remove protocol, www, and trailing slash
    let cleanSite = site.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
    
    // Add the domain
    excludedDomains.push(cleanSite);
    
    // Also add www version if not already present
    if (!cleanSite.startsWith('www.')) {
      excludedDomains.push('www.' + cleanSite);
    }
    
    // For subdomains, also add the parent domain to ensure access
    // Example: mkce.codetantra.com -> also add codetantra.com
    const parts = cleanSite.split('.');
    if (parts.length > 2) {
      // This is a subdomain, add parent domain
      const parentDomain = parts.slice(-2).join('.');
      if (!excludedDomains.includes(parentDomain)) {
        excludedDomains.push(parentDomain);
        excludedDomains.push('www.' + parentDomain);
      }
    }
  });

  // Also allow Chrome internal pages and extension pages
  excludedDomains.push("chrome.google.com");
  excludedDomains.push("chromewebstore.google.com");
  
  // CRITICAL: Need to also allow the extension's own blocked.html page
  // Get extension ID dynamically
  const extensionId = chrome.runtime.id;

  // Create blocking rule - Block all except allowed domains
  const blockingRule = {
    id: 1,
    priority: 1,
    action: { 
      type: "redirect",
      redirect: { extensionPath: "/blocked.html" }
    },
    condition: {
      urlFilter: "*://*/*",  // Match all HTTP/HTTPS URLs
      excludedRequestDomains: excludedDomains,  // EXCEPT these domains
      resourceTypes: ["main_frame"]
    }
  };

  // Update dynamic rules
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1], // Remove existing rule if any
    addRules: [blockingRule]
  }, () => {
    if (chrome.runtime.lastError) {
      console.error("Error updating rules:", chrome.runtime.lastError);
      console.error("Rule details:", JSON.stringify(blockingRule, null, 2));
    } else {
      console.log("✅ CodZe: Blocking rules updated successfully!");
      console.log("📚 Allowed sites:", excludedDomains);
      console.log("🚫 All other sites will be blocked");
    }
  });
}

/**
 * Block access to chrome://extensions and edge://extensions
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url && (
    changeInfo.url.startsWith('chrome://extensions') ||
    changeInfo.url.startsWith('edge://extensions') ||
    changeInfo.url.includes('chrome://settings') ||
    changeInfo.url.includes('edge://settings')
  )) {
    // Redirect to blocked page
    console.log('CodZe: Blocking access to extensions management');
    chrome.tabs.update(tabId, { url: chrome.runtime.getURL('blocked.html') + '?reason=extensions' });
  }
});

/**
 * Toggle full screen lock on all tabs
 * @param {Boolean} enabled - Whether to enable full screen lock
 */
function toggleFullScreenLock(enabled) {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      // Skip chrome:// and extension pages
      if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
        chrome.tabs.sendMessage(tab.id, {
          action: enabled ? "enableFullScreen" : "disableFullScreen"
        }).catch(err => {
          // Silently ignore - content script may not be loaded yet
          console.log("Could not send message to tab:", tab.id, err.message);
        });
      }
    });
  });
  
  // Store preference
  chrome.storage.local.set({ fullScreenLock: enabled });
}

/**
 * Debug function - Check current blocking rules
 * Call this from console: chrome.runtime.sendMessage({action: "checkRules"})
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "checkRules") {
    chrome.declarativeNetRequest.getDynamicRules((rules) => {
      console.log("Current blocking rules:", rules);
      sendResponse({ rules: rules });
    });
    return true;
  }
  
  if (request.action === "testSite") {
    chrome.storage.local.get("allowedSites", (data) => {
      const allowed = data.allowedSites || [];
      sendResponse({ 
        allowed: allowed,
        message: `Testing against ${allowed.length} allowed sites`
      });
    });
    return true;
  }
});